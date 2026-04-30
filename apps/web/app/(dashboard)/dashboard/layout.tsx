import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireDashboardAdmin } from "@/lib/dashboard-auth"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { admin, developmentAccess } = await requireDashboardAdmin("/dashboard")

  return (
    <DashboardShell
      adminEmail={admin?.email}
      developmentAccess={developmentAccess}
    >
      {children}
    </DashboardShell>
  )
}
