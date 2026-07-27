import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, ExternalLink, Power, Link as LinkIcon, FolderTree } from "lucide-react";

export interface AdBanner {
  id: string;
  title: string;
  image_url: string;
  target_url?: string | null;
  position?: string | null;
  category_id?: string | null;
  sub_category?: string | null;
  location?: string | null;
  is_active: boolean;
  created_at?: string;
}

export const AdminAdManager = () => {
  const queryClient = useQueryClient();
  
  // Form State
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [position, setPosition] = useState("home_top");
  const [categoryId, setCategoryId] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [location, setLocation] = useState("");

  // Fetch Banners
  const { data: banners = [], isLoading, error } = useQuery<AdBanner[]>({
    queryKey: ["admin-ad-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not fetch banners:", error.message);
        return [];
      }
      return data || [];
    },
  });

  // Fetch Categories for the dropdown selection
  const { data: categoriesList = [] } = useQuery({
    queryKey: ["admin-categories-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const createBanner = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !imageUrl.trim()) {
        throw new Error("Title and Image URL are required");
      }
      const { error } = await supabase.from("banners").insert([
        {
          title: title.trim(),
          image_url: imageUrl.trim(),
          target_url: targetUrl.trim() || null,
          position: position || "home_top",
          category_id: categoryId || null,
          sub_category: subCategory.trim() || null,
          location: location.trim() || null,
          is_active: true,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-banners"] });
      // Reset Form Fields
      setTitle("");
      setImageUrl("");
      setTargetUrl("");
      setCategoryId("");
      setSubCategory("");
      setLocation("");
      toast.success("Ad/Product posted and assigned to category successfully!");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create post"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("banners")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-banners"] });
      toast.success("Banner state updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-banners"] });
      toast.success("Banner deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Helper to find category name for display cards
  const getCategoryName = (catId?: string | null) => {
    if (!catId) return null;
    const found = categoriesList.find((c: any) => c.id === catId);
    return found ? found.name : null;
  };

  return (
    <div className="space-y-6">
      {/* Create Banner / Ad Form */}
      <div className="border rounded-xl p-4 md:p-6 bg-card space-y-4 shadow-sm">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" /> Create New Ad / Product Listing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name / Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name / Title *</label>
            <Input
              placeholder="e.g. iPhone 15 Pro Max / Summer Promo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Image URL *</label>
            <Input
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* Category Dropdown (Direct Database Association) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <FolderTree className="h-3 w-3" /> Target Category *
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Banner Category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesList.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Sub-category</label>
            <Input
              placeholder="e.g. Smartphones, Laptops"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Location</label>
            <Input
              placeholder="e.g. Mbabane, Manzini"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Placement Position */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Placement Position</label>
            <Input
              placeholder="home_top"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
        </div>

        {/* Product Page Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <LinkIcon className="h-3 w-3" /> Link to Product Page / Target URL
          </label>
          <Input
            placeholder="https://example.com/product/123"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
          />
        </div>

        <Button
          onClick={() => createBanner.mutate()}
          disabled={createBanner.isPending || !title || !imageUrl || !categoryId}
          className="w-full sm:w-auto"
        >
          {createBanner.isPending ? "Posting..." : "Post Listing & Assign Category"}
        </Button>
      </div>

      {/* List Existing Banners */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base md:text-lg">Active & Managed Banners</h3>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm border rounded-xl">Loading banners...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive text-sm border border-destructive/20 rounded-xl bg-destructive/5">
            Failed to load ad banners. Make sure the database table exists.
          </div>
        ) : banners.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
            No ad banners found. Create one above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => {
              const catName = getCategoryName(banner.category_id);
              return (
                <div key={banner.id} className="border rounded-xl p-4 bg-card space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm line-clamp-1">{banner.title}</h4>
                      <Badge variant={banner.is_active ? "default" : "outline"} className="shrink-0 text-[10px]">
                        {banner.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </div>

                    {/* Category & Sub-details tags */}
                    <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                      {catName && <Badge variant="default" className="text-[10px] bg-primary/10 text-primary border-primary/20">📂 {catName}</Badge>}
                      {banner.sub_category && <Badge variant="secondary" className="text-[10px]">{banner.sub_category}</Badge>}
                      {banner.location && <Badge variant="outline" className="text-[10px]">📍 {banner.location}</Badge>}
                    </div>

                    {banner.image_url && (
                      <div className="relative aspect-[3/1] bg-muted rounded-lg overflow-hidden border">
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">Pos: <code className="bg-muted px-1 py-0.5 rounded text-foreground">{banner.position || "default"}</code></span>
                    <div className="flex items-center gap-1">
                      {banner.target_url && (
                        <a href={banner.target_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-muted rounded text-foreground" title="Test Link">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleActive.mutate({ id: banner.id, is_active: !banner.is_active })}
                        title="Toggle Active"
                      >
                        <Power className={`h-4 w-4 ${banner.is_active ? "text-emerald-500" : "text-muted-foreground"}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => {
                          if (confirm("Delete this banner?")) deleteBanner.mutate(banner.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAdManager;