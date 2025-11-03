import chalk from "chalk";

export default {
    name: "clientReady",
    once: true,
    execute(client) {
        console.log(chalk.greenBright(`✅ ${client.user.tag} is online and ready to serve ${client.guilds.cache.size} guild(s)!`));
        //consle guilds with member numbers
        for (const guild of client.guilds.cache.values()) {
            console.log(chalk.bgBlueBright(`${guild.name} ${guild.memberCount} members`));
        }

        client.user.setPresence({
            activities: [
                {
                    name: `Watching ${client.guilds.cache.size} servers`,
                    type: 3,
                },
            ],
            status: "online",
        });
    },
}