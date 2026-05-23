import type { Box, Config, InferenceData } from '$lib/types';
import { WebhookClient, EmbedBuilder, type HexColorString } from 'discord.js';
import Canvas from '@napi-rs/canvas';
import sharp from 'sharp';
import { get } from 'svelte/store';
import configStore from './configStore';

interface InferenceDataBuffer {
	buffer: Buffer;
	box: Box[];
}

let config: Config = get(configStore);

export default async (data: InferenceData) => {
	config = get(configStore);
	try {
		const drawnBuffer = await buildImage(data);
		const newData: InferenceDataBuffer = {
			box: data.box,
			buffer: drawnBuffer
		};
		if (config.DiscordWebhookEnabled && config.DiscordWebhookURL) {
			notifyDiscord(newData).catch((e) => console.error('Discord notification failed:', e));
		}
		if (
			data.printer.MoonrakerEnabled &&
			data.printer.MoonrakerURL &&
			(data.box[0]?.prob || 0) >= data.printer.MoonrakerPauseThreshold
		) {
			notifyMoonraker(data.printer.MoonrakerURL).catch((e) =>
				console.error('Moonraker pause failed:', e)
			);
		}
	} catch (e) {
		console.error('Detection handler error:', e);
	}
};

const buildImage = async (data: InferenceData): Promise<Buffer> => {
	const buffer: Buffer = Buffer.from(data.buffer, 'base64');
	const { width, height } = await sharp(buffer).metadata();
	if (!width || !height) throw new Error('Cannot read image dimensions');
	const canvas = Canvas.createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage(buffer);
	ctx.drawImage(background, 0, 0);
	const color = config.BrandColor || '#f97316';
	ctx.strokeStyle = color;
	ctx.lineWidth = 5;
	ctx.font = '20px sans-serif';
	data.box.forEach(({ x1, y1, x2, y2, prob }: Box) => {
		ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
		ctx.fillStyle = color;
		const width = ctx.measureText(`failure ${prob || 0}%`).width;
		ctx.fillRect(x1, y1, width + 10, 25);
		ctx.fillStyle = '#000000';
		ctx.fillText(`failure ${prob || 0}%`, x1, y1 + 18);
	});
	return canvas.toBuffer('image/jpeg');
};

const notifyDiscord = async (data: InferenceDataBuffer) => {
	const webhookClient = new WebhookClient({ url: config.DiscordWebhookURL });
	const boxes = data.box;

	const notifyEmbed = new EmbedBuilder()
		.setTitle('Spaghetti Detected!')
		.setDescription(
			`Detected ${boxes.length} spaghetti instance${boxes.length === 1 ? '' : 's'} ≤ ${
				boxes[0]?.prob || 0
			}%`
		)
		.setTimestamp()
		.setImage('attachment://spaghetti.jpg')
		.setColor((config.BrandColor as HexColorString) || '#f97316');

	await webhookClient.send({
		embeds: [notifyEmbed],
		files: [
			{
				attachment: data.buffer,
				name: 'spaghetti.jpg'
			}
		],
		content:
			config.DiscordUserPingEnabled && config.DiscordUserPing
				? `<@${config.DiscordUserPing}>`
				: undefined
	});
};

const notifyMoonraker = async (url: string) => {
	const response = await fetch(new URL('/printer/print/pause', url), {
		method: 'POST',
		signal: AbortSignal.timeout(5000)
	});
	if (!response.ok) {
		throw new Error(`Moonraker pause returned ${response.status}`);
	}
};
