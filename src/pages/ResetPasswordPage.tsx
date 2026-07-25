import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const handleAuthRecovery = async () => {
      try {
        // 1. Check if Supabase already processed the URL hash into an active session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && isMounted) {
          setVerifyingSession(false);
          return;
        }

        // 2. Listen for the PASSWORD_RECOVERY event triggered by parsing the URL tokens
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if ((event === "PASSWORD_RECOVERY" || currentSession) && isMounted) {
            setVerifyingSession(false);
          }
        });

        // 3. Fallback timeout in case the hash needs manual parsing or events take a moment
        const timer = setTimeout(() => {
          if (isMounted) {
            setVerifyingSession(false);
          }
        }, 2000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err) {
        console.error("Session verification error:", err);
        if (isMounted) setVerifyingSession(false);
      }
    };

    handleAuthRecovery();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);
    
    try {
      // Update the user password using the verified recovery context
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;

      toast.success("Password updated successfully! Please sign in with your new credentials.");

      // Clean sign out to clear temporary tokens and force Supabase to flush credentials cleanly
      await supabase.auth.signOut();

      // Navigate back to login
      navigate("/login", { replace: true });
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(err.message || "Failed to update password. Please request a new recovery link.");
    } finally {
      setLoading(false);
    }
  };

  if (verifyingSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs sm:text-sm font-medium">Verifying password reset session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={handleReset} className="w-full max-w-md bg-card border border-border/80 shadow-lg p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Set New Password</h2>
          <p className="text-xs text-muted-foreground">
            Please enter your new desired password below.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="At least 6 characters"
              required 
              minLength={6}
              className="h-11 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Re-enter new password"
              required 
              minLength={6}
              className="h-11 rounded-xl text-xs sm:text-sm"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 rounded-xl text-xs sm:text-sm font-semibold gradient-primary border-0 shadow-md mt-2" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;