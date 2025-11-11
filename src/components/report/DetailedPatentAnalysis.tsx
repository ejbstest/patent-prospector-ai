import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Patent {
  id: string;
  patent_number: string;
  patent_title: string;
  assignee: string | null;
  filing_date: string | null;
  conflict_severity: number | null;
  conflict_description: string | null;
  relevant_claims: string[] | null;
  design_around_suggestions: string | null;
}

interface DetailedPatentAnalysisProps {
  patents: Patent[];
}

export function DetailedPatentAnalysis({ patents }: DetailedPatentAnalysisProps) {
  const [expandedPatents, setExpandedPatents] = useState<Set<string>>(new Set());

  const togglePatent = (id: string) => {
    setExpandedPatents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSeverityColor = (severity: number | null) => {
    if (!severity) return 'bg-muted';
    if (severity >= 8) return 'bg-destructive';
    if (severity >= 5) return 'bg-warning';
    return 'bg-success';
  };

  const getSeverityLabel = (severity: number | null) => {
    if (!severity) return 'Unknown';
    if (severity >= 8) return 'Critical';
    if (severity >= 5) return 'High';
    if (severity >= 3) return 'Medium';
    return 'Low';
  };

  const highRiskPatents = patents.filter(p => (p.conflict_severity || 0) >= 5);

  return (
    <section id="patent-analysis" className="space-y-6 page-break-before">
      <div>
        <h2 className="text-3xl font-bold mb-2">Detailed Patent Analysis</h2>
        <p className="text-muted-foreground">
          In-depth review of {highRiskPatents.length} high-risk conflicting patents
        </p>
      </div>

      <div className="space-y-4">
        {highRiskPatents.map((patent) => {
          const isExpanded = expandedPatents.has(patent.id);
          const claims = patent.relevant_claims || [];
          
          return (
            <Card key={patent.id} className="overflow-hidden">
              <div className="p-6 bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-mono text-lg font-semibold">{patent.patent_number}</h3>
                      <Badge className={cn('text-white', getSeverityColor(patent.conflict_severity))}>
                        {getSeverityLabel(patent.conflict_severity)} Risk
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium mb-2">{patent.patent_title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Assignee: {patent.assignee || 'Unknown'}</span>
                      {patent.filing_date && (
                        <span>Filed: {new Date(patent.filing_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePatent(patent.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <CardContent className="pt-6 space-y-6">
                  {/* Conflict Explanation */}
                  {patent.conflict_description && (
                    <div>
                      <h4 className="font-semibold mb-2">Conflict Explanation</h4>
                      <p className="text-sm bg-muted/50 p-4 rounded-lg">
                        {patent.conflict_description}
                      </p>
                    </div>
                  )}

                  {/* Claim Chart */}
                  {claims.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Claim Chart</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/2 bg-muted">Patent Claim Element</TableHead>
                              <TableHead className="w-1/2">Your Invention Feature</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {claims.map((claim, index) => (
                              <TableRow key={index}>
                                <TableCell className="align-top bg-muted/50">
                                  <div className="text-sm">
                                    <span className="font-semibold">Element {index + 1}:</span>
                                    <p className="mt-1">{claim}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="align-top">
                                  <div className="text-sm">
                                    <Badge variant="destructive" className="mb-2">Meets</Badge>
                                    <p>Your system implements similar functionality</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Design Around Suggestions */}
                  {patent.design_around_suggestions && (
                    <div>
                      <h4 className="font-semibold mb-2">Design-Around Strategies</h4>
                      <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
                        <p className="text-sm">{patent.design_around_suggestions}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline">Feasibility: Moderate</Badge>
                          <Badge variant="outline">Impact: Low to Medium</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Legal Status */}
                  <div>
                    <h4 className="font-semibold mb-2">Legal Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Patent Status:</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Litigation History:</span>
                        <span>Under review</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {highRiskPatents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No high-risk patent conflicts identified</p>
          </div>
        )}
      </div>
    </section>
  );
}
