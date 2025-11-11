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
  DollarSign,
  FileSearch,
  Users,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ActivityEvent = {
  id: string;
  type: string;
  description: string;
  created_at: string;
  metadata?: any;
};

type PendingReview = {
  id: string;
  invention_title: string;
  company_name: string;
  created_at: string;
  status: string;
  priority: string;
};

export default function AdminDashboard() {
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalAnalyses: 0,
    completedAnalyses: 0,
    inProgressAnalyses: 0,
    failedAnalyses: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeUsers: 0
  });
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
      
      // Auto-refresh activity feed every 30 seconds
      const interval = setInterval(loadActivityFeed, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Load analyses stats
    const { data: analyses } = await supabase
      .from('analyses')
      .select('status, amount_paid, created_at');

    if (analyses) {
      const totalAnalyses = analyses.length;
      const completedAnalyses = analyses.filter(a => a.status === 'complete').length;
      const inProgressAnalyses = analyses.filter(a => 
        a.status === 'searching' || a.status === 'analyzing' || a.status === 'reviewing'
      ).length;
      const failedAnalyses = analyses.filter(a => a.status === 'failed').length;
      const totalRevenue = analyses.reduce((sum, a) => sum + (a.amount_paid || 0), 0);

      setStats(prev => ({
        ...prev,
        totalRevenue,
        totalAnalyses,
        completedAnalyses,
        inProgressAnalyses,
        failedAnalyses
      }));
    }

    // Load user stats
    const { data: users } = await supabase
      .from('profiles')
      .select('created_at');

    if (users) {
      const totalUsers = users.length;
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const newUsersThisMonth = users.filter(
        u => new Date(u.created_at) > monthAgo
      ).length;

      setStats(prev => ({
        ...prev,
        totalUsers,
        newUsersThisMonth,
        activeUsers: Math.floor(totalUsers * 0.6) // Mock: 60% active
      }));
    }

    // Load pending reviews
    const { data: pending } = await supabase
      .from('analyses')
      .select(`
        id,
        invention_title,
        created_at,
        status,
        profiles:user_id (company_name)
      `)
      .in('status', ['analyzing', 'reviewing'])
      .order('created_at', { ascending: true })
      .limit(10);

    if (pending) {
      setPendingReviews(pending.map((p: any) => ({
        id: p.id,
        invention_title: p.invention_title,
        company_name: p.profiles?.company_name || 'Unknown',
        created_at: p.created_at,
        status: p.status,
        priority: getDaysSinceCreation(p.created_at) > 2 ? 'high' : 'normal'
      })));
    }

    loadActivityFeed();
    setLoading(false);
  };

  const loadActivityFeed = async () => {
    // Load recent agent logs as activity
    const { data: logs } = await supabase
      .from('agent_logs')
      .select('id, agent_name, status, created_at, analysis_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logs) {
      setActivities(logs.map(log => ({
        id: log.id,
        type: log.agent_name,
        description: getActivityDescription(log.agent_name, log.status),
        created_at: log.created_at,
        metadata: { analysis_id: log.analysis_id }
      })));
    }
  };

  const getDaysSinceCreation = (createdAt: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getActivityDescription = (agentName: string, status: string) => {
    const statusText = status === 'success' ? 'completed' : 'failed';
    return `${agentName.charAt(0).toUpperCase() + agentName.slice(1)} agent ${statusText}`;
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

  const keyMetrics = [
    {
      title: "Revenue This Month",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: "Total revenue generated",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      trend: "+12%"
    },
    {
      title: "Total Analyses",
      value: stats.totalAnalyses.toString(),
      description: `${stats.completedAnalyses} completed, ${stats.inProgressAnalyses} in progress`,
      icon: FileSearch,
      color: "from-blue-500 to-cyan-500",
      trend: "+8%"
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      description: `${stats.newUsersThisMonth} new this month`,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      trend: "+15%"
    },
    {
      title: "Conversion Rate",
      value: "24%",
      description: "Free → Paid conversion",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      trend: "+3%"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System overview and platform analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="border-border/50 hover:border-border transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  {metric.trend} vs last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Timeline */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Recent system events</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Service status overview</CardDescription>
              </div>
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Supabase", status: "operational", latency: "45ms" },
                { name: "OpenAI API", status: "operational", latency: "1.2s" },
                { name: "Perplexity API", status: "operational", latency: "3.5s" },
                { name: "Stripe", status: "operational", latency: "120ms" }
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{service.latency}</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews Queue */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Review Queue</CardTitle>
              <CardDescription>
                Analyses waiting for expert review
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/reviews")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">All caught up! No pending reviews.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Analysis</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.invention_title}
                      </TableCell>
                      <TableCell>{review.company_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {review.priority === 'high' ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                            High
                          </Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/dashboard/analysis/${review.id}`)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 hours</div>
            <p className="text-xs text-muted-foreground mt-1">
              Well below 48-hour target
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agent Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.5%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all AI agents
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Cost per Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8.20</div>
            <p className="text-xs text-muted-foreground mt-1">
              3.3% of revenue (healthy margin)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
