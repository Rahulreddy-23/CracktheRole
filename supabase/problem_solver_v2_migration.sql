-- Problem Solver V2 Migration
-- Run in Supabase SQL Editor AFTER the previous migrations
-- This adds type-safe execution metadata to the questions table

-- 1. Add function_name: the exact function name users implement (e.g. "twoSum")
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS function_name TEXT;

-- 2. Add params: ordered array of {name, type} for each parameter
--    Supported types: int, long, float, double, string, bool,
--                     int[], string[], int[][], List<Integer>, List<List<Integer>>
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS params JSONB DEFAULT '[]';

-- 3. Add return_type: the return type of the function
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS return_type TEXT;

-- 4. The test_cases column format changes from:
--      [{"input": "nums = [2,7,11,15], target = 9", "expected_output": "[0, 1]"}]
--    to:
--      [{"label": "Example 1", "inputs": {"nums": [2,7,11,15], "target": 9}, "expected": [0,1], "isPublic": true}]
--
--    isPublic: true  = shown in Test Cases tab (users see these)
--    isPublic: false = hidden test cases, only run during Submit
--
-- Clear existing DSA questions so the seed route can re-insert them in the new format.
-- Non-DSA questions (behavioral, system_design, sql) are untouched.

DELETE FROM public.question_completions
  WHERE question_id IN (
    SELECT id FROM public.questions WHERE category = 'dsa'
  );

DELETE FROM public.bookmarks
  WHERE question_id IN (
    SELECT id FROM public.questions WHERE category = 'dsa'
  );

DELETE FROM public.daily_challenges
  WHERE question_id IN (
    SELECT id FROM public.questions WHERE category = 'dsa'
  );

DELETE FROM public.questions WHERE category = 'dsa';

-- 5. Recreate the question_completions table with an additional time_ms column
--    (optional enhancement - tracks runtime in ms)
ALTER TABLE public.question_completions
  ADD COLUMN IF NOT EXISTS time_ms NUMERIC;
