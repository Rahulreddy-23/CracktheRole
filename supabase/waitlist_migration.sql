---------------- Reference file (code in supabase)-----------


-- Waitlist table for collecting emails from users interested in Pro/Elite plans.
-- Run this migration in the Supabase SQL editor.

CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anyone can insert (no auth required for the landing page)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
