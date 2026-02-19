
import fs from "fs";
import {GenericBot} from "src/general/classes/GenericBot";
import RedisHandler from "./handlers/RedisHandler";
import ProtocolURI from "src/general/classes/ProtocolURI";
import EventHandler from "src/general/handlers/EventHandler";

export class Talos extends GenericBot {
    private protocol = new ProtocolURI(process.env.REDIS_CONN_STRING || "");

    public constructor(private redisHandler: RedisHandler, eventHandler: EventHandler) {
        super(Talos.getBotInfo().token, "src/talos/commands", eventHandler);
    }

    public static getBotInfo(): { token: string, debug: boolean } {
        return require("src/resources/botconfig.json").talos
    }
}