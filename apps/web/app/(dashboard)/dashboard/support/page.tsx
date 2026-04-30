import { MessageCircle } from "lucide-react"

import { PageHeader } from "@wongdigital/ui"

import { requireDashboardAdmin } from "@/lib/dashboard-auth"
import { listSupportChats, getChatWithMessages } from "@wongdigital/db/storefront"

import { SupportDashboard } from "./support-dashboard"

export const metadata = {
  title: "Support | Dashboard",
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ chatId?: string }>
}) {
  await requireDashboardAdmin()
  const params = await searchParams

  const chats = await listSupportChats()
  const selectedChat = params.chatId
    ? await getChatWithMessages(params.chatId)
    : null

  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        description="Live support conversations from the storefront."
        icon={<MessageCircle size={20} />}
        title="Support"
      />
      <SupportDashboard
        chats={chats}
        selectedChat={selectedChat}
      />
    </div>
  )
}
