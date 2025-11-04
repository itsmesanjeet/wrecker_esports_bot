import { EmbedBuilder } from "discord.js";
import StickyMessage from "../../models/stickyMessageSchema.js";

export const handeStickyEmbedCommand = async (message, args) => {
    if (!message.member.permissions.has("ManageMessages"))
        return message.reply("❌ You don’t have permission to manage sticky embeds.");

    const subcommand = args.shift()?.toLowerCase();

    switch (subcommand) {
        case "add":
            await handleAddStickyEmbed(message, args);
            break;
        case "remove":
            await handleRemoveStickyEmbed(message, args);
            break;
        default:
            message.reply("Usage:\n`!stickyembed add #channel \"message text\"`\n`!stickyembed remove #channel`");
    }
}

const handleAddStickyEmbed = async (message, args) => {
    // parse channel mention, color code, and text, save to DB
    const channelMention = args.shift();
    const colorCode = args.shift();
    const stickyText = args.join(" ").replace(/^"|"$/g, "");

    const channelId = channelMention?.replace(/<#(\d+)>/, "$1");
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel) return message.reply("⚠️ Please mention a valid channel.");
    if (!colorCode?.startsWith("#")) return message.reply("⚠️ Please provide a valid HEX color (e.g. `#ff0000`).");
    if (!stickyText) return message.reply("⚠️ Please provide the sticky message text in quotes.");

    // Remove existing sticky
    const existing = await StickyMessage.findOne({ channelId });
    if (existing) {
        const oldMsg = await channel.messages.fetch(existing.messageId).catch(() => null);
        if (oldMsg) await oldMsg.delete().catch(() => null);
        await existing.deleteOne();
    }

    // Create embed
    const embed = new EmbedBuilder()
        .setDescription(stickyText)
        .setColor(colorCode)

    // Send and save
    const stickyMsg = await channel.send({ embeds: [embed] });
    await StickyMessage.create({
        guildId: message.guild.id,
        channelId,
        messageId: stickyMsg.id,
        content: stickyText,
        color: colorCode,
        isEmbed: true,
    });

    message.reply(`✅ Sticky embed added in ${channel.toString()}`);
}

const handleRemoveStickyEmbed = async (message, args) => {
    if (!message.member.permissions.has("ManageMessages"))
        return message.reply("❌ You don’t have permission to manage sticky embeds.");

    const channelMention = args.shift();
    const channelId = channelMention?.replace(/<#(\d+)>/, "$1");
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel) return message.reply("⚠️ Please mention a valid channel.");

    // Remove sticky
    const existing = await StickyMessage.findOne({ channelId });
    if (!existing) return message.reply("⚠️ No sticky embed found in this channel.");

    const oldMsg = await channel.messages.fetch(existing.messageId).catch(() => null);
    if (oldMsg) await oldMsg.delete().catch(() => null);
    await existing.deleteOne();

    message.reply(`✅ Sticky embed removed from ${channel.toString()}`);
}