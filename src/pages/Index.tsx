import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdCard } from "@/components/AdCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, TrendingUp, Users, ShoppingBag, FileText, CheckCircle, DollarSign } from "lucide-react";
import heroCollage from "@/assets/hero-collage.png";

const HomePage = () => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: featuredAds } = useQuery({
    queryKey: ["featured-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: latestAds } = useQuery({
    queryKey: ["latest-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground overflow-hidden">
        <div className="container py-10 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left - Text */}
            <div className="space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary-foreground/80">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Eswatini's #1 Marketplace
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
                Discover & Promote Local Businesses Across{" "}
                <span className="text-gradient">Eswatini</span>
              </h1>
              <p className="text-sm md:text-base max-w-md" style={{ color: "hsl(220 15% 70%)" }}>
                Buy, sell, and advertise products and services — from vehicles and property to agriculture and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button size="default" asChild className="gradient-primary border-0 text-sm px-6 shadow-lg shadow-primary/25">
                  <Link to="/post-ad">Post Your Ad <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button size="default" variant="outline" asChild className="text-sm px-6 border-muted-foreground/30 hover:bg-muted/10" style={{ color: "hsl(220 15% 80%)" }}>
                  <Link to="/marketplace"><Search className="mr-1 h-4 w-4" /> Browse Marketplace</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-2 text-xs" style={{ color: "hsl(220 15% 60%)" }}>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-accent" />
                  <span>Vehicles & Auto parts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-accent" />
                  <span>Banking and Finanial Services</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-accent" />
                  <span>Agriculture</span>
                </div>
              </div>
            </div>

            {/* Right - Image */}
            <div className="hidden md:flex justify-center items-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <img
                src={heroCollage}
                alt="Marketplace items including vehicles, properties, agriculture and more"
                width={1024}
                height={1024}
                className="w-full max-w-md object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick-Access Category Chips */}
      <section className="border-b bg-card">
        <div className="container py-5">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Popular:</span>
            {categories?.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/marketplace?category=${cat.id}`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-secondary/50 px-4 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container py-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <ShoppingBag className="h-6 w-6 mx-auto text-primary" />
              <p className="text-2xl font-bold">{latestAds?.length ?? 0}+</p>
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

      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground mt-1">Find exactly what you're looking for</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/categories">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories?.slice(0, 10).map((cat) => (
            <CategoryCard key={cat.id} id={cat.id} name={cat.name} icon={cat.icon} description={cat.description} />
          ))}
        </div>
      </section>

      {/* Featured */}
      {featuredAds && featuredAds.length > 0 && (
        <section className="bg-secondary/50">
          <div className="container py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Featured Listings</h2>
                <p className="text-muted-foreground mt-1">Handpicked ads from top sellers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredAds.map((ad) => <AdCard key={ad.id} ad={ad} />)}
            </div>
          </div>
        </section>
      )}

      {/* Latest */}
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
        {latestAds && latestAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestAds.map((ad) => <AdCard key={ad.id} ad={ad} />)}
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
