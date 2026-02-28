# How to Add New Problems

Problems live in `src/app/api/practice/seed/route.ts` inside the `PROBLEMS` array.
Each object in the array is one problem. Copy the template below and fill it in.

---

## Problem Object Template

```typescript
{
  title: "Problem Title",       // Shown in the question list + problem header
  description: `...`,           // Markdown: problem statement, examples, constraints
  category: "dsa",              // "dsa" | "system_design" | "behavioral" | "sql"
  difficulty: "easy",           // "easy" | "medium" | "hard"
  company_tags: ["Google"],     // Companies this problem appears at
  topic_tags: ["array"],        // DSA topics (array, hash-map, tree, graph, dp, ...)
  hints: [
    "Hint 1 text",
    "Hint 2 text (revealed one at a time)",
  ],
  solution: `## Approach\n\n...`, // Markdown editorial solution (optional)

  // ── Code execution metadata (required for the editor to work) ──────────────
  function_name: "myFunction",  // Exact name of the function the user implements

  // Ordered list of parameters with their types
  params: [
    { name: "nums",   type: "int[]"  },
    { name: "target", type: "int"    },
  ],
  return_type: "int[]",         // Return type of the function

  // Boilerplate code shown in each language (user fills in the logic)
  starter_code: {
    python: `from typing import List\n\ndef myFunction(nums: List[int], target: int) -> List[int]:\n    # Write your solution here\n    pass`,
    javascript: `function myFunction(nums, target) {\n    // Write your solution here\n\n}`,
    java: `class Solution {\n    public int[] myFunction(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
    cpp: `class Solution {\npublic:\n    vector<int> myFunction(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
  },

  // Test cases
  // isPublic: true  → shown in the Test Cases tab (user can edit them)
  // isPublic: false → hidden, only run when the user clicks Submit
  test_cases: [
    {
      label: "Example 1",
      inputs: { nums: [2, 7, 11, 15], target: 9 },
      expected: [0, 1],
      isPublic: true,
    },
    {
      label: "Example 2",
      inputs: { nums: [3, 2, 4], target: 6 },
      expected: [1, 2],
      isPublic: true,
    },
    {
      label: "Test 3",
      inputs: { nums: [3, 3], target: 6 },
      expected: [0, 1],
      isPublic: false,    // hidden test case
    },
  ],
},
```

---

## Supported Parameter Types

| Type string          | Python type          | JavaScript type  | Java type         | C++ type             |
|----------------------|----------------------|------------------|-------------------|----------------------|
| `"int"`              | `int`                | `number`         | `int`             | `int`                |
| `"long"`             | `int`                | `number`         | `long`            | `long long`          |
| `"float"` / `"double"` | `float`            | `number`         | `double`          | `double`             |
| `"string"`           | `str`                | `string`         | `String`          | `string`             |
| `"bool"`             | `bool`               | `boolean`        | `boolean`         | `bool`               |
| `"int[]"`            | `List[int]`          | `number[]`       | `int[]`           | `vector<int>`        |
| `"string[]"`         | `List[str]`          | `string[]`       | `String[]`        | `vector<string>`     |
| `"int[][]"`          | `List[List[int]]`    | `number[][]`     | `int[][]`         | `vector<vector<int>>`|

---

## Test Case `inputs` Format

The `inputs` field is a plain JavaScript/JSON object where each key is a parameter name and each value is a raw JSON value (not a string representation).

```typescript
// Correct — values are actual JSON types
inputs: { nums: [2, 7, 11, 15], target: 9 }

// Wrong — don't stringify the values
inputs: { nums: "[2, 7, 11, 15]", target: "9" }
```

The `expected` field is also a raw JSON value:
```typescript
expected: [0, 1]        // int[]
expected: true          // bool
expected: 42            // int
expected: "hello"       // string
```

---

## After Adding Problems

1. **Delete existing DSA questions** from your Supabase dashboard (or re-run the migration script).
2. **Call the seed endpoint:** `POST /api/practice/seed`
   You can do this from the browser DevTools or Postman:
   ```
   curl -X POST https://your-domain.com/api/practice/seed \
     -H "Cookie: <your-session-cookie>"
   ```
3. Refresh the practice page — your new problems will appear.

---

## Checklist for a New Problem

- [ ] `title` is unique
- [ ] `description` has at least 2–3 worked examples in the markdown
- [ ] `function_name` matches exactly what's in `starter_code`
- [ ] `params` are in the same order as the function signature
- [ ] `return_type` matches the actual return type
- [ ] All 4 `starter_code` languages are filled in
- [ ] At least 2 public test cases + 2–3 hidden test cases
- [ ] `expected` values are raw JSON (not stringified)
- [ ] Solution editorial is written in `solution` (markdown)

---

## Example: Adding "Contains Duplicate"

```typescript
{
  title: "Contains Duplicate",
  description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.

**Example 1:**
\`\`\`
Input:  nums = [1, 2, 3, 1]
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [1, 2, 3, 4]
Output: false
\`\`\`

**Constraints:**
- \`1 <= nums.length <= 10^5\`
- \`-10^9 <= nums[i] <= 10^9\``,
  category: "dsa",
  difficulty: "easy",
  company_tags: ["Amazon", "Google"],
  topic_tags: ["array", "hash-map", "sorting"],
  hints: [
    "Can you use a data structure to track which elements you have already seen?",
    "A hash set provides O(1) average-time insertion and lookup.",
  ],
  solution: `## Hash Set — O(n) time, O(n) space

\`\`\`python
def containsDuplicate(nums: List[int]) -> bool:
    return len(nums) != len(set(nums))
\`\`\``,
  function_name: "containsDuplicate",
  params: [{ name: "nums", type: "int[]" }],
  return_type: "bool",
  starter_code: {
    python: `from typing import List\n\ndef containsDuplicate(nums: List[int]) -> bool:\n    # Write your solution here\n    pass`,
    javascript: `function containsDuplicate(nums) {\n    // Write your solution here\n\n}`,
    java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your solution here\n        return false;\n    }\n}`,
    cpp: `class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Write your solution here\n        return false;\n    }\n};`,
  },
  test_cases: [
    { label: "Example 1", inputs: { nums: [1, 2, 3, 1] },    expected: true,  isPublic: true  },
    { label: "Example 2", inputs: { nums: [1, 2, 3, 4] },    expected: false, isPublic: true  },
    { label: "Example 3", inputs: { nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] }, expected: true, isPublic: true },
    { label: "Test 4",    inputs: { nums: [1] },              expected: false, isPublic: false },
  ],
},
```
