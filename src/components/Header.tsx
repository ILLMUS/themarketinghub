import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Plus, User, LogOut, LayoutDashboard, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-primary rounded-lg p-2">
            <Search className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-heading font-bold">The Market Hub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <Link to="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/messages")} title="Messages">
                <MessageCircle className="h-4 w-4" />
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
