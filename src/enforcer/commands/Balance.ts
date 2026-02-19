import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Main } from "../Main";
import UserHandler from "../handlers/UserHandler";
import { Singleton } from "src/container/Singleton";

@Singleton
export class Balance extends BaseCommand {
    private userHandler: UserHandler;

    constructor(userHandler: UserHandler) {
        super();
        this.userHandler = userHandler;
    }

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("balance")
            .setDescription("display user balance")
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const user = await this.userHandler.getUser(interaction.user.id);
        if (user.currency <= 0) {
            await interaction.editReply({ content: "You're too poor for this command. <a:gem:1396788024934662144>" });
            return;
        }
        await interaction.editReply({ content: `You have ${user.currency} gems. <a:gem:1396788024934662144>` });
        return;
    }
}