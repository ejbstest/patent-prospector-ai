-- Create enum types
CREATE TYPE public.user_type AS ENUM ('novice', 'intermediate', 'expert');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'standard', 'premium', 'enterprise');
CREATE TYPE public.analysis_status AS ENUM ('intake', 'searching', 'analyzing', 'reviewing', 'complete', 'failed');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.analysis_type AS ENUM ('standard', 'premium_whitespace');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid', 'free_trial');
CREATE TYPE public.report_type AS ENUM ('snapshot', 'full', 'premium');
CREATE TYPE public.agent_name AS ENUM ('research', 'analysis', 'legal', 'report', 'qa');
CREATE TYPE public.agent_status AS ENUM ('success', 'failed');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due');
CREATE TYPE public.transaction_status AS ENUM ('succeeded', 'failed', 'pending');
CREATE TYPE public.referral_status AS ENUM ('pending', 'completed', 'credited');
CREATE TYPE public.app_role AS ENUM ('admin', 'expert', 'user');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  user_type user_type DEFAULT 'novice',
  subscription_tier subscription_tier DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create analyses table
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invention_title TEXT NOT NULL,
  invention_description TEXT NOT NULL,
  technical_keywords TEXT[],
  cpc_classifications TEXT[],
  jurisdictions TEXT[],
  status analysis_status DEFAULT 'intake' NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level risk_level,
  analysis_type analysis_type DEFAULT 'standard' NOT NULL,
  payment_status payment_status DEFAULT 'unpaid' NOT NULL,
  amount_paid DECIMAL(10,2),
  report_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create uploaded_documents table
CREATE TABLE public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create patent_conflicts table
CREATE TABLE public.patent_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  patent_number TEXT NOT NULL,
  patent_title TEXT NOT NULL,
  assignee TEXT,
  filing_date DATE,
  legal_status TEXT,
  conflict_severity INTEGER CHECK (conflict_severity >= 1 AND conflict_severity <= 10),
  claim_overlap_percentage DECIMAL(5,2),
  relevant_claims TEXT[],
  conflict_description TEXT,
  design_around_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  report_type report_type NOT NULL,
  executive_summary TEXT,
  detailed_analysis JSONB,
  pdf_path TEXT,
  version INTEGER DEFAULT 1 NOT NULL,
  generated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create agent_logs table
CREATE TABLE public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  agent_name agent_name NOT NULL,
  agent_input JSONB,
  agent_output JSONB,
  execution_time_ms INTEGER,
  status agent_status NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create admin_reviews table
CREATE TABLE public.admin_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  expert_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_stage TEXT NOT NULL,
  time_spent_minutes INTEGER,
  changes_made JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_name TEXT NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create payment_transactions table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd' NOT NULL,
  status transaction_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status referral_status DEFAULT 'pending' NOT NULL,
  credit_amount DECIMAL(10,2) DEFAULT 250,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patent_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for analyses
CREATE TRIGGER update_analyses_updated_at
BEFORE UPDATE ON public.analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for analyses
CREATE POLICY "Users can view their own analyses"
ON public.analyses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
ON public.analyses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.analyses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and experts can view all analyses"
ON public.analyses FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'expert')
);

-- RLS Policies for uploaded_documents
CREATE POLICY "Users can view documents from their analyses"
ON public.uploaded_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.analyses
    WHERE analyses.id = uploaded_documents.analysis_id
    AND analyses.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents to their analyses"
ON public.uploaded_documents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.analyses
    WHERE analyses.id = uploaded_documents.analysis_id
    AND analyses.user_id = auth.uid()
  )
);

-- RLS Policies for patent_conflicts
CREATE POLICY "Users can view conflicts from their analyses"
ON public.patent_conflicts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.analyses
    WHERE analyses.id = patent_conflicts.analysis_id
    AND analyses.user_id = auth.uid()
  )
);

CREATE POLICY "Experts can create and update conflicts"
ON public.patent_conflicts FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'expert')
);

-- RLS Policies for reports
CREATE POLICY "Users can view reports from their analyses"
ON public.reports FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.analyses
    WHERE analyses.id = reports.analysis_id
    AND analyses.user_id = auth.uid()
  )
);

CREATE POLICY "Experts can create and update reports"
ON public.reports FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'expert')
);

-- RLS Policies for agent_logs
CREATE POLICY "Admins can view all agent logs"
ON public.agent_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_reviews
CREATE POLICY "Experts can view their own reviews"
ON public.admin_reviews FOR SELECT
TO authenticated
USING (auth.uid() = expert_user_id);

CREATE POLICY "Experts can create reviews"
ON public.admin_reviews FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'expert')
);

CREATE POLICY "Admins can view all reviews"
ON public.admin_reviews FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.payment_transactions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can create referrals"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referrer_user_id);

-- Create indexes for performance
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_status ON public.analyses(status);
CREATE INDEX idx_uploaded_documents_analysis_id ON public.uploaded_documents(analysis_id);
CREATE INDEX idx_patent_conflicts_analysis_id ON public.patent_conflicts(analysis_id);
CREATE INDEX idx_reports_analysis_id ON public.reports(analysis_id);
CREATE INDEX idx_agent_logs_analysis_id ON public.agent_logs(analysis_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);