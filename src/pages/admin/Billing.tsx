import { useAdminRole } from "@/hooks/useAdminRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function AdminBilling() {
  const { isAdmin } = useAdminRole();

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Reports</h1>
        <p className="text-muted-foreground mt-2">
          Revenue tracking and financial analytics
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Financial Dashboard</CardTitle>
          </div>
          <CardDescription>
            Comprehensive billing reports coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include MRR/ARR tracking, payment statistics, failed payments,
            subscription management, and customer segmentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
