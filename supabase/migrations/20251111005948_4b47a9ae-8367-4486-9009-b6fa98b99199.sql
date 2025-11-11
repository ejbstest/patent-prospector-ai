-- Add database indexes for performance optimization
-- These indexes improve query performance on frequently accessed columns

-- Analyses table indexes
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON public.analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_status ON public.analyses(user_id, status);

-- Patent conflicts table indexes
CREATE INDEX IF NOT EXISTS idx_patent_conflicts_analysis_id ON public.patent_conflicts(analysis_id);
CREATE INDEX IF NOT EXISTS idx_patent_conflicts_severity ON public.patent_conflicts(conflict_severity DESC);

-- Reports table indexes
CREATE INDEX IF NOT EXISTS idx_reports_analysis_id ON public.reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Agent logs table indexes
CREATE INDEX IF NOT EXISTS idx_agent_logs_analysis_id ON public.agent_logs(analysis_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON public.agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_status ON public.agent_logs(status);

-- Payment transactions table indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_analysis_id ON public.payment_transactions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

-- User roles table indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Uploaded documents table indexes
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_analysis_id ON public.uploaded_documents(analysis_id);

-- Admin reviews table indexes
CREATE INDEX IF NOT EXISTS idx_admin_reviews_analysis_id ON public.admin_reviews(analysis_id);
CREATE INDEX IF NOT EXISTS idx_admin_reviews_expert_user_id ON public.admin_reviews(expert_user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON public.analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_analysis_created ON public.agent_logs(analysis_id, created_at DESC);