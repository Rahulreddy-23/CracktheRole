-- Migration: Add columns to questions table and create question_completions table
-- Run this in Supabase SQL Editor

-- 1. Add starter_code (JSONB) to questions
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS starter_code JSONB DEFAULT '{}';

-- 2. Add test_cases (JSONB) to questions
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS test_cases JSONB DEFAULT '[]';

-- 3. Add question_number (integer) to questions
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS question_number INTEGER;

-- 4. Create question_completions table for tracking solved questions
CREATE TABLE IF NOT EXISTS public.question_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  passed_tests INTEGER DEFAULT 0,
  total_tests INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- RLS for question_completions
ALTER TABLE public.question_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own completions" ON public.question_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create completions" ON public.question_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions" ON public.question_completions FOR UPDATE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_question_completions_user ON public.question_completions(user_id);

-- 5. Assign question_number to existing questions ordered by created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.questions
)
UPDATE public.questions q
SET question_number = n.rn
FROM numbered n
WHERE q.id = n.id;

-- 6. Update DSA questions with starter_code and test_cases
-- Two Sum
UPDATE public.questions SET
  starter_code = '{
    "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass",
    "javascript": "function twoSum(nums, target) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "nums = [2, 7, 11, 15], target = 9", "expected_output": "[0, 1]"},
    {"input": "nums = [3, 2, 4], target = 6", "expected_output": "[1, 2]"},
    {"input": "nums = [3, 3], target = 6", "expected_output": "[0, 1]"}
  ]'::jsonb
WHERE title = 'Two Sum';

-- Best Time to Buy and Sell Stock
UPDATE public.questions SET
  starter_code = '{
    "python": "def maxProfit(prices: list[int]) -> int:\n    # Write your solution here\n    pass",
    "javascript": "function maxProfit(prices) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n        return 0;\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "prices = [7, 1, 5, 3, 6, 4]", "expected_output": "5"},
    {"input": "prices = [7, 6, 4, 3, 1]", "expected_output": "0"},
    {"input": "prices = [2, 4, 1]", "expected_output": "2"}
  ]'::jsonb
WHERE title = 'Best Time to Buy and Sell Stock';

-- Valid Parentheses
UPDATE public.questions SET
  starter_code = '{
    "python": "def isValid(s: str) -> bool:\n    # Write your solution here\n    pass",
    "javascript": "function isValid(s) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "s = \"()[]{}\"", "expected_output": "true"},
    {"input": "s = \"(]\"", "expected_output": "false"},
    {"input": "s = \"([)]\"", "expected_output": "false"},
    {"input": "s = \"{[]}\"", "expected_output": "true"}
  ]'::jsonb
WHERE title = 'Valid Parentheses';

-- Binary Search
UPDATE public.questions SET
  starter_code = '{
    "python": "def search(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass",
    "javascript": "function search(nums, target) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "nums = [-1, 0, 3, 5, 9, 12], target = 9", "expected_output": "4"},
    {"input": "nums = [-1, 0, 3, 5, 9, 12], target = 2", "expected_output": "-1"},
    {"input": "nums = [5], target = 5", "expected_output": "0"}
  ]'::jsonb
WHERE title = 'Binary Search';

-- Maximum Subarray
UPDATE public.questions SET
  starter_code = '{
    "python": "def maxSubArray(nums: list[int]) -> int:\n    # Write your solution here\n    pass",
    "javascript": "function maxSubArray(nums) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", "expected_output": "6"},
    {"input": "nums = [1]", "expected_output": "1"},
    {"input": "nums = [5, 4, -1, 7, 8]", "expected_output": "23"}
  ]'::jsonb
WHERE title = 'Maximum Subarray';

-- 3Sum
UPDATE public.questions SET
  starter_code = '{
    "python": "def threeSum(nums: list[int]) -> list[list[int]]:\n    # Write your solution here\n    pass",
    "javascript": "function threeSum(nums) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "nums = [-1, 0, 1, 2, -1, -4]", "expected_output": "[[-1, -1, 2], [-1, 0, 1]]"},
    {"input": "nums = [0, 1, 1]", "expected_output": "[]"},
    {"input": "nums = [0, 0, 0]", "expected_output": "[[0, 0, 0]]"}
  ]'::jsonb
WHERE title = '3Sum';

-- Longest Substring Without Repeating Characters
UPDATE public.questions SET
  starter_code = '{
    "python": "def lengthOfLongestSubstring(s: str) -> int:\n    # Write your solution here\n    pass",
    "javascript": "function lengthOfLongestSubstring(s) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "s = \"abcabcbb\"", "expected_output": "3"},
    {"input": "s = \"bbbbb\"", "expected_output": "1"},
    {"input": "s = \"pwwkew\"", "expected_output": "3"}
  ]'::jsonb
WHERE title = 'Longest Substring Without Repeating Characters';

-- Number of Islands
UPDATE public.questions SET
  starter_code = '{
    "python": "def numIslands(grid: list[list[str]]) -> int:\n    # Write your solution here\n    pass",
    "javascript": "function numIslands(grid) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return 0;\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "grid = [[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]", "expected_output": "1"},
    {"input": "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]", "expected_output": "3"}
  ]'::jsonb
WHERE title = 'Number of Islands';

-- Merge K Sorted Lists
UPDATE public.questions SET
  starter_code = '{
    "python": "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\ndef mergeKLists(lists):\n    # Write your solution here\n    pass",
    "javascript": "// Definition for singly-linked list.\n// function ListNode(val, next) {\n//     this.val = (val===undefined ? 0 : val)\n//     this.next = (next===undefined ? null : next)\n// }\n\nfunction mergeKLists(lists) {\n    // Write your solution here\n\n}",
    "java": "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write your solution here\n        return null;\n    }\n}"
  }'::jsonb,
  test_cases = '[
    {"input": "lists = [[1,4,5],[1,3,4],[2,6]]", "expected_output": "[1,1,2,3,4,4,5,6]"},
    {"input": "lists = []", "expected_output": "[]"},
    {"input": "lists = [[]]", "expected_output": "[]"}
  ]'::jsonb
WHERE title = 'Merge K Sorted Lists';

-- LRU Cache Design
UPDATE public.questions SET
  starter_code = '{
    "python": "class LRUCache:\n    def __init__(self, capacity: int):\n        # Write your solution here\n        pass\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass",
    "javascript": "class LRUCache {\n    constructor(capacity) {\n        // Write your solution here\n    }\n\n    get(key) {\n\n    }\n\n    put(key, value) {\n\n    }\n}",
    "java": "class LRUCache {\n    public LRUCache(int capacity) {\n        // Write your solution here\n    }\n\n    public int get(int key) {\n        return -1;\n    }\n\n    public void put(int key, int value) {\n\n    }\n}"
  }'::jsonb,
  test_cases = '[]'::jsonb
WHERE title = 'LRU Cache Design';
