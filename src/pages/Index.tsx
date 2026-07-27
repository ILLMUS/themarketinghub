import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PopularChips } from "@/components/PopularChips";
import { AdCard } from "@/components/AdCard";
import { CategoryCard } from "@/components/CategoryCard";
import { BannerSlider } from "@/components/BannerSlider";
import { AdBanner } from "@/components/common/AdBanner";
import { SidebarBanner } from "@/components/SidebarBanner";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, TrendingUp, Users, ShoppingBag, FileText, CheckCircle, DollarSign,
  Smartphone, Car, Home, Hammer, Shield, Sofa, Shirt, Briefcase, Tag,
  Utensils, Heart, Scissors, Phone, TreePine, Landmark, Truck, Play, Pause } from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";

import heroCollage from "@/assets/hero-collage.png";
import heroBg from "@/assets/hero-bg.jpg";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState } from "react";
import { Seo } from "@/hooks/useSeo";
import SEO from "@/components/seo/SEO";
import { marketplaceCategories } from "@/data/marketplaceCategories";

const chipIconMap: Record<string, React.ElementType> = {
  Smartphone, Car, Home, Hammer, Shield, Sofa, Shirt, Briefcase,
  Utensils, Heart, Scissors, Phone, TreePine, FileText, Landmark, Truck,
};

const HomePage = () => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: spotlightAds } = useQuery({
    queryKey: ["spotlight-ads-e500"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .eq("tier", "e500")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: boostedAds } = useQuery({
    queryKey: ["boosted-ads-e350"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .eq("tier", "e350")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: standardAds } = useQuery({
    queryKey: ["standard-ads-e250"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .eq("tier", "e250")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: activeListingsCount = 0 } = useQuery({
    queryKey: ["active-listings-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("advertisements")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("status", "approved")
        .in("tier", ["e250", "e350", "e500"])
        .gte("expires_at", new Date().toISOString());

      if (error) throw error;

      return count ?? 0;
    },
  });

  const heroSpotlights = spotlightAds ?? [];
  const belowHeroSpotlights: typeof heroSpotlights = [];
  const heroShouldSlide = heroSpotlights.length >= 5;
  const autoplayMobile = useRef(Autoplay({ delay: 4375, stopOnInteraction: false, stopOnMouseEnter: true }));
  const autoplayDesktop = useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [mobilePlaying, setMobilePlaying] = useState(true);
  const [desktopPlaying, setDesktopPlaying] = useState(true);

  return (
    <div>
      <Seo
        title="Market Hub – Buy & Sell in Eswatini | Classifieds Marketplace"
        description="Eswatini's #1 online marketplace. Browse cars, property, electronics, services and more across Mbabane, Manzini and beyond. Post free ads in minutes."
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Market Hub",
          url: window.location.origin,
          potentialAction: {
            "@type": "SearchAction",
            target: `${window.location.origin}/marketplace?search={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
    {/* 🌟 Top Position Banner */}
      <div className="container mx-auto px-4 pt-4">
        <AdBanner position="home_top" />
      </div>
      
        {/* Quick-Access Category Chips */}
        <PopularChips categories={marketplaceCategories} /> 


{/* Hero */}
      <section className="bg-secondary/60 -hero text-primary-foreground overflow-hidden relative isolate">
        <div className="container py-10 md:py-16 relative">
          <div className="grid grid-cols-1 gap-1 items-center">
            
            {/* Right - Image */}
            <div className="animate-fade-in w-full" style={{ animationDelay: "0.2s" }}>
              {heroSpotlights.length > 0 ? (
                <>
                  {/* Mobile: Dynamic grid up to 2 columns and 4 rows (max 8 items) */}
                  <div className="md:hidden">
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {heroSpotlights.slice(0, 8).map((ad) => (
                        <Link key={ad.id} to={`/ad/${ad.id}`} className="group block">
                          <div className="relative rounded-none overflow-hidden border border-accent/40 shadow-lg shadow-accent/10 bg-card">
                            <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-none">★</div>
                            <div className="aspect-[4/3] bg-muted overflow-hidden flex items-center justify-center">
                              {ad.images?.[0] ? (
                                <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-contain mx-auto" />
                              ) : (
                                <img src={heroCollage} alt="Marketplace" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="p-2 bg-card text-foreground">
                              <h3 className="font-semibold text-xs line-clamp-1">{ad.title}</h3>
                              <p className="text-sm font-extrabold text-primary">E{ad.price.toLocaleString()}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Desktop: Dynamic grid up to 5 columns and 4 rows (max 20 items) */}
                  <div className="hidden md:grid grid-cols-5 gap-3 w-full">
                    {heroSpotlights.slice(0, 20).map((ad) => (
                      <Link key={ad.id} to={`/ad/${ad.id}`} className="group block">
                        <div className="relative rounded-none overflow-hidden border border-accent/40 shadow-lg shadow-accent/10 bg-card">
                          <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-none">★</div>
                          <div className="aspect-[4/3] bg-muted overflow-hidden flex items-center justify-center">
                            {ad.images?.[0] ? (
                              <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-contain mx-auto group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <img src={heroCollage} alt="Marketplace" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="p-2 bg-card text-foreground">
                            <h3 className="font-semibold text-xs line-clamp-1">{ad.title}</h3>
                            <p className="text-sm font-extrabold text-primary">E{ad.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <img
                  src={heroCollage}
                  alt="Marketplace items including vehicles, properties, agriculture and more"
                  width={1024}
                  height={1024}
                  className="w-full max-w-md object-contain drop-shadow-2xl mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Promotional Banner Slider */}
      <div className="container mx-auto px-4 mt-6">
        <BannerSlider />
      </div>

      {/* E500 Spotlight strip below hero */}
      <section className="border-b bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">★ Spotlight</span>
              <h2 className="text-2xl md:text-3xl font-bold">Premium Listings</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-5">
            <div className="w-full h-full flex flex-col">
              <SidebarBanner />
            </div>
            {belowHeroSpotlights.map((ad) => <AdCard key={ad.id} ad={ad} />)}
          </div>
        </div>
      </section>

      {/* E350 Boosted - right below hero */}
      {boostedAds && boostedAds.length > 0 && (
        <section className="bg-secondary/50">
          <div className="container py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Boosted</span>
                <h2 className="text-2xl md:text-3xl font-bold">Featured Listings</h2>
                <p className="text-muted-foreground mt-1">Handpicked ads from top sellers</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {boostedAds.map((ad) => <AdCard key={ad.id} ad={ad} />)}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="border-b">
        <div className="container py-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <ShoppingBag className="h-6 w-6 mx-auto text-primary" />
              <p className="text-2xl font-bold">
              {activeListingsCount}+
              </p>
              <p className="text-xs text-muted-foreground">Active Listings</p>
            </div>
            <div className="space-y-1">
              <Users className="h-6 w-6 mx-auto text-primary" />
              <p className="text-2xl font-bold">{categories?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
            <div className="space-y-1">
              <TrendingUp className="h-6 w-6 mx-auto text-primary" />
              <p className="text-2xl font-bold">Growing</p>
              <p className="text-xs text-muted-foreground">Daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 Middle Position Banner */}
      <div className="container mx-auto px-4 my-6">
        <AdBanner position="home_middle" />
      </div>

      {/* E250 Standard - Latest Listings */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Latest Listings</h2>
            <p className="text-muted-foreground mt-1">Fresh ads posted recently</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/marketplace">See All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {standardAds && standardAds.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {standardAds.map((ad) => <AdCard key={ad.id} ad={ad} />)}
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/30 rounded-none">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to post an advertisement!</p>
            <Button asChild className="gradient-primary border-0 rounded-none">
              <Link to="/post-ad">Post Your Ad</Link>
            </Button>
          </div>
        )}
      </section>

      {/* 🌟 Bottom Position Banner */}
      <div className="container mx-auto px-4 mb-6">
        <AdBanner position="home_bottom" />
      </div>

      {/* CTA */}
      <section className="gradient-primary">
        <div className="container py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="mb-6 opacity-90 max-w-md mx-auto">
            Join hundreds of businesses advertising on The Market Hub. Reach customers across Eswatini.
          </p>
          <Button size="lg" asChild className="gradient-accent border-0 text-base rounded-none">
            <Link to="/post-ad">Post Your Advertisement <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;