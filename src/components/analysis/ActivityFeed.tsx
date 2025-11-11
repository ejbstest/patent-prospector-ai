import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface AgentLog {
  id: string;
  agent_name: string;
  agent_output: any;
  created_at: string;
  status: string;
}

interface ActivityFeedProps {
  analysisId: string;
}

export function ActivityFeed({ analysisId }: ActivityFeedProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);

  useEffect(() => {
    // Fetch initial logs
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setLogs(data);
    };

    fetchLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`agent-logs-${analysisId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_logs',
          filter: `analysis_id=eq.${analysisId}`,
        },
        (payload) => {
          setLogs((current) => [payload.new as AgentLog, ...current].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [analysisId]);

  const formatLogMessage = (log: AgentLog) => {
    const output = log.agent_output || {};
    if (typeof output === 'string') return output;
    if (output.message) return output.message;
    if (output.summary) return output.summary;
    return `${log.agent_name} completed ${log.status}`;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">AI Activity Feed</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {logs.length === 0 && (
            <p className="text-sm text-muted-foreground">No activity yet...</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{formatLogMessage(log)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
