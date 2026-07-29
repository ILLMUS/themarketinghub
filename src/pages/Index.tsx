import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PopularChips } from "@/components/PopularChips";
import { AdCard } from "@/components/AdCard";
import { BannerSlider } from "@/components/BannerSlider";
import { AdBanner } from "@/components/common/AdBanner";
import { SidebarBanner } from "@/components/SidebarBanner";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Users, TrendingUp, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { Seo } from "@/hooks/useSeo";
import { marketplaceCategories } from "@/data/marketplaceCategories";
import { getUserLocation } from "@/utils/geolocation";
import heroCollage from "@/assets/hero-collage.png";

const HomePage = () => {
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    // Check if user already made a choice
    const permissionStatus = localStorage.getItem("geo_permission");
    if (!permissionStatus) {
      setShowLocationBanner(true);
    }
  }, []);

  const handleAllowLocation = () => {
    setLocating(true);
    getUserLocation(
      (lat, lng) => {
        setLocating(false);
        setShowLocationBanner(false);
        console.log("Location acquired:", lat, lng);
      },
      (error) => {
        setLocating(false);
        setShowLocationBanner(false);
      }
    );
  };

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
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .in("tier", ["e250", "e350", "e500"])
        .gte("expires_at", new Date().toISOString());

      if (error) throw error;
      return count ?? 0;
    },
  });

  const heroSpotlights = spotlightAds ?? [];
  const belowHeroSpotlights: typeof heroSpotlights = [];

  return (
    <div>
      <Seo
        title="The Market Hub – Buy & Sell in Eswatini | Classifieds Marketplace"
        description="Eswatini's #1 online marketplace. Browse cars, property, electronics, services and more."
        type="website"
      />

      {/* Geolocation Banner Prompt */}
      {showLocationBanner && (
        <div className="bg-primary text-primary-foreground px-4 py-3 shadow-md">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-center sm:text-left">
              <MapPin className="w-5 h-5 shrink-0 animate-bounce" />
              <span>Enable location access to discover nearby listings around Eswatini.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAllowLocation}
                disabled={locating}
                className="font-semibold text-xs rounded-none"
              >
                {locating && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                Allow Location
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowLocationBanner(false);
                  localStorage.setItem("geo_permission", "denied");
                }}
                className="text-primary-foreground hover:bg-primary-foreground/10 text-xs rounded-none"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="container mx-auto px-4 pt-4">
        <AdBanner position="home_top" />
      </div>
      
      <PopularChips categories={marketplaceCategories} /> 

      {/* Hero */}
      <section className="bg-secondary/60 text-primary-foreground overflow-hidden relative isolate">
        <div className="container py-10 md:py-16 relative">
          <div className="grid grid-cols-1 gap-1 items-center">
            <div className="animate-fade-in w-full">
              {heroSpotlights.length > 0 ? (
                <>
                  <div className="md:hidden grid grid-cols-2 gap-3 w-full">
                    {heroSpotlights.slice(0, 8).map((ad) => (
                      <Link key={ad.id} to={`/ad/${ad.id}`} className="group block">
                        <div className="relative rounded-none overflow-hidden border border-accent/40 shadow-lg bg-card">
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

                  <div className="hidden md:grid grid-cols-5 gap-3 w-full">
                    {heroSpotlights.slice(0, 20).map((ad) => (
                      <Link key={ad.id} to={`/ad/${ad.id}`} className="group block">
                        <div className="relative rounded-none overflow-hidden border border-accent/40 shadow-lg bg-card">
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
                <img src={heroCollage} alt="Marketplace items" width={1024} height={1024} className="w-full max-w-md object-contain mx-auto" />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-6">
        <BannerSlider />
      </div>

      {/* Spotlight strip */}
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

      {/* Boosted Ads */}
      {boostedAds && boostedAds.length > 0 && (
        <section className="bg-secondary/50">
          <div className="container py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Boosted</span>
                <h2 className="text-2xl md:text-3xl font-bold">Featured Listings</h2>
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
              <p className="text-2xl font-bold">{activeListingsCount}+</p>
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

      <div className="container mx-auto px-4 my-6">
        <AdBanner position="home_middle" />
      </div>

      {/* Standard Ads */}
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
            <Button asChild className="gradient-primary border-0 rounded-none">
              <Link to="/post-ad">Post Your Ad</Link>
            </Button>
          </div>
        )}
      </section>

      <div className="container mx-auto px-4 mb-6">
        <AdBanner position="home_bottom" />
      </div>

      <section className="gradient-primary">
        <div className="container py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <Button size="lg" asChild className="gradient-accent border-0 text-base rounded-none">
            <Link to="/post-ad">Post Your Advertisement <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;