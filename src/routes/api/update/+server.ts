import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from "child_process";
export const POST: RequestHandler = async ({ request }) => {
    update();
	return json({
		success: true
	});

};


function execCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    });
}

async function update() {
    try {
        await execCommand("git pull");
        await execCommand("pnpm install");
        await execCommand("pnpm build");
        await execCommand("sudo systemctl restart forgetti");
    } catch (error) {
        console.error(`Execution error: ${error}`);
    }
}