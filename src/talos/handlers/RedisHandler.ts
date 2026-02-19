import RedisConnector from "src/general/handlers/RedisConnector";
import ServerChannelHandler from "./ServerChannelHandler";
import ChatMessage from "src/general/classes/api/redis/ChatMessage";
import { BaseMessage } from "src/general/classes/api/redis/BaseMessage";
import { Singleton } from "src/container/Singleton";

@Singleton
export default class RedisHandler {
    public client;

    constructor(private redisConnector: RedisConnector, private serverChannelHandler: ServerChannelHandler) {
        this.client = this.redisConnector.getClient();

        if (!this.client) {
            setTimeout(() => {
                this.openChannels();
            }, 5000);
        } else {
            this.openChannels();
        }
    }

    private async openChannels() {
        if (!this.client) {
            throw new Error("Redis client is not initialized.");
        }

        this.client.subscribe(["System", "ChatMessage"], (message, channel) => {
            console.log(`Received message on channel ${channel}: ${message}`);
            if (channel === "ChatMessage") {
                this.serverChannelHandler.relayChatMessage(ChatMessage.fromJson(message));
            } else if (channel === "System") {
                const baseMessage = BaseMessage.fromJson(message);
                switch (baseMessage.data) {
                    case "online":
                        this.serverChannelHandler.sendMessage("Server now online.", baseMessage.serverName, process.env.SERVER_ONLINE || "");
                        break;
                    case "offline":
                        this.serverChannelHandler.sendMessage("Server now offline.", baseMessage.serverName, process.env.SERVER_OFFLINE || "");
                }
            }
        });
    };
}