-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  target_role TEXT DEFAULT 'data_engineer',
  target_companies TEXT[] DEFAULT '{}',
  current_ctc INTEGER DEFAULT 0,
  target_ctc INTEGER DEFAULT 0,
  experience_years INTEGER DEFAULT 0,
  prep_timeline TEXT DEFAULT '3_months',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'elite')),
  streak_count INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview sessions table
CREATE TABLE public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('dsa', 'system_design', 'behavioral', 'sql')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  company_context TEXT,
  messages JSONB DEFAULT '[]',
  score_technical INTEGER CHECK (score_technical BETWEEN 0 AND 100),
  score_communication INTEGER CHECK (score_communication BETWEEN 0 AND 100),
  score_problem_solving INTEGER CHECK (score_problem_solving BETWEEN 0 AND 100),
  score_time_management INTEGER CHECK (score_time_management BETWEEN 0 AND 100),
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  feedback_summary TEXT,
  strengths TEXT[],
  improvements TEXT[],
  duration_seconds INTEGER,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Question bank table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dsa', 'system_design', 'behavioral', 'sql')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  company_tags TEXT[] DEFAULT '{}',
  topic_tags TEXT[] DEFAULT '{}',
  hints TEXT[] DEFAULT '{}',
  solution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User bookmarks
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Salary data (anonymous)
CREATE TABLE public.salary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  base_salary INTEGER NOT NULL,
  bonus INTEGER DEFAULT 0,
  esop_value INTEGER DEFAULT 0,
  total_ctc INTEGER NOT NULL,
  city TEXT DEFAULT 'bangalore',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily challenges
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) NOT NULL,
  challenge_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge completions
CREATE TABLE public.challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.daily_challenges(id) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Interview sessions: users can CRUD their own
CREATE POLICY "Users can view own sessions" ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sessions" ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.interview_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Bookmarks: users can CRUD their own
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Questions: readable by all authenticated users
CREATE POLICY "Questions readable by authenticated" ON public.questions FOR SELECT TO authenticated USING (true);

-- Daily challenges: readable by all authenticated users
CREATE POLICY "Challenges readable by authenticated" ON public.daily_challenges FOR SELECT TO authenticated USING (true);

-- Challenge completions: users can CRUD their own
CREATE POLICY "Users can view own completions" ON public.challenge_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create completions" ON public.challenge_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Salary entries: readable by authenticated, insertable by authenticated
CREATE POLICY "Salary data readable by authenticated" ON public.salary_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can submit salary data" ON public.salary_entries FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_sessions_created_at ON public.interview_sessions(created_at DESC);
CREATE INDEX idx_questions_category ON public.questions(category);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_salary_company ON public.salary_entries(company);
CREATE INDEX idx_salary_role ON public.salary_entries(role);
CREATE INDEX idx_daily_challenges_date ON public.daily_challenges(challenge_date);