import { error } from '@sveltejs/kit';
import fs from "fs";
import config from "$config";
export function load() {
	return config;
}

export const actions = {
    configure: async ({ request }) => {
        const raw_config = await request.formData();
        const config = Object.fromEntries([...raw_config.entries()]);
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2)); 
        return true;
    }
}