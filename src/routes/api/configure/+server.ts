import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import configStore from '$lib/configStore';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
	const newConfig = {
		...config,
		...data
	};
	fs.writeFileSync('./config.json', JSON.stringify(newConfig, null, 2));
	configStore.set(newConfig);
	return json({
		success: true
	});
};
