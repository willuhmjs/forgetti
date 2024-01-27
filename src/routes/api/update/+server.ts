import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from "child_process";

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
    return update().then(message => {
		return json(message);
	});
};

function execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                reject(new Error(stderr));
                return;
            }
            resolve(stdout);
        });
    });
}

async function update(): Promise<{ success: true, message: string }> {
    return new Promise(async (resolve, reject) => {
    try {
        const pullOutput = await execCommand("git pull");
        if (!pullOutput.includes("Already up to date.")) { 
            await execCommand("pnpm install");
            await execCommand("pnpm build");
            execCommand("sudo systemctl restart forgetti");
			resolve({ success: true, message: "Reloading application..." })
        } else {
			resolve({ success: true, message: "Already up to date!" });
		}
    } catch (error) {
        console.error(error);
		reject(error);
    }
});
}