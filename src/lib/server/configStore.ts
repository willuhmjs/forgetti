import { writable } from 'svelte/store';
import fs from 'fs';
import type { Config } from '$lib/types';
import configExample from '../../../config.example.json?raw';

const defaultConfig: Config = JSON.parse(configExample);
let currentConfig: Config;

if (!fs.existsSync('./config.json')) {
	fs.writeFileSync('./config.json', configExample, 'utf-8');
	currentConfig = { ...defaultConfig };
} else {
	try {
		currentConfig = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
	} catch {
		console.error('Invalid config.json, resetting to defaults');
		currentConfig = { ...defaultConfig };
		fs.writeFileSync('./config.json', JSON.stringify(currentConfig, null, 2), 'utf-8');
	}

	let isConfigUpdated = false;
	const configRecord = currentConfig as unknown as Record<string, unknown>;
	const defaultRecord = defaultConfig as unknown as Record<string, unknown>;
	for (const key in defaultRecord) {
		if (configRecord[key] === undefined) {
			configRecord[key] = defaultRecord[key];
			isConfigUpdated = true;
		}
	}

	if (isConfigUpdated) {
		fs.writeFileSync('./config.json', JSON.stringify(currentConfig, null, 2), 'utf-8');
	}
}

export default writable<Config>(currentConfig);
