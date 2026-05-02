"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  QrCode,
  ShoppingBag,
  User,
} from "lucide-react";

import type { AccessPlan, Bundle, Product, StoreSettings } from "@wongdigital/db";
import {
  getProductSelectionMode,
  getServiceProductConfig,
  getServiceTargetConfig,
  serviceReactionOptions,
  getProductDurationConfigs,
  getServiceProductPrice,
  getAccessPlanPrice,
} from "@wongdigital/db/pricing";
import {
  Card,
  CardContent,
  buttonStyles,
} from "@wongdigital/ui";

import { validatePromoCodeAction } from "@/app/(storefront)/order/promo-actions";
import { createOrder } from "@/app/(storefront)/order/actions";
import { isVisibleCatalogProduct } from "@/lib/catalog";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import { CartSummary, type SelectedCartItem } from "./cart-summary";
import { createDefaultOrderItem } from "./product-selection";
import {
  baseOrderSchema,
  orderSchema,
  type OrderFormValues,
  type OrderSelectionValue,
} from "@/lib/schemas";
import {
  useCheckoutPersistence,
  clearPersistedCheckout,
} from "@/lib/checkout-persistence";
import { getUpsellSuggestions } from "@/lib/upsell-rules";
import type { StoreRuntimeFlags } from "@/lib/vercel/edge-config";
import { UpsellCard } from "./upsell-card";
import dynamic from "next/dynamic";

// Lazy load the multi-step components bridging large UI payloads out of the initial Document object
const ProductSelectionStepLoader = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-[90px] w-full rounded-[--radius-card] bg-[--bg-surface] border border-[--border]" />
    <div className="h-[280px] w-full rounded-[--radius-card] bg-[--bg-surface] border border-[--border]" />
  </div>
);

const ProductSelectionStep = dynamic(
  () => import("./product-selection").then((mod) => mod.ProductSelectionStep),
  { loading: ProductSelectionStepLoader, ssr: false },
);

const CustomerDetailsStepLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-[200px] w-full rounded-[--radius-card] bg-[--bg-surface] border border-[--border]" />
    <div className="h-[300px] w-full rounded-[--radius-card] bg-[--bg-surface] border border-[--border]" />
  </div>
);

const CustomerDetailsStep = dynamic(
  () =>
    import("./customer-details-step").then((mod) => mod.CustomerDetailsStep),
  { loading: CustomerDetailsStepLoader, ssr: false },
);

const PaymentStepLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-[120px] w-full rounded-[--radius-card] bg-[--bg-surface] border border-[--border]" />
    <div className="h-[300px] w-full rounded-[--radius-card] bg-[--bg-surface] border border-[--border]" />
  </div>
);

const PaymentStep = dynamic(
  () => import("./payment-step").then((mod) => mod.PaymentStep),
  { loading: PaymentStepLoader, ssr: false },
);

const ReviewStepLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-[300px] w-full rounded-[--radius-card] bg-[--bg-surface] border border-[--border]" />
    <div className="h-[180px] w-full rounded-[--radius-card] bg-[--bg-surface] border border-[--border]" />
  </div>
);

const ReviewStep = dynamic(
  () => import("./review-step").then((mod) => mod.ReviewStep),
  { loading: ReviewStepLoader, ssr: false },
);

type OrderFormProps = {
  products: Product[];
  bundles?: Bundle[];
  selectedProductId?: string;
  storeSettings: StoreSettings;
  storeFlags: StoreRuntimeFlags;
  countryCode?: string;
  authenticatedCustomer?: {
    name: string;
    email: string;
    phone: string | null;
    walletBalance?: string | null;
  } | null;
};

const checkoutSteps = [
  {
    id: "product" as const,
    label: "Product",
    icon: <ShoppingBag size={20} strokeWidth={1.8} />,
  },
  {
    id: "details" as const,
    label: "Details",
    icon: <User size={20} strokeWidth={1.8} />,
  },
  {
    id: "payment" as const,
    label: "Payment",
    icon: <QrCode size={20} strokeWidth={1.8} />,
  },
  {
    id: "review" as const,
    label: "Review",
    icon: <ClipboardCheck size={20} strokeWidth={1.8} />,
  },
] as const;

const productStepSchema = baseOrderSchema.pick({
  items: true,
});

const detailsStepSchema = baseOrderSchema.pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  tipAmount: true,
  serviceDetails: true,
});

const paymentStepSchema = baseOrderSchema.pick({
  paymentMethod: true,
  paymentReference: true,
});

function buildSelectedCartItem(
  product: Product,
  item: OrderSelectionValue,
): SelectedCartItem {
  const selectionMode = getProductSelectionMode(product);

  if (selectionMode === "service") {
    const config = getServiceProductConfig(product);
    const defaultQuantity = config?.quantities[0] ?? 100;
    const quantity =
      item.quantity &&
      config?.quantities.some((value) => value === item.quantity)
        ? item.quantity
        : defaultQuantity;
    const serviceOption = config?.requiresReaction
      ? item.serviceOption?.trim().toLowerCase() ||
        serviceReactionOptions[0]?.value ||
        "like"
      : null;

    return {
      product,
      productId: product.id,
      selectionMode,
      accessPlan: "one_year",
      quantity,
      serviceOption,
      unitPrice: getServiceProductPrice(product, quantity),
    };
  }

  if (selectionMode === "package") {
    return {
      product,
      productId: product.id,
      selectionMode,
      accessPlan: "one_year",
      quantity: item.quantity ?? 1,
      serviceOption: item.serviceOption ?? null,
      unitPrice: product.price ?? "0",
    };
  }

  const durationConfigs = getProductDurationConfigs(product.slug);
  const defaultDigitalPlan: AccessPlan =
    durationConfigs[0]?.plan ?? "one_year";
  const userSelectedPlan = item.accessPlan ?? defaultDigitalPlan;

  return {
    product,
    productId: product.id,
    selectionMode,
    accessPlan: userSelectedPlan,
    quantity: 1,
    serviceOption: null,
    unitPrice: getAccessPlanPrice(product, product.price ?? "0", userSelectedPlan as AccessPlan),
  };
}

export function OrderForm({
  products,
  bundles = [],
  selectedProductId,
  storeSettings,
  storeFlags,
  countryCode = "PH",
  authenticatedCustomer,
}: OrderFormProps) {
  const { formatPrimaryPrice, formatSecondaryPrice, calculateDisplayTotals, showSecondary, rates, currency, isPhp } = useGeoPricing();
  const ratePerUsdt = rates[currency.code] ?? 1;
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const router = useRouter();
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [clearPending, setClearPending] = useState(false);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: string;
    maxDiscountAmount: string | null;
    minOrderAmount: string | null;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, startPromoTransition] = useTransition();

  const preselectedProduct = selectedProductId
    ? (products.find((product) => product.id === selectedProductId) ?? null)
    : null;
  const canBrowseBoosting = storeFlags.boostingEnabled;
  const canPlaceOrders = storeFlags.acceptOrders && !storeFlags.maintenanceMode;


  const defaultPaymentMethod = "binance";

  const form = useForm<OrderFormValues>({
    defaultValues: {
      items:
        preselectedProduct &&
        (canBrowseBoosting ||
          getProductSelectionMode(preselectedProduct) !== "service")
          ? [createDefaultOrderItem(preselectedProduct)]
          : [],
      customerName: authenticatedCustomer?.name ?? "",
      customerEmail: authenticatedCustomer?.email ?? "",
      customerPhone: authenticatedCustomer?.phone ?? "",
      tipAmount: "0",
      serviceDetails: "",
      paymentMethod: defaultPaymentMethod,
      paymentReference: "",
      promoCode: "",
    },
  });

  useCheckoutPersistence(form, step, setStep);

  const selectedOrderItems = form.watch("items");
  const tipAmountValue = form.watch("tipAmount");
  const storefrontProducts = products.filter(isVisibleCatalogProduct);
  const productById = new Map(
    storefrontProducts.map((product) => [product.id, product]),
  );
  const selectedCartItems = selectedOrderItems
    .map((item) => {
      const product = productById.get(item.productId);

      if (!product) {
        return null;
      }

      return buildSelectedCartItem(product, item);
    })
    .filter((item): item is SelectedCartItem => item !== null);
  const selectedProductCount = selectedCartItems.length;
  const selectedProductSlugs = selectedCartItems.map(
    (item) => item.product.slug,
  );
  const upsellSuggestionSlugs = getUpsellSuggestions(selectedProductSlugs);
  const upsellProducts = upsellSuggestionSlugs
    .map((slug) => storefrontProducts.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined)
    .slice(0, 4); // Show max 4 suggestions

  const hasServiceItems = selectedCartItems.some(
    (item) =>
      item.selectionMode === "service" ||
      item.selectionMode === "package" ||
      item.selectionMode === "addon",
  );
  const selectedServiceItems = selectedOrderItems.flatMap((item, index) => {
    const product = productById.get(item.productId);

    if (
      !product ||
      !["service", "package", "addon"].includes(
        getProductSelectionMode(product),
      )
    ) {
      return [];
    }

    return [{ index, item, product }];
  });

  const subtotalPrice = selectedCartItems
    .reduce((sum, item) => sum + Number(item.unitPrice), 0)
    .toFixed(2);

  let discountAmount = 0;
  if (appliedPromo && selectedCartItems.length > 0) {
    const minOrder = Number(appliedPromo.minOrderAmount || "0");
    if (minOrder > 0 && Number(subtotalPrice) < minOrder) {
      discountAmount = 0;
    } else {
      if (appliedPromo.discountType === "percentage") {
        discountAmount =
          (Number(subtotalPrice) * Number(appliedPromo.discountValue)) / 100;
      } else {
        discountAmount = Number(appliedPromo.discountValue);
      }
      if (
        appliedPromo.maxDiscountAmount &&
        Number(appliedPromo.maxDiscountAmount) > 0
      ) {
        discountAmount = Math.min(
          discountAmount,
          Number(appliedPromo.maxDiscountAmount),
        );
      }
      discountAmount = Math.min(discountAmount, Number(subtotalPrice));
    }
  }

  const tipAmountNumber = Number.parseFloat(tipAmountValue || "0");
  const localTipAmount =
    Number.isFinite(tipAmountNumber) && tipAmountNumber >= 0
      ? tipAmountNumber
      : 0;

  // Crucial Fix: Convert the tip from local currency back to USDT so it matches 
  // the subtotal pricing model the database expects.
  const safeTipAmountUsdt = isPhp ? localTipAmount / ratePerUsdt : localTipAmount;

  const appliedBundleId = form.watch("bundleId");
  const appliedBundle = bundles.find((b) => b.id === appliedBundleId);

  if (appliedBundle) {
    const bundlePrice = Number(appliedBundle.bundlePrice);
    const rawSubtotal = Number(subtotalPrice);
    if (rawSubtotal > bundlePrice) {
      discountAmount += rawSubtotal - bundlePrice;
    }
  }

  const rawTotal = Number(subtotalPrice) + safeTipAmountUsdt;
  const MathMax = Math.max; // bypass autoformatter conflicts
  const totalPrice = MathMax(0, rawTotal - discountAmount).toFixed(2);

  const { formattedTotal } = calculateDisplayTotals(
    selectedCartItems,
    safeTipAmountUsdt,
    discountAmount || 0
  );

  function handleApplyPromo(code: string) {
    if (!code) {
      handleRemovePromo();
      return;
    }

    startPromoTransition(async () => {
      setPromoError(null);
      const result = await validatePromoCodeAction(code, Number(subtotalPrice));
      if (result.success && result.data) {
        setAppliedPromo(result.data);
        form.setValue("promoCode", result.data.code);
      } else {
        setAppliedPromo(null);
        form.setValue("promoCode", "");
        setPromoError(result.error || "Invalid promo code");
      }
    });
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoError(null);
    form.setValue("promoCode", "");
  }

  function addUpsellProduct(product: Product) {
    const currentItems = form.getValues("items");
    const hasProduct = currentItems.some(
      (item) => item.productId === product.id,
    );
    if (hasProduct) return;

    const nextItems = [...currentItems, createDefaultOrderItem(product)];
    setItems(nextItems);
  }

  function setItems(nextItems: OrderSelectionValue[]) {
    if (nextItems.length === 0) {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }

      setClearPending(false);
    }

    form.setValue("items", nextItems, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.clearErrors("items");
  }

  function setTipAmount(nextValue: string) {
    form.setValue("tipAmount", nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.clearErrors("tipAmount");
  }

  function clearSelectedProducts() {
    if (!clearPending) {
      setClearPending(true);

      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }

      clearTimerRef.current = setTimeout(() => {
        setClearPending(false);
        clearTimerRef.current = null;
      }, 3000);

      return;
    }

    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    setClearPending(false);
    setItems([]);
  }

  function setItemsError(message: string) {
    form.setError("items", {
      message,
    });
  }

  function validateProductSelections(items: OrderSelectionValue[]) {
    if (items.length === 0) {
      setItemsError("Select at least one product");
      return false;
    }

    for (const item of items) {
      const product = productById.get(item.productId);

      if (!product) {
        setItemsError("Select a valid product");
        return false;
      }

      if (getProductSelectionMode(product) === "service") {
        const config = getServiceProductConfig(product);
        const quantity = Number(item.quantity ?? 0);

        if (!config || !config.quantities.some((value) => value === quantity)) {
          setItemsError(`Choose a valid quantity for ${product.name}`);
          return false;
        }

        if (
          config.requiresReaction &&
          !serviceReactionOptions.some(
            (option) => option.value === item.serviceOption,
          )
        ) {
          setItemsError(`Choose the reaction type for ${product.name}`);
          return false;
        }

        continue;
      }

      const durationConfigs = getProductDurationConfigs(product.slug);
      const validPlans = durationConfigs.length > 0 
        ? durationConfigs.map(c => c.plan) 
        : ["one_year", "lifetime"]; // Support default packages

      if (!item.accessPlan || !validPlans.includes(item.accessPlan as string)) {
        setItemsError(`Choose a valid access plan for ${product.name}`);
        return false;
      }
    }

    return true;
  }

  function validateServiceTargets() {
    for (const serviceItem of selectedServiceItems) {
      const targetUrl = serviceItem.item.targetUrl?.trim() ?? "";
      const targetConfig = getServiceTargetConfig(serviceItem.product);

      if (!targetUrl) {
        form.setError(`items.${serviceItem.index}.targetUrl`, {
          message: `Add the ${targetConfig.label.toLowerCase()} for ${serviceItem.product.name}.`,
        });
        return false;
      }
      try {
        new URL(targetUrl);
      } catch {
        form.setError(`items.${serviceItem.index}.targetUrl`, {
          message: `Enter a valid ${targetConfig.label.toLowerCase()} for ${serviceItem.product.name}.`,
        });
        return false;
      }
    }
    return true;
  }

  async function handleNextStep() {
    setServerError(null);
    form.clearErrors();
    setReceiptError(null);

    const values = form.getValues();

    if (step === 0) {
      const parsed = productStepSchema.safeParse(values);

      if (!parsed.success) {
        applyIssues(parsed.error.issues);
        return;
      }

      if (!validateProductSelections(parsed.data.items)) {
        return;
      }
    }

    if (step === 1) {
      const parsed = detailsStepSchema.safeParse(values);

      if (!parsed.success) {
        applyIssues(parsed.error.issues);
        return;
      }

      if (!validateServiceTargets()) {
        return;
      }
    }

    if (step === 2) {
      const parsed = paymentStepSchema.safeParse(values);

      if (!parsed.success) {
        applyIssues(parsed.error.issues);
        return;
      }

      if (!receiptFile) {
        setReceiptError("Upload the online receipt before moving to review.");
        return;
      }
    }

    setStep((currentStep) =>
      Math.min(currentStep + 1, checkoutSteps.length - 1),
    );
  }

  function applyIssues(
    issues: Array<{
      message: string;
      path: PropertyKey[];
    }>,
  ) {
    const firstIssue = issues[0];
    const field = firstIssue?.path[0];

    if (firstIssue && typeof field === "string") {
      form.setError(field as keyof OrderFormValues, {
        message: firstIssue.message,
      });
      return;
    }

    setServerError(
      firstIssue?.message ?? "Please review the form and try again.",
    );
  }
  const cartSummaryRef = useRef<HTMLDivElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Scroll to form top whenever step changes
  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Scroll to first error after validation failure
  useEffect(() => {
    const errorKeys = Object.keys(form.formState.errors);
    if (errorKeys.length > 0 || serverError || receiptError) {
      const errorEl = document.querySelector(
        '[data-field-error], [role="alert"]',
      );
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [form.formState.errors, serverError, receiptError]);

  return (
    <div className="relative scroll-mt-24" ref={formTopRef}>
      <div className="sticky top-2 sm:top-[72px] z-30 mb-4 sm:mb-6 lg:mb-8">
        <div className="rounded-[--radius-card] border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_92%,transparent)] backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-3.5">
          {/* Top row: Step label + Total */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                Step {String(step + 1).padStart(2, "0")} / {String(checkoutSteps.length).padStart(2, "0")}
              </span>
              <p className="font-display text-sm font-semibold tracking-tight text-[--text-primary]">
                {checkoutSteps[step]?.label}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                Total
              </p>
              <span className="font-display text-base font-semibold tabular-nums text-[--text-primary]">
                {formattedTotal}
              </span>
              {showSecondary && (
                <p className="font-mono text-[10px] text-[--text-muted]">
                  ≈ {formatSecondaryPrice(totalPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Segmented progress bar */}
          <div className="flex items-center gap-1">
            {checkoutSteps.map((checkoutStep, index) => {
              const complete = index < step;
              const active = index === step;
              return (
                <button
                  key={checkoutStep.id}
                  type="button"
                  disabled={index > step}
                  onClick={() => {
                    if (index <= step) setStep(index);
                  }}
                  className="group relative h-1 flex-1 overflow-hidden bg-[--border] transition-all cursor-pointer disabled:cursor-default"
                  aria-label={`${checkoutStep.label}${complete ? " (completed)" : active ? " (current)" : ""}`}
                >
                  {complete && (
                    <div className="absolute inset-0 bg-[--text-primary]" />
                  )}
                  {active && (
                    <div className="absolute inset-0 bg-[--accent] animate-[subtle-pulse_2s_ease-in-out_infinite]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Step labels — desktop only */}
          <div className="hidden sm:flex mt-2">
            {checkoutSteps.map((checkoutStep, index) => (
              <span
                key={checkoutStep.id}
                className={`flex-1 text-center font-mono text-[9px] uppercase tracking-[0.08em] transition-colors ${
                  index < step
                    ? "text-[--text-primary]"
                    : index === step
                      ? "text-[--accent-strong] font-semibold"
                      : "text-[--text-muted]"
                }`}
              >
                {index < step ? "✓ " : ""}
                {checkoutStep.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="space-y-5 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Minimal step header */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="font-display text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-[--text-primary]">
                {step === 0 && "Choose products"}
                {step === 1 && "Your details"}
                {step === 2 && "Payment"}
                {step === 3 && "Review & confirm"}
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-[--text-secondary]">
                {step === 0 &&
                  "Mix subscriptions and growth packages in one order."}
                {step === 1 && "Just your name and email — phone is optional."}
                {step === 2 &&
                  "Pay securely with QRPH or Binance Pay."}
                {step === 3 &&
                  "Review everything before we process your order."}
              </p>
            </div>
            {step === 0 && selectedProductCount > 0 ? (
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-3 py-1.5 text-xs font-semibold text-[--accent] border border-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
              >
                {selectedProductCount} item
                {selectedProductCount === 1 ? "" : "s"}
              </motion.span>
            ) : null}
          </motion.div>

          <FormProvider {...form}>
            <form
              id="order-form-element"
              className="space-y-6 min-h-[500px] pb-[88px] sm:pb-0"
              onSubmit={form.handleSubmit((values) => {
                setServerError(null);
                form.clearErrors();
                setReceiptError(null);

                startTransition(async () => {
                  if (!canPlaceOrders) {
                    setServerError(
                      storeFlags.maintenanceMessage ??
                        "New orders are temporarily paused. Please try again a little later.",
                    );
                    return;
                  }

                  const parsed = orderSchema.safeParse(values);

                  if (!parsed.success) {
                    applyIssues(parsed.error.issues);
                    return;
                  }

                  if (!validateProductSelections(parsed.data.items)) {
                    setStep(0);
                    return;
                  }

                  if (!validateServiceTargets()) {
                    setStep(1);
                    return;
                  }

                  const isWallet = parsed.data.paymentMethod === "wallet";

                  if (!isWallet && !receiptFile) {
                    setReceiptError(
                      "Upload the online receipt before submitting your order.",
                    );
                    setStep(2);
                    return;
                  }

                  const formData = new FormData();
                  formData.append("items", JSON.stringify(parsed.data.items));
                  formData.append("customerName", parsed.data.customerName);
                  formData.append("customerEmail", parsed.data.customerEmail);
                  formData.append(
                    "customerPhone",
                    parsed.data.customerPhone ?? "",
                  );
                  formData.append("tipAmount", safeTipAmountUsdt.toFixed(2));
                  formData.append(
                    "serviceDetails",
                    parsed.data.serviceDetails ?? "",
                  );
                  formData.append("paymentMethod", parsed.data.paymentMethod);
                  if (parsed.data.paymentReference) {
                    formData.append(
                      "paymentReference",
                      parsed.data.paymentReference,
                    );
                  }
                  if (parsed.data.promoCode)
                    formData.append("promoCode", parsed.data.promoCode);
                  if (parsed.data.bundleId)
                    formData.append("bundleId", parsed.data.bundleId);
                  if (receiptFile) {
                    formData.append("receiptFile", receiptFile);
                  }

                  const result = await createOrder(formData);

                  if (!result.success) {
                    setServerError(result.error);
                    return;
                  }

                  clearPersistedCheckout();

                  router.push(`/order/success/${result.data.orderCode}?token=${result.data.token}`);
                });
              })}
            >
              {!canPlaceOrders || !canBrowseBoosting ? (
                <div className="space-y-3 rounded-[--radius-inner] border border-[--text-primary] bg-[--accent] px-4 py-3 text-sm font-medium text-[--accent-fg]">
                  {!canPlaceOrders ? (
                    <p>
                      {storeFlags.maintenanceMessage ??
                        "Checkout is temporarily paused while we make store updates."}
                    </p>
                  ) : null}
                  {!canBrowseBoosting ? (
                    <p>
                      Boosting services are temporarily hidden right now. You
                      can still browse the digital product catalog.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {step === 0 ? (
                <div className="step-content-enter space-y-4" key="step-0">
                  <ProductSelectionStep
                    products={products}
                    selectedCartItems={selectedCartItems}
                    selectedProductId={selectedProductId}
                    setClearPending={setClearPending}
                    storeFlags={storeFlags}
                  />
                  {form.formState.errors.items?.message && typeof form.formState.errors.items.message === "string" ? (
                    <div className="rounded-xl border border-[--color-error] bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] p-4 text-center text-sm font-medium text-[--color-error]" role="alert">
                      {form.formState.errors.items.message}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="step-content-enter" key="step-1">
                  <CustomerDetailsStep
                    buildSelectedCartItem={buildSelectedCartItem}
                    hasServiceItems={hasServiceItems}
                    selectedServiceItems={selectedServiceItems}
                    setTipAmount={setTipAmount}
                    tipAmountValue={tipAmountValue}
                  />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="step-content-enter" key="step-2">
                  <PaymentStep
                    receiptError={receiptError}
                    receiptFile={receiptFile}
                    setReceiptError={setReceiptError}
                    setReceiptFile={setReceiptFile}
                    storeSettings={storeSettings}
                    countryCode={countryCode}
                    walletBalance={authenticatedCustomer?.walletBalance}
                    defaultPaymentMethod={defaultPaymentMethod}
                  />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="step-content-enter" key="step-3">
                  <ReviewStep
                    hasServiceItems={hasServiceItems}
                    receiptFile={receiptFile}
                    safeTipAmount={safeTipAmountUsdt}
                    selectedCartItems={selectedCartItems}
                    selectedServiceItems={selectedServiceItems}
                    storeSettings={storeSettings}
                    subtotalPrice={subtotalPrice}
                    discountAmount={discountAmount.toFixed(2)}
                    appliedPromoCode={appliedPromo?.code}
                    totalPrice={totalPrice}
                  />
                </div>
              ) : null}

              {step === 0 && upsellProducts.length > 0 ? (
                <div className="space-y-3 animate-fade-in-up-sm">
                  <h3 className="font-display tracking-tight text-xl mx-2">
                    Frequently Bought Together
                  </h3>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {upsellProducts.map((product) => (
                      <UpsellCard
                        key={product.id}
                        product={product}
                        onAdd={addUpsellProduct}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <CartSummary
                clearPending={clearPending}
                hasServiceItems={hasServiceItems}
                items={selectedCartItems}
                onClear={clearSelectedProducts}
                summaryId="order-cart-summary"
                summaryRef={cartSummaryRef}
                subtotalPrice={subtotalPrice}
                tipAmount={safeTipAmountUsdt.toFixed(2)}
                totalPrice={totalPrice}
                discountAmount={discountAmount.toFixed(2)}
                appliedPromoCode={appliedPromo?.code}
                promoError={promoError}
                isValidatingPromo={isValidatingPromo}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
              />

              {serverError ? (
                <p
                  className="rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3 text-sm font-medium text-[--color-danger-text]"
                  role="alert"
                >
                  {serverError}
                </p>
              ) : null}

              <div className="mt-5 sm:mt-8 space-y-3 sm:space-y-4">
                <p className="text-xs leading-6 text-[--text-secondary]">
                  By submitting your order, you agree to our{" "}
                  <Link
                    className="text-[--accent]"
                    href="/legal/terms-of-service"
                  >
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link className="text-[--accent]" href="/legal/refund-policy">
                    Refund Policy
                  </Link>
                  ,{" "}
                  <Link
                    className="text-[--accent]"
                    href="/legal/privacy-policy"
                  >
                    Privacy Policy
                  </Link>
                  , and{" "}
                  <Link className="text-[--accent]" href="/legal/disclaimer">
                    Disclaimer
                  </Link>
                  .
                </p>
                <p className="text-xs leading-6 text-[--text-secondary]">
                  Need help before ordering?{" "}
                  <a
                    className="text-[--accent]"
                    href={`mailto:${storeSettings.supportEmail}`}
                  >
                    Email {storeSettings.supportEmail}
                  </a>{" "}
                  or{" "}
                  <Link className="text-[--accent]" href="/track">
                    track an existing order
                  </Link>
                  .
                </p>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="safe-bottom fixed bottom-[72px] inset-x-3 sm:sticky sm:inset-x-auto sm:bottom-[24px] lg:bottom-[32px] z-30 mt-4 sm:mt-6 flex sm:w-fit sm:mx-auto items-center justify-between sm:justify-center gap-2 rounded-[--radius-card] border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_92%,transparent)] backdrop-blur-xl p-1.5 shadow-[--shadow-md]"
      >
        {step > 0 ? (
          <button
            className={buttonStyles({
              className: "group gap-1.5",
              variant: "ghost",
            })}
            onClick={() =>
              setStep((currentStep) => Math.max(currentStep - 1, 0))
            }
            type="button"
          >
            <ArrowLeft
              aria-hidden="true"
              className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
              size={14}
              strokeWidth={2}
            />
            <span className="hidden xs:inline">Back</span>
          </button>
        ) : null}

        {step < checkoutSteps.length - 1 ? (
          <button
            className={buttonStyles({
              className: "group gap-2 px-5 sm:px-6 flex-1 sm:flex-none max-w-[280px] sm:max-w-none",
            })}
            disabled={step === 0 && selectedProductCount === 0}
            onClick={handleNextStep}
            type="button"
          >
            <span className="truncate">
              {step === 0 && selectedProductCount === 0 ? (
                "Select a product"
              ) : (
                <>
                  Continue
                  <span className="hidden sm:inline">
                    {" "}
                    to {checkoutSteps[step + 1]?.label ?? "Submit"}
                  </span>
                </>
              )}
            </span>
            {step !== 0 || selectedProductCount > 0 ? (
              <ArrowRight
                aria-hidden="true"
                className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                size={14}
                strokeWidth={2}
              />
            ) : null}
          </button>
        ) : (
          <button
            className={buttonStyles({
              className: "group gap-2 px-5 sm:px-6 flex-1 sm:flex-none max-w-[280px] sm:max-w-none",
            })}
            disabled={isPending || !canPlaceOrders}
            type="submit"
            form="order-form-element"
          >
            {!canPlaceOrders
              ? "Orders paused"
              : isPending
                ? "Submitting…"
                : "Submit order"}
            {!isPending && canPlaceOrders ? (
              <Check
                aria-hidden="true"
                size={14}
                className="shrink-0"
                strokeWidth={2.5}
              />
            ) : null}
          </button>
        )}
      </motion.div>
    </div>
  );
}
