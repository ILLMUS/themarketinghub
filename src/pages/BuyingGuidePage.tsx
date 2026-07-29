// src/pages/BuyingGuidePage.tsx
import SEO from "@/components/seo/SEO";

export default function BuyingGuidePage() {
  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <h1 className="text-3xl font-bold">Buying Guide</h1>
      <p className="text-muted-foreground">Find the best deals safely and efficiently on The Market Hub.</p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground">
        <li><strong>Compare Offers:</strong> Check multiple listings in categories to gauge fair market pricing.</li>
        <li><strong>Communicate Clearly:</strong> Use our in-app chat to clarify specifications, condition, and availability.</li>
        <li><strong>Test Electronics:</strong> Ensure devices, phones, and appliances function fully before handing over payment.</li>
      </ul>
    </div>
  );
}