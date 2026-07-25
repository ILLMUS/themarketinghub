import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    image_url: "",
    target_url: "",
    position: "homepage_banner",
    status: "active",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      try {
        const { data, error } = await supabase.from("ad_campaigns").select("*").eq("id", id).single();
        if (error) throw error;
        if (data) {
          setForm({
            title: data.title || "",
            image_url: data.image_url || "",
            target_url: data.target_url || "",
            position: data.position || "homepage_banner",
            status: data.status || "active",
            start_date: data.start_date ? data.start_date.split("T")[0] : "",
            end_date: data.end_date ? data.end_date.split("T")[0] : "",
          });
        }
      } catch (err: any) {
        toast({ title: "Failed to load campaign", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("ad_campaigns").update(form).eq("id", id);
      if (error) throw error;

      toast({ title: "Campaign updated successfully!" });
      navigate("/admin/advertising");
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading campaign details...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Link to="/admin/advertising" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Advertising
      </Link>

      <h1 className="text-2xl font-bold mb-6">Edit Campaign</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card border p-6 rounded-xl shadow-sm">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>

        <div>
          <Label htmlFor="target_url">Target URL</Label>
          <Input id="target_url" value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>

        <Button type="submit" className="w-full mt-4" disabled={submitting}>
          {submitting ? "Updating..." : "Update Campaign"}
        </Button>
      </form>
    </div>
  );
}