import { CampaignForm } from "@/services/advertising";

interface BannerPreviewProps {
  campaign: Partial<CampaignForm>;
}

export default function BannerPreview({ campaign }: BannerPreviewProps) {
  return (
    <div className="border rounded-xl p-4 bg-muted/30 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Live Banner Preview
        </span>
        <span className="text-xs text-emerald-600 font-bold">Standard Price: E500.00</span>
      </div>

      {campaign.image_url ? (
        <div className="overflow-hidden rounded-xl border shadow-sm">
          <img
            src={campaign.image_url}
            alt={campaign.title || "Banner Preview"}
            className="w-full h-auto max-h-48 object-cover"
          />
        </div>
      ) : (
        <div className="h-32 rounded-xl bg-muted border flex items-center justify-center text-sm text-muted-foreground">
          Upload or enter an image URL to see preview
        </div>
      )}

      <div className="text-xs text-muted-foreground flex justify-between">
        <span>Company: {campaign.company_name || "N/A"}</span>
        <span>
          Target: {campaign.destination_url || campaign.whatsapp || "No target set"}
        </span>
      </div>
    </div>
  );
}