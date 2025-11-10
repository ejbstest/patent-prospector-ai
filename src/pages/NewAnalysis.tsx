import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewAnalysis() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New IP Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Start a comprehensive intellectual property risk assessment
        </p>
      </div>

      <Alert className="border-secondary/50 bg-secondary/10">
        <AlertCircle className="h-4 w-4 text-secondary" />
        <AlertDescription className="text-sm">
          The intake form and analysis workflow will be implemented in the next phase.
          This is a placeholder for the multi-step adaptive form.
        </AlertDescription>
      </Alert>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The IP risk analysis intake form is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature will include:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
            <li>Adaptive multi-step intake form</li>
            <li>User sophistication detection</li>
            <li>File upload for technical documents</li>
            <li>CPC/IPC classification auto-suggestion</li>
            <li>Jurisdiction selection</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
