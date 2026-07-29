// src/pages/PrivacyPolicyPage.tsx
import SEO from "@/components/seo/SEO";

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground">Last updated: July 29, 2026</p>
      
      <section className="space-y-3 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
        <p>We collect account details, listing information, approximate geographic coordinates, and in-app communications to deliver marketplace functionality.</p>
        
        <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
        <p>Your details are used to display approved ads, facilitate secure chat between buyers and sellers, and prevent fraud.</p>
        
        <h2 className="text-xl font-semibold text-foreground">3. Contact</h2>
        <p>For privacy inquiries, contact us via email at themarkethub51@gmail.com or WhatsApp 76373859.</p>
      </section>
    </div>
  );
}