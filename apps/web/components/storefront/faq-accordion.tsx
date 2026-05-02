"use client";

import { handlingHoursLabel } from "@/lib/urgency";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  SectionHeading,
} from "@wongdigital/ui";

const items = [
  {
    question: "What digital products do you sell?",
    answer:
      "We offer authentic premium subscriptions — like ChatGPT Plus, Canva Pro, and Spotify Premium — alongside 100+ specialized social media growth packages. It's your one-stop shop for scaling your digital presence.",
  },
  {
    question: "How fast is delivery?",
    answer:
      "We value your time. Most digital subscriptions and social media boosts are fully processed and delivered within 2 to 6 hours after your payment receipt is verified.",
  },
  {
    question: "How does the checkout and payment process work?",
    answer:
      "Add products to your cart, fill in your details, and choose how to pay. We accept QRPH (GCash, Maya, BPI, and all Philippine QR-enabled banks) for local payments, and Binance / Crypto (USDT, BNB, BTC) worldwide.",
  },
  {
    question: "How do social media boosts work?",
    answer:
      "It's simple: pick the platform, select your targeted package, and provide the public URL link during checkout. If your chosen service includes a 'Refill' period, you are completely protected against follower or engagement drops during that window.",
  },
  {
    question: "Do you offer Lifetime access?",
    answer:
      "Yes. While checking out, you can often choose between a standard 1-Year access plan or upgrade directly to Lifetime access for a flat premium fee on supported subscriptions.",
  },
  {
    question: "Are your premium accounts legitimate?",
    answer:
      "Absolutely. We guarantee 100% verified, authentic access. No bots or hacked accounts. We've successfully processed over a hundred thousand orders since 2024.",
  },
  {
    question: "What if I need help or experience an issue?",
    answer: `Just tap the floating Support Chat icon at the bottom of your screen. Our live team is ready to help you with setups, replacements, or general questions. Orders and support tickets are processed daily during ${handlingHoursLabel}.`,
  },
];

export function FAQAccordion() {
  const sectionRef = useIntersectionReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="reveal container-shell py-16 sm:py-20 lg:py-28 border-t border-[--border]"
      id="faq"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading
            eyebrow="FAQ"
            title="Things buyers ask before their first order."
            description="Can't find your question? Open the chat — we'll respond within minutes during business hours."
          />
        </div>

        <div className="lg:col-span-8">
          <Accordion type="single" collapsible className="w-full divide-y divide-[--border] border-y border-[--border]">
            {items.map((item, index) => (
              <AccordionItem
                value={`item-${index}`}
                key={index}
                className="group"
              >
                <AccordionTrigger className="py-5 text-left font-display text-base sm:text-lg font-medium tracking-tight text-[--text-primary] hover:no-underline data-[state=open]:text-[--text-primary]">
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-[--text-muted]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-[--text-secondary]">
                  <p className="pl-8 max-w-2xl">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
