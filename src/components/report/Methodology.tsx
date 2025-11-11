export function Methodology() {
  return (
    <section id="methodology" className="space-y-6 page-break-before">
      <div>
        <h2 className="text-3xl font-bold mb-2">Methodology</h2>
        <p className="text-muted-foreground">
          Our comprehensive approach to IP risk analysis
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Data Sources</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span><strong>USPTO PatentsView API:</strong> United States Patent and Trademark Office comprehensive database</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span><strong>Lens.org:</strong> Global patent data aggregator with 140M+ patent records</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span><strong>Google Patents Public Data:</strong> Full-text patent search and citation analysis</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Search Strategy</h3>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <p><strong>Keywords:</strong> Extracted from invention description and technical specifications</p>
            <p><strong>CPC/IPC Classifications:</strong> AI-identified patent classification codes</p>
            <p><strong>Date Range:</strong> Active and pending patents from the last 20 years</p>
            <p><strong>Jurisdictions:</strong> Focused on user-specified target markets</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Analysis Approach</h3>
          <p className="text-sm">
            This analysis employs a hybrid AI-assisted methodology with expert human review:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm mt-3 ml-4">
            <li>AI-powered patent search across multiple databases</li>
            <li>Automated claim element extraction and comparison</li>
            <li>Machine learning-based conflict severity scoring</li>
            <li>Expert patent attorney review and validation</li>
            <li>Manual claim chart creation for high-risk patents</li>
            <li>Strategic mitigation recommendations by IP professionals</li>
          </ol>
        </div>

        <div className="border-l-4 border-warning pl-4 py-3 bg-warning/5">
          <h4 className="font-semibold text-warning mb-2">Important Disclaimers</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• This report does not constitute legal advice</li>
            <li>• Analysis represents a snapshot in time; patent landscape may change</li>
            <li>• Recommend consulting with licensed patent attorney before making business decisions</li>
            <li>• Some patents may be pending or not yet published</li>
            <li>• International patent families may exist beyond analyzed jurisdictions</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
