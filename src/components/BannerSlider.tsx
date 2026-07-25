import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export const BannerSlider = () => {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  const { data: banners, isLoading, error } = useQuery({
    queryKey: ["active-banner-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("status", "active")
        .gte("end_date", new Date().toISOString());

      if (error) {
        // Log query error without breaking UI
        console.warn("BannerSlider query notice:", error.message);
        return [];
      }
      return data || [];
    },
  });

  if (isLoading || error || !banners || banners.length === 0) {
    return null; // Gracefully render nothing if no banners or if database table is not ready yet
  }

  return (
    <div className="w-full my-6">
      <Carousel
        opts={{ loop: true, align: "start" }}
        plugins={[plugin.current]}
        className="w-full relative rounded-2xl overflow-hidden shadow-sm"
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="basis-full">
              <a
                href={banner.target_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative w-full h-[180px] sm:h-[260px] md:h-[320px] overflow-hidden rounded-2xl group"
              >
                <img
                  src={banner.image_url || "/placeholder.svg"}
                  alt={banner.title || "Promotional Banner"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback image handling
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                {banner.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 text-white">
                    <h3 className="font-bold text-lg md:text-2xl line-clamp-1">{banner.title}</h3>
                  </div>
                )}
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 && (
          <>
            <CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-none" />
            <CarouselNext className="right-4 bg-background/80 hover:bg-background border-none" />
          </>
        )}
      </Carousel>
    </div>
  );
};