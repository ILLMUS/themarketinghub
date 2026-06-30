import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Plus, User, LogOut, LayoutDashboard, MessageCircle, Heart, Users, Building } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";

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
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div >
            <img
  src="/logo.png"
  alt="The Market Hub"
  className="h-10 w-10 object-contain"
/>
          </div>
          <span className="text-xl font-heading font-bold">The Market Hub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Marketplace
          </Link>
         <div className="relative group">
  <Link
    to="/categories"
    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
  >
    Categories
  </Link>

  {
<div
  className="
    absolute
    top-full
    left-1/2
    -translate-x-1/2
    mt-2
    w-72
    rounded-xl
    border
    bg-card
    shadow-xl

    opacity-0
    invisible
    translate-y-2

    group-hover:opacity-100
    group-hover:visible
    group-hover:translate-y-0

    transition-all
    duration-200
    z-50
  "
>

<div className="flex">

  {/* LEFT SIDE */}

  <div className="w-64 border-r">
    <div className="w-64 border-r max-h-[70vh] overflow-y-auto">
    {categories?.map(category => (

      <button
        key={category.id}
        onMouseEnter={() => setActiveCategory(category)}
        className="group/item flex justify-between items-center w-full px-4 py-3 hover:bg-muted"
      >

        <span>{category.name}</span>

        <ChevronRight
          className="
            h-4
            w-4
            opacity-0
            transition-all
            duration-200
            group-hover/item:opacity-100
            group-hover/item:translate-x-1
          "
        />

      </button>

    ))}
    </div>
  </div>

  {/* RIGHT SIDE */}

 <div className="min-w-[450px] border-l bg-card p-5">

    {activeCategory && (

      <>
        <h3 className="font-semibold mb-3">

          {activeCategory.name}

        </h3>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">

          {activeCategory.subcategories?.map((sub: any) => (

            <Link
  key={sub.id}
  to={`/marketplace?subcategory=${sub.id}`}
  className="
    flex
    items-center
    rounded-lg
    px-3
    py-2
    text-sm
    transition-all
    duration-200
    hover:bg-muted
    hover:text-primary
  "
>
  {sub.name}
</Link>

          ))}

        </div>

      </>

    )}

  </div>

</div>


</div>
  }
</div>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
                    <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

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
                <Button className="w-full gradient-primary border-0" onClick={() => { navigate("/post-ad"); setMenuOpen(false); }}>
                  <Plus className="h-4 w-4 mr-1" /> Post Ad
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { navigate("/saved"); setMenuOpen(false); }}>
                  <Heart className="h-4 w-4 mr-1" /> Saved Ads
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { navigate("/messages"); setMenuOpen(false); }}>
                  <MessageCircle className="h-4 w-4 mr-1" /> Messages
                  {unreadCount > 0 && (
                    <span className="ml-2 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { navigate("/profile"); setMenuOpen(false); }}>
                  <User className="h-4 w-4 mr-1" /> Profile
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => { signOut(); setMenuOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out
                </Button>
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
