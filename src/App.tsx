
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { AuthPopup } from "@/components/AuthPopup";

// Core pages
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import AdDetails from "./pages/AdDetails";
import PostAd from "./pages/PostAd";
import Categories from "./pages/Categories";
import { MarketplaceCategoryPage } from "./pages/MarketplaceCategoryPage";

// Authentication and user pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import SavedAds from "./pages/SavedAds";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import Advertising from "./pages/admin/Advertising";
import NewCampaign from "./pages/admin/NewCampaign";
import EditCampaign from "./pages/admin/EditCampaign";

// Informational pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import HowItWorks from "@/pages/HowItWorks";
import FaqPage from "@/pages/FaqPage";
import SafetyTipsPage from "@/pages/SafetyTipsPage";
import BuyingGuidePage from "@/pages/BuyingGuidePage";
import SellingGuidePage from "@/pages/SellingGuidePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsConditionsPage from "@/pages/TermsConditionsPage";
import ReportListingPage from "@/pages/ReportListingPage";

import NotFound from "./pages/NotFound";

// Create one QueryClient for the whole application.
const queryClient = new QueryClient();

/**
 * Scroll to the top when the route changes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

/**
 * Controls where the global authentication popup appears.
 *
 * Public seller storefronts should be viewable without signing in.
 * The popup is therefore not mounted on /store/:sellerId.
 *
 * If your AuthPopup is controlled by other components or has its
 * own independent triggers, those triggers should also respect
 * this public-route rule.
 */
const RouteAwareAuthPopup = () => {
  const { pathname } = useLocation();

  const isPublicStorefront = /^\/store\/[^/]+\/?$/.test(pathname);

  if (isPublicStorefront) {
    return null;
  }

  return <AuthPopup />;
};

/**
 * Main application routes.
 */
const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />

      <AuthProvider>
        <RouteAwareAuthPopup />

        <Layout>
          <Routes>
            {/* =========================================
                CORE APPLICATION
            ========================================= */}
            <Route path="/" element={<Index />} />

            <Route
              path="/marketplace"
              element={<Marketplace />}
            />

            <Route
              path="/ad/:id"
              element={<AdDetails />}
            />

            <Route
              path="/post-ad"
              element={<PostAd />}
            />

            {/* =========================================
                CATEGORIES
            ========================================= */}
            <Route
              path="/categories"
              element={<Categories />}
            />

            <Route
              path="/categories/:categoryId"
              element={<MarketplaceCategoryPage />}
            />

            {/* =========================================
                AUTHENTICATION
            ========================================= */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />

            {/* =========================================
                USER PROFILE AND SELLER STOREFRONT
            ========================================= */}

            {/* Private profile settings */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Public seller storefront.
                Visitors do not need to sign in to view it. */}
            <Route
              path="/store/:sellerId"
              element={<Profile />}
            />

            <Route
              path="/messages"
              element={<Messages />}
            />

            <Route
              path="/saved"
              element={<SavedAds />}
            />

            {/* =========================================
                ADMIN WORKSPACE
            ========================================= */}
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/advertising"
              element={<Advertising />}
            />

            <Route
              path="/admin/advertising/new"
              element={<NewCampaign />}
            />

            <Route
              path="/admin/advertising/edit/:id"
              element={<EditCampaign />}
            />

            {/* =========================================
                INFORMATION AND FOOTER PAGES
            ========================================= */}
            <Route
              path="/about"
              element={<About />}
            />

            <Route
              path="/contact"
              element={<Contact />}
            />

            <Route
              path="/how-it-works"
              element={<HowItWorks />}
            />

            <Route
              path="/faq"
              element={<FaqPage />}
            />

            <Route
              path="/safety-tips"
              element={<SafetyTipsPage />}
            />

            <Route
              path="/buying-guide"
              element={<BuyingGuidePage />}
            />

            <Route
              path="/selling-guide"
              element={<SellingGuidePage />}
            />

            <Route
              path="/privacy-policy"
              element={<PrivacyPolicyPage />}
            />

            <Route
              path="/terms-and-conditions"
              element={<TermsConditionsPage />}
            />

            <Route
              path="/report-listing"
              element={<ReportListingPage />}
            />

            {/* =========================================
                MARKETPLACE FILTER SHORTCUTS
            ========================================= */}
            <Route
              path="/featured"
              element={<Marketplace />}
            />

            <Route
              path="/latest"
              element={<Marketplace />}
            />

            {/* =========================================
                404 CATCH-ALL
            ========================================= */}
            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </>
  );
};

/**
 * Root application.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
