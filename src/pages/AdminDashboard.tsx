import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, FileText, Clock, CheckCircle, XCircle, Star, Trash2, Eye, CreditCard, Users, Tag, Shield, UserCheck,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import SEO from "@/components/seo/SEO";

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

const AdminDashboard = () => {
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

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
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
      return profiles.map((p) => ({
        ...p,
        roles: roles.filter((r) => r.user_id === p.user_id),
      }));
    },
    enabled: isAdmin,
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
    pending_payment: allAds?.filter((a) => a.status === "pending_payment").length ?? 0,
    pending_approval: allAds?.filter((a) => a.status === "pending_approval").length ?? 0,
    approved: allAds?.filter((a) => a.status === "approved").length ?? 0,
    rejected: allAds?.filter((a) => a.status === "rejected").length ?? 0,
  };

  const filterAds = (status?: AdStatus) => status ? allAds?.filter((a) => a.status === status) : allAds;

  const AdTable = ({ ads }: { ads: typeof allAds }) => (
    <div>
      {/* Responsive Cards for Mobile */}
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
              <Badge variant={statusConfig[ad.status].variant} className="shrink-0 text-[10px]">
                {statusConfig[ad.status].label}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs border-y py-2 border-border/60">
              <div>
                <span className="text-muted-foreground">Price:</span>{" "}
                <span className="font-semibold text-foreground">E{ad.price.toLocaleString()}</span>
              </div>
              <div>
                <Select value={ad.tier} onValueChange={(v) => updateTier.mutate({ id: ad.id, tier: v as AdTier })}>
                  <SelectTrigger className={`h-7 w-[125px] text-[11px] border ${tierConfig[ad.tier].className}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="e500">E500 Spotlight</SelectItem>
                    <SelectItem value="e350">E350 Boosted</SelectItem>
                    <SelectItem value="e250">E250 Standard</SelectItem>
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

      {/* Desktop Table Layout */}
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
                      <SelectTrigger className={`h-8 w-[140px] text-xs border ${tierConfig[ad.tier].className}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="e500">E500 Spotlight</SelectItem>
                        <SelectItem value="e350">E350 Boosted</SelectItem>
                        <SelectItem value="e250">E250 Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Badge variant={statusConfig[ad.status].variant}>
                      {statusConfig[ad.status].label}
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
            <p className="text-xs md:text-sm text-muted-foreground">Manage advertisements and users</p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="w-full overflow-x-auto scrollbar-none border-b border-border">
          <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0 pb-px rounded-none flex flex-nowrap min-w-max">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">All Ads</TabsTrigger>
            <TabsTrigger value="pending_payment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Payment ({counts.pending_payment})
            </TabsTrigger>
            <TabsTrigger value="pending_approval" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Approval ({counts.pending_approval})
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm">Rejected</TabsTrigger>
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs md:text-sm gap-1.5">
              <Users className="h-3.5 w-3.5" /> Users ({users?.length ?? 0})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {[
              { label: "Total Ads", count: counts.total, icon: FileText, color: "text-primary" },
              { label: "Pending Payment", count: counts.pending_payment, icon: CreditCard, color: "text-amber-500" },
              { label: "Pending Approval", count: counts.pending_approval, icon: Clock, color: "text-blue-500" },
              { label: "Approved", count: counts.approved, icon: CheckCircle, color: "text-green-500" },
              { label: "Rejected", count: counts.rejected, icon: XCircle, color: "text-destructive" },
            ].map((item) => (
              <div key={item.label} className="border rounded-xl p-3 md:p-4 bg-card shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs text-muted-foreground font-medium line-clamp-1">{item.label}</p>
                  <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
                <p className="text-xl md:text-2xl font-bold tracking-tight">{item.count}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base md:text-lg">Recent Advertisements</h3>
            <AdTable ads={allAds?.slice(0, 10)} />
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-0"><AdTable ads={allAds} /></TabsContent>
        <TabsContent value="pending_payment" className="mt-0"><AdTable ads={filterAds("pending_payment")} /></TabsContent>
        <TabsContent value="pending_approval" className="mt-0"><AdTable ads={filterAds("pending_approval")} /></TabsContent>
        <TabsContent value="approved" className="mt-0"><AdTable ads={filterAds("approved")} /></TabsContent>
        <TabsContent value="rejected" className="mt-0"><AdTable ads={filterAds("rejected")} /></TabsContent>

        <TabsContent value="users" className="mt-0">
          {/* Responsive Cards for Mobile */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {users?.map((u) => {
              const userIsAdmin = u.roles.some((r) => r.role === "admin");
              return (
                <div key={u.id} className="border rounded-xl p-4 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{u.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={userIsAdmin ? "default" : "secondary"} className="text-[10px]">
                      {userIsAdmin ? (
                        <><Shield className="h-3 w-3 mr-1" /> Admin</>
                      ) : (
                        <><UserCheck className="h-3 w-3 mr-1" /> User</>
                      )}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-border/60 flex justify-end">
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      variant={userIsAdmin ? "destructive" : "outline"}
                      onClick={() => {
                        if (userIsAdmin && !confirm("Remove admin role from this user?")) return;
                        toggleRole.mutate({ userId: u.user_id, isCurrentlyAdmin: userIsAdmin });
                      }}
                    >
                      {userIsAdmin ? "Remove Admin Role" : "Promote to Admin"}
                    </Button>
                  </div>
                </div>
              );
            })}
            {(!users || users.length === 0) && (
              <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm">No users found</div>
            )}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Joined</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u) => {
                    const userIsAdmin = u.roles.some((r) => r.role === "admin");
                    return (
                      <tr key={u.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Badge variant={userIsAdmin ? "default" : "secondary"}>
                            {userIsAdmin ? (
                              <><Shield className="h-3 w-3 mr-1" /> Admin</>
                            ) : (
                              <><UserCheck className="h-3 w-3 mr-1" /> User</>
                            )}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant={userIsAdmin ? "destructive" : "outline"}
                            onClick={() => {
                              if (userIsAdmin && !confirm("Remove admin role from this user?")) return;
                              toggleRole.mutate({ userId: u.user_id, isCurrentlyAdmin: userIsAdmin });
                            }}
                          >
                            {userIsAdmin ? "Remove Admin" : "Make Admin"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!users || users.length === 0) && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;