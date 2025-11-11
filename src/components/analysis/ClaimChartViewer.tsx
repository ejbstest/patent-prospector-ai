import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Patent {
  id: string;
  patent_number: string;
  patent_title: string;
  relevant_claims: string[] | null;
}

interface ClaimChartViewerProps {
  patent: Patent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimChartViewer({ patent, isOpen, onClose }: ClaimChartViewerProps) {
  if (!patent) return null;

  const claims = patent.relevant_claims || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Claim Chart: {patent.patent_number}</SheetTitle>
          <SheetDescription>{patent.patent_title}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Patent Claim Element</TableHead>
                  <TableHead className="w-1/2">Your Invention Feature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim, index) => (
                  <TableRow key={index}>
                    <TableCell className="align-top">
                      <div className="text-sm">
                        <span className="font-semibold">Element {index + 1}:</span>
                        <p className="mt-1">{claim}</p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top bg-muted/30">
                      <div className="text-sm">
                        <span className="font-semibold">Matching Feature:</span>
                        <p className="mt-1">
                          <span className="bg-warning/20 px-1 rounded">
                            Your system includes similar functionality
                          </span>
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Infringement Likelihood Assessment</h4>
            <p className="text-sm text-muted-foreground">
              Based on the claim chart analysis, there is a <strong className="text-destructive">high likelihood</strong> of patent infringement.
              We recommend consulting with a patent attorney for a formal freedom-to-operate opinion.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
