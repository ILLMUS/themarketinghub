import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Section } from "./Section";

const faqs = [
  {
    q: "How do I post an advertisement?",
    a: "Create an account, click Post Ad, fill in your listing details, upload photos and submit your advertisement for approval.",
  },
  {
    q: "Are advertisements reviewed?",
    a: "Yes. Every listing is reviewed before it becomes visible to ensure quality, safety and compliance with our marketplace rules.",
  },
  {
    q: "How do buyers contact sellers?",
    a: "Buyers can contact sellers through WhatsApp, phone call or direct messaging depending on the seller's preferred contact method.",
  },
  {
    q: "Is posting free?",
    a: "Basic advertisements are free. Premium advertising options are available for businesses that want additional exposure.",
  },
  {
    q: "How long do listings stay active?",
    a: "Listings remain active until they expire or are marked as sold by the seller.",
  },
];

export function FAQ() {
  return (
    <Section
      title="Frequently Asked Questions"
      subtitle="Everything you need to know."
    >
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible>

          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger>
                {faq.q}
              </AccordionTrigger>

              <AccordionContent>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}

        </Accordion>
      </div>
    </Section>
  );
}