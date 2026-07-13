import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  AdvertisingService,
  AdCampaign,
} from "@/services/advertising";

import CampaignTable from "@/components/advertising/CampaignTable";

export default function Advertising() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);

      const data =
        await AdvertisingService.getCampaigns();

      setCampaigns(data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold flex items-center gap-2">

            <Megaphone className="w-7 h-7" />

            Advertising

          </h1>

          <p className="text-muted-foreground">

            Manage all banner advertising campaigns.

          </p>

        </div>

        <Button asChild>

          <Link to="/admin/advertising/new">

            <Plus className="mr-2 h-4 w-4" />

            New Campaign

          </Link>

        </Button>

      </div>

      <Card>

        <CardContent className="p-6">

          <CampaignTable
            campaigns={campaigns}
            loading={loading}
            onRefresh={loadCampaigns}
          />

        </CardContent>

      </Card>

    </div>
  );
}