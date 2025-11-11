import { useAdminRole } from "@/hooks/useAdminRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function AdminSystem() {
  const { isAdmin } = useAdminRole();

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground mt-2">
          Monitor system performance and service status
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle>System Monitoring</CardTitle>
          </div>
          <CardDescription>
            Real-time system health monitoring coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include detailed service status, error logs, performance metrics,
            and agent bottleneck analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
