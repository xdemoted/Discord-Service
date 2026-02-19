import { Singleton } from "src/container/Singleton";
import { Main } from "../Main";

@Singleton
export default class MessageHandler {
    private main: Main

    public constructor(main:Main) {
        this.main = main;
    }

    public startMessageEnforcement() {
        this.main.getClient().on('messageCreate', async (message) => {
            if (message.author.bot) return;
            if (message.guildId != "917476736223043604") return;

            if (!message.content.toLowerCase().includes("milk")) {
                message.delete().catch(err => {
                    console.error("Failed to delete message:", err);
                });
            }
        })
    }
}