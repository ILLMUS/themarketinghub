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

type AdStatus = Database["public"]["Enums"]["ad_status"];

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

  if (loading) return <div className="container py-20 text-center">Loading...</div>;
  if (!isAdmin) {
    return (
      <div className="container py-20 text-center">
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
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
            <th className="text-left p-3 font-medium">Price</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ads?.map((ad) => (
            <tr key={ad.id} className="border-t hover:bg-muted/30">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {ad.is_featured && <Star className="h-3 w-3 text-accent fill-accent" />}
                  <span className="font-medium line-clamp-1">{ad.title}</span>
                </div>
              </td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">{ad.categories?.name}</td>
              <td className="p-3">E{ad.price.toLocaleString()}</td>
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
            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No advertisements</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage advertisements and categories</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Ads</TabsTrigger>
          <TabsTrigger value="pending_payment">
            <CreditCard className="h-3.5 w-3.5 mr-1" /> Payment ({counts.pending_payment})
          </TabsTrigger>
          <TabsTrigger value="pending_approval">
            <Clock className="h-3.5 w-3.5 mr-1" /> Approval ({counts.pending_approval})
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-3.5 w-3.5 mr-1" /> Users ({users?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Ads", count: counts.total, icon: FileText, color: "text-primary" },
              { label: "Pending Payment", count: counts.pending_payment, icon: CreditCard, color: "text-accent" },
              { label: "Pending Approval", count: counts.pending_approval, icon: Clock, color: "text-accent" },
              { label: "Approved", count: counts.approved, icon: CheckCircle, color: "text-success" },
              { label: "Rejected", count: counts.rejected, icon: XCircle, color: "text-destructive" },
            ].map((item) => (
              <div key={item.label} className="border rounded-xl p-4 bg-card">
                <item.icon className={`h-5 w-5 ${item.color} mb-2`} />
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-3">Recent Advertisements</h3>
          <AdTable ads={allAds?.slice(0, 10)} />
        </TabsContent>

        <TabsContent value="all"><AdTable ads={allAds} /></TabsContent>
        <TabsContent value="pending_payment"><AdTable ads={filterAds("pending_payment")} /></TabsContent>
        <TabsContent value="pending_approval"><AdTable ads={filterAds("pending_approval")} /></TabsContent>
        <TabsContent value="approved"><AdTable ads={filterAds("approved")} /></TabsContent>
        <TabsContent value="rejected"><AdTable ads={filterAds("rejected")} /></TabsContent>

        <TabsContent value="users">
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Joined</th>
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
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
