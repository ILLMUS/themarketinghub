import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Plus, User, LogOut, LayoutDashboard, MessageCircle, Heart, Users, Building } from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";

import {  ArrowRight, ShoppingBag, FileText, CheckCircle, DollarSign,
  Smartphone, Car, Home, Hammer, Shield, Sofa, Shirt, Briefcase, Tag,
  Utensils, Scissors, TreePine, Landmark, Truck, Play, Pause } from "lucide-react";
 
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { DesktopNavItem } from "@/components/navigation/DesktopNavItem";
import {
  Target,
  TrendingUp,
} from "lucide-react";
import {
  PlusCircle,
  BadgeCheck,
   MapPin,
   Phone,
   Mail
} from "lucide-react";
import {
  Laptop,
  Wheat,
  Beef,
  Banknote,
  Sparkles,
  Music,
} from "lucide-react";


export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [showPostText, setShowPostText] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const unreadCount = useUnreadMessages();

  const { data: latestAds } = useQuery({
    queryKey: ["header-latest-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select(`
          id,
          title,
          price,
          images,
          location
        `)
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
        .select(`
          id,
          name,
          icon,
          subcategories (
            id,
            name,
            icon
          )
        `)
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
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur shadow-sm supports-[backdrop-filter]:bg-card/80 transition-all duration-200">
      
      {/* =========================================================
          MOBILE TOP ROW (☰ LOGO 🔍 [❤])
          ========================================================= */}
      <div className="relative flex md:hidden h-14 items-center justify-between px-4 bg-card border-b mr-[20px] ml-[20px]">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button 
            className="p-1.5 rounded-full text-muted-foreground active:bg-muted transition-colors mr-[17px]" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
          </button>
          
          <Link to="/" className="flex items-center transition-transform active:scale-95">
            <img
              src="/logo.png"
              alt="The Market Hub"
              className="h-8 w-8 object-contain"
            />
          </Link>
        </div>

        {/* Right: Search Icon & Saved Icon */}
        <div className="flex items-center gap-1.5 ">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="p-2 text-muted-foreground hover:text-primary active:bg-muted rounded-full transition-all "
            aria-label="Search marketplace "
          >
            <Search className="h-[21px] w-[21px]" />
          </button>

          {user && (
            <button
              onClick={() => navigate("/saved")}
              className="p-2 text-muted-foreground ml-[15px] hover:text-primary active:bg-muted rounded-full transition-all"
              aria-label="Saved Ads"
            >
              <Heart className="h-[21px] w-[21px]" />
            </button>
          )}
        </div>

        {/* Expandable Mobile Search Dropdown Area */}
        {mobileSearchOpen && (
          <div className="absolute inset-0 z-50 flex items-center gap-2 bg-card px-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex-1">
              <SearchAutocomplete className="w-full text-sm" />
            </div>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>


      {/* =========================================================
          MOBILE SECOND ROW: QUICK ACTIONS (❤ 💬 ⊕ 👤 🚪)
          ========================================================= */}
      <div className="md:hidden bg-card border-b shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-2 px-6 mr-[-30px] ml-[-30px]">
            {user ? (
              <>
                {/* Saved */}
                <button
                  onClick={() => navigate("/saved")}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:scale-90 transition-all"
                >
                  <Heart className="h-[19px] w-[19px]" />
                </button>

                {/* Messages */}
                <button
                  onClick={() => navigate("/messages")}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:scale-90 transition-all"
                >
                  <MessageCircle className="h-[19px] w-[19px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* HERO Floating Post Ad Circle Button */}
                <div className="relative flex items-center justify-center">
                  <button
                    onClick={() => navigate("/post-ad")}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 active:shadow-md transition-all duration-200"
                    title="Post Ad"
                  >
                    <Plus className="h-6 w-6 stroke-[2.5]" />
                  </button>
                </div>

                {/* Profile */}
                <button
                  onClick={() => navigate("/profile")}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:scale-90 transition-all"
                >
                  <User className="h-[19px] w-[19px]" />
                </button>

                {/* Logout */}
                <button
                  onClick={signOut}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all"
                >
                  <LogOut className="h-[19px] w-[19px]" />
                </button>
              </>
            ) : (
              <div className="flex w-full items-center justify-between gap-4 py-0.5">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 rounded-full border border-input py-2 text-center text-xs font-semibold shadow-sm hover:bg-muted active:scale-[0.98] transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="flex-1 rounded-full bg-primary py-2 text-center text-xs font-semibold text-white shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          DESKTOP HEADER LAYOUT
          ========================================================= */}
      <div className="hidden md:flex container mx-auto h-16 items-center justify-between gap-6 px-6">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/logo.png"
            alt="The Market Hub"
            className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            MarketHub
          </span>
        </Link>

        {/* Search Bar Container */}
        <div className="flex-1 max-w-md rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-background shadow-sm transition-all duration-300 hover:border-gray-400 hover:shadow-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <SearchAutocomplete className="w-full" />
        </div>

        {/* Action Controls Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="rounded-lg shadow-sm hover:bg-muted">
                  <LayoutDashboard className="h-[15px] w-[15px] mr-1.5" /> Admin
                </Button>
              )}
              
              {/* Animated Desktop Post Ad Button */}
              <button
                onClick={() => navigate("/post-ad")}
                className="flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary/95 transition-all duration-300 ease-in-out"
              >
                <Plus className={`h-[15px] w-[15px] transition-all duration-300 ${showPostText ? "mr-1.5" : "mr-1.5"}`} />
                <span className="whitespace-nowrap">
                  {showPostText ? "Post Ad Now" : "Post Ad"}
                </span>
              </button>
              
              <Button variant="ghost" size="icon" onClick={() => navigate("/saved")} title="Saved Ads" className="text-muted-foreground hover:text-primary rounded-full h-9 w-9">
                <Heart className="h-[19px] w-[19px]" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => navigate("/messages")} title="Messages" className="relative text-muted-foreground hover:text-primary rounded-full h-9 w-9">
                <MessageCircle className="h-[19px] w-[19px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title="Profile" className="text-muted-foreground hover:text-primary rounded-full h-9 w-9">
                <User className="h-[19px] w-[19px]" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive rounded-full h-9 w-9">
                <LogOut className="h-[19px] w-[19px]" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="font-medium">
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/register")} className="gradient-primary border-0 rounded-lg shadow-sm">
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
        <div className="md:hidden border-t bg-card p-4 space-y-1 shadow-inner animate-in fade-in slide-in-from-top-4 duration-200">
          <Link to="/marketplace" className="block py-2.5 px-2 text-sm font-medium tracking-wide rounded-md hover:bg-muted text-foreground/90" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          <Link to="/categories" className="block py-2.5 px-2 text-sm font-medium tracking-wide rounded-md hover:bg-muted text-foreground/90" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link to="/how-it-works" className="block py-2.5 px-2 text-sm font-medium tracking-wide rounded-md hover:bg-muted text-foreground/90" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link to="/about" className="block py-2.5 px-2 text-sm font-medium tracking-wide rounded-md hover:bg-muted text-foreground/90" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="block py-2.5 px-2 text-sm font-medium tracking-wide rounded-md hover:bg-muted text-foreground/90" onClick={() => setMenuOpen(false)}>Contact</Link>
          
          <div className="pt-3 mt-2 border-t border-border/60 space-y-2">
            {user && isAdmin && (
              <Button variant="outline" className="w-full justify-center shadow-sm" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                <LayoutDashboard className="h-4 w-4 mr-1.5" /> Admin Panel
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}