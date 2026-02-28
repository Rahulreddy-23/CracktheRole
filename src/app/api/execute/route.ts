import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Judge0 CE language IDs — https://ce.judge0.com/languages
const LANGUAGE_MAP: Record<string, number> = {
  python: 100,     // Python 3.12.5
  javascript: 97,  // Node.js 20.17.0
  java: 91,        // Java JDK 17.0.6
  cpp: 105,        // C++ GCC 14.1.0
};

const JUDGE0_BASE = "https://ce.judge0.com";

interface Param {
  name: string;
  type: string;
}

interface ExecuteRequest {
  language: string;
  code: string;
  functionName: string;
  params: Param[];
  returnType: string;
  inputs: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Output normalizer — makes "[0, 1]" === "[0,1]" and "True" === "true"
// ---------------------------------------------------------------------------
function normalizeOutput(raw: string): string {
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "boolean") return parsed.toString();
    if (typeof parsed === "number") return String(parsed);
    if (Array.isArray(parsed)) return JSON.stringify(parsed);
    if (typeof parsed === "string") return parsed;
    return JSON.stringify(parsed);
  } catch {
    // Not valid JSON — return trimmed as-is (handles plain strings)
    return trimmed;
  }
}

// ---------------------------------------------------------------------------
// Stdin builders
// Python/JS: JSON object of all inputs  {"nums":[2,7,11,15],"target":9}
// Java/C++: one value per line          [2,7,11,15]\n9
// ---------------------------------------------------------------------------
function buildJsonStdin(params: Param[], inputs: Record<string, unknown>): string {
  const obj: Record<string, unknown> = {};
  for (const p of params) obj[p.name] = inputs[p.name];
  return JSON.stringify(obj);
}

function buildLineStdin(params: Param[], inputs: Record<string, unknown>): string {
  return params
    .map((p) => {
      const val = inputs[p.name];
      if (Array.isArray(val)) return JSON.stringify(val).replace(/\s+/g, "");
      if (typeof val === "string") return val;
      return String(val);
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// Python wrapper
// Adds standard imports, appends a __main__ block that reads JSON stdin,
// calls the user function with **kwargs, and prints normalised JSON output.
// ---------------------------------------------------------------------------
function wrapPython(userCode: string, functionName: string): string {
  return `import json
import sys
import math
from typing import List, Optional, Tuple, Dict

${userCode}

if __name__ == "__main__":
    _data = json.loads(sys.stdin.read().strip())
    _result = ${functionName}(**_data)
    if isinstance(_result, bool):
        print(str(_result).lower())
    elif isinstance(_result, list):
        print(json.dumps(_result, separators=(',', ':')))
    elif _result is None:
        print("null")
    else:
        print(json.dumps(_result))
`;
}

// ---------------------------------------------------------------------------
// JavaScript wrapper
// Reads JSON stdin, spreads values in param-insertion order into the function.
// Object.values() preserves insertion order for string keys in V8.
// ---------------------------------------------------------------------------
function wrapJavaScript(userCode: string, functionName: string): string {
  return `${userCode}

;(function () {
  const _fs = require('fs');
  const _raw = _fs.readFileSync('/dev/stdin', 'utf-8').trim();
  const _data = JSON.parse(_raw);
  const _result = ${functionName}(...Object.values(_data));
  if (typeof _result === 'boolean') {
    process.stdout.write(String(_result) + '\\n');
  } else if (_result === null || _result === undefined) {
    process.stdout.write('null\\n');
  } else if (typeof _result === 'object') {
    process.stdout.write(JSON.stringify(_result) + '\\n');
  } else {
    process.stdout.write(String(_result) + '\\n');
  }
})();
`;
}

// ---------------------------------------------------------------------------
// Java type helpers
// ---------------------------------------------------------------------------
function javaType(type: string): string {
  const map: Record<string, string> = {
    int: "int",
    long: "long",
    float: "float",
    double: "double",
    string: "String",
    bool: "boolean",
    boolean: "boolean",
    "int[]": "int[]",
    "int[][]": "int[][]",
    "string[]": "String[]",
    "char[]": "char[]",
    "List<Integer>": "List<Integer>",
    "List<List<Integer>>": "List<List<Integer>>",
  };
  return map[type] ?? "Object";
}

function javaParseExpr(type: string, rawVar: string): string {
  switch (type) {
    case "int":    return `Integer.parseInt(${rawVar})`;
    case "long":   return `Long.parseLong(${rawVar})`;
    case "float":  return `Float.parseFloat(${rawVar})`;
    case "double": return `Double.parseDouble(${rawVar})`;
    case "string": return `${rawVar}.replaceAll("^\\\"|\\\"$", "")`;
    case "bool":
    case "boolean":return `Boolean.parseBoolean(${rawVar})`;
    case "int[]":  return `_parseIntArray(${rawVar})`;
    case "int[][]":return `_parseInt2DArray(${rawVar})`;
    case "string[]":return `_parseStringArray(${rawVar})`;
    case "char[]": return `_parseCharArray(${rawVar})`;
    default:       return rawVar;
  }
}

function javaOutputCode(returnType: string): string {
  switch (returnType) {
    case "int":
    case "long":
    case "float":
    case "double":           return "System.out.println(_result);";
    case "bool":
    case "boolean":          return "System.out.println(_result);";
    case "string":           return "System.out.println(_result);";
    case "int[]":            return "System.out.println(_toJson(_result));";
    case "string[]":         return "System.out.println(_toJson(java.util.Arrays.asList(_result)));";
    case "List<Integer>":    return "System.out.println(_toJson(_result));";
    case "List<List<Integer>>": return "System.out.println(_toJson(_result));";
    default:                 return "System.out.println(_result);";
  }
}

// ---------------------------------------------------------------------------
// Java wrapper
// The user writes `class Solution { ... }`.
// We prepend imports, append class Main with parse helpers + main().
// Judge0 Java: file named Main.java, runs `java Main`.
// Multiple non-public classes in one file is legal in Java.
// ---------------------------------------------------------------------------
function wrapJava(
  userCode: string,
  functionName: string,
  params: Param[],
  returnType: string
): string {
  const parseHelpers = `
    private static int[] _parseIntArray(String s) {
        s = s.trim();
        if (s.equals("[]")) return new int[0];
        s = s.substring(1, s.length() - 1).trim();
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());
        return arr;
    }
    private static int[][] _parseInt2DArray(String s) {
        s = s.trim();
        if (s.equals("[]")) return new int[0][];
        java.util.List<int[]> rows = new java.util.ArrayList<>();
        int depth = 0, start = -1;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '[') { depth++; if (depth == 2) start = i; }
            else if (c == ']') { depth--; if (depth == 1 && start != -1) { rows.add(_parseIntArray(s.substring(start, i + 1))); start = -1; } }
        }
        return rows.toArray(new int[0][]);
    }
    private static String[] _parseStringArray(String s) {
        s = s.trim();
        if (s.equals("[]")) return new String[0];
        s = s.substring(1, s.length() - 1).trim();
        if (s.isEmpty()) return new String[0];
        java.util.List<String> result = new java.util.ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            if (s.charAt(i) == '"') {
                int end = s.indexOf('"', i + 1);
                result.add(s.substring(i + 1, end));
                i = end + 1;
                if (i < s.length() && s.charAt(i) == ',') i++;
            } else {
                int end = s.indexOf(',', i);
                if (end == -1) end = s.length();
                String tok = s.substring(i, end).trim();
                if (!tok.isEmpty()) result.add(tok);
                i = end + 1;
            }
        }
        return result.toArray(new String[0]);
    }
    private static char[] _parseCharArray(String s) {
        s = s.trim();
        if (s.startsWith("[")) {
            s = s.substring(1, s.length() - 1);
            String[] parts = s.split(",");
            char[] arr = new char[parts.length];
            for (int i = 0; i < parts.length; i++) {
                String t = parts[i].trim().replace("\"", "");
                arr[i] = t.isEmpty() ? ' ' : t.charAt(0);
            }
            return arr;
        }
        return s.toCharArray();
    }
    private static String _toJson(int[] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) { if (i > 0) sb.append(","); sb.append(arr[i]); }
        return sb.append("]").toString();
    }
    private static String _toJson(java.util.List<?> list) {
        if (list == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            Object item = list.get(i);
            if (item instanceof java.util.List) sb.append(_toJson((java.util.List<?>) item));
            else if (item instanceof String) sb.append('"').append(item).append('"');
            else sb.append(item);
        }
        return sb.append("]").toString();
    }`;

  const parseLines = params
    .map((p) => {
      const jType = javaType(p.type);
      const parseExpr = javaParseExpr(p.type, `_raw_${p.name}`);
      return `        String _raw_${p.name} = sc.nextLine().trim();\n        ${jType} ${p.name} = ${parseExpr};`;
    })
    .join("\n");

  const paramList = params.map((p) => p.name).join(", ");
  const jReturnType = javaType(returnType);
  const outputCode = javaOutputCode(returnType);

  return `import java.util.*;

${userCode}

class Main {
${parseHelpers}
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
${parseLines}
        Solution _sol = new Solution();
        ${jReturnType} _result = _sol.${functionName}(${paramList});
        ${outputCode}
    }
}
`;
}

// ---------------------------------------------------------------------------
// C++ type helpers
// ---------------------------------------------------------------------------
function cppType(type: string): string {
  const map: Record<string, string> = {
    int: "int",
    long: "long long",
    float: "float",
    double: "double",
    string: "string",
    bool: "bool",
    boolean: "bool",
    "int[]": "vector<int>",
    "string[]": "vector<string>",
    "int[][]": "vector<vector<int>>",
  };
  return map[type] ?? "auto";
}

function cppParseLines(type: string, name: string): string {
  switch (type) {
    case "int":
      return `    int ${name}; { string _l; getline(cin, _l); ${name} = stoi(_l); }`;
    case "long":
      return `    long long ${name}; { string _l; getline(cin, _l); ${name} = stoll(_l); }`;
    case "float":
    case "double":
      return `    double ${name}; { string _l; getline(cin, _l); ${name} = stod(_l); }`;
    case "string":
      return `    string ${name}; { getline(cin, ${name}); ${name}.erase(remove(${name}.begin(), ${name}.end(), '"'), ${name}.end()); }`;
    case "bool":
    case "boolean":
      return `    bool ${name}; { string _l; getline(cin, _l); ${name} = (_l.find("true") != string::npos || _l == "1"); }`;
    case "int[]":
      return `    vector<int> ${name}; { string _l; getline(cin, _l); ${name} = _parseIntVec(_l); }`;
    case "string[]":
      return `    vector<string> ${name}; { string _l; getline(cin, _l); ${name} = _parseStringVec(_l); }`;
    case "int[][]":
      return `    vector<vector<int>> ${name}; { string _l; getline(cin, _l); ${name} = _parseInt2DVec(_l); }`;
    default:
      return `    string ${name}; getline(cin, ${name});`;
  }
}

function cppOutputCode(returnType: string): string {
  switch (returnType) {
    case "int":
    case "long":   return `cout << _result << "\\n";`;
    case "float":
    case "double": return `cout << _result << "\\n";`;
    case "bool":
    case "boolean":return `cout << (_result ? "true" : "false") << "\\n";`;
    case "string": return `cout << _result << "\\n";`;
    case "int[]":  return `cout << _toJsonVec(_result) << "\\n";`;
    case "int[][]":return `cout << _toJsonVec2D(_result) << "\\n";`;
    default:       return `cout << _result << "\\n";`;
  }
}

// ---------------------------------------------------------------------------
// C++ wrapper
// Judge0 C++: file named main.cpp, compiled with g++, main() is entry point.
// Parse helpers are file-scope static functions.
// ---------------------------------------------------------------------------
function wrapCpp(
  userCode: string,
  functionName: string,
  params: Param[],
  returnType: string
): string {
  const parseHelpers = `
static vector<int> _parseIntVec(const string& s) {
    vector<int> res;
    string t = s;
    t.erase(remove(t.begin(), t.end(), '['), t.end());
    t.erase(remove(t.begin(), t.end(), ']'), t.end());
    if (t.empty()) return res;
    stringstream ss(t);
    string tok;
    while (getline(ss, tok, ',')) {
        tok.erase(remove_if(tok.begin(), tok.end(), ::isspace), tok.end());
        if (!tok.empty()) res.push_back(stoi(tok));
    }
    return res;
}

static vector<vector<int>> _parseInt2DVec(const string& s) {
    vector<vector<int>> res;
    if (s == "[]") return res;
    int depth = 0, start = -1;
    for (int i = 0; i < (int)s.size(); i++) {
        if (s[i] == '[') { depth++; if (depth == 2) start = i; }
        else if (s[i] == ']') { depth--; if (depth == 1 && start != -1) { res.push_back(_parseIntVec(s.substr(start, i - start + 1))); start = -1; } }
    }
    return res;
}

static vector<string> _parseStringVec(const string& s) {
    vector<string> res;
    if (s == "[]") return res;
    string inner = s.substr(1, s.size() - 2);
    int i = 0;
    while (i < (int)inner.size()) {
        while (i < (int)inner.size() && (inner[i] == ' ' || inner[i] == ',')) i++;
        if (i >= (int)inner.size()) break;
        if (inner[i] == '"') {
            int end = inner.find('"', i + 1);
            res.push_back(inner.substr(i + 1, end - i - 1));
            i = end + 1;
        } else {
            int end = inner.find(',', i);
            if (end == (int)string::npos) end = inner.size();
            res.push_back(inner.substr(i, end - i));
            i = end;
        }
    }
    return res;
}

static string _toJsonVec(const vector<int>& v) {
    if (v.empty()) return "[]";
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) { if (i) s += ","; s += to_string(v[i]); }
    return s + "]";
}

static string _toJsonVec2D(const vector<vector<int>>& vv) {
    if (vv.empty()) return "[]";
    string s = "[";
    for (int i = 0; i < (int)vv.size(); i++) { if (i) s += ","; s += _toJsonVec(vv[i]); }
    return s + "]";
}`;

  const paramLines = params.map((p) => cppParseLines(p.type, p.name)).join("\n");
  const paramList = params.map((p) => p.name).join(", ");
  const outputLine = cppOutputCode(returnType);

  return `#include <bits/stdc++.h>
using namespace std;

${userCode}
${parseHelpers}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
${paramLines}
    Solution sol;
    auto _result = sol.${functionName}(${paramList});
    ${outputLine}
    return 0;
}
`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ExecuteRequest;
    const { language, code, functionName, params, returnType, inputs } = body;

    if (!language || !code) {
      return Response.json(
        { error: "Missing required fields: language and code" },
        { status: 400 }
      );
    }

    if (!LANGUAGE_MAP[language]) {
      return Response.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    if (!functionName || !params || !returnType || !inputs) {
      return Response.json(
        {
          error:
            "Missing execution metadata. Ensure functionName, params, returnType, and inputs are provided.",
        },
        { status: 400 }
      );
    }

    // Build the final source code and stdin for the chosen language
    let finalCode: string;
    let stdin: string;

    switch (language) {
      case "python":
        finalCode = wrapPython(code, functionName);
        stdin = buildJsonStdin(params, inputs);
        break;
      case "javascript":
        finalCode = wrapJavaScript(code, functionName);
        stdin = buildJsonStdin(params, inputs);
        break;
      case "java":
        finalCode = wrapJava(code, functionName, params, returnType);
        stdin = buildLineStdin(params, inputs);
        break;
      case "cpp":
        finalCode = wrapCpp(code, functionName, params, returnType);
        stdin = buildLineStdin(params, inputs);
        break;
      default:
        return Response.json(
          { error: `Unsupported language: ${language}` },
          { status: 400 }
        );
    }

    // Submit to Judge0 CE (synchronous — wait=true returns result immediately)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);
    const startTime = Date.now();

    let judge0Res: Response;
    try {
      judge0Res = await fetch(
        `${JUDGE0_BASE}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,status,time,compile_output`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language_id: LANGUAGE_MAP[language],
            source_code: Buffer.from(finalCode).toString("base64"),
            stdin: Buffer.from(stdin).toString("base64"),
            cpu_time_limit: 10,
            wall_time_limit: 15,
          }),
          signal: controller.signal,
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        return Response.json(
          { error: "Code execution timed out after 20 seconds." },
          { status: 408 }
        );
      }
      return Response.json(
        { error: "Code execution service unavailable. Please try again." },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!judge0Res.ok) {
      return Response.json(
        { error: "Code execution service unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await judge0Res.json();
    const executionTime =
      data.time
        ? parseFloat(data.time)
        : (Date.now() - startTime) / 1000;

    const decode = (b64: string | null | undefined): string => {
      if (!b64) return "";
      try {
        return Buffer.from(b64, "base64").toString("utf-8");
      } catch {
        return b64;
      }
    };

    const stdout = decode(data.stdout);
    const stderr = decode(data.stderr);
    const compileOutput = decode(data.compile_output);
    const combinedStderr = [compileOutput, stderr].filter(Boolean).join("\n");

    // Judge0 status id 3 = "Accepted" (successful execution)
    const statusId = data.status?.id ?? 0;
    const exitCode = statusId === 3 ? 0 : 1;

    return Response.json({
      stdout: stdout.trim(),
      stderr: combinedStderr,
      exitCode,
      executionTime,
      normalized: normalizeOutput(stdout),
    });
  } catch (error) {
    console.error("Execute route error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
