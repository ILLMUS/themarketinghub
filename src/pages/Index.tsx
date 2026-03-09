import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdCard } from "@/components/AdCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, TrendingUp, Users, ShoppingBag } from "lucide-react";

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
      <section className="gradient-hero text-primary-foreground">
        <div className="container py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Discover & Promote Local Businesses Across{" "}
              <span className="text-gradient">Eswatini</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl" style={{ color: "hsl(220 15% 70%)" }}>
              The Market Hub is your go-to digital marketplace for buying, selling, and advertising products and services.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button size="lg" asChild className="gradient-primary border-0 text-base px-8">
                <Link to="/post-ad">Post Your Advertisement <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 border-muted-foreground/30 hover:bg-muted/10" style={{ color: "hsl(220 15% 80%)" }}>
                <Link to="/marketplace"><Search className="mr-2 h-4 w-4" /> Browse Marketplace</Link>
              </Button>
            </div>
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

      {/* Categories */}
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
