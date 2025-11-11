import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileSearch, 
  Plus, 
  TrendingUp, 
  Activity,
  ExternalLink,
  MoreVertical,
  Share2,
  Trash2,
  Eye,
  Copy,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type Analysis = {
  id: string;
  invention_title: string;
  status: string;
  risk_score: number | null;
  risk_level: string | null;
  created_at: string;
  payment_status: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    avgRisk: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('analyses')
      .select('id, invention_title, status, risk_score, risk_level, created_at, payment_status')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setAnalyses(data);
      
      // Calculate stats
      const total = data.length;
      const active = data.filter(a => a.status !== 'complete' && a.status !== 'failed').length;
      const completedScores = data
        .filter(a => a.risk_score !== null)
        .map(a => a.risk_score as number);
      const avgRisk = completedScores.length > 0
        ? Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
        : 0;
      
      setStats({ total, active, avgRisk });
    }
    
    setLoading(false);
  };

  const handleCopyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user?.id}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copied!",
      description: "Referral link copied to clipboard"
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      searching: { label: "Searching", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      analyzing: { label: "Analyzing", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      reviewing: { label: "Reviewing", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
      complete: { label: "Complete", className: "bg-green-500/10 text-green-500 border-green-500/20" },
      failed: { label: "Failed", className: "bg-red-500/10 text-red-500 border-red-500/20" },
      intake: { label: "Pending", className: "bg-muted text-muted-foreground" }
    };
    
    const variant = variants[status] || variants.intake;
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const quickStats = [
    {
      title: "Total Analyses",
      value: stats.total.toString(),
      description: "All time IP risk assessments",
      icon: FileSearch,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Active Analyses",
      value: stats.active.toString(),
      description: "Currently in progress",
      icon: Activity,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Average Risk Score",
      value: stats.avgRisk > 0 ? stats.avgRisk.toString() : "—",
      description: "Across completed analyses",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500"
    }
  ];

  const tips = [
    "💡 Tip: Run FTO analysis 6 months before major fundraising",
    "📊 Did you know? 60% of patent litigation targets startups in Series A/B phase",
    "🎯 Best practice: Review patent landscapes quarterly in fast-moving sectors"
  ];

  const [currentTip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your IP risk analyses and track your portfolio
          </p>
        </div>
        <Button 
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-glow"
          onClick={() => navigate("/dashboard/new-analysis")}
        >
          <Plus className="mr-2 h-5 w-5" />
          Start New Analysis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border/50 hover:border-border transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Button
          variant="outline"
          className="h-auto py-6 flex-col items-start"
          onClick={() => navigate("/dashboard/analyses")}
        >
          <FileSearch className="h-5 w-5 mb-2" />
          <span className="font-semibold">View All Analyses</span>
          <span className="text-xs text-muted-foreground">Browse your full history</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-6 flex-col items-start"
          onClick={() => navigate("/dashboard/new-analysis")}
        >
          <Plus className="h-5 w-5 mb-2" />
          <span className="font-semibold">New Analysis</span>
          <span className="text-xs text-muted-foreground">Start IP risk assessment</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-6 flex-col items-start"
          onClick={() => window.open('https://example.com/samples', '_blank')}
        >
          <ExternalLink className="h-5 w-5 mb-2" />
          <span className="font-semibold">Sample Reports</span>
          <span className="text-xs text-muted-foreground">See example analyses</span>
        </Button>
      </div>

      {/* Recent Analyses */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>
                Your latest IP risk assessment reports
              </CardDescription>
            </div>
            {analyses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/analyses")}
              >
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start your first IP risk analysis to see detailed reports and conflict assessments.
              </p>
              <Button 
                onClick={() => navigate("/dashboard/new-analysis")}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Analysis
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invention Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow 
                      key={analysis.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/dashboard/analysis/${analysis.id}`)}
                    >
                      <TableCell className="font-medium">
                        {analysis.invention_title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(analysis.status)}
                      </TableCell>
                      <TableCell>
                        {analysis.risk_score !== null ? (
                          <span className="font-semibold">{analysis.risk_score}/100</span>
                        ) : (
                          <span className="text-muted-foreground">In Progress</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/analysis/${analysis.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/dashboard/analysis/${analysis.id}`);
                              toast({ title: "Link copied!" });
                            }}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={async () => {
                                await supabase.from('analyses').delete().eq('id', analysis.id);
                                loadDashboardData();
                                toast({ title: "Analysis deleted" });
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Insights & Tips */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Insights & Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{currentTip}</p>
          </CardContent>
        </Card>

        {/* Referral Widget */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Invite & Earn</CardTitle>
            <CardDescription>
              Earn $250 credit per successful referral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 justify-start font-mono text-xs"
                onClick={handleCopyReferralLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Referral Link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You've referred 0 people • $0 earned
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
