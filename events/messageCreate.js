import { handleStickyMessage } from "../features/sticky/stickyManager.js";
import { handleStickyCommand } from "../commands/sticky/stickyCommandHandler.js";
import { handeStickyEmbedCommand } from "../commands/sticky/stickyEmbedCommandHandler.js";

export default {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    // 1️⃣ Re-send sticky when messages come in
    await handleStickyMessage(message);

    // 2️⃣ Listen for prefix commands
    const prefix = "!";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    switch (commandName) {
      case "sticky":
        await handleStickyCommand(message, args);
        break;
      case "stickyembed":
        await handeStickyEmbedCommand(message, args);
        break;
    }
  },
};