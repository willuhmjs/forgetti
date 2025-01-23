import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { LogExportRequestPacket } from '$lib/types';
import { exportLogsToFile, exportLogsToDiscord } from '$lib/server/logsHandler';

export const POST: RequestHandler = async ({ request }) => {
	const requestPacket = (await request.json()) as LogExportRequestPacket;
	const { logs } = requestPacket;

	try {
		// Export logs to file
		const logFilePath = exportLogsToFile(logs);

		// Export logs to Discord if enabled
		await exportLogsToDiscord(logs);

		return json({
			message: 'Logs exported successfully!',
			type: 'success',
			logFilePath
		});
	} catch (error: any) {
		return json({
			message: error.message || error,
			type: 'error'
		});
	}
};
