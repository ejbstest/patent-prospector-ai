import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Check } from "lucide-react";

export default function Billing() {
  const currentPlan = {
    name: "Free",
    price: "$0",
    period: "month",
    features: [
      "1 IP risk snapshot per month",
      "Basic conflict detection",
      "Email support",
      "2-page summary reports"
    ]
  };

  const upgradePlans = [
    {
      name: "Standard",
      price: "$1,999",
      period: "per analysis",
      features: [
        "Complete IP risk analysis",
        "Full detailed reports (10-15 pages)",
        "Design-around strategies",
        "Priority support",
        "Interactive claim charts"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: "$3,499",
      period: "per analysis",
      features: [
        "Everything in Standard",
        "White space analysis",
        "Competitive landscape mapping",
        "Innovation opportunity scoring",
        "Dedicated expert review"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      features: [
        "Everything in Premium",
        "Portfolio management",
        "Team collaboration tools",
        "White-label reports",
        "Volume discounts",
        "Custom integrations"
      ],
      popular: false
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and payment methods
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{currentPlan.price}</span>
              <span className="text-muted-foreground">/ {currentPlan.period}</span>
            </div>
            <ul className="space-y-2">
              {currentPlan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {upgradePlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`border-border/50 relative ${plan.popular ? 'border-secondary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/ {plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  disabled
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your past transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payment history yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
