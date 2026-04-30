"use client"

import { Send, CheckCircle2, MessageCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import type { SupportChat, SupportChatWithMessages } from "@wongdigital/db"
import { Card, CardContent, buttonStyles } from "@wongdigital/ui"

import { adminReplyAction, resolveChatAction } from "@/app/(storefront)/chat/actions"

export function SupportDashboard({
  chats,
  selectedChat,
}: {
  chats: SupportChat[]
  selectedChat: SupportChatWithMessages | null
}) {
  const router = useRouter()
  const [reply, setReply] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleReply(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedChat || !reply.trim()) return

    startTransition(async () => {
      const result = await adminReplyAction({
        chatId: selectedChat.id,
        content: reply,
      })

      if (result.success) {
        setReply("")
        router.refresh()
      }
    })
  }

  function handleResolve(chatId: string) {
    startTransition(async () => {
      await resolveChatAction(chatId)
      router.refresh()
    })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* Chat List */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-[--border] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[--text-muted]">
              Conversations ({chats.length})
            </p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {chats.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[--text-muted]">
                No chats yet
              </p>
            ) : (
              chats.map((chat) => (
                <Link
                  className={`flex items-start gap-3 border-b border-[--border] px-4 py-3 transition-colors hover:bg-[--bg-surface] ${
                    selectedChat?.id === chat.id
                      ? "bg-[--accent-tint-soft]"
                      : ""
                  }`}
                  href={`/dashboard/support?chatId=${chat.id}`}
                  key={chat.id}
                >
                  <span className={`mt-1 flex h-2 w-2 shrink-0 rounded-full ${
                    chat.status === "open" ? "bg-[--color-success]" : "bg-[--text-muted]"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-[--text-primary]">
                        {chat.visitorName}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        chat.status === "open"
                          ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success]"
                          : "bg-[--bg-card] text-[--text-muted]"
                      }`}>
                        {chat.status}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[--text-muted]">
                      <Clock size={10} />
                      {new Date(chat.updatedAt).toLocaleString("en-PH", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    {chat.visitorEmail ? (
                      <p className="mt-0.5 truncate text-[10px] text-[--text-muted]">
                        {chat.visitorEmail}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Detail */}
      <Card>
        <CardContent className="flex flex-col p-0" style={{ minHeight: "40vh" }}>
          {!selectedChat ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
              <MessageCircle className="text-[--text-muted]" size={32} strokeWidth={1} />
              <p className="text-sm text-[--text-muted]">Select a conversation to view</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-[--border] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[--text-primary]">
                    {selectedChat.visitorName}
                  </p>
                  <p className="text-[10px] text-[--text-muted]">
                    {selectedChat.visitorEmail ?? "No email provided"}
                  </p>
                </div>
                {selectedChat.status === "open" ? (
                  <button
                    className={buttonStyles({ variant: "ghost", className: "text-xs gap-1.5" })}
                    disabled={isPending}
                    onClick={() => handleResolve(selectedChat.id)}
                    type="button"
                  >
                    <CheckCircle2 size={14} />
                    Resolve
                  </button>
                ) : (
                  <span className="rounded-full bg-[--bg-card] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[--text-muted]">
                    Resolved
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-2.5 overflow-y-auto p-4" style={{ maxHeight: "45vh" }}>
                {selectedChat.messages.map((msg) => (
                  <div
                    className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                    key={msg.id}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3.5 py-2 text-sm leading-relaxed ${
                        msg.sender === "admin"
                          ? "rounded-br-[4px] bg-[--accent] text-[--accent-fg]"
                          : "rounded-bl-[4px] border border-[--border] bg-[--bg-surface] text-[--text-primary]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`mt-1 text-[9px] ${msg.sender === "admin" ? "text-[color-mix(in_srgb,var(--accent-fg)_60%,transparent)]" : "text-[--text-muted]"}`}>
                        {msg.sender === "admin" ? "Admin · " : ""}
                        {new Date(msg.createdAt).toLocaleTimeString("en-PH", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              {selectedChat.status === "open" ? (
                <form
                  className="flex items-center gap-2 border-t border-[--border] p-3"
                  onSubmit={handleReply}
                >
                  <input
                    className="flex-1 rounded-[12px] border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] outline-none transition-colors focus:border-[--accent] placeholder:text-[--text-muted]"
                    disabled={isPending}
                    maxLength={1000}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Type a reply..."
                    type="text"
                    value={reply}
                  />
                  <button
                    aria-label="Send reply"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[--accent] text-[--accent-fg] transition-opacity hover:opacity-90 disabled:opacity-40"
                    disabled={isPending || !reply.trim()}
                    type="submit"
                  >
                    <Send size={16} strokeWidth={2} />
                  </button>
                </form>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
