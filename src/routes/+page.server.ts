import keyv from '$lib/server/db';
import defaultcfg from '$lib/defaultcfg.js';

export const load = async () => {
	const config = await keyv.get("config") || defaultcfg;
	return { config, success: true };
};

export const actions = {
	config: async ({ request }) => {
		const config = await request.json();
		await keyv.set("config", config);
		return { success: true, config };
	},
};

