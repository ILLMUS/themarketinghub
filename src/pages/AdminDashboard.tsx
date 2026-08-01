import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, FileText, Clock, CheckCircle, XCircle, Star, Trash2, Eye, CreditCard, Users, Shield, UserCheck, Image as ImageIcon, Upload, Link as LinkIcon, Pencil, X, Check, AlertTriangle
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AdStatus = Database["public"]["Enums"]["ad_status"];
type AdTier = Database["public"]["Enums"]["ad_tier"];

const tierConfig: Record<AdTier, { label: string; price: number; className: string }> = {
  e500: { label: "E500 Spotlight", price: 500, className: "bg-accent/20 text-accent-foreground border-accent" },
  e350: { label: "E350 Boosted", price: 350, className: "bg-primary/15 text-primary border-primary/40" },
  e250: { label: "E250 Standard", price: 250, className: "bg-muted text-muted-foreground border-border" },
};

const statusConfig: Record<AdStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pending Payment", variant: "outline" },
  pending_approval: { label: "Pending Approval", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

// --- Editable Banner Manager Component ---
const AdminAdManager = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("home_top");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit State Management
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  // Fetch active banners list
  const { data: banners, isLoading: loadingBanners } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an image file to upload");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("banners").getPublicUrl(filePath);
      const imageUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase.from("banners").insert({
        title,
        image_url: imageUrl,
        target_url: linkUrl || "#",
        position,
        is_active: true,
      });

      if (dbError) throw dbError;

      toast.success("Banner published and active!");
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });

      setTitle("");
      setLinkUrl("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload banner");
    } finally {
      setIsUploading(false);
    }
  };

  const startEditing = (banner: any) => {
    setEditingId(banner.id);
    setEditTitle(banner.title || "");
    setEditLinkUrl(banner.target_url || "");
    setEditPosition(banner.position || "home_top");
    setEditFile(null);
    setEditPreviewUrl(banner.image_url);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditLinkUrl("");
    setEditPosition("");
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const saveEditBanner = async (id: string, existingImageUrl: string) => {
    setIsUploading(true);
    try {
      let imageUrl = existingImageUrl;

      if (editFile) {
        const fileExt = editFile.name.split('.').pop();
        const fileName = `banner-${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("banners")
          .upload(filePath, editFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("banners").getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase
        .from("banners")
        .update({
          title: editTitle,
          image_url: imageUrl,
          target_url: editLinkUrl || "#",
          position: editPosition,
        })
        .eq("id", id);

      if (dbError) throw dbError;

      toast.success("Banner updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      cancelEditing();
    } catch (err: any) {
      toast.error(err.message || "Failed to update banner");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      toast.success("Banner removed");
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Upload New Ad Banner
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Upload custom display banners to promote featured sellers, specials, or announcements.
          </p>
        </div>

        <form onSubmit={handleUploadBanner} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Banner Title / Name</label>
              <input
                type="text"
                placeholder="e.g. Summer Special Sale Header"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Target Placement</label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_top">Home Page (Top Banner)</SelectItem>
                  <SelectItem value="home_middle">Home Page (Middle Promo)</SelectItem>
                  <SelectItem value="sidebar">Sidebar Banner</SelectItem>
                  <SelectItem value="category_header">Category Top Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" /> Destination Link (URL)
            </label>
            <input
              type="url"
              placeholder="https://yourmarket.com/promotions or /ad/123"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Banner Image</label>
            <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center transition-colors bg-muted/20 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="space-y-3">
                  <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain border shadow-sm" />
                  <p className="text-xs text-muted-foreground">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, or GIF (Suggested size: 1200x300px)</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {previewUrl && (
              <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>
                Clear
              </Button>
            )}
            <Button type="submit" size="sm" disabled={isUploading || !selectedFile}>
              {isUploading ? "Uploading..." : "Save Banner"}
            </Button>
          </div>
        </form>
      </div>

      {/* Active Banners List */}
      <div className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
        <h3 className="font-semibold text-base">Active Display Banners</h3>
        {loadingBanners ? (
          <p className="text-xs text-muted-foreground">Loading active banners...</p>
        ) : banners && banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner: any) => {
              const isEditing = editingId === banner.id;

              return (
                <div key={banner.id} className="border rounded-lg p-3 relative space-y-3 bg-muted/10">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-foreground">Edit Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full h-8 px-2 rounded border border-input bg-background text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-foreground">Edit Position</label>
                        <Select value={editPosition} onValueChange={setEditPosition}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home_top">Home Page (Top Banner)</SelectItem>
                            <SelectItem value="home_middle">Home Page (Middle Promo)</SelectItem>
                            <SelectItem value="sidebar">Sidebar Banner</SelectItem>
                            <SelectItem value="category_header">Category Top Banner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-foreground">Destination Link</label>
                        <input
                          type="url"
                          value={editLinkUrl}
                          onChange={(e) => setEditLinkUrl(e.target.value)}
                          className="w-full h-8 px-2 rounded border border-input bg-background text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-foreground">Banner Image (Replace)</label>
                        <div className="border border-dashed rounded p-2 text-center bg-background relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {editPreviewUrl ? (
                            <img src={editPreviewUrl} alt="Edit Preview" className="h-20 mx-auto object-cover rounded" />
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Click to change image</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={cancelEditing}>
                          <X className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" className="h-7 text-xs px-2" onClick={() => saveEditBanner(banner.id, banner.image_url)} disabled={isUploading}>
                          <Check className="h-3 w-3 mr-1" /> {isUploading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="aspect-[3/1] overflow-hidden rounded-md border bg-muted">
                        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-xs line-clamp-1">{banner.title}</p>
                          <Badge variant="outline" className="text-[10px] mt-0.5">{banner.position}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEditing(banner)} title="Edit Banner">
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => deleteBanner(banner.id)} title="Delete Banner">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">No custom banners currently uploaded.</p>
        )}
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");

  const { data: allAds } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
      if (pErr) throw pErr;
      const { data: roles, error: rErr } = await supabase.from("user_roles").select("*");
      if (rErr) throw rErr;

      const formattedProfiles = [];
      for (let i = 0; i < profiles.length; i++) {
        const p = profiles[i];
        const userRoles = [];
        for (let j = 0; j < roles.length; j++) {
          if (roles[j].user_id === p.user_id) {
            userRoles.push(roles[j]);
          }
        }
        formattedProfiles.push({
          ...p,
          roles: userRoles,
        });
      }
      return formattedProfiles;
    },
    enabled: isAdmin,
  });

  const { data: reportedListings, isLoading: loadingReports } = useQuery({
    queryKey: ["admin-reported-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reported_listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const updateReportStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reported_listings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reported-listings"] });
      toast.success("Report status updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reported_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reported-listings"] });
      toast.success("Report removed");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdStatus }) => {
      const { error } = await supabase.from("advertisements").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Status updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase.from("advertisements").update({ is_featured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateTier = useMutation({
    mutationFn: async ({ id, tier }: { id: string; tier: AdTier }) => {
      const { error } = await supabase.from("advertisements").update({ tier }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Tier updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleRole = useMutation({
    mutationFn: async ({ userId, isCurrentlyAdmin }: { userId: string; isCurrentlyAdmin: boolean }) => {
      if (isCurrentlyAdmin) {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: "admin" as const });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteAd = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("advertisements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Ad deleted");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (loading) return <div className="container px-4 py-20 text-center">Loading...</div>;
  if (!isAdmin) {
    return (
      <div className="container px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const counts = {
    total: allAds?.length ?? 0,
    pending_payment: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
  };

  if (allAds) {
    for (const ad of allAds) {
      if (ad.status in counts) {
        counts[ad.status as keyof typeof counts]++;
      }
    }
  }

  const filterAds = (status?: AdStatus) => {
    if (!status || !allAds) return allAds;
    const filtered = [];
    for (let i = 0; i < allAds.length; i++) {
      if (allAds[i].status === status) {
        filtered.push(allAds[i]);
      }
    }
    return filtered;
  };

  const AdTable = ({ ads }: { ads: typeof allAds }) => (
    <div>
      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {ads?.map((ad) => (
          <div key={ad.id} className="border rounded-xl p-4 bg-card space-y-3 relative">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5">
                {ad.is_featured && <Star className="h-4 w-4 mt-0.5 text-accent fill-accent shrink-0" />}
                <div>
                  <h4 className="font-semibold text-sm text-foreground line-clamp-2">{ad.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{ad.categories?.name || "No Category"}</p>
                </div>
              </div>
              <Badge variant={statusConfig[ad.status as AdStatus].variant} className="shrink-0 text-[10px]">
                {statusConfig[ad.status as AdStatus].label}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs border-y py-2 border-border/60">
              <div>
                <span className="text-muted-foreground">Price:</span>{" "}
                <span className="font-semibold text-foreground">E{ad.price.toLocaleString()}</span>
              </div>
              <div>
                <Select value={ad.tier} onValueChange={(v) => updateTier.mutate({ id: ad.id, tier: v as AdTier })}>
                  <SelectTrigger className={`h-7 w-[125px] text-[11px] border ${tierConfig[ad.tier as AdTier].className}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="e500">E100 Spotlight</SelectItem>
                    <SelectItem value="e350">E50 Boosted</SelectItem>
                    <SelectItem value="e250">Free Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 pt-1">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/ad/${ad.id}`)} title="View" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
              {ad.status === "pending_payment" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: ad.id, status: "pending_approval" })} title="Confirm Payment" className="h-8 px-2 text-xs">
                  <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay
                </Button>
              )}
              {ad.status === "pending_approval" && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="text-success h-8 px-2 text-xs" onClick={() => updateStatus.mutate({ id: ad.id, status: "approved" })} title="Approve">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive h-8 px-2 text-xs" onClick={() => updateStatus.mutate({ id: ad.id, status: "rejected" })} title="Reject">
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
              )}
              <Button size="sm" variant="ghost" onClick={() => toggleFeatured.mutate({ id: ad.id, is_featured: !ad.is_featured })} title="Toggle Featured" className="h-8 w-8 p-0">
                <Star className={`h-4 w-4 ${ad.is_featured ? "fill-accent text-accent" : ""}`} />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => { if (confirm("Delete this ad?")) deleteAd.mutate(ad.id); }} title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {(!ads || ads.length === 0) && (
          <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm">No advertisements</div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Price</th>
                <th className="text-left p-3 font-medium">Plan</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads?.map((ad) => (
                <tr key={ad.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {ad.is_featured && <Star className="h-3.5 w-3.5 text-accent fill-accent shrink-0" />}
                      <span className="font-medium line-clamp-1">{ad.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{ad.categories?.name || "No Category"}</td>
                  <td className="p-3 font-medium">E{ad.price.toLocaleString()}</td>
                  <td className="p-3">
                    <Select value={ad.tier} onValueChange={(v) => updateTier.mutate({ id: ad.id, tier: v as AdTier })}>
                      <SelectTrigger className={`h-8 w-[140px] text-xs border ${tierConfig[ad.tier as AdTier].className}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="e500">E100 Spotlight</SelectItem>
                        <SelectItem value="e350">E50 Boosted</SelectItem>
                        <SelectItem value="e250">Free Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Badge variant={statusConfig[ad.status as AdStatus].variant}>
                      {statusConfig[ad.status as AdStatus].label}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/ad/${ad.id}`)} title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {ad.status === "pending_payment" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: ad.id, status: "pending_approval" })} title="Confirm Payment">
                          <CreditCard className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {ad.status === "pending_approval" && (
                        <>
                          <Button size="sm" variant="outline" className="text-success" onClick={() => updateStatus.mutate({ id: ad.id, status: "approved" })} title="Approve">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus.mutate({ id: ad.id, status: "rejected" })} title="Reject">
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => toggleFeatured.mutate({ id: ad.id, is_featured: !ad.is_featured })} title="Toggle Featured">
                        <Star className={`h-3.5 w-3.5 ${ad.is_featured ? "fill-accent text-accent" : ""}`} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Delete this ad?")) deleteAd.mutate(ad.id); }} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!ads || ads.length === 0) && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No advertisements</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container px-4 py-6 md:py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Manage advertisements, users, reported listings, and ad banners</p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="w-full overflow-x-auto scrollbar-none border-b border-border">
          <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0 pb-px rounded-none flex flex-nowrap min-w-max">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">All Ads ({counts.total})</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">Pending Approval ({counts.pending_approval})</TabsTrigger>
            <TabsTrigger value="payment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">Pending Payment ({counts.pending_payment})</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Reported Listings ({reportedListings?.filter(r => r.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">Users ({users?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="banners" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">Ad Banners</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-xl p-4 bg-card shadow-sm space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Total Ads</span>
              <h3 className="text-2xl font-bold">{counts.total}</h3>
            </div>
            <div className="border rounded-xl p-4 bg-card shadow-sm space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Pending Review</span>
              <h3 className="text-2xl font-bold text-secondary-foreground">{counts.pending_approval}</h3>
            </div>
            <div className="border rounded-xl p-4 bg-card shadow-sm space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Approved & Live</span>
              <h3 className="text-2xl font-bold text-success">{counts.approved}</h3>
            </div>
            <div className="border rounded-xl p-4 bg-card shadow-sm space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Reported Listings</span>
              <h3 className="text-2xl font-bold text-destructive">{reportedListings?.filter(r => r.status === 'pending').length || 0}</h3>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all"><AdTable ads={allAds} /></TabsContent>
        <TabsContent value="pending"><AdTable ads={filterAds("pending_approval")} /></TabsContent>
        <TabsContent value="payment"><AdTable ads={filterAds("pending_payment")} /></TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Reported Listings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Review user reports concerning fraudulent or prohibited items.</p>
              </div>
            </div>

            {loadingReports ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Loading reports...</p>
            ) : reportedListings && reportedListings.length > 0 ? (
              <div className="space-y-3">
                {reportedListings.map((report: any) => (
                  <div key={report.id} className="border rounded-lg p-4 space-y-2 bg-muted/20">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                          {report.listing_title}
                        </h4>
                        {report.listing_link && (
                          <a href={report.listing_link} target="_blank" rel="noreferrer" className="text-xs text-primary underline truncate block max-w-md mt-0.5">
                            {report.listing_link}
                          </a>
                        )}
                      </div>
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'} className="text-[10px]">
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-xs bg-background p-2.5 rounded border border-border/60 text-foreground">
                      <span className="font-semibold text-muted-foreground block mb-0.5">Reason:</span>
                      {report.reason}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        Submitted: {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {report.status === 'pending' ? (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateReportStatus.mutate({ id: report.id, status: 'resolved' })}>
                            Mark Resolved
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateReportStatus.mutate({ id: report.id, status: 'pending' })}>
                            Reopen
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => { if (confirm("Delete this report?")) deleteReport.mutate(report.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">No reported listings found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Phone</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u: any) => {
                    const isAdminUser = u.roles?.some((r: any) => r.role === "admin");
                    return (
                      <tr key={u.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{u.full_name || "Unnamed User"}</td>
                        <td className="p-3 text-muted-foreground">{u.phone_number || "No Phone"}</td>
                        <td className="p-3">
                          <Badge variant={isAdminUser ? "default" : "outline"}>
                            {isAdminUser ? "Admin" : "User"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleRole.mutate({ userId: u.user_id, isCurrentlyAdmin: isAdminUser })}
                          >
                            {isAdminUser ? "Remove Admin" : "Make Admin"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="banners"><AdminAdManager /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;