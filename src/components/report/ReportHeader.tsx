import { Download, Share2, Printer, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ReportHeaderProps {
  companyName?: string;
  analysisDate: string;
  reportVersion: string;
  analysisId: string;
}

export function ReportHeader({ companyName, analysisDate, reportVersion, analysisId }: ReportHeaderProps) {
  const { toast } = useToast();

  const handleExportPDF = async () => {
    toast({ title: 'Generating PDF...', description: 'This may take a moment' });
    // TODO: Implement PDF export via edge function
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Share this link with others' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportData = (format: 'json' | 'csv') => {
    toast({ title: `Exporting ${format.toUpperCase()}...` });
    // TODO: Implement data export
  };

  return (
    <header className="sticky top-0 z-30 bg-background border-b shadow-sm print:static print:shadow-none">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {companyName || 'Aegis'} - IP Risk Analysis
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>{new Date(analysisDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <Badge variant="secondary">{reportVersion}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('json')}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('csv')}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
