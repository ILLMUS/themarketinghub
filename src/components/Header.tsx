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

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">

{/* Mobile Quick Actions */}

<div className="md:hidden border-t bg-card">

  <div className="container">

<div
  className="
    flex
    items-center
    justify-evenly
    py-1
    px-0
    lg:px-4
  "
>

      {user ? (

        <>



          {/* Saved */}

          <button
            onClick={() => navigate("/saved")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart className="h-6 w-6" />
          </button>

          {/* Messages */}

          <button
            onClick={() => navigate("/messages")}
            className="relative text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="h-6 w-6" />

            {unreadCount > 0 && (

              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  h-5
                  min-w-5
                  rounded-full
                  bg-destructive
                  text-white
                  text-[10px]
                  flex
                  items-center
                  justify-center
                "
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>

            )}

          </button>
          {/* Post Ad */}

          <button
            onClick={() => navigate("/post-ad")}
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-primary
              text-white
              shadow-lg
              transition-all
              duration-300
              hover:scale-110
            "
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* Profile */}

          <button
            onClick={() => navigate("/profile")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <User className="h-6 w-6" />
          </button>
          

          {/* Logout */}

          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-red-500 transition-colors"
          >
            <LogOut className="h-6 w-6" />
          </button>

        </>

      ) : (

        <>

          <button
            onClick={() => navigate("/login")}
            className="
              rounded-full
              border
              px-4
              py-2
              text-sm
            "
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="
              rounded-full
              bg-primary
              px-4
              py-2
              text-sm
              text-white
            "
          >
            Register
          </button>

        </>

      )}

    </div>

  </div>

</div>

      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div >
            <img
              src="/logo.png"
              alt="The Market Hub"
              className="h-10 w-10 object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav */}

 {/* Search */}
    <div
  className="
    mx-auto
    w-full
    max-w-md
    rounded-xl
    border
    border-gray-300
    dark:border-gray-700
    bg-white
    dark:bg-background
    shadow-sm
    transition-all
    duration-300
    hover:border-gray-400
    hover:shadow-md
    focus-within:border-primary
    focus-within:ring-2
    focus-within:ring-primary/20
  "
>
  <SearchAutocomplete
    className="w-full"
  />
</div>




        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Admin
                </Button>
              )}
              <Button size="sm" onClick={() => navigate("/post-ad")} className="gradient-primary border-0">
                <Plus className="h-4 w-4 mr-1" /> Post Ad
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/saved")} title="Saved Ads">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/messages")} title="Messages" className="relative">
                <MessageCircle className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} title="Profile">
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/register")} className="gradient-primary border-0">
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-3 animate-fade-in">
          <Link to="/marketplace" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          <Link to="/categories" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link to="/how-it-works" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link to="/about" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Contact</Link>
          <div className="pt-2 border-t space-y-2">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="outline" className="w-full" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                    <LayoutDashboard className="h-4 w-4 mr-1" /> Admin
                  </Button>
                )}

              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full" onClick={() => { navigate("/login"); setMenuOpen(false); }}>Sign In</Button>
                <Button className="w-full gradient-primary border-0" onClick={() => { navigate("/register"); setMenuOpen(false); }}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
