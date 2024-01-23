import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import type { RequestHandler } from './$types';
import os from 'os'; // import os module

export const POST: RequestHandler = async ({ request }) => {
	const { command } = await request.json();
	switch (command) {
		case 'shutdown':
			if (os.platform() === 'win32') {
				exec('shutdown /s /t 0', (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				});
			} else {
				exec('sudo shutdown -h now', (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				});
			}
			break;
		case 'restart':
			if (os.platform() === 'win32') {
				exec('shutdown /r /t 0', (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				});
			} else {
				exec('sudo shutdown -r now', (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				});
			}
			break;
	}
	return json({
		success: true
	});
};
