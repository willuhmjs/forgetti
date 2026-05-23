import { json } from '@sveltejs/kit';
import { execFile } from 'child_process';
import type { RequestHandler } from './$types';
import os from 'os';

const ALLOWED_COMMANDS = ['Shutdown', 'Restart'] as const;
type PowerCommand = (typeof ALLOWED_COMMANDS)[number];

function isValidCommand(command: unknown): command is PowerCommand {
	return typeof command === 'string' && ALLOWED_COMMANDS.includes(command as PowerCommand);
}

function execPowerCommand(command: PowerCommand): Promise<string> {
	return new Promise((resolve, reject) => {
		const isWindows = os.platform() === 'win32';
		let bin: string;
		let args: string[];

		if (command === 'Shutdown') {
			bin = isWindows ? 'shutdown' : 'sudo';
			args = isWindows ? ['/s', '/t', '0'] : ['shutdown', '-h', 'now'];
		} else {
			bin = isWindows ? 'shutdown' : 'sudo';
			args = isWindows ? ['/r', '/t', '0'] : ['shutdown', '-r', 'now'];
		}

		execFile(bin, args, (error, stdout, stderr) => {
			if (error) {
				reject(error.message);
				return;
			}
			resolve(stdout || 'Command executed');
		});
	});
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!isValidCommand(body?.command)) {
		return json({ success: false, message: 'Invalid command' }, { status: 400 });
	}

	try {
		await execPowerCommand(body.command);
	} catch {
		// Power commands may kill the process before responding
	}

	return json({
		success: true,
		message: `${body.command} signal received!`
	});
};
