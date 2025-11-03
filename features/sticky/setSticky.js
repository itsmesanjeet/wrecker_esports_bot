import StickyMessage from "../../models/stickyMessageSchema.js";

export default {
  name: "sticky",
  description: "Set or update a sticky message in this channel.",
  async execute(message, args) {
    if (!message.member.permissions.has("ManageMessages"))
      return message.reply("❌ You don’t have permission to use this command.");

    const content = args.join(" ");
    if (!content) return message.reply("Please provide a sticky message text.");

    // Delete old sticky if exists
    const existing = await StickyMessage.findOne({ channelId: message.channel.id });
    if (existing) {
      try {
        const oldMsg = await message.channel.messages.fetch(existing.messageId).catch(() => null);
        if (oldMsg) await oldMsg.delete().catch(() => null);
      } catch (err) {
        console.warn("Could not delete old sticky:", err.message);
      }
      await existing.deleteOne();
    }

    // Send new sticky message
    const stickyMsg = await message.channel.send(content);

    // Save in DB
    await StickyMessage.create({
      guildId: message.guild.id,
      channelId: message.channel.id,
      messageId: stickyMsg.id,
      content,
    });

    return message.reply("✅ Sticky message set for this channel!");
  },
};
