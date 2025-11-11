import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useAdminRole() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    checkAdminRole();
  }, [user, navigate]);

  const checkAdminRole = async () => {
    if (!user) return;

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (error) {
      console.error("Error checking role:", error);
      setIsAdmin(false);
      setLoading(false);
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this area",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    if (!data) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive"
      });
      navigate("/dashboard");
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }

    setLoading(false);
  };

  return { isAdmin, loading };
}
