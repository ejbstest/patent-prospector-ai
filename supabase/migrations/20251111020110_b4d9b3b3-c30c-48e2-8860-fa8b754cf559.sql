-- Create preview_reports table for storing AI-generated free previews
CREATE TABLE public.preview_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  preliminary_risk_score INTEGER,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  confidence_level INTEGER DEFAULT 85,
  top_conflicts JSONB DEFAULT '[]'::jsonb,
  key_findings TEXT[] DEFAULT ARRAY[]::TEXT[],
  landscape_summary JSONB DEFAULT '{}'::jsonb,
  patents_found_count INTEGER DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.preview_reports ENABLE ROW LEVEL SECURITY;

-- Users can view preview reports from their analyses
CREATE POLICY "Users can view preview reports from their analyses"
ON public.preview_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.analyses
    WHERE analyses.id = preview_reports.analysis_id
    AND analyses.user_id = auth.uid()
  )
);

-- Admins and experts can view all preview reports
CREATE POLICY "Admins and experts can view all preview reports"
ON public.preview_reports
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'expert'::app_role)
);

-- Service role can create preview reports (via edge functions)
CREATE POLICY "Service role can create preview reports"
ON public.preview_reports
FOR INSERT
WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX idx_preview_reports_analysis_id ON public.preview_reports(analysis_id);