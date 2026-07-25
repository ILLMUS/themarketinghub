import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImagePlus, Trash2, ExternalLink, Loader2, Sparkles } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  position?: string;
  created_at: string;
}

export const AdminAdManager = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all banners
  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Banner[];
    },
  });

  // Create new banner
  const createBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast.error("Please provide both a title and an image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("banners").insert([
        {
          title,
          image_url: imageUrl,
          link_url: linkUrl || null,
          is_active: true,
        },
      ]);

      if (error) throw error;

      toast.success("Banner added successfully!");
      setTitle("");
      setImageUrl("");
      setLinkUrl("");
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to add banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle active/inactive status
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("banners")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner status updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete banner
  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {/* Create New Banner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-primary" /> Add New Ad Banner
          </CardTitle>
          <CardDescription>
            Create promotional banners to feature across your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createBanner} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-title">Banner Title</Label>
                <Input
                  id="banner-title"
                  placeholder="e.g. Summer Promo 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/banner-image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-url">Target Link URL (Optional)</Label>
              <Input
                id="link-url"
                placeholder="https://example.com/promotion or /ad/123"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Banner...
                </>
              ) : (
                "Add Banner"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Banner List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Active & Saved Banners
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading banners...</div>
          ) : !banners || banners.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-xl text-muted-foreground text-sm">
              No banners found. Add your first banner above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border rounded-xl p-4 bg-card flex flex-col justify-between space-y-3 relative"
                >
                  <div className="space-y-2">
                    <div className="aspect-[3/1] rounded-lg overflow-hidden bg-muted border relative group">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/600x200?text=Invalid+Image+URL";
                        }}
                      />
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1">{banner.title}</h4>
                        {banner.link_url && (
                          <a
                            href={banner.link_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                          >
                            {banner.link_url} <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <Badge variant={banner.is_active ? "default" : "secondary"} className="shrink-0">
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={(checked) =>
                          toggleActive.mutate({ id: banner.id, is_active: checked })
                        }
                      />
                      <span className="text-muted-foreground">
                        {banner.is_active ? "Visible" : "Hidden"}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive h-8 px-2"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this banner?")) {
                          deleteBanner.mutate(banner.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdManager;