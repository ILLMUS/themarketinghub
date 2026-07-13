import { useEffect, useState } from "react";
import {
  AdvertisingService,
  AdCampaign,
} from "@/services/advertising";

interface BannerAdProps {
  position: string;
  className?: string;
}

export default function BannerAd({
  position,
  className = "",
}: BannerAdProps) {
const [banner, setBanner] = useState<AdCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanner();
  }, [position]);

  async function loadBanner() {
    try {
      setLoading(true);

      const campaign =
        await AdvertisingService.getBanner(position);

      setBanner(campaign);
    } catch (error) {
      console.error("Failed to load banner:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (!banner) return;

    // Website
    if (banner.destination_url) {
      window.open(
        banner.destination_url,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    // WhatsApp
    if (banner.whatsapp) {
      window.open(
        `https://wa.me/${banner.whatsapp.replace(/\D/g, "")}`,
        "_blank"
      );
    }
  }

  if (loading) {
    return (
      <div
        className={`
          w-full
          h-48
          animate-pulse
          rounded-xl
          bg-muted
          ${className}
        `}
      />
    );
  }

  if (!banner) {
    return null;
  }

  return (
    <div
      className={`
        overflow-hidden
        rounded-xl
        cursor-pointer
        transition-all
        duration-300
        hover:shadow-xl
        hover:scale-[1.01]
        ${className}
      `}
      onClick={handleClick}
    >
      <img
        src={banner.image_url}
        alt={banner.title}
        className="
          w-full
          h-auto
          object-cover
        "
      />
    </div>
  );
}