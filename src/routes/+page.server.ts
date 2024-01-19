import { error } from '@sveltejs/kit';
import fs from 'fs';
import configStore from '$lib/configStore';
import { get } from 'svelte/store';

export function load() {
	return get(configStore);
}

export const actions = {
	configure: async ({ request }) => {
		const raw_config = await request.formData();
		const config = Object.fromEntries([...raw_config.entries()]);
		fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
		configStore.set(config);
		return true;
	}
};
