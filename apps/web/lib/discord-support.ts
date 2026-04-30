import "server-only"

function getWebhookUrl() {
  return process.env.DISCORD_SUPPORT_WEBHOOK_URL?.trim()
}

/**
 * Creates a new Forum post (thread) via the webhook.
 * Uses `?wait=true` to get the response, which contains `channel_id` = thread ID.
 */
export async function createDiscordSupportThread(
  visitorName: string,
  firstMessage: string,
): Promise<string | null> {
  const url = getWebhookUrl()
  if (!url) return null

  const response = await fetch(`${url}?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_name: `💬 ${visitorName}`,
      content: `**New support chat from ${visitorName}**\n\n> ${firstMessage}`,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown error")
    console.error(`Discord support thread creation failed (${response.status}): ${text}`)
    return null
  }

  const data = await response.json() as { channel_id?: string }
  return data.channel_id ?? null
}

/**
 * Posts a follow-up message to an existing Forum thread.
 * Uses `?thread_id=` query parameter.
 */
export async function postToDiscordSupportThread(
  threadId: string,
  sender: "customer" | "admin",
  senderName: string,
  message: string,
): Promise<void> {
  const url = getWebhookUrl()
  if (!url) return

  const label = sender === "admin" ? "🛡️ Admin" : `👤 ${senderName}`
  const content = `**${label}:**\n${message}`

  // Discord has a 2000 character limit
  const truncated = content.length > 1990
    ? `${content.slice(0, 1987)}...`
    : content

  const response = await fetch(`${url}?thread_id=${threadId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: truncated }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown error")
    console.error(`Discord support message failed (${response.status}): ${text}`)
  }
}
