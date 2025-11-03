import StickyMessage from "../../models/stickyMessageSchema.js";

export async function handleStickyMessage(message) {
  if (message.author.bot) return;

  const stickyData = await StickyMessage.findOne({ channelId: message.channel.id });
  if (!stickyData) return;

  try {
    // Delete the previous sticky message if it still exists
    const oldMessage = await message.channel.messages.fetch(stickyData.messageId).catch(() => null);
    if (oldMessage) await oldMessage.delete().catch(() => null);

    // Send new sticky message
    const newSticky = await message.channel.send(stickyData.content);

    // Update messageId in DB
    stickyData.messageId = newSticky.id;
    await stickyData.save();
  } catch (err) {
    console.error("Error handling sticky message:", err);
  }
}
