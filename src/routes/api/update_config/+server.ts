import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Config, ConfigUpdateRequestPacket, ConfigUpdateResponsePacket } from '$lib/types';
import fs from 'fs';
import configStore from '$lib/server/configStore';

const DISCORD_WEBHOOK_PATTERN = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

function isValidUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return ['http:', 'https:'].includes(parsed.protocol);
	} catch {
		return false;
	}
}

function validateConfig(config: Partial<Config>): string | null {
	if (config.ConfidenceThreshold !== undefined) {
		if (typeof config.ConfidenceThreshold !== 'number' || config.ConfidenceThreshold < 1 || config.ConfidenceThreshold > 100) {
			return 'ConfidenceThreshold must be a number between 1 and 100';
		}
	}

	if (config.MaxCPU !== undefined) {
		if (typeof config.MaxCPU !== 'number' || config.MaxCPU < 1 || config.MaxCPU > 100) {
			return 'MaxCPU must be a number between 1 and 100';
		}
	}

	if (config.Model !== undefined) {
		if (!['nano', 'small'].includes(config.Model)) {
			return 'Model must be "nano" or "small"';
		}
	}

	if (config.DiscordWebhookURL !== undefined && config.DiscordWebhookURL !== '') {
		if (!DISCORD_WEBHOOK_PATTERN.test(config.DiscordWebhookURL)) {
			return 'Invalid Discord webhook URL format';
		}
	}

	if (config.BrandColor !== undefined) {
		if (typeof config.BrandColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(config.BrandColor)) {
			return 'BrandColor must be a valid hex color (e.g. #f97316)';
		}
	}

	if (config.Printers !== undefined) {
		if (!Array.isArray(config.Printers)) return 'Printers must be an array';
		for (const printer of config.Printers) {
			if (!printer.Name || typeof printer.Name !== 'string' || printer.Name.length > 64) {
				return 'Printer name must be a string under 64 characters';
			}
			if (printer.CameraURL && !isValidUrl(printer.CameraURL)) {
				return `Invalid camera URL for printer "${printer.Name}"`;
			}
			if (printer.MoonrakerURL && !isValidUrl(printer.MoonrakerURL)) {
				return `Invalid Moonraker URL for printer "${printer.Name}"`;
			}
			if (printer.MoonrakerPauseThreshold !== undefined) {
				if (typeof printer.MoonrakerPauseThreshold !== 'number' || printer.MoonrakerPauseThreshold < 1 || printer.MoonrakerPauseThreshold > 100) {
					return 'MoonrakerPauseThreshold must be between 1 and 100';
				}
			}
		}
	}

	return null;
}

export const POST: RequestHandler = async ({ request }) => {
	const requestPacket = (await request.json()) as ConfigUpdateRequestPacket;

	const validationError = validateConfig(requestPacket.config);
	if (validationError) {
		return json({
			message: validationError,
			type: 'error',
			purpose: 'configUpdate'
		} as ConfigUpdateResponsePacket);
	}

	try {
		const currentConfig = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

		const newConfig = {
			...currentConfig,
			...requestPacket.config
		};
		fs.writeFileSync('./config.json', JSON.stringify(newConfig, null, 2));
		configStore.set(newConfig);
		return json({
			message: 'Configuration updated successfully!',
			type: 'success',
			purpose: 'configUpdate',
			config: newConfig
		} as ConfigUpdateResponsePacket);
	} catch (error: any) {
		return json({
			message: error.message || error,
			type: 'error',
			purpose: 'configUpdate'
		} as ConfigUpdateResponsePacket);
	}
};
