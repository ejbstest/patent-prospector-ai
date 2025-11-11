import { useAdminRole } from "@/hooks/useAdminRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
  const { isAdmin } = useAdminRole();

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Platform metrics and insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Analytics Dashboard</CardTitle>
          </div>
          <CardDescription>
            Detailed charts and reports coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include comprehensive analytics including user growth charts, 
            revenue trends, conversion funnels, and geographic distribution maps.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
