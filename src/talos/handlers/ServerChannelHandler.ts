import { Attachment, AttachmentBuilder, Webhook, WebhookClient } from "discord.js";
import ChatMessage from "src/general/classes/api/redis/ChatMessage";
import { createCanvas, loadImage } from "canvas";
import { BaseMessage } from "src/general/classes/api/redis/BaseMessage";
import { FilterService } from "src/general/filter/FilterService";
import { Singleton } from "src/container/Singleton";

@Singleton
export default class ServerChannelHandler {
    constructor(private filterService: FilterService) {}

    private getWebhook():WebhookClient {
        const url: string = process.env.WEBHOOK_URL || "";

        if (url === "") {
            throw new Error("Webhook URL is not defined.");
        } else if (!url.startsWith("https://discord.com/api/webhooks/")) {
            throw new Error("Invalid Discord webhook URL.");
        }

        return new WebhookClient({url: url});
    }

    public getAvatarImage(name: string): string {
        const avatarUrl = process.env.AVATAR_API ? process.env.AVATAR_API.replace("{name}", name) : null;

        if (!avatarUrl) 
            throw new Error("Avatar API URL is not defined.");

        return avatarUrl;
    }

    public relayChatMessage(message:ChatMessage): void {
        this.sendMessage(message.data, message.name, this.getAvatarImage(message.name));
    }

    public relaySystemMessage(message: BaseMessage): void {
        
    }

    public sendMessage(content: string, username:string, avatarURL:string): void {
        const webhook = this.getWebhook();

        content = this.filterService.applyDiscordFilter(content);

        webhook.send({
            content: content,
            username: username,
            avatarURL: avatarURL
        }).catch(error => {
            console.error("Error sending webhook message:", error);
        });
    }
}