import { ApplicationCommandType, ApplicationIntegrationType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, InteractionContextType, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";
import BaseCommand from "../../../general/classes/BaseCommand";
import { Main } from "../../Main";
import { UserRating } from "src/general/classes/api/mongodb/User";
import GeneralUtils from "src/general/utils/GeneralUtils";
import UserHandler from "src/enforcer/handlers/UserHandler";
import MongoHandler from "src/enforcer/handlers/MongoHandler";
import { Singleton } from "src/container/Singleton";

@Singleton
export class Smash extends BaseCommand {
    private main: Main;
    private mongoHandler: MongoHandler;
    private userHandler: UserHandler;

    public constructor(main: Main, mongoHandler: MongoHandler, userHandler: UserHandler) {
        super();
        this.main = main;
        this.mongoHandler = mongoHandler;
        this.userHandler = userHandler;
    }

    public override deferReply: boolean = false;
    public getCommand(): RESTPostAPIContextMenuApplicationCommandsJSONBody {
        return new ContextMenuCommandBuilder()
            .setName("Smash")
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setType(ApplicationCommandType.Message)
            .toJSON();
    }

    public async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
                const messageID = interaction.targetId;
        const message = await interaction.channel?.messages.fetch(messageID);

        if (!message) {
            await interaction.reply({ content: "Could not fetch message.", ephemeral: true });
            return;
        }

        if (message.author.id === this.main.getClient().user?.id) {
            if (message.embeds.length == 1) {
                let image = message.embeds[0].image?.url;
                if (image) {
                    await interaction.deferReply({ephemeral: true});
                    this.mongoHandler.getWaifuFromURL(image).then(async waifu => {
                        if (!waifu) {
                            await interaction.editReply({ content: "Could not find waifu in database."});
                            return;
                        }

                        const user = await this.userHandler.getUser(interaction.user.id);
                        GeneralUtils.setArray(user.stats.waifus, { id: waifu.id, rating: UserRating.SMASH }, "id");

                        await interaction.editReply({ content: `Waifu has been put into your smash collection.`});
                        return;
                    });
                }
            }
        }

        await interaction.followUp({ content: `**${interaction.user.displayName}** ` + this.main.getRandom("smash") + " **(smash)**" });
    }
}