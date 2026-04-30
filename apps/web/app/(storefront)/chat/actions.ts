"use server"

import {
  createSupportChat,
  getActiveChatByVisitorId,
  getChatWithMessages,
  insertSupportMessage,
  updateChatDiscordThread,
  updateChatStatus,
} from "@wongdigital/db/storefront"
import type { SupportChatWithMessages } from "@wongdigital/db"

import type { ActionResult } from "@/lib/actions"
import { checkRateLimit } from "@/lib/security"
import {
  createDiscordSupportThread,
  postToDiscordSupportThread,
} from "@/lib/discord-support"

export async function startChatAction(input: {
  visitorId: string
  visitorName: string
  visitorEmail?: string
  message: string
}): Promise<ActionResult<SupportChatWithMessages>> {
  const allowed = await checkRateLimit("startChat", 3, 60000)
  if (!allowed) {
    return { success: false, error: "Please wait a moment before starting a new chat." }
  }

  const name = input.visitorName.trim()
  const message = input.message.trim()

  if (!name || name.length < 2) {
    return { success: false, error: "Please enter your name." }
  }
  if (!message || message.length < 2) {
    return { success: false, error: "Please enter a message." }
  }
  if (message.length > 1000) {
    return { success: false, error: "Message is too long (max 1000 characters)." }
  }

  try {
    // Check for existing open chat
    const existing = await getActiveChatByVisitorId(input.visitorId)
    if (existing) {
      return { success: true, data: existing }
    }

    // Create chat in DB
    const chat = await createSupportChat({
      visitorId: input.visitorId,
      visitorName: name,
      visitorEmail: input.visitorEmail?.trim() || undefined,
    })

    // Insert first message
    const firstMessage = await insertSupportMessage({
      chatId: chat.id,
      sender: "customer",
      content: message,
    })

    // Create Discord thread (non-blocking for the user)
    const threadId = await createDiscordSupportThread(name, message).catch((error) => {
      console.error("Failed to create Discord support thread:", error)
      return null
    })

    if (threadId) {
      await updateChatDiscordThread(chat.id, threadId).catch(() => undefined)
    }

    return {
      success: true,
      data: {
        ...chat,
        discordThreadId: threadId,
        messages: [firstMessage],
      },
    }
  } catch (error) {
    console.error("startChatAction error:", error)
    return { success: false, error: "Failed to start chat. Please try again." }
  }
}

export async function sendMessageAction(input: {
  chatId: string
  visitorId: string
  content: string
}): Promise<ActionResult<{ messageId: string }>> {
  const allowed = await checkRateLimit("sendMessage", 10, 60000)
  if (!allowed) {
    return { success: false, error: "You're sending messages too quickly." }
  }

  const content = input.content.trim()
  if (!content || content.length < 1) {
    return { success: false, error: "Message cannot be empty." }
  }
  if (content.length > 1000) {
    return { success: false, error: "Message is too long (max 1000 characters)." }
  }

  try {
    const chat = await getChatWithMessages(input.chatId)

    if (!chat || chat.visitorId !== input.visitorId) {
      return { success: false, error: "Chat not found." }
    }

    if (chat.status === "resolved") {
      return { success: false, error: "This chat has been resolved. Start a new one if you need help." }
    }

    const message = await insertSupportMessage({
      chatId: input.chatId,
      sender: "customer",
      content,
    })

    // Post to Discord thread
    if (chat.discordThreadId) {
      await postToDiscordSupportThread(
        chat.discordThreadId,
        "customer",
        chat.visitorName,
        content,
      ).catch((error) => {
        console.error("Failed to post to Discord thread:", error)
      })
    }

    return { success: true, data: { messageId: message.id } }
  } catch (error) {
    console.error("sendMessageAction error:", error)
    return { success: false, error: "Failed to send message." }
  }
}

export async function loadChatAction(visitorId: string): Promise<ActionResult<SupportChatWithMessages | null>> {
  try {
    const chat = await getActiveChatByVisitorId(visitorId)
    return { success: true, data: chat }
  } catch (error) {
    console.error("loadChatAction error:", error)
    return { success: false, error: "Failed to load chat." }
  }
}

export async function adminReplyAction(input: {
  chatId: string
  content: string
}): Promise<ActionResult<{ messageId: string }>> {
  const content = input.content.trim()
  if (!content) {
    return { success: false, error: "Reply cannot be empty." }
  }

  try {
    const chat = await getChatWithMessages(input.chatId)
    if (!chat) {
      return { success: false, error: "Chat not found." }
    }

    const message = await insertSupportMessage({
      chatId: input.chatId,
      sender: "admin",
      content,
    })

    // Post to Discord thread
    if (chat.discordThreadId) {
      await postToDiscordSupportThread(
        chat.discordThreadId,
        "admin",
        "Admin",
        content,
      ).catch(() => undefined)
    }

    return { success: true, data: { messageId: message.id } }
  } catch (error) {
    console.error("adminReplyAction error:", error)
    return { success: false, error: "Failed to send reply." }
  }
}

export async function resolveChatAction(chatId: string): Promise<ActionResult<void>> {
  try {
    await updateChatStatus(chatId, "resolved")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("resolveChatAction error:", error)
    return { success: false, error: "Failed to resolve chat." }
  }
}
