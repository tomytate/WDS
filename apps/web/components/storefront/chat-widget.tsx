"use client";

import { MessageCircle, Send, X, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { createClient } from "@/utils/supabase/client";
import {
  startChatAction,
  sendMessageAction,
  loadChatAction,
} from "@/app/(storefront)/chat/actions";

type ChatMessage = {
  id: string;
  sender: "customer" | "admin";
  content: string;
  createdAt: string;
};

type ChatState = {
  chatId: string | null;
  visitorId: string;
  messages: ChatMessage[];
};

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";

  const stored = localStorage.getItem("tds_visitor_id");
  if (stored) return stored;

  const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("tds_visitor_id", id);
  return id;
}

function getStoredChatId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tds_chat_id");
}

function storeChatId(chatId: string) {
  localStorage.setItem("tds_chat_id", chatId);
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    chatId: null,
    visitorId: "",
    messages: [],
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load existing chat on mount
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    setChatState((prev) => ({ ...prev, visitorId }));

    const storedChatId = getStoredChatId();
    if (!storedChatId) return;

    setLoading(true);
    loadChatAction(visitorId).then((result) => {
      if (result.success && result.data) {
        setChatState({
          chatId: result.data.id,
          visitorId,
          messages: result.data.messages.map((m) => ({
            id: m.id,
            sender: m.sender,
            content: m.content,
            createdAt: m.createdAt.toISOString(),
          })),
        });
      }
      setLoading(false);
    });
  }, []);

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    if (!chatState.chatId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chatState.chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${chatState.chatId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            sender: string;
            content: string;
            created_at: string;
          };

          setChatState((prev) => {
            // Deduplicate
            if (prev.messages.some((m) => m.id === newMsg.id)) return prev;

            return {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: newMsg.id,
                  sender: newMsg.sender as "customer" | "admin",
                  content: newMsg.content,
                  createdAt: newMsg.created_at,
                },
              ],
            };
          });

          // If the panel is closed and it's an admin message, mark as unread
          if (newMsg.sender === "admin" && !open) {
            setHasUnread(true);
          }

          setTimeout(scrollToBottom, 100);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatState.chatId, open, scrollToBottom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages.length, scrollToBottom]);

  async function handleStartChat(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSending(true);

    const result = await startChatAction({
      visitorId: chatState.visitorId,
      visitorName: name,
      visitorEmail: email || undefined,
      message,
    });

    if (!result.success) {
      setError(result.error);
      setSending(false);
      return;
    }

    const chat = result.data;
    storeChatId(chat.id);
    setChatState({
      chatId: chat.id,
      visitorId: chatState.visitorId,
      messages: chat.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
    setMessage("");
    setSending(false);
  }

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!chatState.chatId || !message.trim()) return;

    setError(null);
    setSending(true);

    const result = await sendMessageAction({
      chatId: chatState.chatId,
      visitorId: chatState.visitorId,
      content: message,
    });

    if (!result.success) {
      setError(result.error);
      setSending(false);
      return;
    }

    setMessage("");
    setSending(false);
    inputRef.current?.focus();
  }

  function handleOpen() {
    setOpen(true);
    setHasUnread(false);
  }

  const hasStartedChat = chatState.chatId !== null;

  return (
    <>
      {/* Floating Bubble */}
      <AnimatePresence>
        {!open ? (
          <motion.button
            animate={{ scale: 1, opacity: 1 }}
            aria-label="Open support chat"
            className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[--accent] bg-[--accent] text-[--accent-fg] shadow-[0_4px_24px_var(--accent-tint-strong)] transition-transform hover:scale-105 active:scale-95 md:bottom-5"
            exit={{ scale: 0.8, opacity: 0 }}
            initial={{ scale: 0.8, opacity: 0 }}
            onClick={handleOpen}
            type="button"
          >
            <MessageCircle size={24} strokeWidth={1.5} />
            {hasUnread ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[--color-success] opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-[--color-success]" />
              </span>
            ) : null}
          </motion.button>
        ) : null}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-base)_40%,transparent)] backdrop-blur-3xl shadow-[var(--shadow-elevated)] sm:bottom-5 sm:right-5 md:bottom-5"
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ maxHeight: "min(70vh, 540px)" }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--border)_50%,transparent)] bg-[--accent-tint-soft] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[--accent] text-[--accent-fg]">
                  <MessageCircle size={16} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[--text-primary]">
                    Support Chat
                  </p>
                  <p className="text-[10px] text-[--text-muted]">
                    We typically reply within minutes
                  </p>
                </div>
              </div>
              <button
                aria-label="Close chat"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[--text-muted] transition-colors hover:bg-[--bg-card] hover:text-[--text-primary]"
                onClick={() => setOpen(false)}
                type="button"
              >
                {hasStartedChat ? <Minimize2 size={16} /> : <X size={16} />}
              </button>
            </div>

            {/* Body */}
            {!hasStartedChat && !loading ? (
              /* Start Chat Form */
              <form
                className="flex flex-1 flex-col gap-3 p-4"
                onSubmit={handleStartChat}
              >
                <p className="text-xs text-[--text-secondary]">
                  Hi! How can we help you today?
                </p>
                <input
                  className="rounded-[12px] border border-[color-mix(in_srgb,var(--border)_50%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] px-3 py-2 text-sm text-[--text-primary] outline-none transition-colors focus:border-[--accent] placeholder:text-[--text-muted]"
                  maxLength={60}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                  type="text"
                  value={name}
                />
                <input
                  className="rounded-[12px] border border-[color-mix(in_srgb,var(--border)_50%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] px-3 py-2 text-sm text-[--text-primary] outline-none transition-colors focus:border-[--accent] placeholder:text-[--text-muted]"
                  maxLength={120}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email (optional)"
                  type="email"
                  value={email}
                />
                <textarea
                  className="min-h-[80px] resize-none rounded-[12px] border border-[color-mix(in_srgb,var(--border)_50%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] px-3 py-2 text-sm text-[--text-primary] outline-none transition-colors focus:border-[--accent] placeholder:text-[--text-muted]"
                  maxLength={1000}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe your issue or question..."
                  required
                  value={message}
                />
                {error ? (
                  <p className="text-xs text-[--color-danger]">{error}</p>
                ) : null}
                <button
                  className="rounded-[12px] bg-[--accent] px-4 py-2.5 text-sm font-semibold text-[--accent-fg] transition-opacity hover:opacity-90 disabled:opacity-50"
                  disabled={sending || !name.trim() || !message.trim()}
                  type="submit"
                >
                  {sending ? "Starting Chat..." : "Start Chat"}
                </button>
              </form>
            ) : (
              /* Chat Messages */
              <div className="flex flex-1 flex-col">
                <div
                  className="flex-1 space-y-2 overflow-y-auto p-3"
                  style={{ maxHeight: "min(50vh, 380px)" }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[--accent] border-t-transparent" />
                    </div>
                  ) : chatState.messages.length === 0 ? (
                    <p className="py-8 text-center text-xs text-[--text-muted]">
                      No messages yet
                    </p>
                  ) : (
                    chatState.messages.map((msg) => (
                      <div
                        className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
                        key={msg.id}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                            msg.sender === "customer"
                              ? "rounded-br-[4px] bg-[--accent] text-[--accent-fg]"
                              : "rounded-bl-[4px] border border-[color-mix(in_srgb,var(--border)_50%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_60%,transparent)] text-[--text-primary]"
                          }`}
                        >
                          {msg.sender === "admin" ? (
                            <p className="mb-0.5 text-[10px] font-semibold text-[--accent]">
                              Support
                            </p>
                          ) : null}
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <p
                            className={`mt-1 text-[9px] ${msg.sender === "customer" ? "text-[color-mix(in_srgb,var(--accent-fg)_70%,transparent)]" : "text-[--text-muted]"}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-PH",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form
                  className="flex items-center gap-2 border-t border-[--border] p-3"
                  onSubmit={handleSendMessage}
                >
                  <input
                    className="flex-1 rounded-[12px] border border-[color-mix(in_srgb,var(--border)_50%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] px-3 py-2 text-sm text-[--text-primary] outline-none transition-colors focus:border-[--accent] placeholder:text-[--text-muted]"
                    disabled={sending}
                    maxLength={1000}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type a message..."
                    ref={inputRef}
                    type="text"
                    value={message}
                  />
                  <button
                    aria-label="Send message"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[--accent] text-[--accent-fg] transition-opacity hover:opacity-90 disabled:opacity-40"
                    disabled={sending || !message.trim()}
                    type="submit"
                  >
                    <Send size={16} strokeWidth={2} />
                  </button>
                </form>
                {error ? (
                  <p className="px-3 pb-2 text-xs text-[--color-danger]">
                    {error}
                  </p>
                ) : null}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
