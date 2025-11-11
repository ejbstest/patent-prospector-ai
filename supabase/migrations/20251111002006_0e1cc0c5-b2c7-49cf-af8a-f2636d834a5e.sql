-- Create storage bucket for analysis documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-documents', 'analysis-documents', false);

-- RLS policy: Users can upload files to their own analyses
CREATE POLICY "Users can upload to their analyses"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'analysis-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Users can view their own analysis documents
CREATE POLICY "Users can view their analysis documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'analysis-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Admins and experts can view all analysis documents
CREATE POLICY "Admins and experts can view all analysis documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'analysis-documents' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'expert'::app_role))
);