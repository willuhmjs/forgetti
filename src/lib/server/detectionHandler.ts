import type { Box, InferenceData } from '$lib/types';
import { WebhookClient, EmbedBuilder, type HexColorString } from 'discord.js';
import Canvas from '@napi-rs/canvas';
import sharp from 'sharp';
import { get } from 'svelte/store';
import colorMap from '$lib/colorMap';
import configStore from './configStore';

interface InferenceDataBuffer {
	buffer: Buffer;
	box: Box[];
}

let config = get(configStore);

export default async (data: InferenceData) => {
	config = get(configStore);
	try {
		const drawnBuffer = await buildImage(data);
		const newData: InferenceDataBuffer = {
			box: data.box,
			buffer: drawnBuffer
		};
		if (config.DiscordWebhookEnabled && config.DiscordWebhookURL) notifyDiscord(newData);
	} catch (e) {
		console.error(e);
	}
};

const buildImage = async (data: InferenceData): Promise<Buffer> => {
	const buffer: Buffer = Buffer.from(data.buffer, 'base64');
	const { width, height } = await sharp(buffer).metadata();
	const canvas = Canvas.createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage(buffer);
	ctx.drawImage(background, 0, 0);
	ctx.strokeStyle = colorMap.get(config.BrandColor) || '#ffffff';
	ctx.lineWidth = 5;
	ctx.font = '20px sans-serif';
	data.box.forEach(({ x1, y1, x2, y2, prob }: Box) => {
		ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
		ctx.fillStyle = colorMap.get(config.BrandColor) || '#ffffff';
		const width = ctx.measureText(`failure ${prob}%`).width;
		ctx.fillRect(x1, y1, width + 10, 25);
		ctx.fillStyle = '#000000';
		ctx.fillText(`failure ${prob}%`, x1, y1 + 18);
	});
	return canvas.toBuffer('image/jpeg');
};

const notifyDiscord = (data: InferenceDataBuffer) => {
	const webhookClient = new WebhookClient({ url: config.DiscordWebhookURL });

	const boxes = data.box;

	const notifyEmbed = new EmbedBuilder()
		.setTitle('Spaghetti Detected!')
		.setDescription(
			`Detected ${boxes.length} spaghetti instance${boxes.length === 1 ? '' : 's'} ≤ ${boxes[0].prob}%`
		)
		.setTimestamp()
		.setImage('attachment://spaghetti.jpg')
		.setColor((colorMap.get(config.BrandColor) as HexColorString) || '#ffffff');
	webhookClient.send({
		embeds: [notifyEmbed],
		files: [
			{
				attachment: data.buffer,
				name: 'spaghetti.jpg'
			}
		],
		content:
			config.DiscordUserPing && config.DiscordUserPing ? `<@${config.DiscordUserPing}>` : undefined
	});
};

const notifyMoonraker = () => {
	
} 