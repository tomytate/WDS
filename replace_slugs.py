import os
import re

files_to_update = [
    "apps/web/components/storefront/recently-viewed-row.tsx",
    "apps/web/components/storefront/product-card.tsx",
    "apps/web/components/storefront/command-palette.tsx",
    "apps/web/components/storefront/product-selection.tsx",
    "apps/web/components/storefront/upsell-card.tsx",
    "apps/web/components/storefront/track-order-form.tsx",
    "apps/web/components/storefront/customer-details-step.tsx",
    "apps/web/components/storefront/cart-summary.tsx",
    "apps/web/components/storefront/review-step.tsx",
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist")
        continue

    with open(filepath, "r") as f:
        content = f.read()

    # Product references
    content = re.sub(r'formatPrimaryPrice\((product\.price)\)', r'formatPrimaryPrice(\1, product.slug)', content)
    content = re.sub(r'formatPrimaryPrice\((p\.price)\)', r'formatPrimaryPrice(\1, p.slug)', content)
    content = re.sub(r'formatPrimaryPrice\((pkg\.price)\)', r'formatPrimaryPrice(\1, pkg.slug)', content)
    content = re.sub(r'formatPrimaryPrice\((pkg\.savings)\)', r'formatPrimaryPrice(\1, pkg.slug)', content)
    content = re.sub(r'formatPrimaryPrice\((displayPrice)\)', r'formatPrimaryPrice(\1, product.slug)', content)
    content = re.sub(r'formatPrimaryPrice\((startsAtPrice)\)', r'formatPrimaryPrice(\1, product.slug)', content)
    content = re.sub(r'formatPrimaryPrice\((serviceConfig\.pricePerThousand)\)', r'formatPrimaryPrice(\1, product.slug)', content)

    content = re.sub(r'formatSecondaryPrice\((product\.price)\)', r'formatSecondaryPrice(\1, product.slug)', content)
    content = re.sub(r'formatSecondaryPrice\((serviceConfig\.pricePerThousand)\)', r'formatSecondaryPrice(\1, product.slug)', content)

    # Item unit price (where item has a product)
    content = re.sub(r'formatPrimaryPrice\((item\.unitPrice)\)', r'formatPrimaryPrice(\1, item.product?.slug)', content)
    content = re.sub(r'formatPrimaryPrice\((focusedItem\.unitPrice)\)', r'formatPrimaryPrice(\1, focusedItem.product?.slug)', content)
    content = re.sub(r'formatPrimaryPrice\((selectedItem!\.unitPrice)\)', r'formatPrimaryPrice(\1, selectedItem!.product?.slug)', content)
    
    with open(filepath, "w") as f:
        f.write(content)

print("Replacement complete")
