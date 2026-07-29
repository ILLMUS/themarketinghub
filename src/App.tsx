import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { AuthPopup } from "@/components/AuthPopup";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import AdDetails from "./pages/AdDetails";
import PostAd from "./pages/PostAd";
import Categories from "./pages/Categories";
import { MarketplaceCategoryPage } from "./pages/MarketplaceCategoryPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import SavedAds from "./pages/SavedAds";
import NotFound from "./pages/NotFound";

// Footer & Resource Pages
import HowItWorks from "@/pages/HowItWorks";
import FaqPage from "@/pages/FaqPage";
import SafetyTipsPage from "@/pages/SafetyTipsPage";
import BuyingGuidePage from "@/pages/BuyingGuidePage";
import SellingGuidePage from "@/pages/SellingGuidePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsConditionsPage from "@/pages/TermsConditionsPage";
import ReportListingPage from "@/pages/ReportListingPage";

// Advertising Routes (Enabled)
import Advertising from "./pages/admin/Advertising";
import NewCampaign from "./pages/admin/NewCampaign";
import EditCampaign from "./pages/admin/EditCampaign";

// ScrollToTop Helper Component with smooth scrolling
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Creates a smooth, elegant glide back to the top
    });
  }, [pathname]);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          {/* Global OLX-style timed Google Auth Popup */}
          <AuthPopup />
          
          <Layout>
            <Routes>
              {/* Core Application Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/ad/:id" element={<AdDetails />} />
              <Route path="/post-ad" element={<PostAd />} />
              
              {/* Category Routing */}
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoryId" element={<MarketplaceCategoryPage />} />
              
              {/* Authentication & User Workspace */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/saved" element={<SavedAds />} />

              {/* Admin Workspace */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/advertising" element={<Advertising />} />
              <Route path="/admin/advertising/new" element={<NewCampaign />} />
              <Route path="/admin/advertising/edit/:id" element={<EditCampaign />} />
              
              {/* Informational & Footer Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/safety-tips" element={<SafetyTipsPage />} />
              <Route path="/buying-guide" element={<BuyingGuidePage />} />
              <Route path="/selling-guide" element={<SellingGuidePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
              <Route path="/report-listing" element={<ReportListingPage />} />
              
              {/* Quick Filter Links */}
              <Route path="/featured" element={<Marketplace />} />
              <Route path="/latest" element={<Marketplace />} />
              
              {/* 404 Catch-All Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;