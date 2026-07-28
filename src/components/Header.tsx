import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useSavedAds } from "@/hooks/useSavedAds";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Plus, User, LogOut, LayoutDashboard, MessageCircle, Heart, Building, Sparkles } from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Laptop, Banknote, Users } from "lucide-react";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPostText, setShowPostText] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const unreadCount = useUnreadMessages();
  
  const { savedAdIds } = useSavedAds();
  const savedCount = savedAdIds?.length || 0;

  const { data: latestAds } = useQuery({
    queryKey: ["header-latest-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select(`id, title, price, images, location`)
        .eq("status", "approved")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  const iconMap = {
    electronics: Laptop,
    vehicles: Banknote,
    jobs: Users,
    construction: Building,
    health_beauty: Heart,
  };
    
  const { data: categories } = useQuery({
    queryKey: ["header-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(`id, name, icon, subcategories (id, name, icon)`)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPostText(true);
      setTimeout(() => {
        setShowPostText(false);
      }, 1800);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] dark:border-white/[0.08] bg-background/80 backdrop-blur-2xl transition-all duration-300">
      
      {/* =========================================================
          MOBILE TOP ROW (Apple Hybrid Minimalist Bar)
          ========================================================= */}
      <div className="relative flex md:hidden h-12 items-center justify-between px-4">
        {/* Left: Hamburger & Clean Title */}
        <div className="flex items-center gap-2.5">
          <button 
            className="p-1 rounded-full text-foreground/80 hover:bg-muted active:scale-95 transition-all" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          
          <Link to="/" className="flex items-center gap-1.5 active:scale-95 transition-transform">
            <img
              src="/logo.png"
              alt="The Market Hub"
              className="h-5 w-5 object-contain" 
            />
            <span className="text-xs font-semibold tracking-tight text-foreground">
              MarketHub
            </span>
          </Link>
        </div>

        {/* Right: Search Icon */}
        <div className="flex items-center">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="p-1.5 rounded-full text-foreground/80 hover:bg-muted active:scale-95 transition-all"
            aria-label="Search marketplace"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Expandable Mobile Search Dropdown Area */}
        {mobileSearchOpen && (
          <div className="absolute inset-0 z-50 flex items-center gap-2 bg-background px-4 animate-in fade-in duration-200 border-b border-border/40">
            <div className="flex-1">
              <SearchAutocomplete className="w-full text-xs h-8 bg-muted/50 rounded-lg px-3 border-0" />
            </div>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================
          MOBILE SECOND ROW: FLUID APPLE/MACOS QUICK ACTIONS BAR
          ========================================================= */}
      <div className="md:hidden border-t border-black/[0.04] dark:border-white/[0.04] bg-muted/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex items-center justify-around">
            {user ? (
              <>
                <button
                  onClick={() => navigate("/saved")}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted active:scale-90 transition-all"
                >
                  <Heart className="h-3.5 w-3.5" />
                  {savedCount > 0 && (
                    <span className="absolute top-0 right-0 h-3 min-w-3 px-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center shadow-xs">
                      {savedCount > 9 ? "9+" : savedCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate("/messages")}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted active:scale-90 transition-all"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-3 min-w-3 px-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate("/post-ad")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  title="Post Ad"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted active:scale-90 transition-all"
                >
                  <User className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={signOut}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <div className="flex w-full items-center justify-center gap-2 py-0.5">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 rounded-full bg-muted/80 py-1 text-center text-[11px] font-medium text-foreground hover:bg-muted transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="flex-1 rounded-full bg-primary py-1 text-center text-[11px] font-medium text-primary-foreground shadow-xs hover:opacity-95 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          DESKTOP HEADER LAYOUT (Apple Glassmorphism / macOS Menu Hybrid)
          ========================================================= */}
      <div className="hidden md:flex container mx-auto h-14 items-center justify-between gap-6 px-6">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/logo.png"
            alt="The Market Hub"
            className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-semibold text-sm tracking-tight text-foreground">
            MarketHub
          </span>
        </Link>

        {/* Search Bar Container - Refined macOS Style */}
        <div className="flex-1 max-w-sm rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-muted/40 px-3 py-1 shadow-xs transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
          <SearchAutocomplete className="w-full text-xs bg-transparent border-0 shadow-none focus-visible:ring-0" />
        </div>

        {/* Action Controls Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/admin")} 
                  className="rounded-full text-xs font-normal h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" /> Admin
                </Button>
              )}
              
              {/* Desktop Post Ad Button */}
              <button
                onClick={() => navigate("/post-ad")}
                className="flex items-center justify-center h-8 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-xs hover:opacity-90 active:scale-95 transition-all duration-200"
              >
                <Plus className="h-3 w-3 mr-1 stroke-[2.5]" />
                <span className="whitespace-nowrap">
                  {showPostText ? "Post Ad Now" : "Post Ad"}
                </span>
              </button>
              
              {/* Saved Ads Desktop Icon Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/saved")} 
                title="Saved Ads" 
                className="relative text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full h-8 w-8 transition-all"
              >
                <Heart className="h-3.5 w-3.5" />
                {savedCount > 0 && (
                  <span className="absolute top-0 right-0 h-3.5 min-w-3.5 px-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center shadow-xs">
                    {savedCount > 9 ? "9+" : savedCount}
                  </span>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/messages")} 
                title="Messages" 
                className="relative text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full h-8 w-8 transition-all"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-3.5 min-w-3.5 px-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/profile")} 
                title="Profile" 
                className="text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full h-8 w-8 transition-all"
              >
                <User className="h-3.5 w-3.5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={signOut} 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/login")} 
                className="text-xs font-normal h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full"
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate("/register")} 
                className="text-xs font-medium h-8 px-3.5 rounded-full bg-primary text-primary-foreground shadow-xs hover:opacity-90 transition-all"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          MOBILE DRAWER PANEL LINKS
          ========================================================= */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-2xl p-4 space-y-1 shadow-lg animate-in fade-in duration-200">
          <Link to="/marketplace" className="block py-2 px-3 text-xs font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          <Link to="/categories" className="block py-2 px-3 text-xs font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link to="/how-it-works" className="block py-2 px-3 text-xs font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link to="/about" className="block py-2 px-3 text-xs font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="block py-2 px-3 text-xs font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Contact</Link>
          
          <div className="pt-2 mt-2 border-t border-border/40">
            {user && isAdmin && (
              <Button variant="ghost" className="w-full justify-start text-xs font-normal h-8 text-muted-foreground hover:text-foreground" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                <LayoutDashboard className="h-3.5 w-3.5 mr-2" /> Admin Panel
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}