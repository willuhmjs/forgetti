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
    exec('sh update.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}