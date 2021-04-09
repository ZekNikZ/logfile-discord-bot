import { Client, Message } from 'discord.js';

export default function onMessage(client: Client, msg: Message): void {
    // Check if message was in a guild or in a DM
    if (!msg.guild) {
        // Message is a DM
    } else {
        // Message is in a guild
        if (msg.attachments.size > 0) {
            msg.attachments.forEach((attachment) => {
                if (attachment.name === 'output_log.txt') {
                    msg.reply(
                        `https://ktane.timwi.de/More/Logfile%20Analyzer.html#url=${attachment.url}`
                    );
                }
            });
        }
        console.log(msg);
    }
}
