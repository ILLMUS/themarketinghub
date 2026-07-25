import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BannerUploader from "@/components/advertising/uploader/BannerUploader";

export default function NewCampaign() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    image_url: "",
    target_url: "",
    position: "homepage_banner",
    status: "active",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.image_url) {
      toast({
        title: "Image required",
        description: "Please upload a banner image before creating the campaign.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("ad_campaigns").insert([form]);
      if (error) throw error;

      toast({ title: "Campaign created successfully!" });
      navigate("/admin/advertising");
    } catch (err: any) {
      toast({
        title: "Failed to create campaign",
        description: err.message || "Ensure ad_campaigns table exists in Supabase.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/admin/advertising"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Advertising
      </Link>

      <h1 className="text-2xl font-bold mb-6">Create New Ad Campaign</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border p-6 rounded-xl shadow-sm">
        <div>
          <Label htmlFor="title" className="mb-2 block">Campaign Title</Label>
          <Input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Summer Sale Banner"
          />
        </div>

        {/* Banner Drag & Drop / File Uploader */}
        <div>
          <Label className="mb-2 block">Campaign Banner Image</Label>
          <BannerUploader
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />
        </div>

        <div>
          <Label htmlFor="target_url" className="mb-2 block">Target Redirect URL</Label>
          <Input
            id="target_url"
            value={form.target_url}
            onChange={(e) => setForm({ ...form, target_url: e.target.value })}
            placeholder="https://example.com/promo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="position" className="mb-2 block">Position</Label>
            <select
              id="position"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            >
              <option value="homepage_banner">Homepage Banner</option>
              <option value="sidebar">Sidebar</option>
              <option value="category_header">Category Header</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status" className="mb-2 block">Status</Label>
            <select
              id="status"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date" className="mb-2 block">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="end_date" className="mb-2 block">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-4" disabled={submitting}>
          {submitting ? "Saving..." : "Create Campaign"}
        </Button>
      </form>
    </div>
  );
}