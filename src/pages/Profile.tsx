import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setName(data.name);
        setPhone(data.phone ?? "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      toast.error("Name must be between 1 and 100 characters");
      return;
    }
    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^[\d\s\-+()]{0,20}$/.test(trimmedPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: trimmedName, phone: trimmedPhone || null })
      .eq("user_id", user!.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return <div className="container py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+268 7XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
            />
          </div>
          <Button type="submit" className="w-full gradient-primary border-0" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
