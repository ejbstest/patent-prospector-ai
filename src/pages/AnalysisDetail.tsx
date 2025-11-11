import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Share2, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProgressRing } from '@/components/analysis/ProgressRing';
import { ProgressTimeline } from '@/components/analysis/ProgressTimeline';
import { CountdownTimer } from '@/components/analysis/CountdownTimer';
import { ActivityFeed } from '@/components/analysis/ActivityFeed';
import { RiskMeter } from '@/components/analysis/RiskMeter';
import { ConflictingPatentsTable } from '@/components/analysis/ConflictingPatentsTable';
import { ClaimChartViewer } from '@/components/analysis/ClaimChartViewer';
import { format } from 'date-fns';

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [patents, setPatents] = useState<any[]>([]);
  const [selectedPatent, setSelectedPatent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchAnalysis = async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast({ title: 'Error loading analysis', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }

      setAnalysis(data);
      setIsLoading(false);
    };

    const fetchPatents = async () => {
      const { data } = await supabase
        .from('patent_conflicts')
        .select('*')
        .eq('analysis_id', id)
        .order('conflict_severity', { ascending: false });

      if (data) setPatents(data);
    };

    fetchAnalysis();
    fetchPatents();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`analysis-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analyses',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setAnalysis(payload.new);
          toast({ title: 'Analysis updated', description: 'Progress has been updated' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user, navigate, toast]);

  if (isLoading || !analysis) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      submitted: { variant: 'secondary', label: 'Submitted' },
      queued: { variant: 'secondary', label: 'Queued' },
      searching: { variant: 'default', label: 'Searching' },
      analyzing: { variant: 'secondary', label: 'Analyzing' },
      generating_claims: { variant: 'default', label: 'Generating Claims' },
      identifying_whitespace: { variant: 'default', label: 'Identifying White Space' },
      writing_report: { variant: 'default', label: 'Writing Report' },
      formatting: { variant: 'default', label: 'Formatting' },
      complete: { variant: 'default', label: 'Complete' },
      failed: { variant: 'destructive', label: 'Failed' },
    };
    const config = variants[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTimelineSteps = (): Array<{ label: string; status: 'complete' | 'in-progress' | 'pending'; count?: number }> => {
    const statusOrder = ['submitted', 'queued', 'searching', 'analyzing', 'generating_claims', 'identifying_whitespace', 'writing_report', 'formatting', 'complete'];
    const currentIndex = statusOrder.indexOf(analysis.status);
    
    return [
      { 
        label: 'Patent search initiated', 
        status: currentIndex >= 2 ? 'complete' : currentIndex === 2 ? 'in-progress' : 'pending'
      },
      { 
        label: `Analyzing ${patents.length} relevant patents`, 
        status: currentIndex > 3 ? 'complete' : currentIndex === 3 ? 'in-progress' : 'pending',
        count: currentIndex >= 3 ? patents.length : undefined
      },
      { 
        label: 'Generating claim charts', 
        status: currentIndex > 4 ? 'complete' : currentIndex === 4 ? 'in-progress' : 'pending'
      },
      { 
        label: 'Identifying white space opportunities', 
        status: currentIndex > 5 ? 'complete' : currentIndex === 5 ? 'in-progress' : 'pending'
      },
      { 
        label: 'Writing comprehensive report', 
        status: currentIndex > 6 ? 'complete' : currentIndex === 6 ? 'in-progress' : 'pending'
      },
      { 
        label: 'Final formatting & delivery', 
        status: currentIndex >= 8 ? 'complete' : currentIndex === 7 ? 'in-progress' : 'pending'
      },
    ];
  };

  const isInProgress = !['complete', 'failed'].includes(analysis.status);
  const isComplete = analysis.status === 'complete';
  const isPaid = analysis.payment_status === 'paid';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/analyses')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{analysis.invention_title}</h1>
            <div className="flex items-center gap-3 mt-2">
              {getStatusBadge(analysis.status)}
              <span className="text-sm text-muted-foreground">
                Created {format(new Date(analysis.created_at), 'MMM d, yyyy')}
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                ID: {analysis.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Section (for in-progress analyses) */}
      {isInProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis in Progress</CardTitle>
            <CardDescription>Our AI agents are working on your IP risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ProgressRing percentage={analysis.progress_percentage || 0} />
              <div className="flex-1 w-full space-y-6">
                <ProgressTimeline steps={getTimelineSteps()} />
                <CountdownTimer progressPercentage={analysis.progress_percentage || 0} />
              </div>
            </div>
            <ActivityFeed analysisId={id!} />
          </CardContent>
        </Card>
      )}

      {/* Full Risk Dashboard (paid completed analyses) */}
      {isComplete && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <RiskMeter score={analysis.risk_score || 0} size={200} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conflicting Patents ({patents.length})</CardTitle>
              <CardDescription>Patents that may pose IP risks</CardDescription>
            </CardHeader>
            <CardContent>
              <ConflictingPatentsTable 
                patents={patents} 
                onViewClaimChart={setSelectedPatent}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Report</CardTitle>
              <CardDescription>
                Generated {analysis.report_generated_at ? format(new Date(analysis.report_generated_at), 'MMM d, yyyy') : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(`/dashboard/analysis/${id}/report`)}>
                View Complete Report
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <ClaimChartViewer
        patent={selectedPatent}
        isOpen={!!selectedPatent}
        onClose={() => setSelectedPatent(null)}
      />
    </div>
  );
}
