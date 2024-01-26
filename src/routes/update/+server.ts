import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

import { exec } from "child_process";

export const POST: RequestHandler = async ({ request }) => {
    update();
	return json({
		success: true
	});

};

async function update() {
    // todo impl
}