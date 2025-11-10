import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSearch, Plus, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Analyses",
      value: "0",
      description: "Completed IP risk assessments",
      icon: FileSearch,
      trend: "+0%"
    },
    {
      title: "Average Risk Score",
      value: "—",
      description: "Across all analyses",
      icon: TrendingUp,
      trend: "—"
    },
    {
      title: "Credits Remaining",
      value: "—",
      description: "Free tier limit",
      icon: DollarSign,
      trend: "—"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Manage your IP risk analyses here.
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          onClick={() => navigate("/dashboard/new-analysis")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
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

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
          <CardDescription>
            Your recent IP risk assessment reports
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
