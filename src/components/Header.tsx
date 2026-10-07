import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useSavedAds } from "@/hooks/useSavedAds";
import { Button } from "@/components/ui/button";
import {
  Search,
  Menu,
  X,
  Plus,
  User,
  LogOut,
  LayoutDashboard,
  MessageCircle,
  Heart,
  Building,
  Home,
  ShoppingBag,
} from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Laptop, Banknote, Users } from "lucide-react";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showPostText, setShowPostText] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const unreadCount = useUnreadMessages();

  const { savedAdIds } = useSavedAds();
  const savedCount = savedAdIds?.length || 0;

  /*
   * ============================================================
   * USER DISPLAY NAME
   * ============================================================
   */

  const metadata = user?.user_metadata as
    | {
        full_name?: string;
        first_name?: string;
        last_name?: string;
        name?: string;
        avatar_url?: string;
      }
    | undefined;

  const fullName =
    metadata?.full_name ||
    metadata?.name ||
    [metadata?.first_name, metadata?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email?.split("@")[0] ||
    "User";

  const nameParts = fullName.trim().split(/\s+/);

  const firstName = nameParts[0] || "User";
  const lastName = nameParts.slice(1).join(" ");

  const avatarUrl = metadata?.avatar_url;

  /*
   * ============================================================
   * LATEST ADS
   * ============================================================
   */

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

  /*
   * ============================================================
   * CATEGORY ICONS
   * ============================================================
   */

  const iconMap = {
    electronics: Laptop,
    vehicles: Banknote,
    jobs: Users,
    construction: Building,
    health_beauty: Heart,
  };

  /*
   * ============================================================
   * CATEGORIES
   * ============================================================
   */

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

  /*
   * ============================================================
   * POST AD TEXT ROTATION
   * ============================================================
   */

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPostText(true);

      const timeout = setTimeout(() => {
        setShowPostText(false);
      }, 1800);

      return () => clearTimeout(timeout);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navigateAndClose = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  /*
   * ============================================================
   * MOBILE / TABLET TOP NAV
   *
   * Visible below lg.
   * Designed around the supplied mobile reference.
   * ============================================================
   */

  const CompactTopNav = () => (
    <div className="lg:hidden">
      <div className="relative z-[60] h-[74px] border-b border-border bg-background">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          {/* LEFT: PROFILE + NAME */}
          <button
            type="button"
            onClick={() =>
              user
                ? navigate("/profile")
                : navigate("/login")
            }
            className="flex min-w-0 items-center gap-3 text-left"
            aria-label={user ? "Open profile" : "Sign in"}
          >
            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/80 bg-background">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 stroke-[1.5] text-foreground" />
              )}
            </div>

            {/* Name */}
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-semibold text-foreground">
                {user ? firstName : "Welcome"}
              </div>

              <div className="truncate text-[13px] text-muted-foreground">
                {user ? lastName || "Account" : "Sign in"}
              </div>
            </div>
          </button>

          {/* RIGHT ACTIONS */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Messages */}
            <button
              type="button"
              onClick={() =>
                user
                  ? navigate("/messages")
                  : navigate("/login")
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95"
              aria-label="Messages"
            >
              <MessageCircle className="h-5 w-5 stroke-[1.7]" />

              {user && unreadCount > 0 && (
                <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Search */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95"
              aria-label="Search marketplace"
            >
              <Search className="h-5 w-5 stroke-[1.8]" />
            </button>
          </div>
        </div>

        {/* EXPANDED SEARCH */}
        {mobileSearchOpen && (
          <div className="absolute inset-0 z-[70] flex h-[74px] items-center gap-2 bg-background px-4 sm:px-6">
            <div className="flex-1">
              <SearchAutocomplete
                autoFocus
                className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          MOBILE/TABLET DRAWER
          ======================================================== */}

      {menuOpen && (
        <div className="absolute left-0 right-0 top-[74px] z-[55] border-b border-border bg-background shadow-lg">
          <div className="p-3 sm:p-4">
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => navigateAndClose("/")}
                className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium hover:bg-muted"
              >
                <Home className="h-4 w-4" />
                Home
              </button>

              <button
                type="button"
                onClick={() => navigateAndClose("/marketplace")}
                className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium hover:bg-muted"
              >
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </button>

              <button
                type="button"
                onClick={() => navigateAndClose("/categories")}
                className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium hover:bg-muted"
              >
                <Building className="h-4 w-4" />
                Categories
              </button>

              <button
                type="button"
                onClick={() => navigateAndClose("/how-it-works")}
                className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4" />
                How It Works
              </button>

              <button
                type="button"
                onClick={() => navigateAndClose("/about")}
                className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium hover:bg-muted"
              >
                <User className="h-4 w-4" />
                About
              </button>

              <button
                type="button"
                onClick={() => navigateAndClose("/contact")}
                className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" />
                Contact
              </button>

              {/* ADMIN */}
              {user && isAdmin && (
                <div className="mt-2 border-t border-border pt-2">
                  <button
                    type="button"
                    onClick={() => navigateAndClose("/admin")}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium text-primary hover:bg-muted"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Panel
                  </button>
                </div>
              )}

              {/* AUTH */}
              {!user && (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => navigateAndClose("/login")}
                    className="h-10 border border-border text-sm font-medium"
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateAndClose("/register")}
                    className="h-10 bg-primary text-sm font-medium text-primary-foreground"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {user && (
                <div className="mt-2 border-t border-border pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      closeMenu();
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );

  /*
   * ============================================================
   * MOBILE / TABLET BOTTOM NAV
   *
   * Visible below lg.
   * ============================================================
   */

  const CompactBottomNav = () => (
    <div className="lg:hidden">
      <nav
        className="fixed bottom-0 left-0 right-0 z-[80] border-t border-border bg-background"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="mx-auto flex h-[68px] max-w-2xl items-center justify-around px-2 sm:px-8">
          {/* MENU */}
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className={`flex h-12 w-14 flex-col items-center justify-center gap-1 ${
              menuOpen
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            aria-label="Menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5 stroke-[2]" />
            ) : (
              <Menu className="h-5 w-5 stroke-[2]" />
            )}

            <span className="text-[9px] font-medium">
              Menu
            </span>
          </button>

          {/* HOME */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className={`flex h-12 w-14 flex-col items-center justify-center gap-1 ${
              isActive("/")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            aria-label="Home"
          >
            <Home
              className={`h-5 w-5 ${
                isActive("/")
                  ? "fill-current"
                  : ""
              }`}
              strokeWidth={1.8}
            />

            <span className="text-[9px] font-medium">
              Home
            </span>
          </button>

          {/* CENTER POST BUTTON */}
          <button
            type="button"
            onClick={() =>
              user
                ? navigate("/post-ad")
                : navigate("/login")
            }
            className="relative -mt-7 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95"
            aria-label="Post an ad"
          >
            <Plus className="h-8 w-8 stroke-[2]" />
          </button>

          {/* MARKETPLACE */}
          <button
            type="button"
            onClick={() => navigate("/marketplace")}
            className={`flex h-12 w-14 flex-col items-center justify-center gap-1 ${
              isActive("/marketplace")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            aria-label="Marketplace"
          >
            <ShoppingBag
              className={`h-5 w-5 ${
                isActive("/marketplace")
                  ? "fill-current"
                  : ""
              }`}
              strokeWidth={1.8}
            />

            <span className="text-[9px] font-medium">
              Shop
            </span>
          </button>

          {/* SAVED */}
          <button
            type="button"
            onClick={() =>
              user
                ? navigate("/saved")
                : navigate("/login")
            }
            className={`relative flex h-12 w-14 flex-col items-center justify-center gap-1 ${
              isActive("/saved")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            aria-label="Saved ads"
          >
            <Heart
              className={`h-5 w-5 ${
                isActive("/saved")
                  ? "fill-current"
                  : ""
              }`}
              strokeWidth={1.8}
            />

            <span className="text-[9px] font-medium">
              Saved
            </span>

            {savedCount > 0 && (
              <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                {savedCount > 9 ? "9+" : savedCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );

  /*
   * ============================================================
   * DESKTOP HEADER
   *
   * Visible from lg upwards.
   * ============================================================
   */

  const DesktopHeader = () => (
    <div className="hidden lg:flex">
      <div className="container mx-auto h-14 w-full items-center justify-between gap-6 px-6 lg:flex">
        {/* Logo */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2"
        >
          <img
            src="/logo.png"
            alt="The Market Hub"
            className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
          />

          <span className="text-sm font-semibold tracking-tight text-foreground">
            The Market Hub
          </span>
        </Link>

        {/* Search */}
        <div className="max-w-sm flex-1 rounded-full border border-black/[0.08] bg-muted/40 px-3 py-1 shadow-xs transition-all duration-200 hover:border-black/20 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 dark:border-white/[0.08] dark:hover:border-white/20">
          <SearchAutocomplete className="w-full border-0 bg-transparent text-xs shadow-none focus-visible:ring-0" />
        </div>

        {/* Desktop actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="h-8 rounded-full px-3 text-xs font-normal text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground"
                >
                  <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                  Admin
                </Button>
              )}

              {/* Post Ad */}
              <button
                onClick={() => navigate("/post-ad")}
                className="flex h-8 items-center justify-center rounded-full bg-primary px-3.5 text-xs font-medium text-primary-foreground shadow-xs transition-all duration-200 hover:opacity-90 active:scale-95"
              >
                <Plus className="mr-1 h-3 w-3 stroke-[2.5]" />

                <span className="whitespace-nowrap">
                  {showPostText ? "Post Ad Now" : "Post Ad"}
                </span>
              </button>

              {/* Saved */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/saved")}
                title="Saved Ads"
                className="relative h-8 w-8 rounded-full text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground"
              >
                <Heart className="h-3.5 w-3.5" />

                {savedCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                    {savedCount > 9 ? "9+" : savedCount}
                  </span>
                )}
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                title="Messages"
                className="relative h-8 w-8 rounded-full text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5" />

                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {/* Profile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                title="Profile"
                className="h-8 w-8 rounded-full text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground"
              >
                <User className="h-3.5 w-3.5" />
              </Button>

              {/* Sign out */}
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sign out"
                className="h-8 w-8 rounded-full text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
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
                className="h-8 rounded-full px-3 text-xs font-normal text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                Sign In
              </Button>

              <Button
                size="sm"
                onClick={() => navigate("/register")}
                className="h-8 rounded-full bg-primary px-3.5 text-xs font-medium text-primary-foreground shadow-xs transition-all hover:opacity-90"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /*
   * ============================================================
   * HEADER
   * ============================================================
   */

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-background dark:border-white/[0.08]">
        {/* Mobile / Tablet */}
        <CompactTopNav />

        {/* Desktop */}
        <DesktopHeader />
      </header>

      {/* Fixed bottom mobile/tablet navigation */}
      <CompactBottomNav />
    </>
  );
}