import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Loader2, User, Phone, Mail, MapPin, Camera, Package, Heart, CheckCircle2, ShieldCheck, LogOut 
} from "lucide-react";
import * as SeoModule from "@/hooks/useSeo";

// Safe import guard against module export mismatches
const Seo = (SeoModule as any).Seo || (SeoModule as any).default || (() => null);

const LOCATIONS = ["Mbabane", "Manzini", "Matsapha", "Siteki", "Big Bend", "Nhlangano", "Piggs Peak"];

const ProfilePage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 1. Fetch Profile with React Query
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // 2. Fetch User Analytics / Stats
  const { data: userStats } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      const { count: adsCount } = await supabase
        .from("advertisements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      return {
        adsCount: adsCount || 0,
      };
    },
    enabled: !!user?.id,
  });

  // Populate local form state once data arrives
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setAvatarUrl(profile.avatar_url || "");
    } else if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  // Auth Guard Redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // 3. Profile Mutation (Fixed with onConflict)
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: { name: string; phone: string | null; location: string | null; avatar_url: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user!.id,
            ...updatedData,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id", // Instructs Supabase to update when user_id exists
          }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile saved successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user!.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setAvatarUrl(publicUrl);
      updateProfileMutation.mutate({
        name,
        phone: phone.trim() || null,
        location: location || null,
        avatar_url: publicUrl,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      toast.error("Name must be between 1 and 100 characters");
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^[\d\s\-+()]{7,20}$/.test(trimmedPhone)) {
      toast.error("Please enter a valid phone number format");
      return;
    }

    updateProfileMutation.mutate({
      name: trimmedName,
      phone: trimmedPhone || null,
      location: location || null,
      avatar_url: avatarUrl || null,
    });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile information...</p>
      </div>
    );
  }

  const hasChanges = 
    name !== (profile?.name || "") ||
    phone !== (profile?.phone || "") ||
    location !== (profile?.location || "");

  return (
    <div className="container max-w-5xl py-8 px-4 mx-auto space-y-8 animate-fade-in">
      {Seo && <Seo title="Account & Profile Settings | Market Hub" description="Manage your personal information and preferences." />}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          
          {/* Avatar Upload Container */}
          <div className="relative group">
            <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-md">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {name ? name.substring(0, 2).toUpperCase() : <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:scale-105 transition-transform"
            >
              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          {/* User Bio Summary */}
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{name || "Valued User"}</h1>
              <Badge variant="secondary" className="gap-1 font-normal text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified Account
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <Mail className="h-3.5 w-3.5" /> {user?.email}
            </p>
            {location && (
              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {location}, Eswatini
              </p>
            )}
          </div>

          {/* Quick Action Button */}
          <Button variant="outline" size="sm" onClick={() => signOut?.()} className="gap-2 shrink-0">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userStats?.adsCount ?? 0}</p>
              <p className="text-xs text-muted-foreground font-medium">Active Ads</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-xl text-accent-foreground">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">Saved</p>
              <p className="text-xs text-muted-foreground font-medium">Favorite Items</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-xl text-muted-foreground">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">Active</p>
              <p className="text-xs text-muted-foreground font-medium">Account Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="details">Personal Details</TabsTrigger>
          <TabsTrigger value="security">Account Security</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your public contact details for buyers and sellers.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9"
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+268 7612 3456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9"
                        maxLength={20}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Used by buyers to call or WhatsApp you.</p>
                  </div>

                  {/* Preferred Location Selection */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="location">Primary Location / Region</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select your main area in Eswatini" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending || !hasChanges}
                    className="min-w-[140px]"
                  >
                    {updateProfileMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Account Credentials</CardTitle>
              <CardDescription>Manage your sign-in details and primary security identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
                <div>
                  <p className="font-semibold text-sm">Primary Email Address</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-600/30">Verified</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                To update your password or authentication provider, visit your account security settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;