import { AdCampaign, AdvertisingService } from "@/services/advertising";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BannerCardProps {
  campaign: AdCampaign & { ad_positions?: { name: string; code: string } };
  onRefresh: () => void;
}

export default function BannerCard({ campaign, onRefresh }: BannerCardProps) {
  const handleToggle = async () => {
    try {
      await AdvertisingService.toggleCampaign(campaign.id, !campaign.active);
      toast.success("Campaign status updated");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this E500 ad campaign?")) return;
    try {
      await AdvertisingService.deleteCampaign(campaign.id);
      toast.success("Campaign deleted");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete campaign");
    }
  };

  return (
    <div className="flex items-center justify-between border p-4 rounded-xl bg-card shadow-sm gap-4">
      <img
        src={campaign.image_url}
        alt={campaign.title}
        className="w-28 h-16 object-cover rounded-lg border"
      />

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">{campaign.title}</h4>
          <span className="text-xs text-muted-foreground">({campaign.company_name})</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Position: <span className="font-medium text-foreground">{campaign.ad_positions?.name || "General"}</span>
        </p>
        <p className="text-xs text-emerald-600 font-semibold">Price: E500.00</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Active</span>
          <Switch checked={campaign.active} onCheckedChange={handleToggle} />
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}