import dotenv from "dotenv";
dotenv.config();

import connectDB from "./DB/db.js";
connectDB();

import { Client, GatewayIntentBits } from "discord.js";

import { loadEvents } from "./client/eventLoader.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Map();

await loadEvents(client);

client.login(process.env.DISCORD_TOKEN);
