-- Enable realtime for analyses table to support live updates
ALTER TABLE public.analyses REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.analyses;

-- Enable realtime for agent_logs for activity feed
ALTER TABLE public.agent_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_logs;

-- Enable realtime for patent_conflicts
ALTER TABLE public.patent_conflicts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patent_conflicts;