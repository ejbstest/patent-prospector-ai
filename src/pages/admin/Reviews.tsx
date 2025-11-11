import { useEffect, useState } from "react";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PendingAnalysis = {
  id: string;
  invention_title: string;
  invention_description: string;
  company_name: string;
  created_at: string;
  status: string;
  payment_status: string;
  amount_paid: number | null;
  analysis_type: string;
  user_id: string;
};

type PatentConflict = {
  id: string;
  patent_number: string;
  patent_title: string;
  assignee: string | null;
  filing_date: string | null;
  legal_status: string | null;
  conflict_severity: number | null;
  claim_overlap_percentage: number | null;
  conflict_description: string | null;
  design_around_suggestions: string | null;
};

type PreviewReport = {
  id: string;
  preliminary_risk_score: number | null;
  risk_level: string | null;
  key_findings: string[] | null;
  top_conflicts: any;
  landscape_summary: any;
  confidence_level: number | null;
  patents_found_count: number | null;
  analysis_id: string;
  created_at: string;
  generated_at: string;
};

export default function AdminReviews() {
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<PendingAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<PendingAnalysis | null>(null);
  const [conflicts, setConflicts] = useState<PatentConflict[]>([]);
  const [previewReport, setPreviewReport] = useState<PreviewReport | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [qaChecklist, setQaChecklist] = useState({
    patentVerified: false,
    riskCalibrated: false,
    claimChartAccurate: false,
    recommendationsActionable: false,
    legalDisclaimers: false,
    formattingProfessional: false,
  });

  useEffect(() => {
    if (isAdmin) {
      loadPendingAnalyses();
    }
  }, [isAdmin]);

  const loadPendingAnalyses = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        id,
        invention_title,
        invention_description,
        created_at,
        status,
        payment_status,
        amount_paid,
        analysis_type,
        user_id,
        profiles:user_id (company_name)
      `)
      .in('status', ['reviewing'])
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error loading analyses:", error);
      toast({
        title: "Error",
        description: "Failed to load pending analyses",
        variant: "destructive"
      });
    } else if (data) {
      setAnalyses(data.map((a: any) => ({
        ...a,
        company_name: a.profiles?.company_name || 'Unknown'
      })));
    }
    
    setLoading(false);
  };

  const handleTakeReview = async (analysis: PendingAnalysis) => {
    setSelectedAnalysis(analysis);
    setTimeStarted(new Date());
    setReviewNotes("");
    setQaChecklist({
      patentVerified: false,
      riskCalibrated: false,
      claimChartAccurate: false,
      recommendationsActionable: false,
      legalDisclaimers: false,
      formattingProfessional: false,
    });

    // Load conflicts for this analysis
    const { data: conflictsData } = await supabase
      .from('patent_conflicts')
      .select('*')
      .eq('analysis_id', analysis.id)
      .order('conflict_severity', { ascending: false });

    if (conflictsData) {
      setConflicts(conflictsData);
    }

    // Load preview report
    const { data: previewData } = await supabase
      .from('preview_reports')
      .select('*')
      .eq('analysis_id', analysis.id)
      .single();

    if (previewData) {
      setPreviewReport(previewData);
    }

    // Update status to reviewing
    await supabase
      .from('analyses')
      .update({ status: 'reviewing' })
      .eq('id', analysis.id);

    loadPendingAnalyses();
  };

  const handleConflictSeverityChange = async (conflictId: string, newSeverity: number) => {
    await supabase
      .from('patent_conflicts')
      .update({ conflict_severity: newSeverity })
      .eq('id', conflictId);

    setConflicts(prev => prev.map(c => 
      c.id === conflictId ? { ...c, conflict_severity: newSeverity } : c
    ));
  };

  const handleToggleConflict = async (conflictId: string, include: boolean) => {
    // Mark as false positive by setting severity to 0
    const newSeverity = include ? 5 : 0;
    
    await supabase
      .from('patent_conflicts')
      .update({ conflict_severity: newSeverity })
      .eq('id', conflictId);

    setConflicts(prev => prev.map(c => 
      c.id === conflictId ? { ...c, conflict_severity: newSeverity } : c
    ));
  };

  const handleCompleteReview = async () => {
    if (!selectedAnalysis || !timeStarted) return;

    // Check if all QA items are checked
    const allChecked = Object.values(qaChecklist).every(v => v);
    if (!allChecked) {
      toast({
        title: "QA Checklist Incomplete",
        description: "Please complete all QA checklist items before finalizing",
        variant: "destructive"
      });
      return;
    }

    const timeSpentMinutes = Math.floor((new Date().getTime() - timeStarted.getTime()) / 60000);

    // Create admin review record
    const { error: reviewError } = await supabase
      .from('admin_reviews')
      .insert({
        analysis_id: selectedAnalysis.id,
        expert_user_id: (await supabase.auth.getUser()).data.user?.id,
        review_stage: 'expert_review',
        notes: reviewNotes,
        time_spent_minutes: timeSpentMinutes,
        changes_made: {
          conflicts_adjusted: conflicts.filter(c => c.conflict_severity !== null).length,
          qa_completed: true
        }
      });

    if (reviewError) {
      console.error("Error creating review:", reviewError);
      toast({
        title: "Error",
        description: "Failed to save review",
        variant: "destructive"
      });
      return;
    }

    // Update analysis status to complete
    const { error: analysisError } = await supabase
      .from('analyses')
      .update({
        status: 'complete',
        progress_percentage: 100
      })
      .eq('id', selectedAnalysis.id);

    if (analysisError) {
      console.error("Error updating analysis:", analysisError);
      toast({
        title: "Error",
        description: "Failed to complete analysis",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Review Complete",
      description: `Analysis marked as complete. Time spent: ${timeSpentMinutes} minutes`
    });

    setSelectedAnalysis(null);
    setConflicts([]);
    setPreviewReport(null);
    loadPendingAnalyses();
  };

  const getDaysSinceCreation = (createdAt: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
        <p className="text-muted-foreground mt-2">
          Paid analyses awaiting expert review
        </p>
      </div>

      {/* Queue Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting expert attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {analyses.filter(a => getDaysSinceCreation(a.created_at) > 1).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Over 24 hours old
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${analyses.reduce((sum, a) => sum + (a.amount_paid || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In pending queue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Analyses Awaiting Review</CardTitle>
          <CardDescription>
            Click "Take Review" to begin expert analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-sm text-muted-foreground">
                No pending reviews at this time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Analysis ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Invention Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Time in Queue</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis) => {
                    const daysInQueue = getDaysSinceCreation(analysis.created_at);
                    const isUrgent = daysInQueue > 1;
                    
                    return (
                      <TableRow key={analysis.id} className={isUrgent ? "bg-red-500/5" : ""}>
                        <TableCell className="font-mono text-xs">
                          {analysis.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {analysis.company_name}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {analysis.invention_title}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isUrgent && <AlertCircle className="h-4 w-4 text-red-500" />}
                            <span className={isUrgent ? "text-red-500 font-medium" : ""}>
                              {daysInQueue}d {Math.floor(((new Date().getTime() - new Date(analysis.created_at).getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isUrgent ? (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              High
                            </Badge>
                          ) : (
                            <Badge variant="outline">Normal</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${analysis.amount_paid?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleTakeReview(analysis)}
                          >
                            Take Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Interface Sheet */}
      <Sheet open={selectedAnalysis !== null} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          {selectedAnalysis && (
            <>
              <SheetHeader>
                <SheetTitle>Expert Review: {selectedAnalysis.invention_title}</SheetTitle>
                <SheetDescription>
                  Review AI analysis and adjust as needed before finalizing
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Time Tracker */}
                {timeStarted && (
                  <Card className="bg-muted/50 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Time Spent:</span>
                        <span className="text-muted-foreground">
                          {Math.floor((new Date().getTime() - timeStarted.getTime()) / 60000)} minutes
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Tabs defaultValue="conflicts" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="qa">QA Checklist</TabsTrigger>
                  </TabsList>

                  {/* Patent Conflicts Tab */}
                  <TabsContent value="conflicts" className="space-y-4">
                    <div className="space-y-4">
                      {conflicts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No conflicts found for this analysis
                        </p>
                      ) : (
                        conflicts.map((conflict) => (
                          <Card key={conflict.id} className="border-border/50">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">
                                    {conflict.patent_number}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {conflict.patent_title}
                                  </CardDescription>
                                </div>
                                <Badge variant={conflict.conflict_severity === 0 ? "outline" : "default"}>
                                  Severity: {conflict.conflict_severity || 0}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Assignee:</span>
                                  <p className="font-medium">{conflict.assignee || 'Unknown'}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Filing Date:</span>
                                  <p className="font-medium">{conflict.filing_date || 'Unknown'}</p>
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">
                                  Conflict Severity: {conflict.conflict_severity || 0}
                                </Label>
                                <Slider
                                  value={[conflict.conflict_severity || 0]}
                                  onValueChange={(value) => handleConflictSeverityChange(conflict.id, value[0])}
                                  max={10}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`include-${conflict.id}`}
                                  checked={(conflict.conflict_severity || 0) > 0}
                                  onCheckedChange={(checked) => 
                                    handleToggleConflict(conflict.id, checked as boolean)
                                  }
                                />
                                <label
                                  htmlFor={`include-${conflict.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Include in final report
                                </label>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Analysis Overview Tab */}
                  <TabsContent value="analysis" className="space-y-4">
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Invention Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedAnalysis.invention_description}
                        </p>
                      </CardContent>
                    </Card>

                    {previewReport && (
                      <Card className="border-border/50">
                        <CardHeader>
                          <CardTitle>AI-Generated Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Risk Score</Label>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="text-4xl font-bold">
                                {previewReport.preliminary_risk_score || 0}
                              </div>
                              <Badge variant="outline" className="text-base">
                                {previewReport.risk_level || 'Unknown'}
                              </Badge>
                            </div>
                          </div>

                          {previewReport.key_findings && previewReport.key_findings.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Key Findings</Label>
                              <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                                {previewReport.key_findings.map((finding, i) => (
                                  <li key={i} className="text-muted-foreground">{finding}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Expert Notes Tab */}
                  <TabsContent value="notes" className="space-y-4">
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Expert Review Notes</CardTitle>
                        <CardDescription>
                          Add your observations and adjustments made during review
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Enter your expert notes here..."
                          rows={12}
                          className="resize-none"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* QA Checklist Tab */}
                  <TabsContent value="qa" className="space-y-4">
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Quality Assurance Checklist</CardTitle>
                        <CardDescription>
                          All items must be checked before completing the review
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { key: 'patentVerified', label: 'All patent citations verified for accuracy' },
                          { key: 'riskCalibrated', label: 'Risk score properly calibrated' },
                          { key: 'claimChartAccurate', label: 'Claim chart analysis is accurate' },
                          { key: 'recommendationsActionable', label: 'Recommendations are actionable and specific' },
                          { key: 'legalDisclaimers', label: 'Legal disclaimers included' },
                          { key: 'formattingProfessional', label: 'Report formatting is professional and client-ready' },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={qaChecklist[key as keyof typeof qaChecklist]}
                              onCheckedChange={(checked) =>
                                setQaChecklist(prev => ({ ...prev, [key]: checked as boolean }))
                              }
                            />
                            <label
                              htmlFor={key}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAnalysis(null)}
                    className="flex-1"
                  >
                    Save Draft & Close
                  </Button>
                  <Button
                    onClick={handleCompleteReview}
                    className="flex-1"
                  >
                    Mark Analysis Complete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
