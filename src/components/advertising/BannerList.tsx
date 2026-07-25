import { useEffect, useState } from "react";
import {
  AdCampaign,
  AdPosition,
  AdvertisingService,
} from "@/services/advertising";
import BannerCard from "./BannerCard";
import BannerPreview from "./BannerPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function BannerList() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [positions, setPositions] = useState<AdPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [positionId, setPositionId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignData, positionData] = await Promise.all([
        AdvertisingService.getCampaigns(),
        AdvertisingService.getPositions(),
      ]);
      setCampaigns(campaignData || []);
      setPositions(positionData || []);
      if (positionData && positionData.length > 0) {
        setPositionId(positionData[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load advertising data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await AdvertisingService.uploadBannerImage(file);
      setImageUrl(url);
      toast.success("Banner image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload or provide a banner image URL");
      return;
    }

    setSubmitting(true);
    try {
      await AdvertisingService.createCampaign({
        company_name: companyName,
        title,
        description: description || undefined,
        image_url: imageUrl,
        destination_url: destinationUrl || undefined,
        whatsapp: whatsapp || undefined,
        position_id: positionId,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        active: true,
      });

      toast.success("E500 Ad Campaign created!");
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCompanyName("");
    setTitle("");
    setDescription("");
    setImageUrl("");
    setDestinationUrl("");
    setWhatsapp("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">E500.00 Advertising Banners</h2>
          <p className="text-sm text-muted-foreground">
            Manage banner placements across your home and category pages.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "New Campaign"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border rounded-xl p-6 bg-card space-y-4 shadow-sm">
          <h3 className="font-semibold text-lg">Create E500 Ad Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                placeholder="e.g., Acme Motors"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Campaign Title</Label>
              <Input
                placeholder="e.g., Grand Opening Promo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Placement Position</Label>
              <select
                className="w-full border rounded-md h-10 px-3 bg-background text-sm"
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
              >
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && <Loader2 className="h-5 w-5 animate-spin self-center" />}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Website URL (Optional)</Label>
              <Input
                placeholder="https://..."
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>WhatsApp Contact Number (Optional)</Label>
              <Input
                placeholder="+268..."
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <BannerPreview campaign={{ image_url: imageUrl, title, company_name: companyName, destination_url: destinationUrl, whatsapp }} />

          <Button type="submit" className="w-full" disabled={submitting || uploading}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish E500 Banner"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center p-8 border rounded-xl bg-muted/20 text-muted-foreground">
          No ad campaigns created yet. Click "New Campaign" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((camp) => (
            <BannerCard key={camp.id} campaign={camp} onRefresh={loadData} />
          ))}
        </div>
      )}
    </div>
  );
}