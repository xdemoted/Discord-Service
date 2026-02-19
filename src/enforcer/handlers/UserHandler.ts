import { BaseInteraction, Interaction, Message, User } from "discord.js";
import ActiveUser from "src/general/classes/api/mongodb/ActiveUser";
import { Main } from "../Main";
import GeneralUtils from "src/general/utils/GeneralUtils";
import MongoHandler from "./MongoHandler";
import { Singleton } from "src/container/Singleton";

@Singleton
export default class UserHandler {
    private main: Main;
    private mongoHandler: MongoHandler;
    private users: Map<string, ActiveUser> = new Map();
    private userPromises: Map<string, Promise<ActiveUser>> = new Map();

    public constructor(main: Main, mongoHandler: MongoHandler) {
        this.main = main;
        this.mongoHandler = mongoHandler;
    }


    async getUser(userID: string): Promise<ActiveUser> {
        if (this.users.has(userID)) {
            return Promise.resolve(this.users.get(userID)!);
        }
        if (this.userPromises.has(userID)) {
            return this.userPromises.get(userID)!;
        }
        const userPromise = (async () => {
            try {
                const user_1 = await this.main.getClient().users.fetch(userID);
                const userData = await this.mongoHandler.getUser(user_1);
                const activeUser = ActiveUser.fromUser(userData);
                this.users.set(userID, activeUser);
                return activeUser;
            } catch (error) {
                console.error(`Error fetching user ${userID}:`, error);
                throw new Error(`User with ID ${userID} not found.`);
            } finally {
                this.userPromises.delete(userID);
            }
        })();
        this.userPromises.set(userID, userPromise);
        return userPromise;
    }

    setUser(user: ActiveUser): void {
        this.users.set(user.userID, user);
    }

    giveInteractXP(interact: Message<boolean> | Interaction, user: ActiveUser) {
        const guild = interact.guild;
        if (interact instanceof Message) {
            if (interact.channel.isTextBased() && interact.content.length > 5) {
            } else return;
        } else if (interact instanceof BaseInteraction) {
            if (interact.isCommand() || interact.isButton()) {
            } else return;
        } else return;

        if (GeneralUtils.timeSince(user.lastInteract) > 60000) { // 1 minute cooldown
            user.setLastInteract();

            const randomNum = GeneralUtils.randomNumber(5, 25);

            if (user.modifyXP(randomNum)) {
                user.modifyCurrency(GeneralUtils.randomNumber(1, 3));
            }

            if (guild) {
                const guildProfile = user.getGuildProfile(guild.id);
                if (guildProfile.modifyXP(randomNum)) {
                    guildProfile.modifyCurrency(GeneralUtils.randomNumber(5, 10));
                }
            }
        }
    }

    startUserSaveInterval(): void {
        setInterval(() => {
            this.users.forEach((user, userID) => {
                this.mongoHandler.saveUser(user);

                if (GeneralUtils.timeSince(user.lastUpdated) > 600000) { // Delete users not updated in the last 10 minutes
                    this.users.delete(userID);
                }
            });
        }, Main.getVariables().DEBUG ? Main.getVariables().DEBUG_SAVE_CD : 300000); // Save every 5 minutes
    }
}