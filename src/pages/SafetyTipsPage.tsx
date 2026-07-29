// src/pages/SafetyTipsPage.tsx
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import SEO from "@/components/seo/SEO";

export default function SafetyTipsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-4">Safety Tips</h1>
      <p className="text-muted-foreground mb-8">Your safety is our top priority. Follow these guidelines to trade securely.</p>
      <div className="space-y-4">
        <div className="flex gap-4 border rounded-xl p-5 bg-card">
          <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Meet in Public Places</h3>
            <p className="text-sm text-muted-foreground">Always meet buyers or sellers in well-lit, busy public areas such as shopping malls or near police stations.</p>
          </div>
        </div>
        <div className="flex gap-4 border rounded-xl p-5 bg-card">
          <ShieldAlert className="h-6 w-6 text-destructive shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Inspect Before You Pay</h3>
            <p className="text-sm text-muted-foreground">Never send advance money or deposits before physically inspecting and verifying the item.</p>
          </div>
        </div>
      </div>
    </div>
  );
}