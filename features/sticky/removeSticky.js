import StickyMessage from "../../models/stickyMessageSchema.js";

export default {
  name: "sticky-remove",
  description: "Remove sticky message from this channel.",
  async execute(message) {
    if (!message.member.permissions.has("ManageMessages"))
      return message.reply("❌ You don’t have permission to use this command.");

    const sticky = await StickyMessage.findOne({ channelId: message.channel.id });
    if (!sticky) return message.reply("There’s no sticky message set for this channel.");

    try {
      const oldMsg = await message.channel.messages.fetch(sticky.messageId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => null);
    } catch (err) {
      console.warn("Could not delete old sticky:", err.message);
    }

    await sticky.deleteOne();
    message.reply("✅ Sticky message removed from this channel.");
  },
};
