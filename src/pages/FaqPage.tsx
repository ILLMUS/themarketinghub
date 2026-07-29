// src/pages/FaqPage.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FaqPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-8">Got questions? We’ve got answers.</p>
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg px-4">
          <AccordionTrigger>How do I post an advertisement?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Click "Post Advertisement", select your preferred listing tier (Standard, Boosted, or Spotlight), fill in your item details, upload photos, and submit.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border rounded-lg px-4">
          <AccordionTrigger>How do I pay for my listing?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            After submitting your ad, send the required fee via Mobile Money or EFT, then forward your proof of payment via WhatsApp (76373859) or email.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className="border rounded-lg px-4">
          <AccordionTrigger>How long do listings stay active?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Standard and featured listings remain active on the marketplace for 30 days before renewal is required.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}