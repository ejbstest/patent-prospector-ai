import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex mb-8 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary items-center justify-center shadow-glow animate-pulse">
          <Shield className="h-8 w-8 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          IP Risk Analyzer
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Professional intellectual property risk assessment powered by AI. 
          Identify patent conflicts before they become problems.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white group px-8"
            onClick={() => navigate("/signup")}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="border-2 px-8"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            {
              title: "AI-Powered Analysis",
              description: "Advanced algorithms scan millions of patents to identify potential conflicts"
            },
            {
              title: "Professional Reports",
              description: "Get detailed, actionable reports with design-around strategies"
            },
            {
              title: "Expert Review",
              description: "Every analysis reviewed by IP professionals for accuracy"
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-xl bg-card border border-border/50 hover:border-secondary/50 transition-colors">
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
