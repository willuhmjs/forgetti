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
    exec("git pull && pnpm install && pnpm build && sudo systemctl restart forgetti", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}