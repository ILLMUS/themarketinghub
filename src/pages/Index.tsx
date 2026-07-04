import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PopularChips } from "@/components/PopularChips";
import { AdCard } from "@/components/AdCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, TrendingUp, Users, ShoppingBag, FileText, CheckCircle, DollarSign,
  Smartphone, Car, Home, Hammer, Shield, Sofa, Shirt, Briefcase, Tag,
  Utensils, Heart, Scissors, Phone, TreePine, Landmark, Truck, Play, Pause } from "lucide-react";
import heroCollage from "@/assets/hero-collage.png";
import heroBg from "@/assets/hero-bg.jpg";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState } from "react";
import { Seo } from "@/hooks/useSeo";
import SEO from "@/components/seo/SEO";

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



      {/* Hero */}
      <section className="gradient-hero text-primary-foreground overflow-hidden relative isolate">

      {/* Search */}
     <SearchAutocomplete
    className="max-w-md mx-auto pt-1 pb-1"/>


      {/* Quick-Access Category Chips */}
      <PopularChips categories={categories} chipIconMap={chipIconMap} />


        {/* Responsive background image */}
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <div className="container py-10 md:py-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            


            {/* Right - Image */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {heroSpotlights.length > 0 ? (
                <>
                  {/* Mobile: swipeable carousel */}
                  <div className="md:hidden">
                    <Carousel
                      opts={{ loop: true, align: "start" }}
                      plugins={heroShouldSlide ? [autoplayMobile.current] : []}
                      className="w-full max-w-sm mx-auto"
                    >
                      <CarouselContent className="-ml-3">
                        {heroSpotlights.map((ad) => (
                          <CarouselItem key={ad.id} className="pl-3 basis-1/2">
                            <Link to={`/ad/${ad.id}`} className="group block">
                              <div className="relative rounded-xl overflow-hidden border border-accent/40 shadow-lg shadow-accent/10 bg-card">
                                <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">★</div>
                                <div className="aspect-[4/3] bg-muted overflow-hidden">
                                  {ad.images?.[0] ? (
                                    <img src={ad.images[0]} alt={ad.title} className="w-full h-auto max-h-[650px] object-contain mx-auto" />
                                  ) : (
                                    <img src={heroCollage} alt="Marketplace" className="w-full h-auto max-h-[650px] object-contain mx-auto" />
                                  )}
                                </div>
                                <div className="p-2 bg-card text-foreground">
                                  <h3 className="font-semibold text-xs line-clamp-1">{ad.title}</h3>
                                  <p className="text-sm font-extrabold text-primary">E{ad.price.toLocaleString()}</p>
                                </div>
                              </div>
                            </Link>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                    {heroShouldSlide && (
                      <button
                        onClick={() => {
                          if (mobilePlaying) {
                            autoplayMobile.current.stop();
                          } else {
                            autoplayMobile.current.play();
                          }
                          setMobilePlaying(!mobilePlaying);
                        }}
                        className="mx-auto mt-3 flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary-foreground/80 backdrop-blur-sm hover:bg-primary/30 transition-colors"
                        aria-label={mobilePlaying ? "Pause carousel" : "Play carousel"}
                      >
                        {mobilePlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        {mobilePlaying ? "Pause" : "Play"}
                      </button>
                    )}
                  </div>
                  {/* Desktop: 2x2 grid (or sliding carousel when 4+ ads) */}
                  {heroShouldSlide ? (
                    <div className="hidden md:block w-full max-w-xl mx-auto">
                      <Carousel
                        opts={{ loop: true, align: "start" }}
                        plugins={[autoplayDesktop.current]}
                        className="w-full"
                      >
                        <CarouselContent className="-ml-3">
                          {heroSpotlights.map((ad) => (
                            <CarouselItem key={ad.id} className="pl-3 basis-1/4">
                              <Link to={`/ad/${ad.id}`} className="group block">
                                <div className="relative rounded-xl overflow-hidden border border-accent/40 shadow-lg shadow-accent/10 bg-card">
                                  <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">★</div>
                                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                                    {ad.images?.[0] ? (
                                      <img src={ad.images[0]} alt={ad.title} className="w-full h-auto max-h-[650px] object-contain mx-auto group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                      <img src={heroCollage} alt="Marketplace" className="w-full h-auto max-h-[650px] object-contain mx-auto" />
                                    )}
                                  </div>
                                  <div className="p-2 bg-card text-foreground">
                                    <h3 className="font-semibold text-xs line-clamp-1">{ad.title}</h3>
                                    <p className="text-sm font-extrabold text-primary">E{ad.price.toLocaleString()}</p>
                                  </div>
                                </div>
                              </Link>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                      <button
                        onClick={() => {
                          if (desktopPlaying) {
                            autoplayDesktop.current.stop();
                          } else {
                            autoplayDesktop.current.play();
                          }
                          setDesktopPlaying(!desktopPlaying);
                        }}
                        className="mx-auto mt-3 flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary-foreground/80 backdrop-blur-sm hover:bg-primary/30 transition-colors"
                        aria-label={desktopPlaying ? "Pause carousel" : "Play carousel"}
                      >
                        {desktopPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        {desktopPlaying ? "Pause" : "Play"}
                      </button>
                    </div>
                  ) : (
                    <div className="hidden md:grid grid-cols-2 gap-3 w-full max-w-xl mx-auto">
                      {heroSpotlights.slice(0, 4).map((ad) => (
                        <Link key={ad.id} to={`/ad/${ad.id}`} className="group">
                          <div className="relative rounded-xl overflow-hidden border border-accent/40 shadow-lg shadow-accent/10 bg-card">
                            <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">★</div>
                            <div className="aspect-[4/3] bg-muted overflow-hidden">
                              {ad.images?.[0] ? (
                                <img src={ad.images[0]} alt={ad.title} className="w-full h-full max-h-[650px] object-contain mx-auto group-hover:scale-105 transition-transform duration-500" />
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
                  )}
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

      {/* E500 Spotlight strip below hero */}
      {belowHeroSpotlights.length > 0 && (
        <section className="border-b bg-gradient-to-b from-accent/5 to-transparent">
          <div className="container py-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent">★ Spotlight</span>
                <h2 className="text-2xl md:text-3xl font-bold">Premium Listings</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {belowHeroSpotlights.map((ad) => <AdCard key={ad.id} ad={ad} />)}
            </div>
          </div>
        </section>
      )}

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

      {/* How It Works */}
      <section className="bg-secondary/50">
        <div className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Start selling in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: FileText, step: "1", title: "Post Your Ad", description: "Create a listing with photos, description, and price in minutes." },
              { icon: CheckCircle, step: "2", title: "Get Approved", description: "Our team reviews your ad to ensure quality and trust for all users." },
              { icon: DollarSign, step: "3", title: "Sell & Earn", description: "Connect with buyers across Eswatini and close the deal." },
            ].map((item, i) => (
              <div key={i} className="relative text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest">Step {item.step}</div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">{item.description}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute top-6 -right-6 h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>



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
          <div className="text-center py-16 bg-secondary/30 rounded-xl">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to post an advertisement!</p>
            <Button asChild className="gradient-primary border-0">
              <Link to="/post-ad">Post Your Ad</Link>
            </Button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="gradient-primary">
        <div className="container py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="mb-6 opacity-90 max-w-md mx-auto">
            Join hundreds of businesses advertising on The Market Hub. Reach customers across Eswatini.
          </p>
          <Button size="lg" asChild className="gradient-accent border-0 text-base">
            <Link to="/post-ad">Post Your Advertisement <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
