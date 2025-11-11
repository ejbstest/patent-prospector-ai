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
      searching: { variant: 'default', label: 'Searching' },
      analyzing: { variant: 'secondary', label: 'Analyzing' },
      reviewing: { variant: 'default', label: 'Expert Review' },
      complete: { variant: 'default', label: 'Complete' },
    };
    const config = variants[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTimelineSteps = (): Array<{ label: string; status: 'complete' | 'in-progress' | 'pending'; count?: number }> => {
    const progress = analysis.progress_percentage || 0;
    return [
      { label: 'Patent search initiated', status: (progress >= 10 ? 'complete' : 'pending') as 'complete' | 'in-progress' | 'pending' },
      { 
        label: `Analyzing ${patents.length} relevant patents`, 
        status: (progress >= 10 && progress < 60 ? 'in-progress' : progress >= 60 ? 'complete' : 'pending') as 'complete' | 'in-progress' | 'pending',
        count: progress >= 10 && progress < 60 ? patents.length : undefined
      },
      { label: 'Conflict assessment', status: (progress >= 60 && progress < 80 ? 'in-progress' : progress >= 80 ? 'complete' : 'pending') as 'complete' | 'in-progress' | 'pending' },
      { label: 'Report generation', status: (progress >= 80 && progress < 95 ? 'in-progress' : progress >= 95 ? 'complete' : 'pending') as 'complete' | 'in-progress' | 'pending' },
      { label: 'Expert review', status: (progress >= 95 ? 'in-progress' : 'pending') as 'complete' | 'in-progress' | 'pending' },
    ];
  };

  const isInProgress = ['searching', 'analyzing'].includes(analysis.status);
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

      {/* Free Snapshot (unpaid completed analyses) */}
      {isComplete && !isPaid && (
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle>Free IP Risk Snapshot</CardTitle>
            <CardDescription>Upgrade to see the full analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              <RiskMeter score={analysis.risk_score || 0} />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Top 3 Potential Conflicts</h3>
              <div className="space-y-2">
                {patents.slice(0, 3).map((patent) => (
                  <div key={patent.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-mono text-sm font-medium">{patent.patent_number}</p>
                        <p className="text-sm mt-1">{patent.patent_title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {patent.assignee || 'Unknown assignee'}
                        </p>
                      </div>
                      <Badge variant="destructive">Severity: {patent.conflict_severity}/10</Badge>
                    </div>
                    <div className="mt-3 relative">
                      <p className="text-sm text-muted-foreground blur-sm select-none">
                        This patent describes a similar method for...
                      </p>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="sm" variant="secondary">
                          Unlock Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle>Unlock Full Report</CardTitle>
                <CardDescription>Get complete access to all conflicts, claim charts, and strategies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$2,500</div>
                <ul className="space-y-2 text-sm">
                  <li>✓ See all {patents.length} potential conflicts</li>
                  <li>✓ Detailed claim chart analysis</li>
                  <li>✓ Design-around strategies</li>
                  <li>✓ Competitive landscape mapping</li>
                  <li>✓ Expert review and recommendations</li>
                </ul>
                <Button className="w-full" size="lg">
                  Upgrade Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Special offer expires in 47:23:15
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Full Risk Dashboard (paid completed analyses) */}
      {isComplete && isPaid && (
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
