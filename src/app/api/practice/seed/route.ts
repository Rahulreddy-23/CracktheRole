import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This route requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS for inserting questions.
// POST /api/practice/seed  — seeds 5 DSA problems in V2 format.

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }
  return createClient(url, serviceKey);
}

// ---------------------------------------------------------------------------
// Problem definitions
// Each problem has:
//   function_name  — exact function the user implements
//   params         — ordered [{name, type}] matching the function signature
//   return_type    — return type string
//   starter_code   — boilerplate for python / javascript / java / cpp
//   test_cases     — [{label, inputs, expected, isPublic}]
//                    isPublic:true  shown in editor test-case tabs
//                    isPublic:false hidden, only run on Submit
// ---------------------------------------------------------------------------

const PROBLEMS = [
  // ── 1. Two Sum ─────────────────────────────────────────────────────────────
  {
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.

You may assume that each input has exactly **one solution**, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [3, 2, 4], target = 6
Output: [1, 2]
\`\`\`

**Example 3:**
\`\`\`
Input:  nums = [3, 3], target = 6
Output: [0, 1]
\`\`\`

**Constraints:**
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.

**Follow-up:** Can you come up with an algorithm that is less than O(n²) time complexity?`,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Google", "Amazon", "Meta", "Microsoft", "Apple"],
    topic_tags: ["array", "hash-map"],
    hints: [
      "A brute-force O(n²) approach checks every pair. Can you do better?",
      "Use a hash map to store each number and its index as you iterate.",
      "For each element, check whether (target − element) already exists in the map before inserting the current element.",
    ],
    solution: `## Hash Map Approach — O(n) time, O(n) space

For each element we look up its complement \`(target - num)\` in a hash map. If found, we have our answer. Otherwise we record \`num → index\` for future lookups.

\`\`\`python
def twoSum(nums: List[int], target: int) -> List[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
\`\`\`

**Why it works:** Single pass — every element is processed once. The hash map provides O(1) average-time lookups, giving us O(n) overall.`,
    function_name: "twoSum",
    params: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    return_type: "int[]",
    starter_code: {
      python: `from typing import List

def twoSum(nums: List[int], target: int) -> List[int]:
    # Write your solution here
    pass`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here

}`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
    },
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
        label: "Example 3",
        inputs: { nums: [3, 3], target: 6 },
        expected: [0, 1],
        isPublic: true,
      },
      {
        label: "Test 4",
        inputs: { nums: [-1, -2, -3, -4, -5], target: -8 },
        expected: [2, 4],
        isPublic: false,
      },
      {
        label: "Test 5",
        inputs: { nums: [0, 4, 3, 0], target: 0 },
        expected: [0, 3],
        isPublic: false,
      },
    ],
  },

  // ── 2. Valid Parentheses ────────────────────────────────────────────────────
  {
    title: "Valid Parentheses",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is **valid**.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input:  s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input:  s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input:  s = "(]"
Output: false
\`\`\`

**Constraints:**
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'.\``,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Google", "Amazon", "Meta", "Microsoft"],
    topic_tags: ["string", "stack"],
    hints: [
      "Think about what data structure naturally handles 'last in, first out' matching.",
      "Use a stack. Push opening brackets; for each closing bracket, check the top of the stack.",
      "At the end, the stack must be empty for the string to be valid.",
    ],
    solution: `## Stack Approach — O(n) time, O(n) space

For each character: if it's an opening bracket, push it. If it's a closing bracket, check that the top of the stack is the matching opener.

\`\`\`python
def isValid(s: str) -> bool:
    stack = []
    close_to_open = {')': '(', '}': '{', ']': '['}
    for ch in s:
        if ch in close_to_open:
            if not stack or stack[-1] != close_to_open[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return len(stack) == 0
\`\`\``,
    function_name: "isValid",
    params: [{ name: "s", type: "string" }],
    return_type: "bool",
    starter_code: {
      python: `def isValid(s: str) -> bool:
    # Write your solution here
    pass`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your solution here

}`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};`,
    },
    test_cases: [
      {
        label: "Example 1",
        inputs: { s: "()" },
        expected: true,
        isPublic: true,
      },
      {
        label: "Example 2",
        inputs: { s: "()[]{}" },
        expected: true,
        isPublic: true,
      },
      {
        label: "Example 3",
        inputs: { s: "(]" },
        expected: false,
        isPublic: true,
      },
      {
        label: "Test 4",
        inputs: { s: "([)]" },
        expected: false,
        isPublic: false,
      },
      {
        label: "Test 5",
        inputs: { s: "{[]}" },
        expected: true,
        isPublic: false,
      },
      {
        label: "Test 6",
        inputs: { s: "]" },
        expected: false,
        isPublic: false,
      },
    ],
  },

  // ── 3. Best Time to Buy and Sell Stock ─────────────────────────────────────
  {
    title: "Best Time to Buy and Sell Stock",
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the **maximum profit** you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.

**Example 1:**
\`\`\`
Input:  prices = [7, 1, 5, 3, 6, 4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6).
             Profit = 6 - 1 = 5.
\`\`\`

**Example 2:**
\`\`\`
Input:  prices = [7, 6, 4, 3, 1]
Output: 0
Explanation: No profitable transaction is possible.
\`\`\`

**Constraints:**
- \`1 <= prices.length <= 10^5\`
- \`0 <= prices[i] <= 10^4\``,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Amazon", "Meta", "Microsoft", "Google", "Apple"],
    topic_tags: ["array", "greedy", "sliding-window"],
    hints: [
      "You need to find the maximum difference (prices[j] - prices[i]) where j > i.",
      "Track the minimum price seen so far as you scan left to right.",
      "At each index, the best profit if you sell today = current price − min price so far.",
    ],
    solution: `## Single Pass Greedy — O(n) time, O(1) space

Track the minimum price seen so far and the maximum profit achievable at each step.

\`\`\`python
def maxProfit(prices: List[int]) -> int:
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit
\`\`\`

**Why it works:** We never need to look back — the best buy point up to the current day is always the minimum price seen so far.`,
    function_name: "maxProfit",
    params: [{ name: "prices", type: "int[]" }],
    return_type: "int",
    starter_code: {
      python: `from typing import List

def maxProfit(prices: List[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    // Write your solution here

}`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your solution here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your solution here
        return 0;
    }
};`,
    },
    test_cases: [
      {
        label: "Example 1",
        inputs: { prices: [7, 1, 5, 3, 6, 4] },
        expected: 5,
        isPublic: true,
      },
      {
        label: "Example 2",
        inputs: { prices: [7, 6, 4, 3, 1] },
        expected: 0,
        isPublic: true,
      },
      {
        label: "Example 3",
        inputs: { prices: [2, 4, 1] },
        expected: 2,
        isPublic: true,
      },
      {
        label: "Test 4",
        inputs: { prices: [1] },
        expected: 0,
        isPublic: false,
      },
      {
        label: "Test 5",
        inputs: { prices: [3, 2, 6, 5, 0, 3] },
        expected: 4,
        isPublic: false,
      },
    ],
  },

  // ── 4. Maximum Subarray ────────────────────────────────────────────────────
  {
    title: "Maximum Subarray",
    description: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return its sum.

**Example 1:**
\`\`\`
Input:  nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: The subarray [4, -1, 2, 1] has the largest sum = 6.
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [1]
Output: 1
\`\`\`

**Example 3:**
\`\`\`
Input:  nums = [5, 4, -1, 7, 8]
Output: 23
\`\`\`

**Constraints:**
- \`1 <= nums.length <= 10^5\`
- \`-10^4 <= nums[i] <= 10^4\`

**Follow-up:** If you have figured out the O(n) solution, try coding another solution using the **divide and conquer** approach, which is more subtle.`,
    category: "dsa",
    difficulty: "medium",
    company_tags: ["Amazon", "Microsoft", "Google", "LinkedIn"],
    topic_tags: ["array", "dynamic-programming", "greedy"],
    hints: [
      "Think about what happens when you extend a subarray by one element — should you keep the current sum or start fresh?",
      "Kadane's Algorithm: maintain a running sum. If it becomes negative, reset it to 0 (start a new subarray).",
      "Keep track of the maximum running sum seen at any point — that is your answer.",
    ],
    solution: `## Kadane's Algorithm — O(n) time, O(1) space

At each position, decide: is it better to extend the current subarray or start a new one?

\`\`\`python
def maxSubArray(nums: List[int]) -> int:
    current = max_sum = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        max_sum = max(max_sum, current)
    return max_sum
\`\`\`

**Key insight:** If the running sum drops below the current element, it's more profitable to start a fresh subarray from the current element.`,
    function_name: "maxSubArray",
    params: [{ name: "nums", type: "int[]" }],
    return_type: "int",
    starter_code: {
      python: `from typing import List

def maxSubArray(nums: List[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Write your solution here

}`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your solution here
        return 0;
    }
};`,
    },
    test_cases: [
      {
        label: "Example 1",
        inputs: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
        expected: 6,
        isPublic: true,
      },
      {
        label: "Example 2",
        inputs: { nums: [1] },
        expected: 1,
        isPublic: true,
      },
      {
        label: "Example 3",
        inputs: { nums: [5, 4, -1, 7, 8] },
        expected: 23,
        isPublic: true,
      },
      {
        label: "Test 4",
        inputs: { nums: [-1] },
        expected: -1,
        isPublic: false,
      },
      {
        label: "Test 5",
        inputs: { nums: [-2, -1] },
        expected: -1,
        isPublic: false,
      },
    ],
  },

  // ── 5. Climbing Stairs ─────────────────────────────────────────────────────
  {
    title: "Climbing Stairs",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many **distinct ways** can you climb to the top?

**Example 1:**
\`\`\`
Input:  n = 2
Output: 2
Explanation: There are two ways to climb to the top.
  1. 1 step + 1 step
  2. 2 steps
\`\`\`

**Example 2:**
\`\`\`
Input:  n = 3
Output: 3
Explanation: There are three ways to climb to the top.
  1. 1 step + 1 step + 1 step
  2. 1 step + 2 steps
  3. 2 steps + 1 step
\`\`\`

**Constraints:**
- \`1 <= n <= 45\``,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Amazon", "Apple", "Google", "Adobe"],
    topic_tags: ["dynamic-programming", "math", "memoization"],
    hints: [
      "Think recursively: to reach step n, you either came from step n-1 (1 step) or step n-2 (2 steps).",
      "The number of ways to reach step n = ways(n-1) + ways(n-2). Does this pattern look familiar?",
      "This is the Fibonacci sequence! You only need to keep track of the last two values.",
    ],
    solution: `## Fibonacci DP — O(n) time, O(1) space

The number of ways to reach step n is the same as the Fibonacci sequence.

\`\`\`python
def climbStairs(n: int) -> int:
    if n <= 2:
        return n
    prev, curr = 1, 2
    for _ in range(3, n + 1):
        prev, curr = curr, prev + curr
    return curr
\`\`\`

**Why it works:** \`ways(n) = ways(n-1) + ways(n-2)\`. We can compute this iteratively with O(1) space by rolling two variables forward.`,
    function_name: "climbStairs",
    params: [{ name: "n", type: "int" }],
    return_type: "int",
    starter_code: {
      python: `def climbStairs(n: int) -> int:
    # Write your solution here
    pass`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    // Write your solution here

}`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your solution here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your solution here
        return 0;
    }
};`,
    },
    test_cases: [
      {
        label: "Example 1",
        inputs: { n: 2 },
        expected: 2,
        isPublic: true,
      },
      {
        label: "Example 2",
        inputs: { n: 3 },
        expected: 3,
        isPublic: true,
      },
      {
        label: "Example 3",
        inputs: { n: 5 },
        expected: 8,
        isPublic: true,
      },
      {
        label: "Test 4",
        inputs: { n: 1 },
        expected: 1,
        isPublic: false,
      },
      {
        label: "Test 5",
        inputs: { n: 10 },
        expected: 89,
        isPublic: false,
      },
      {
        label: "Test 6",
        inputs: { n: 45 },
        expected: 1836311903,
        isPublic: false,
      },
    ],
  },
];

export async function POST() {
  try {
    const supabase = getAdminClient();

    // Check if DSA questions already exist (avoid double-seeding)
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("category", "dsa");

    if (count && count > 0) {
      return NextResponse.json(
        { message: "Questions already seeded.", count },
        { status: 200 }
      );
    }

    // Insert all problems
    const { data: inserted, error } = await supabase
      .from("questions")
      .insert(
        PROBLEMS.map((p, i) => ({
          title: p.title,
          description: p.description,
          category: p.category,
          difficulty: p.difficulty,
          company_tags: p.company_tags,
          topic_tags: p.topic_tags,
          hints: p.hints,
          solution: p.solution,
          function_name: p.function_name,
          params: p.params,
          return_type: p.return_type,
          starter_code: p.starter_code,
          test_cases: p.test_cases,
          question_number: i + 1,
        }))
      )
      .select("id, title");

    if (error) {
      console.error("Seed error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Set today's daily challenge to the first problem (Two Sum)
    if (inserted && inserted.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      await supabase
        .from("daily_challenges")
        .upsert({ question_id: inserted[0].id, challenge_date: today }, { onConflict: "challenge_date" });
    }

    return NextResponse.json(
      {
        message: `Seeded ${inserted?.length ?? 0} DSA problems successfully.`,
        problems: inserted?.map((q) => q.title),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Seed route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
