import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

// Helper to get or create a persistent unique device token
const getDeviceToken = () => {
  let token = localStorage.getItem("market_device_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("market_device_token", token);
  }
  return token;
};

export const AuthPopup = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Production mode: Set to false so it tracks via Supabase and only shows once per visitor
  const FORCE_TEST_MODE = false; 

  useEffect(() => {
    // If user is already logged in, never show the popup
    if (user) return;

    let isMounted = true;

    const checkAndTrigger = async () => {
      try {
        const deviceToken = getDeviceToken();

        if (!FORCE_TEST_MODE) {
          const { data, error } = await supabase
            .from("auth_popups")
            .select("id")
            .eq("device_token", deviceToken)
            .maybeSingle();

          if (error) {
            console.error("Error checking auth popup state:", error);
          }
          if (data) return; // Already seen in database
        }

        console.log("AuthPopup timer started. Waiting 10 seconds...");

        // Start the 10-second timer
        const timer = setTimeout(async () => {
          if (!isMounted) return;
          console.log("10 seconds elapsed! Opening AuthPopup.");
          setIsOpen(true);

          if (!FORCE_TEST_MODE) {
            await supabase.from("auth_popups").insert({ device_token: deviceToken });
          }
        }, 10000);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Failed in AuthPopup effect:", err);
      }
    };

    checkAndTrigger();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Auth error:", err);
      toast.error(err.message || "Failed to authenticate with Google.");
      setIsLoading(false);
    }
  };

  if (user) return null;

  return (
    <Dialog open={isOpen} modal={true}>
      <DialogContent 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] sm:max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl text-center space-y-6 z-[99999] overflow-hidden duration-200 outline-none"
      >
        
        {/* Explicit Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-muted-foreground hover:text-foreground transition bg-muted/60"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Decorative Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3 pt-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Welcome to Market Hub!
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in instantly to chat with sellers, save favorites, and post your items in seconds.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-semibold shadow-md border border-gray-200 flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.36 7.23 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.12 0 9.87 0 11.7c0 1.83.43 3.58 1.19 5.12l4.09-2.55z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.64 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Protected by Cloudflare & Secure OAuth
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AuthPopup;