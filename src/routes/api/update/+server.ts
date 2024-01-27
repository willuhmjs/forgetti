import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from "child_process";

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
    try {
        const message = await update();
        return json(message);
    } catch (error) {
        return json({ success: false, message: error.message });
    }
};

function execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Command execution failed: ${error.message}`));
                return;
            }
            if (stderr) {
                reject(new Error(`Command execution failed with stderr: ${stderr}`));
                return;
            }
            resolve(stdout);
        });
    });
}

async function update(): Promise<{ success: boolean, message: string }> {
    try {
        const pullOutput = await execCommand("git pull -q");
        await execCommand("pnpm install");
        await execCommand("pnpm build");
        await execCommand("sudo systemctl restart forgetti");
        return { success: true, message: "Reloading application..." };
    } catch (error) {
        throw new Error(`Update failed: ${error.message}`);
    }
}