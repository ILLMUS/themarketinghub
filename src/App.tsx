import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import AdDetails from "./pages/AdDetails";
import PostAd from "./pages/PostAd";
import HowItWorks from "@/pages/HowItWorks";
import Categories from "./pages/Categories";
import { MarketplaceCategoryPage } from "./pages/MarketplaceCategoryPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPasswordPage from "./pages/ResetPasswordPage"; // Import ResetPasswordPage
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import SavedAds from "./pages/SavedAds";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Core Application Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/ad/:id" element={<AdDetails />} />
              <Route path="/post-ad" element={<PostAd />} />
              
              {/* CATEGORY ROUTING 
                /categories handles the broad overview dashboard.
                /categories/:categoryId dynamically handles matching profiles (vehicles, pets, services, etc.)
              */}
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoryId" element={<MarketplaceCategoryPage />} />
              
              {/* Authentication & User Workspace */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/saved" element={<SavedAds />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Informational Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-it-works" element={<HowItWorks />} />

              {/* Coming Soon Templates */}
              <Route path="/buying-guide" element={<ComingSoon />} />
              <Route path="/selling-guide" element={<ComingSoon />} />
              <Route path="/privacy-policy" element={<ComingSoon />} />
              <Route path="/terms-and-conditions" element={<ComingSoon />} />
              <Route path="/report-listing" element={<ComingSoon />} />
              <Route path="/featured" element={<ComingSoon />} />
              <Route path="/latest" element={<ComingSoon />} />
              <Route path="/faq" element={<ComingSoon />} />
              
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