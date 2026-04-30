import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LegalDocumentPage } from "@/components/storefront/legal-document-page"
import { getLegalDocumentBySlug, legalDocuments } from "@/lib/legal"

type LegalDocumentPageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return legalDocuments.map((document) => ({
    slug: document.slug,
  }))
}

export async function generateMetadata({
  params,
}: LegalDocumentPageProps): Promise<Metadata> {
  const { slug } = await params
  const document = getLegalDocumentBySlug(slug)

  if (!document) {
    return {
      title: "Legal Document Not Found",
    }
  }

  return {
    title: document.title,
    description: document.summary,
  }
}

export default async function LegalDocumentRoute({ params }: LegalDocumentPageProps) {
  const { slug } = await params
  const document = getLegalDocumentBySlug(slug)

  if (!document) {
    notFound()
  }

  return <LegalDocumentPage document={document} />
}
