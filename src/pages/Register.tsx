import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, any>) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Automatically render the visible Cloudflare Turnstile widget on mount
  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    const loadWidget = () => {
      if (window.turnstile) {
        try {
          window.turnstile.render("#turnstile-widget", {
            sitekey: siteKey,
            theme: "auto", // Automatically matches your app's light/dark mode
            callback: (token: string) => {
              setTurnstileToken(token);
            },
            "expired-callback": () => {
              setTurnstileToken(null);
            },
            "error-callback": () => {
              setTurnstileToken(null);
            },
          });
        } catch (e) {
          console.error("Turnstile render error:", e);
        }
      }
    };

    if (window.turnstile) {
      loadWidget();
    } else {
      const timer = setInterval(() => {
        if (window.turnstile) {
          loadWidget();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;
      toast.success("Account created successfully! Please check your email to verify.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join The Market Hub today</p>
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>

            {/* VISIBLE CLOUDFLARE TURNSTILE BOX CONTAINER */}
            <div className="py-2 flex justify-center">
              <div id="turnstile-widget" className="min-h-[65px] w-full flex justify-center" />
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-primary border-0" 
              disabled={loading || !turnstileToken}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;