import { getDb } from "../client";
import type {
  ChatSender,
  ChatStatus,
  SupportChat,
  SupportChatWithMessages,
  SupportMessage,
} from "../types";

export async function createSupportChat(input: {
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  discordThreadId?: string;
}): Promise<SupportChat> {
  const supabase = getDb();
  const { data: chat, error } = await supabase
    .from("support_chats")
    .insert({
      visitor_id: input.visitorId,
      visitor_name: input.visitorName,
      visitor_email: input.visitorEmail ?? null,
      discord_thread_id: input.discordThreadId ?? null,
    } as any)
    .select()
    .single();

  if (error || !chat) throw new Error("Failed to create support chat.");

  return mapChat(chat);
}

export async function updateChatDiscordThread(
  chatId: string,
  discordThreadId: string,
) {
  const supabase = getDb();
  await supabase
    .from("support_chats")
    .update({
      discord_thread_id: discordThreadId,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", chatId);
}

export async function insertSupportMessage(input: {
  chatId: string;
  sender: ChatSender;
  content: string;
}): Promise<SupportMessage> {
  const supabase = getDb();

  const { data: message, error } = await supabase
    .from("support_messages")
    .insert({
      chat_id: input.chatId,
      sender: input.sender,
      content: input.content,
    } as any)
    .select()
    .single();

  if (error || !message) throw new Error("Failed to insert message.");

  await supabase
    .from("support_chats")
    .update({ updated_at: new Date().toISOString() } as any)
    .eq("id", input.chatId);

  return mapMessage(message);
}

export async function getActiveChatByVisitorId(
  visitorId: string,
): Promise<SupportChatWithMessages | null> {
  const supabase = getDb();

  const { data: chat, error: chatError } = await supabase
    .from("support_chats")
    .select("*")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (chatError || !chat || (chat as any).status === "resolved") return null;

  const { data: messages, error: msgError } = await supabase
    .from("support_messages")
    .select("*")
    .eq("chat_id", (chat as any).id)
    .order("created_at", { ascending: true });

  return {
    ...mapChat(chat),
    messages: msgError || !messages ? [] : messages.map(mapMessage),
  };
}

export async function getChatWithMessages(
  chatId: string,
): Promise<SupportChatWithMessages | null> {
  const supabase = getDb();
  const { data: chat, error } = await supabase
    .from("support_chats")
    .select("*")
    .eq("id", chatId)
    .maybeSingle();

  if (error || !chat) return null;

  const { data: messages, error: msgError } = await supabase
    .from("support_messages")
    .select("*")
    .eq("chat_id", (chat as any).id)
    .order("created_at", { ascending: true });

  return {
    ...mapChat(chat),
    messages: msgError || !messages ? [] : messages.map(mapMessage),
  };
}

export async function listSupportChats(
  status?: ChatStatus,
): Promise<SupportChat[]> {
  const supabase = getDb();

  let query = supabase
    .from("support_chats")
    .select("*")
    .order("updated_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }

  const { data: rows, error } = await query;
  if (error || !rows) return [];

  return rows.map(mapChat);
}

export async function updateChatStatus(chatId: string, status: ChatStatus) {
  const supabase = getDb();
  await supabase
    .from("support_chats")
    .update({
      status,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", chatId);
}

function mapChat(row: any): SupportChat {
  return {
    id: row.id,
    visitorId: row.visitor_id,
    visitorName: row.visitor_name,
    visitorEmail: row.visitor_email,
    discordThreadId: row.discord_thread_id,
    status: row.status ?? "open",
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapMessage(row: any): SupportMessage {
  return {
    id: row.id,
    chatId: row.chat_id,
    sender: row.sender ?? "customer",
    content: row.content,
    createdAt: new Date(row.created_at),
  };
}
