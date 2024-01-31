import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ConfigUpdateRequestPacket, ConfigUpdateResponsePacket } from '$lib/types';
import fs from "fs";
import configStore from '$lib/server/configStore';
export const POST: RequestHandler = async ({ request }) => {
	const requestPacket = (await request.json()) as ConfigUpdateRequestPacket;
	try {
        const currentConfig = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

        const newConfig = {
            ...currentConfig,
            ...requestPacket.config,
        };
        fs.writeFileSync('./config.json', JSON.stringify(newConfig, null, 2));
        configStore.set(newConfig);
        return json({
            message: "Configuration updated successfully!",
            type: "success",
            purpose: "configUpdate",
            config: newConfig
        } as ConfigUpdateResponsePacket )
    } catch (error: any) {
        json({
            message: error.message || error,
            type: "error",
            purpose: "configUpdate"
        } as ConfigUpdateResponsePacket )
    }
};
