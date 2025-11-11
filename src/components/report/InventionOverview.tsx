import { Badge } from '@/components/ui/badge';

interface InventionOverviewProps {
  description: string;
  keyFeatures: string[];
  classifications: string[];
  jurisdictions: string[];
}

export function InventionOverview({
  description,
  keyFeatures,
  classifications,
  jurisdictions,
}: InventionOverviewProps) {
  return (
    <section id="invention-overview" className="space-y-6 page-break-before">
      <div>
        <h2 className="text-3xl font-bold mb-2">Invention Overview</h2>
        <p className="text-muted-foreground">
          Summary of the analyzed invention and its technical characteristics
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Description</h3>
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Key Technical Features</h3>
        <ul className="grid gap-2">
          {keyFeatures.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 bg-muted/30 p-3 rounded">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-medium">
                {index + 1}
              </div>
              <span className="text-sm flex-1">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Patent Classifications</h3>
          <div className="flex flex-wrap gap-2">
            {classifications.length > 0 ? (
              classifications.map((code, index) => (
                <Badge key={index} variant="outline" className="font-mono">
                  {code}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No classifications identified</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Target Markets</h3>
          <div className="flex flex-wrap gap-2">
            {jurisdictions.length > 0 ? (
              jurisdictions.map((jurisdiction, index) => (
                <Badge key={index} variant="secondary">
                  {jurisdiction}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No target markets specified</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
