import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Analyses() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Analyses</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your IP risk assessment reports
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

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Your Analyses</CardTitle>
          <CardDescription>
            All your completed and in-progress IP risk assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first IP risk analysis to identify potential patent conflicts and get professional insights.
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
