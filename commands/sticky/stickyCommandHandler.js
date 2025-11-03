import StickyMessage from "../../models/stickyMessageSchema.js";

export async function handleStickyCommand(message, args) {
  if (!message.member.permissions.has("ManageMessages"))
    return message.reply("❌ You don’t have permission to manage stickies.");

  const subcommand = args.shift()?.toLowerCase();

  switch (subcommand) {
    case "add":
      await handleAddSticky(message, args);
      break;

    case "remove":
      await handleRemoveSticky(message, args);
      break;

    default:
      message.reply("Usage:\n`!sticky add #channel \"message text\"`\n`!sticky remove #channel`");
  }
}

// Subcommand: add
async function handleAddSticky(message, args) {
  // parse channel mention and text, save to DB
  const channelMention = args.shift();
  const stickyText = args.join(" ").replace(/^"|"$/g, "");

  const channelId = channelMention?.replace(/<#(\d+)>/, "$1");
  const channel = message.guild.channels.cache.get(channelId);
  if (!channel) return message.reply("⚠️ Please mention a valid channel.");
  if (!stickyText) return message.reply("⚠️ Please provide the sticky text.");

  // Remove old sticky if exists
  const existing = await StickyMessage.findOne({ channelId });
  if (existing) {
    const oldMsg = await channel.messages.fetch(existing.messageId).catch(() => null);
    if (oldMsg) await oldMsg.delete().catch(() => null);
    await existing.deleteOne();
  }

  // Send new sticky and save
  const stickyMsg = await channel.send(stickyText);
  await StickyMessage.create({
    guildId: message.guild.id,
    channelId,
    messageId: stickyMsg.id,
    content: stickyText,
  });

  message.reply(`✅ Sticky added in ${channel.toString()}`);
}

// Subcommand: remove
async function handleRemoveSticky(message, args) {
  const channelMention = args.shift();
  const channelId = channelMention?.replace(/<#(\d+)>/, "$1");
  const channel = message.guild.channels.cache.get(channelId);
  if (!channel) return message.reply("⚠️ Please mention a valid channel.");

  const sticky = await StickyMessage.findOne({ channelId });
  if (!sticky) return message.reply("There’s no sticky message in that channel.");

  const oldMsg = await channel.messages.fetch(sticky.messageId).catch(() => null);
  if (oldMsg) await oldMsg.delete().catch(() => null);

  await sticky.deleteOne();
  message.reply(`✅ Sticky removed from ${channel.toString()}`);
}