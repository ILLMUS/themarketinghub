import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">

      <div className="container py-14">

        <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-5">

          {/* ------------------------------------------------ */}
          {/* Brand */}
          {/* ------------------------------------------------ */}

          <div className="lg:col-span-2">

            <h3 className="text-xl font-bold mb-4">
              The Market Hub
            </h3>

            <p className="text-sm text-muted-foreground leading-6">
              Eswatini's trusted online marketplace connecting buyers and
              sellers nationwide. Buy, sell and discover thousands of products,
              services and opportunities all in one place.
            </p>

          </div>

          {/* ------------------------------------------------ */}
          {/* Marketplace */}
          {/* ------------------------------------------------ */}

          <div>

            <h4 className="font-semibold mb-4">
              Marketplace
            </h4>

            <div className="space-y-2">

              <Link
                to="/marketplace"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Browse Listings
              </Link>

              <Link
                to="/categories"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Categories
              </Link>

              <Link
                to="/featured"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Featured Listings
              </Link>

              <Link
                to="/latest"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Latest Listings
              </Link>

              <Link
                to="/post-ad"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Post Advertisement
              </Link>

            </div>

          </div>



          {/* ------------------------------------------------ */}
          {/* Resources */}
          {/* ------------------------------------------------ */}

          <div>

            <h4 className="font-semibold mb-4">
              Resources
            </h4>

            <div className="space-y-2">

              <Link to="/how-it-works" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>

              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </Link>

              <Link to="/safety-tips" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Safety Tips
              </Link>

              <Link to="/buying-guide" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Buying Guide
              </Link>

              <Link to="/selling-guide" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Selling Guide
              </Link>

            </div>

          </div>

          {/* ------------------------------------------------ */}
          {/* Company */}
          {/* ------------------------------------------------ */}

          <div>

            <h4 className="font-semibold mb-4">
              Company
            </h4>

            <div className="space-y-2">

              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>

              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>

              <Link to="/privacy-policy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>

              <Link to="/terms-and-conditions" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>

              <Link to="/report-listing" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Report Listing
              </Link>

            </div>

          </div>

        </div>

        {/* ------------------------------------------------ */}
        {/* Bottom Footer */}
        {/* ------------------------------------------------ */}

        <div className="border-t mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} The Market Hub. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-5 text-sm">

            <a
              href="https://wa.me/26876373859"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              WhatsApp
            </a>

            <a
              href="mailto:themarkethub51@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              themarkethub51@gmail.com
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}