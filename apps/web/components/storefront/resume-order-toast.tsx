"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play } from "lucide-react";

import { STORAGE_KEY } from "@/lib/checkout-persistence";

export function ResumeOrderToast() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked) return;

    try {
      const persistedStr = localStorage.getItem(STORAGE_KEY);
      if (persistedStr) {
        const persisted = JSON.parse(persistedStr);
        // If there are items in the basket, prompt them to resume
        if (persisted && persisted.items && persisted.items.length > 0) {
          toast.message("Order in Progress", {
            description:
              "You have unsubmitted items in your cart. Want to complete it?",
            duration: 8000,
            icon: <Play size={16} className="text-[--accent]" />,
            action: {
              label: "Resume Order",
              onClick: () => router.push("/order"),
            },
          });
        }
      }
    } catch (_e) {
      // Ignore parse errors
    }

    setChecked(true);
  }, [checked, router]);

  return null;
}
