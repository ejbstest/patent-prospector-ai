import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { TableOfContents } from '@/components/report/TableOfContents';
import { ReportHeader } from '@/components/report/ReportHeader';
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary';
import { Methodology } from '@/components/report/Methodology';
import { InventionOverview } from '@/components/report/InventionOverview';
import { DetailedPatentAnalysis } from '@/components/report/DetailedPatentAnalysis';
import { MitigationStrategies } from '@/components/report/MitigationStrategies';

export default function ReportViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [patents, setPatents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('executive-summary');

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      // Fetch analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (analysisError) {
        toast({ title: 'Error loading report', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }

      // Check if analysis is complete
      if (analysisData.status !== 'complete') {
        toast({ 
          title: 'Report not ready', 
          description: 'This analysis is still in progress',
          variant: 'destructive' 
        });
        navigate(`/dashboard/analysis/${id}`);
        return;
      }

      // Check payment status
      if (analysisData.payment_status !== 'paid') {
        toast({ 
          title: 'Upgrade required', 
          description: 'Please upgrade to view the full report',
          variant: 'destructive' 
        });
        navigate(`/dashboard/analysis/${id}`);
        return;
      }

      setAnalysis(analysisData);

      // Fetch patents
      const { data: patentData } = await supabase
        .from('patent_conflicts')
        .select('*')
        .eq('analysis_id', id)
        .order('conflict_severity', { ascending: false });

      if (patentData) setPatents(patentData);
      setIsLoading(false);
    };

    fetchData();
  }, [id, user, navigate, toast]);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  if (isLoading || !analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  const tocItems = [
    { id: 'executive-summary', title: 'Executive Summary', level: 1 },
    { id: 'methodology', title: 'Methodology', level: 1 },
    { id: 'invention-overview', title: 'Invention Overview', level: 1 },
    { id: 'patent-analysis', title: 'Patent Analysis', level: 1 },
    { id: 'mitigation-strategies', title: 'Mitigation Strategies', level: 1 },
  ];

  const keyFindings = [
    `${patents.filter(p => (p.conflict_severity || 0) >= 7).length} high-risk patent conflicts identified`,
    `Primary concern: Patent ${patents[0]?.patent_number || 'N/A'} from ${patents[0]?.assignee || 'unknown assignee'}`,
    'Recommended immediate action: Design-around strategy for top 3 conflicts',
    `Overall risk level: ${analysis.risk_level || 'Medium'}`,
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:static { position: static !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .page-break-before { page-break-before: always; }
          .page-break-after { page-break-after: always; }
          body { background: white; }
        }
      `}</style>

      <ReportHeader
        companyName={undefined}
        analysisDate={analysis.created_at}
        reportVersion="v1.0 - Expert Reviewed"
        analysisId={analysis.id}
      />

      <div className="flex relative">
        <TableOfContents items={tocItems} activeId={activeSection} />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/dashboard/analysis/${id}`)}
              className="mb-6 print:hidden"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analysis
            </Button>

            <div className="space-y-12 bg-white shadow-sm rounded-lg p-8 print:shadow-none">
              <ExecutiveSummary
                riskScore={analysis.risk_score || 50}
                riskLevel={analysis.risk_level || 'medium'}
                keyFindings={keyFindings}
                recommendation={(analysis.risk_score || 50) < 40 ? 'proceed' : (analysis.risk_score || 50) < 70 ? 'caution' : 'halt'}
                estimatedCost={45000}
              />

              <Methodology />

              <InventionOverview
                description={analysis.invention_description || 'No description provided'}
                keyFeatures={analysis.technical_keywords || []}
                classifications={analysis.cpc_classifications || []}
                jurisdictions={analysis.jurisdictions || []}
              />

              <DetailedPatentAnalysis patents={patents} />

              <MitigationStrategies />

              {/* Next Steps Section */}
              <section id="next-steps" className="space-y-6 page-break-before">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Next Steps & Resources</h2>
                  <p className="text-muted-foreground">
                    Recommended actions and helpful resources
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Recommended Service Providers</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Patent Attorneys:</strong> Contact a licensed patent attorney for FTO opinions</li>
                    <li>• <strong>Patent Watch Services:</strong> CPA Global, Minesoft, or Questel for monitoring</li>
                    <li>• <strong>R&D Consultation:</strong> Engineering firms for design-around implementation</li>
                    <li>• <strong>Licensing Brokers:</strong> ICAP Patent Brokerage for licensing discussions</li>
                  </ul>
                </div>

                <div className="border-l-4 border-warning pl-4 py-3">
                  <h4 className="font-semibold mb-2">When to Update This Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    We recommend refreshing this IP risk analysis annually or when making significant product changes.
                    Patent landscapes evolve constantly as new patents are filed and granted.
                  </p>
                </div>
              </section>

              {/* Disclaimers */}
              <section className="text-xs text-muted-foreground border-t pt-6 space-y-2">
                <p><strong>Legal Disclaimer:</strong> This report is for informational purposes only and does not constitute legal advice. Consult with a licensed patent attorney before making business decisions based on this analysis.</p>
                <p><strong>Accuracy:</strong> While we strive for accuracy, patent data may be incomplete or outdated. Some patents may be pending or not yet published.</p>
                <p><strong>Liability:</strong> We are not liable for any decisions made based on this report. This analysis represents a snapshot in time and the patent landscape may change.</p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
