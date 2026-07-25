import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdCampaign {
  id: string;
  title: string;
  image_url: string;
  target_url?: string;
  position: string;
  status: string;
  start_date: string;
  end_date: string;
  impressions?: number;
  clicks?: number;
}

export default function Advertising() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err: any) {
      console.warn("Notice loading campaigns:", err.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      const { error } = await supabase.from("ad_campaigns").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Campaign deleted successfully" });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toast({ title: "Error deleting campaign", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Ad Campaigns & Banners
          </h1>
          <p className="text-muted-foreground">Manage homepage and marketplace banner advertisements.</p>
        </div>
        <Link to="/admin/advertising/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading ad campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="border rounded-xl p-8 text-center bg-card">
          <p className="text-muted-foreground mb-4">No ad campaigns found.</p>
          <Link to="/admin/advertising/new">
            <Button variant="outline">Create your first banner campaign</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col">
              <div className="h-40 bg-muted relative">
                <img
                  src={campaign.image_url || "/placeholder.svg"}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                  campaign.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                }`}>
                  {campaign.status}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Position: {campaign.position}</p>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <Link to={`/admin/advertising/edit/${campaign.id}`}>
                    <Button size="sm" variant="outline"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                  </Link>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(campaign.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}