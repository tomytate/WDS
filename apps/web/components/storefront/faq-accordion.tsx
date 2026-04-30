"use client";

import { handlingHoursLabel } from "@/lib/urgency";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@wongdigital/ui";

const items = [
  {
    question: "What digital products do you sell?",
    answer: "We offer authentic premium subscriptions — like ChatGPT Plus, Canva Pro, and Spotify Premium — alongside 100+ specialized social media growth packages. It's your one-stop shop for scaling your digital presence.",
  },
  {
    question: "How fast is delivery?",
    answer: "We value your time. Most digital subscriptions and social media boosts are fully processed and delivered within 2 to 6 hours after your payment receipt is verified.",
  },
  {
    question: "How does the checkout and payment process work?",
    answer: "Add products to your cart, fill in your details, and choose how to pay. We accept QRPH (GCash, Maya, BPI, and all Philippine QR-enabled banks) for local payments, and Binance/Crypto (USDT, BNB, BTC) worldwide.",
  },
  {
    question: "How do social media boosts work?",
    answer: "It's simple: pick the platform, select your targeted package, and provide the public URL link during checkout. If your chosen service includes a 'Refill' period, you are completely protected against follower or engagement drops during that window.",
  },
  {
    question: "Do you offer Lifetime access?",
    answer: "Yes! While checking out, you can often choose between a standard 1-Year access plan or upgrade directly to Lifetime access for a flat premium fee on supported subscriptions.",
  },
  {
    question: "Are your premium accounts legitimate?",
    answer: "Absolutely. We guarantee 100% verified, authentic access. No bots or hacked accounts. We've successfully processed over a hundred thousand orders since 2024.",
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
      className="reveal container-shell py-14 sm:py-18 lg:py-24"
      id="faq"
    >
      <div className="space-y-8 sm:space-y-10">
        {/* Heading */}
        <div>
          <div className="accent-bar mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[--text-primary]">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-[--text-secondary] max-w-lg">
            Things buyers ask before their first order.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {items.map((item, index) => (
              <AccordionItem
                value={`item-${index}`}
                key={index}
                className="glass-panel rounded-xl sm:rounded-2xl px-5 sm:px-6 transition-all data-[state=open]:border-l-[3px] data-[state=open]:border-l-[--accent] data-[state=open]:shadow-[0_0_20px_var(--accent-glow)]"
              >
                <AccordionTrigger className="text-left font-display font-semibold hover:no-underline data-[state=open]:text-[--accent]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-[--text-secondary] pb-4 sm:pb-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
