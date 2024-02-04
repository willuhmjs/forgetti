import { writable } from 'svelte/store';
import fs from 'fs';
import type { Config } from '$lib/types';
import configExample from '../../../config.example.json?raw';

let currentConfig: Config;

if (!fs.existsSync('./config.json')) {
	fs.writeFileSync('./config.json', configExample, 'utf-8');
	currentConfig = JSON.parse(configExample);
} else {
	currentConfig = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

	const defaultConfig = JSON.parse(configExample);
	let isConfigUpdated = false;
	for (const key in defaultConfig) {
		if (currentConfig[key] === undefined) {
			currentConfig[key] = defaultConfig[key];
			isConfigUpdated = true;
		}
	}

	if (isConfigUpdated) {
		fs.writeFileSync('./config.json', JSON.stringify(currentConfig, null, 2), 'utf-8');
	}
}

export default writable<Config>(currentConfig);
