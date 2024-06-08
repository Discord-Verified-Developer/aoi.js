import {
	GatewayEventNames,
	type Interaction,
	InteractionTypes,
	type Snowflake,
} from 'zeneth';
import { type AoiClient } from '../structures/AoiClient.js';
import { isAutoFetchDataEnabled } from '../util/DapiHelper.js';
import { AoiClientEvents } from '../typings/enums.js';

export function onInteraction(client: AoiClient) {
	client.client.on(
		GatewayEventNames.InteractionCreate,
		async (interaction) => {
			await interactionCreate(interaction, client);
		},
	);
}

export async function interactionCreate(
	interaction: Interaction,
	client: AoiClient,
) {
	const cmdName = getCommandName(interaction);
	if (!cmdName) return;
	await client.managers.commands
		.exec({
			type: 'interaction',
			data: {
				interaction,
				client: client.client,
				bot: client,
				message: interaction.message,
				channel:
                    interaction.channel ??
                    client.cache?.channels?.get(interaction.channelId) ??
                    isAutoFetchDataEnabled('channel', client)
                    	? await client.client.getChannel(
                    		interaction.channelId!,
                    	)
                    	: { id: interaction.channelId, fetched: false },
				guild:
                    client.cache?.guilds?.get(interaction.guildId) ??
                    isAutoFetchDataEnabled('guild', client)
                    	? await client.client.getGuild(
                    		interaction.guildId!,
                    	)
                    	: { id: interaction.guildId, fetched: false },
				author: interaction.user,
				member: interaction.member,
			},
			filter: (cmd) => cmd.name === cmdName,
		})

		.catch((e) => {
			if (e.component && !e.success) return;
			else client.emit(AoiClientEvents.Error, e);
		});
}

function getCommandName(interaction: Interaction) {
	switch (interaction.type) {
		case InteractionTypes.ApplicationCommand:
			return interaction.data.name;
		case InteractionTypes.MessageComponent:
			return interaction.customId!;
		case InteractionTypes.ApplicationCommandAutocomplete:
			return interaction.data.name;
		default:
			return undefined;
	}
}
