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