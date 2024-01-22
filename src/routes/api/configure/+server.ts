import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import configStore from '$lib/configStore';

export const POST: RequestHandler = async ({ request }) => {
	const config = await request.json();
	fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
	configStore.set(config);
	return json({
		success: true
	})
}

export const PUT: RequestHandler = async ({request}) => {
	const { category, key, value } = await request.json();
	const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
	config[category][key] = value;
	fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
	configStore.set(config);
	return json({
		success: true
	})
}