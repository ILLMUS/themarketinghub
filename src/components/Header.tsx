import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Plus, User, LogOut, LayoutDashboard, MessageCircle, Heart, Users, Building } from "lucide-react";
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

        <DesktopNavItem title="Marketplace" to="/marketplace">
         <div className="w-[430px] rounded-2xl border bg-card shadow-2xl overflow-hidden">

  {/* Header */}

  <div className="border-b px-6 py-4">

    <h3 className="font-semibold text-lg">
      Latest Listings
    </h3>

    <p className="text-sm text-muted-foreground">
      Freshly posted items from across Eswatini
    </p>

  </div>

  {/* Listings */}

  <div className="p-3">

    {latestAds?.map((ad) => (

      <Link
        key={ad.id}
        to={`/ad/${ad.id}`}
        className="
          group
          flex
          gap-4
          rounded-xl
          p-3
          transition-all
          duration-300
          hover:bg-muted/60
        "
      >

        {/* Image */}

        <div
          className="
            h-16
            w-16
            overflow-hidden
            rounded-xl
            bg-muted
            flex-shrink-0
          "
        >

          <img
            src={ad.images?.[0] || "/placeholder.svg"}
            alt={ad.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-110
            "
          />

        </div>

        {/* Content */}

        <div className="flex flex-1 flex-col justify-center">

          <h4
            className="
              line-clamp-1
              font-medium
              transition-colors
              duration-300
              group-hover:text-primary
            "
          >
            {ad.title}
          </h4>

          <p className="text-sm font-semibold mt-1">

            E{Number(ad.price).toLocaleString()}

          </p>

          <span
            className="
              mt-2
              text-xs
              text-muted-foreground
              transition-all
              duration-300
              group-hover:translate-x-1
              group-hover:text-primary
            "
          >
            View Details →
          </span>

        </div>

      </Link>

    ))}

  </div>

  {/* Footer */}

  <div className="border-t px-6 py-4">

    <Link
      to="/marketplace"
      className="
        flex
        items-center
        justify-between
        rounded-xl
        bg-primary/5
        px-4
        py-3
        transition-all
        duration-300
        hover:bg-primary/10
      "
    >

      <div>

        <p className="font-medium">
          Explore the Marketplace
        </p>

        <p className="text-sm text-muted-foreground">
          Browse every available listing
        </p>

      </div>

      <ChevronRight className="h-5 w-5" />

    </Link>

  </div>

</div>
          </DesktopNavItem>
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
<DesktopNavItem title="About" to="/about">
  <div className="w-[760px] rounded-2xl border bg-card shadow-2xl p-8">

    {/* Header */}
    <div className="text-center mb-8">
      <h3 className="text-2xl font-bold">
        About The Market Hub
      </h3>

      <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto leading-6">
        Eswatini's premier digital marketplace connecting businesses,
        entrepreneurs and customers through one modern platform.
      </p>
    </div>

    {/* Three Columns */}

    <div className="grid grid-cols-3 gap-8">

      {/* Mission */}

      <div
        className="
          group
          rounded-xl
          p-4
          transition-all
          duration-300
          hover:bg-muted/60
        "
      >
        <div
          className="
            mb-4
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <Target className="h-7 w-7 text-primary" />
        </div>

        <h4 className="font-semibold mb-2">
          Our Mission
        </h4>

        <p className="text-sm text-muted-foreground">
          Empower individuals and businesses with a trusted digital
          marketplace.
        </p>
      </div>

      {/* Community */}

      <div
        className="
          group
          rounded-xl
          p-4
          transition-all
          duration-300
          hover:bg-muted/60
        "
      >
        <div
          className="
            mb-4
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <Users className="h-7 w-7 text-primary" />
        </div>

        <h4 className="font-semibold mb-2">
          Our Community
        </h4>

        <p className="text-sm text-muted-foreground">
          Connecting buyers, sellers and entrepreneurs across Eswatini.
        </p>
      </div>

      {/* Vision */}

      <div
        className="
          group
          rounded-xl
          p-4
          transition-all
          duration-300
          hover:bg-muted/60"
        >
        <div
          className="
            mb-4
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <TrendingUp className="h-7 w-7 text-primary" />
        </div>

        <h4 className="font-semibold mb-2">
          Our Vision
        </h4>

        <p className="text-sm text-muted-foreground">
          Building Southern Africa's most trusted digital marketplace.
        </p>
      </div>

    </div>

    {/* Footer */}

    <div className="mt-8 border-t pt-5 flex items-center justify-between">

      <div>
        <p className="font-medium">
          Learn more about our journey
        </p>

        <p className="text-sm text-muted-foreground">
          Discover who we are and why thousands trust Market Hub.
        </p>
      </div>

      <Link
        to="/about"
        className="
          rounded-lg
          bg-primary
          px-5
          py-2.5
          text-sm
          font-medium
          text-primary-foreground
          transition-all
          duration-300
          hover:scale-105
        "
      >
        Learn More
      </Link>

    </div>

  </div>
</DesktopNavItem>


<DesktopNavItem
  title="How It Works"
  to="/how-it-works"
>
  <div className="w-[850px] rounded-2xl border bg-card shadow-2xl overflow-hidden">

    {/* Header */}

    <div className="px-8 py-7 text-center border-b">

      <h3 className="text-3xl font-bold">
        How The Market Hub Works
      </h3>

      <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
        Buying and selling across Eswatini has never been easier.
        Follow these simple steps to advertise your products,
        connect with buyers and complete successful sales.
      </p>

    </div>

    {/* Steps */}

    <div className="grid grid-cols-4 gap-6 p-8">

      {/* Step 1 */}

      <div
        className="
          group
          rounded-xl
          p-5
          transition-all
          duration-300
          hover:bg-muted/60
          hover:-translate-y-1
        "
      >

        <div
          className="
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <PlusCircle className="h-7 w-7 text-primary" />
        </div>

        <span className="text-xs font-semibold text-primary">
          STEP 01
        </span>

        <h4 className="mt-2 font-semibold">
          Post Your Ad
        </h4>

        <p className="mt-2 text-sm text-muted-foreground leading-6">
          Create your listing by adding photos,
          pricing, category and a detailed description.
        </p>

      </div>

      {/* Step 2 */}

      <div
        className="
          group
          rounded-xl
          p-5
          transition-all
          duration-300
          hover:bg-muted/60
          hover:-translate-y-1
        "
      >

        <div
          className="
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <Search className="h-7 w-7 text-primary" />
        </div>

        <span className="text-xs font-semibold text-primary">
          STEP 02
        </span>

        <h4 className="mt-2 font-semibold">
          Reach Buyers
        </h4>

        <p className="mt-2 text-sm text-muted-foreground leading-6">
          Thousands of buyers browse The Market Hub every day looking for products and services.
        </p>

      </div>

      {/* Step 3 */}

      <div
        className="
          group
          rounded-xl
          p-5
          transition-all
          duration-300
          hover:bg-muted/60
          hover:-translate-y-1
        "
      >

        <div
          className="
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <MessageCircle className="h-7 w-7 text-primary" />
        </div>

        <span className="text-xs font-semibold text-primary">
          STEP 03
        </span>

        <h4 className="mt-2 font-semibold">
          Connect Instantly
        </h4>

        <p className="mt-2 text-sm text-muted-foreground leading-6">
          Buyers contact you directly through WhatsApp,
          phone or secure in-app messaging.
        </p>

      </div>

      {/* Step 4 */}

      <div
        className="
          group
          rounded-xl
          p-5
          transition-all
          duration-300
          hover:bg-muted/60
          hover:-translate-y-1
        "
      >

        <div
          className="
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <BadgeCheck className="h-7 w-7 text-primary" />
        </div>

        <span className="text-xs font-semibold text-primary">
          STEP 04
        </span>

        <h4 className="mt-2 font-semibold">
          Complete Your Sale
        </h4>

        <p className="mt-2 text-sm text-muted-foreground leading-6">
          Meet safely, finalise the transaction and grow your business with confidence.
        </p>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t px-8 py-5 flex items-center justify-between">

      <div>

        <p className="font-semibold">
          Ready to reach thousands of buyers?
        </p>

        <p className="text-sm text-muted-foreground">
          Start advertising today or explore listings from across Eswatini.
        </p>

      </div>

      <div className="flex gap-3">

        <Button
          className="gradient-primary border-0"
          onClick={() => navigate("/post-ad")}
        >
          Start Selling
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate("/marketplace")}
        >
          Browse Marketplace
        </Button>

      </div>

    </div>

  </div>
</DesktopNavItem>

<DesktopNavItem
  title="Contact"
  to="/contact"
>
  <div className="w-[700px] rounded-2xl border bg-card shadow-2xl overflow-hidden">

    {/* Header */}

    <div className="border-b px-8 py-6 text-center">

      <h3 className="text-2xl font-bold">
        Contact The Market Hub
      </h3>

      <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
        Have questions or need help? Reach out to our team using any of the
        contact methods below.
      </p>

    </div>

    {/* Contact Cards */}

    <div className="grid grid-cols-2 gap-5 p-6">

      {/* WhatsApp */}

      <a
        href="https://wa.me/26876373859"
        target="_blank"
        rel="noopener noreferrer"
        className="
          group
          flex
          items-center
          gap-4
          rounded-xl
          border
          p-5
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-primary/40
          hover:shadow-lg
        "
      >

        <div
          className="
            rounded-xl
            bg-green-500/10
            p-3
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <MessageCircle className="h-6 w-6 text-green-600" />
        </div>

        <div>

          <h4 className="font-semibold group-hover:text-primary transition-colors">
            WhatsApp
          </h4>

          <p className="text-sm text-muted-foreground">
            +268 7637 3859
          </p>

        </div>

      </a>

      {/* Email */}

      <a
        href="mailto:themarkethub51@gmail.com"
        className="
          group
          flex
          items-center
          gap-4
          rounded-xl
          border
          p-5
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-primary/40
          hover:shadow-lg
        "
      >

        <div
          className="
            rounded-xl
            bg-primary/10
            p-3
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <Mail className="h-6 w-6 text-primary" />
        </div>

        <div>

          <h4 className="font-semibold group-hover:text-primary transition-colors">
            Email
          </h4>

          <p className="text-sm text-muted-foreground">
            themarkethub51@gmail.com
          </p>

        </div>

      </a>

      {/* Phone */}

      <a
        href="tel:+26876373859"
        className="
          group
          flex
          items-center
          gap-4
          rounded-xl
          border
          p-5
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-primary/40
          hover:shadow-lg
        "
      >

        <div
          className="
            rounded-xl
            bg-primary/10
            p-3
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <Phone className="h-6 w-6 text-primary" />
        </div>

        <div>

          <h4 className="font-semibold group-hover:text-primary transition-colors">
            Phone
          </h4>

          <p className="text-sm text-muted-foreground">
            +268 7637 3859
          </p>

        </div>

      </a>

      {/* Location */}

      <div
        className="
          group
          flex
          items-center
          gap-4
          rounded-xl
          border
          p-5
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-primary/40
          hover:shadow-lg
        "
      >

        <div
          className="
            rounded-xl
            bg-primary/10
            p-3
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          <MapPin className="h-6 w-6 text-primary" />
        </div>

        <div>

          <h4 className="font-semibold group-hover:text-primary transition-colors">
            Location
          </h4>

          <p className="text-sm text-muted-foreground">
            Eswatini
          </p>

        </div>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t px-8 py-5 flex items-center justify-between">

      <div>

        <p className="font-semibold">
          Need more assistance?
        </p>

        <p className="text-sm text-muted-foreground">
          Visit our contact page for all available support channels.
        </p>

      </div>

      <Link
        to="/contact"
        className="
          rounded-lg
          bg-primary
          px-5
          py-2.5
          text-sm
          font-medium
          text-primary-foreground
          transition-all
          duration-300
          hover:scale-105
        "
      >
        Contact Us
      </Link>

    </div>

  </div>
</DesktopNavItem>
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
