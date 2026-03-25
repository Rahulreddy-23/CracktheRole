"use client";

import type { CodeExecutionResult } from "@/types";
import type { SqlJsStatic, Database as SQLiteDB } from "sql.js";

let dbInstance: SQLiteDB | null = null;
let sqlPromise: Promise<SqlJsStatic> | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    // Dynamic import keeps the ~1MB WASM bundle out of the initial page load
    const initSqlJs = (await import("sql.js")).default;
    sqlPromise = initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }
  return sqlPromise;
}

async function getDB(schemaAndData?: string): Promise<SQLiteDB> {
  const SQL = await getSqlJs();

  if (schemaAndData) {
    // Fresh DB for each schema-seeded execution
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
    }
    const db = new SQL.Database();
    db.run(schemaAndData);
    dbInstance = db;
    return dbInstance;
  }

  if (!dbInstance) {
    dbInstance = new SQL.Database();
  }
  return dbInstance;
}

/** Execute SQL code in the browser using SQLite (sql.js). */
export async function executeSql(
  code: string,
  schema?: string
): Promise<CodeExecutionResult> {
  try {
    const db = await getDB(schema);
    const results = db.exec(code);

    let stdout = "";
    for (const result of results) {
      stdout += result.columns.join(" | ") + "\n";
      stdout += result.columns.map(() => "---").join("-|-") + "\n";
      for (const row of result.values) {
        stdout +=
          row.map((v) => (v === null ? "NULL" : String(v))).join(" | ") + "\n";
      }
      stdout += "\n";
    }

    if (!stdout.trim()) {
      stdout = "Query executed successfully. No results returned.";
    }

    return {
      stdout: stdout.trim() || null,
      stderr: null,
      compile_output: null,
      status: "Success",
      executionTime: null,
      memoryUsed: null,
      language: "sql",
      version: "SQLite (browser)",
    };
  } catch (err) {
    return {
      stdout: null,
      stderr: err instanceof Error ? err.message : "SQL execution error",
      compile_output: null,
      status: "Error",
      executionTime: null,
      memoryUsed: null,
      language: "sql",
      version: "SQLite (browser)",
    };
  }
}

/** Close and discard the current in-memory database. */
export function resetSqlDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
