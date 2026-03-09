import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-heading font-bold mb-3">The Market Hub</h3>
            <p className="text-sm text-muted-foreground">
              Eswatini's leading digital marketplace connecting businesses and customers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Marketplace</h4>
            <div className="space-y-2">
              <Link to="/marketplace" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Ads</Link>
              <Link to="/categories" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Categories</Link>
              <Link to="/post-ad" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Post Ad</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>WhatsApp: 76373859</p>
              <p>themarkethub51@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} The Market Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
