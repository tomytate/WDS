export type LegalSection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

export type LegalDocument = {
  slug: string
  title: string
  shortTitle: string
  summary: string
  effectiveDate: string
  notice?: string
  intro?: string[]
  sections: LegalSection[]
  closing?: string[]
}

export const legalDocuments: LegalDocument[] = [
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    shortTitle: "Terms",
    summary:
      "The rules that govern ordering, payment, delivery, support, and use of Wong Digital Shop.",
    effectiveDate: "March 27, 2026",
    notice:
      "MAHALAGA: Sa pag-order, pagbabayad, o paggamit ng anumang serbisyo sa Wong Digital Shop, kinikilala mong nabasa mo ang mga tuntuning ito at sumasang-ayon kang masaklaw ng mga ito. Ang pagbabayad ay nagsisilbing electronic acceptance mo sa order at sa mga patakarang nakasaad dito.",
    intro: [
      "These Terms of Service apply to all visitors, buyers, and users of Wong Digital Shop. They govern your access to the website, your purchase of digital products or social media services, and your use of any support provided through the store.",
      "If you do not agree with these terms, do not place an order or continue using the website.",
    ],
    sections: [
      {
        title: "Acceptance and Eligibility",
        bullets: [
          "By using the website or paying for an order, you agree to these terms, the Refund Policy, the Privacy Policy, and the Disclaimer.",
          "You confirm that the information you submit for your order is accurate, current, and complete.",
          "The service is intended for buyers who are at least 18 years old or who are using the service with valid parental or legal guardian consent.",
        ],
      },
      {
        title: "Product Listings and Access Options",
        paragraphs: [
          "All items sold on the storefront are digital products or digital services only. No physical goods are shipped.",
          "Listings are presented with a base 1-year price. During checkout, buyers may choose either 1 Year access or a Lifetime upgrade that adds a premium upgrade fee per selected product.",
          "When a product is described as lifetime access, it refers to the intended duration of the lifetime option shown at the time of purchase. Features, platform rules, and access conditions may still change because of actions taken by the original platform or service provider.",
        ],
      },
      {
        title: "Orders, Payment, and Delivery",
        bullets: [
          "Orders are submitted through the Wong Digital Shop checkout flow. Payments are currently accepted through QRPH (GCash, Maya, bank apps) and Binance Pay.",
          "An order is reviewed after payment reference details and receipt upload are submitted through the site.",
          "Orders are handled daily from 10 AM to 9 PM, and delivery is usually completed within 24 hours after successful verification.",
          "An order code is issued after checkout and should be used for tracking, support, and complaint handling.",
        ],
      },
      {
        title: "Buyer Responsibilities",
        bullets: [
          "Use a valid email address that you control so product delivery and support messages can reach you.",
          "Review the product details, platform requirements, and instructions before ordering.",
          "Keep your account credentials, device access, and recovery channels secure after delivery.",
          "Do not misuse the delivered product, share access in an unauthorized way, or violate the original platform's rules.",
        ],
      },
      {
        title: "Third-Party Platforms and Service Changes",
        paragraphs: [
          "Wong Digital Shop is an independent reseller and is not affiliated with, endorsed by, or officially connected to the original brands or platforms unless expressly stated otherwise.",
          "Original platforms may change features, device limits, security rules, regional availability, account status, or enforcement practices at any time. These matters are outside Wong Digital Shop's direct control.",
          "Wong Digital Shop may update listings, availability, pricing, and product descriptions at any time to reflect operational, supplier, or platform changes.",
        ],
      },
      {
        title: "Refunds, Replacements, and Support",
        paragraphs: [
          "Refund handling is governed by the Wong Digital Shop Refund Policy, which is incorporated into these Terms by reference.",
          "Where an issue is reported, Wong Digital Shop may review the order, request proof, and decide whether support, replacement, partial refund, or denial applies under the Refund Policy.",
        ],
      },
      {
        title: "Disputes, Fraud Prevention, and Enforcement",
        bullets: [
          "Buyers must first contact Wong Digital Shop through the official support contact shown on the website or order confirmation before filing an external payment dispute.",
          "Wong Digital Shop may suspend, cancel, or refuse orders that appear fraudulent, abusive, duplicated, or inconsistent with the submitted payment and order details.",
          "Wong Digital Shop may keep records reasonably necessary to investigate fraud, chargebacks, abuse, or policy violations.",
        ],
      },
      {
        title: "Limitation of Liability and Entire Agreement",
        paragraphs: [
          "To the maximum extent permitted by applicable law, Wong Digital Shop will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the website or any product purchased from the store.",
          "These Terms, together with the Refund Policy, Privacy Policy, and Disclaimer, form the full agreement between you and Wong Digital Shop regarding the storefront and your orders.",
        ],
      },
    ],
    closing: [
      "By completing a purchase, you confirm that you have reviewed the product or service details, understand that third-party platform changes may affect delivery or access, and agree to follow the policies posted on the Wong Digital Shop website.",
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    shortTitle: "Refund Policy",
    summary:
      "The support, complaint, replacement, and limited refund rules that apply to Wong Digital Shop digital orders.",
    effectiveDate: "March 27, 2026",
    intro: [
      "Wong Digital Shop primarily sells digital goods that are delivered electronically. Because digital delivery can be consumed or accessed quickly, all orders are reviewed under a strict digital-goods policy.",
      "Please review this page carefully before completing your order.",
    ],
    sections: [
      {
        title: "General No-Refund Rule",
        bullets: [
          "All digital product and digital service sales are generally final after payment verification and successful delivery.",
          "Refunds are not issued for change of mind, buyer's remorse, duplicate orders placed by the buyer, or dissatisfaction with a platform's interface or features.",
          "Refunds are not issued because of buyer device limitations, unsupported regions, network issues, or failure to follow the provided instructions.",
        ],
      },
      {
        title: "Limited Dead on Arrival Exception",
        paragraphs: [
          "A partial refund of up to 50% of the purchase price may be considered only when all of the following are met at the same time: the delivered product is completely non-functional on delivery, Wong Digital Shop cannot provide a working replacement within 48 hours of a valid complaint, the complaint is filed on time, and the required proof is submitted in full.",
        ],
      },
      {
        title: "Complaint Window and Hard Deadlines",
        bullets: [
          "A valid complaint must be filed within seven (7) calendar days from the purchase date.",
          "After ten (10) calendar days from purchase, refund claims are closed and the transaction is treated as complete for refund-processing purposes.",
          "Wong Digital Shop may still review support requests after that period at its discretion, but a replacement or refund is not guaranteed.",
        ],
      },
      {
        title: "Proof Requirements",
        bullets: [
          "A complete, unedited, continuous screen recording must be provided from the moment the Wong Digital Shop delivery message is opened through the failed login or access attempt.",
          "The video must include a visible date or time marker showing that the issue was raised within the complaint window.",
          "The order code, payment reference, and purchased product must be clearly identified in the complaint.",
          "Screenshots alone are not enough when the policy requires full video proof.",
        ],
      },
      {
        title: "Non-Refundable Scenarios",
        bullets: [
          "The product was working when delivered but later became affected by third-party platform enforcement, security changes, policy updates, or service interruptions.",
          "The buyer shared credentials, modified recovery details, changed key account settings, or allowed unauthorized access.",
          "The buyer violated the original platform's rules, device restrictions, or usage policies.",
          "The buyer no longer needs the product or ordered the wrong item.",
        ],
      },
      {
        title: "Replacement Priority",
        paragraphs: [
          "Wong Digital Shop prioritizes support and replacement before considering any refund. Where appropriate, a replacement of equal or similar value may be offered instead of a refund.",
          "Each order may be limited to one courtesy replacement unless Wong Digital Shop decides otherwise based on the circumstances.",
        ],
      },
      {
        title: "Chargebacks and Dispute Handling",
        paragraphs: [
          "Before filing a chargeback or payment dispute, buyers are expected to contact Wong Digital Shop through the official support channel shown on the website or in the order confirmation.",
          "If a chargeback is filed without prior internal review, Wong Digital Shop may suspend active support, cancel undelivered orders, and respond to the payment provider using available order and communication records.",
        ],
      },
      {
        title: "How to File a Complaint",
        bullets: [
          "Contact Wong Digital Shop through the official support email listed on the website or in your order confirmation.",
          "Include your order code, payment reference, product name, and a short explanation of the issue.",
          "Attach the required unedited video proof where applicable.",
          "Allow up to 48 hours for review and resolution during the store's published handling hours.",
        ],
      },
    ],
    closing: [
      "By completing a purchase, you confirm that you have read, understood, and accepted this Refund Policy.",
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    shortTitle: "Privacy Policy",
    summary:
      "How Wong Digital Shop collects, uses, stores, and protects buyer information across the storefront and order flow.",
    effectiveDate: "March 27, 2026",
    intro: [
      "This Privacy Policy explains how Wong Digital Shop collects, uses, stores, and shares information when you browse the site, place an order, upload payment proof, or contact support.",
    ],
    sections: [
      {
        title: "Information We Collect",
        bullets: [
          "Personal information such as your name, email address, and mobile number.",
          "Transaction information such as your order code, selected products, payment reference number, receipt upload, payment amount, and order history.",
          "Technical information such as device type, browser details, IP address, access timestamps, and basic session information.",
        ],
      },
      {
        title: "How We Use Your Information",
        bullets: [
          "To process, verify, deliver, and support your digital product or digital service orders.",
          "To confirm payments and review uploaded receipts and references.",
          "To respond to customer support requests, complaints, and after-sales concerns.",
          "To improve website reliability, order handling, fraud prevention, and customer experience.",
          "To send order confirmations, tracking details, support responses, and important service updates.",
        ],
      },
      {
        title: "Sharing and Disclosure",
        paragraphs: [
          "Wong Digital Shop does not sell your personal information.",
        ],
        bullets: [
          "We may share limited information with payment providers and banks where necessary to verify or investigate a transaction.",
          "We may share limited information with hosting, analytics, storage, and technical service providers that help operate the website, subject to appropriate confidentiality and data-protection measures.",
          "We may keep and disclose records where reasonably necessary to investigate fraud, payment abuse, or legal claims, or where required by law, regulation, court order, or lawful government request.",
        ],
      },
      {
        title: "Data Retention",
        bullets: [
          "Order, payment, and support records may be retained for at least three (3) years for accounting, fraud review, and dispute handling purposes.",
          "Inactive support records and browsing-related data may be archived or removed when no longer needed for legitimate business or legal reasons.",
          "Fraud-prevention and dispute records may be retained for as long as reasonably necessary to protect the business and comply with legal obligations.",
        ],
      },
      {
        title: "Data Security",
        paragraphs: [
          "Wong Digital Shop uses reasonable administrative, technical, and organizational safeguards to help protect personal data against unauthorized access, misuse, alteration, or disclosure.",
          "However, no website, storage provider, or internet transmission method can guarantee absolute security.",
        ],
      },
      {
        title: "Your Rights",
        bullets: [
          "You may request access to the personal information Wong Digital Shop holds about you.",
          "You may request correction of inaccurate or incomplete information.",
          "You may request deletion of personal data, subject to legal, accounting, fraud-prevention, and transaction-retention obligations.",
          "You may object to certain processing activities where applicable law provides that right.",
        ],
      },
      {
        title: "Cookies and Local Storage",
        paragraphs: [
          "The website uses essential cookies, local storage, and session mechanisms to support theme preferences, checkout flow, order tracking, and core functionality. The site does not sell browsing behavior to third-party advertisers.",
        ],
      },
      {
        title: "Children's Privacy",
        paragraphs: [
          "Wong Digital Shop is not intended for children under 18, and the shop does not knowingly collect personal information from minors without proper legal basis or authorization.",
        ],
      },
      {
        title: "Changes to This Policy",
        paragraphs: [
          "Wong Digital Shop may update this Privacy Policy from time to time. The latest version posted on the website will apply from the stated effective date.",
        ],
      },
    ],
    closing: [
      "If you have a privacy-related request, use the official support contact listed on the website or in your order confirmation.",
    ],
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    shortTitle: "Disclaimer",
    summary:
      "Important notice about brand affiliation, platform risk, warranties, and liability for Wong Digital Shop digital products and services.",
    effectiveDate: "March 27, 2026",
    intro: [
      "Please read this Disclaimer carefully before purchasing any product or service from Wong Digital Shop.",
    ],
    sections: [
      {
        title: "Independent Reseller",
        paragraphs: [
      "Wong Digital Shop operates as an independent reseller of digital products, access plans, and social media services. Unless expressly stated otherwise, Wong Digital Shop is not affiliated with, endorsed by, sponsored by, or officially connected to the original brands or platforms referenced on the website.",
        ],
      },
      {
        title: "Third-Party Platform Risk",
        bullets: [
          "Products may depend on third-party platforms, suppliers, account systems, or upstream policies that are outside Wong Digital Shop's direct control.",
          "Original platforms may change features, pricing, access rules, device rules, region support, security requirements, or account status at any time.",
          "Platform enforcement actions, service interruptions, bans, or policy changes can affect product functionality after delivery.",
        ],
      },
      {
        title: "No Warranty",
        paragraphs: [
          "All products and services are provided on an 'as is' and 'as available' basis to the maximum extent permitted by law.",
        ],
        bullets: [
          "Wong Digital Shop does not guarantee uninterrupted, error-free, or permanent availability of any third-party platform or feature.",
          "Wong Digital Shop does not guarantee that every product will remain unaffected by upstream policy or platform changes.",
          "Any implied warranties, including merchantability or fitness for a particular purpose, are disclaimed to the extent permitted by applicable law.",
        ],
      },
      {
        title: "Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by applicable law, Wong Digital Shop, its owners, operators, staff, and service providers will not be liable for indirect, incidental, special, consequential, or punitive damages arising from or related to any order, product, or use of the website.",
          "If Wong Digital Shop is found liable for any claim, total liability will not exceed the amount actually paid for the specific order that gave rise to the claim.",
        ],
      },
      {
        title: "Force Majeure",
        bullets: [
          "Wong Digital Shop is not responsible for delays or failures caused by events outside its reasonable control, including third-party platform actions, internet outages, payment-system failures, government action, civil unrest, natural disasters, cyber incidents, or supplier disruption.",
        ],
      },
      {
        title: "Accuracy and Availability",
        paragraphs: [
          "Wong Digital Shop aims to keep pricing, descriptions, and availability current, but the website may occasionally contain errors, outdated details, or temporary inaccuracies.",
          "Wong Digital Shop reserves the right to correct pricing or listing errors, adjust availability, and cancel or review an order when necessary.",
        ],
      },
      {
        title: "Third-Party Services and Intellectual Property",
        bullets: [
          "Links to payment providers, messaging tools, storage tools, or third-party services are governed by those providers' own terms and policies.",
          "All trademarks, logos, and brand names referenced on the site remain the property of their respective owners.",
          "Use of third-party names or logos on the Wong Digital Shop website does not imply endorsement, sponsorship, or official affiliation.",
        ],
      },
      {
        title: "Severability and Entire Agreement",
        paragraphs: [
          "If any part of this Disclaimer is held invalid or unenforceable, the rest of the Disclaimer will continue in effect.",
          "This Disclaimer, together with the Terms of Service, Refund Policy, and Privacy Policy, forms part of the complete agreement between you and Wong Digital Shop regarding the website and your orders.",
        ],
      },
    ],
  },
]

export function getLegalDocumentBySlug(slug: string) {
  return legalDocuments.find((document) => document.slug === slug) ?? null
}
