import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface AdBannerProps {
  position: "home_top" | "home_middle" | "home_bottom" | "sidebar" | "category_header";
  className?: string;
}

export const AdBanner = ({ position, className = "" }: AdBannerProps) => {
  // Autoplay plugin set to 15 seconds (15000ms), pausing when interacting
  const autoplayPlugin = useRef(
    Autoplay({ delay: 15000, stopOnInteraction: true })
  );

  const { data: banners, isLoading } = useQuery({
    queryKey: ["ad-banner", position],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("position", position)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`Error fetching banners for position ${position}:`, error);
        return [];
      }
      return data || [];
    },
  });

  if (isLoading || !banners || banners.length === 0) return null;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <Carousel
        opts={{ loop: true, align: "start" }}
        plugins={[autoplayPlugin.current]}
        className="w-full relative overflow-hidden"
      >
        <CarouselContent className="ml-0">
          {banners.map((banner, index) => {
            const bannerImgs = (banner as any).images?.length > 0 
              ? (banner as any).images 
              : banner.image_url ? [banner.image_url] : [];
            const primaryImg = bannerImgs[0] || banner.image_url;
            const targetUrl = banner.target_url || "#";

            return (
              <CarouselItem key={banner.id || index} className="basis-full pl-0">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => autoplayPlugin.current.stop()}
                  className="group relative block w-full overflow-hidden cursor-pointer bg-black/95"
                >
                  {/* Further reduced mobile height using aspect-[2.8/1] */}
                  <div className="relative w-full aspect-[2.8/1] sm:aspect-[4/1] md:aspect-[5/1] overflow-hidden flex items-center justify-center">
                    <img
                      src={primaryImg}
                      alt={banner.title || "Promotional Banner"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </a>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default AdBanner;