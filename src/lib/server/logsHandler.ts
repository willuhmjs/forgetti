import fs from 'fs';
import { WebhookClient, EmbedBuilder, type HexColorString } from 'discord.js';
import colorMap from '$lib/colorMap';
import configStore from '$lib/server/configStore';
import { get } from 'svelte/store';

const config = get(configStore);

export const exportLogsToFile = (logs: string) => {
	const logText = logs;
	const logFilePath = './logs.txt';
	fs.writeFileSync(logFilePath, logText, 'utf-8');
	return logFilePath;
};

export const exportLogsToDiscord = async (logs: string) => {
	if (!config.DiscordWebhookEnabled || !config.DiscordWebhookURL) {
		throw new Error('Discord webhook is not enabled or URL is missing.');
	}

	const webhookClient = new WebhookClient({ url: config.DiscordWebhookURL });

	const notifyEmbed = new EmbedBuilder()
		.setTitle('Logs Export')
		.setDescription('Exported logs')
		.setTimestamp()
		.setColor((colorMap.get(config.BrandColor) as HexColorString) || '#ffffff');

	webhookClient.send({
		embeds: [notifyEmbed],
		files: [
			{
				attachment: Buffer.from(logs, 'utf-8'),
				name: 'logs.txt'
			}
		],
		content:
			config.DiscordUserPing && config.DiscordUserPing ? `<@${config.DiscordUserPing}>` : undefined
	});
};
