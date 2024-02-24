import axios, { type AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';
import detectionHandler from '$lib/server/detectionHandler';
import si from 'systeminformation';
import configStore from '$lib/server/configStore';
import ms from 'ms';
import server from '$lib/server/wsServer';
import { detectObjects, latestDetection } from '$lib/server/model';
import type { Readable } from 'stream';
import { get } from 'svelte/store';
import { exec } from 'child_process';
import { dev } from '$app/environment';
import type { AppUpdateRequestPacket, AppUpdateResponsePacket } from '$lib/types';

let lastReport = 0;
let currentCameraPromiseDirty = Symbol();
let currentConfig = get(configStore);
startStream(currentConfig);

function execCommand(command: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.log(error.message);
				reject(error.message);
				return;
			}
			if (stderr) {
				console.log(stderr);
				reject(stderr);
				return;
			}
			console.log(stdout);
			resolve(stdout);
		});
	});
}

server.on('connection', (socket) => {
	latestDetection.subscribe((val) => {
		socket.send(JSON.stringify({ purpose: 'inference', ...val }));
	});

	// send os data to client

	setInterval(async () => {
		const osInfo = await si.osInfo();
		const loadPercent = (await si.currentLoad()).currentLoad;
		const mem = await si.mem(); // .used / .total * 100
		const cpuTemp = await si.cpuTemperature(); // .main + .max
		const netStats = (await si.networkStats())[0];
		socket.send(
			JSON.stringify({
				purpose: 'system',
				distro: osInfo.distro,
				platform: osInfo.platform,
				release: osInfo.release,
				codename: osInfo.codename,
				kernel: osInfo.kernel,
				memPercent: Math.round((mem.used / mem.total) * 100),
				cpuTemp: Math.round(cpuTemp.main) || 0,
				netiface: netStats.iface,
				netRX: netStats.rx_bytes / 1000,
				netTX: netStats.tx_bytes / 1000,
				loadPercent: Math.round(loadPercent)
			})
		);
	}, 1000);

	const commands = [
		'git pull',
		'pnpm install --frozen-lockfile',
		'pnpm build',
		'sudo systemctl restart forgetti'
	];
	const toastableLogs = [/Current branch main is up to date/, /Already up to date/];
	socket.on('message', async (data) => {
		const requestPacket: AppUpdateRequestPacket = JSON.parse(data.toString());
		if (requestPacket.purpose === 'appUpdate') {
			if (dev)
				return socket.send(
					JSON.stringify({
						purpose: 'appUpdate',
						message: 'Cannot update while in developer mode!',
						command: 'meta',
						type: 'error',
						toastable: true,
						time: new Date().toLocaleTimeString('en-US')
					} as AppUpdateResponsePacket)
				);
			for (const command of commands) {
				try {
					socket.send(
						JSON.stringify({
							purpose: 'appUpdate',
							message: 'Executing...',
							command: command,
							type: 'success',
							toastable: false,
							time: new Date().toLocaleTimeString('en-US')
						})
					);
					const output = await execCommand(command);
					let matchesToastable = false;
					if (command === 'git pull') {
						for (const toastable of toastableLogs) {
							if (toastable.test(output)) {
								matchesToastable = true;
								break;
							}
						}
					}
					socket.send(
						JSON.stringify({
							purpose: 'appUpdate',
							message: output,
							command: command,
							type: 'success',
							toastable: matchesToastable,
							time: new Date().toLocaleTimeString('en-US')
						} as AppUpdateResponsePacket)
					);
					if (matchesToastable) break;
				} catch (error) {
					socket.send(
						JSON.stringify({
							purpose: 'appUpdate',
							message: error,
							command: command,
							type: 'error',
							toastable: false,
							time: new Date().toLocaleTimeString('en-US')
						} as AppUpdateResponsePacket)
					);
				}
			}
		}
	});
});

latestDetection.subscribe((data) => {
	if (
		data?.box?.[0]?.prob > currentConfig.ConfidenceThreshold &&
		Date.now() - lastReport > ms(currentConfig.ReportCooldown)
	) {
		lastReport = Date.now();
		detectionHandler(data);
	}
});

async function startStream(config: any) {
	const trackedSymbol = currentCameraPromiseDirty;
	const mjpegConsumer = new MjpegConsumer();

	const requestConfig: AxiosRequestConfig = {
		url: config.CameraURL,
		responseType: 'stream'
	};

	let processing = false;
	const process = async (frameBuffer: Buffer) => {
		processing = true;
		await detectObjects(frameBuffer);
		processing = false;
	};

	try {
		const response = await axios(requestConfig);
		const stream: Readable = response.data.pipe(mjpegConsumer);

		stream.on('data', (frame: Buffer) => {
			if (frame && !processing) {
				try {
					process(frame);
				} catch (e) {
					console.error(e);
				}
			}

			if (currentCameraPromiseDirty != trackedSymbol) {
				stream.destroy();
				return;
			}
		});
	} catch (e) {
		console.error(e);
	}
}

configStore.subscribe((config) => {
	// A new symbol should be generated (aka stream stopped) if either the config.Enabled property is false or the new cameraURL is different from the old cameraURL
	// A new stream should be started if either the config.Enabled property goes from false to true OR the CameraURL value updates WHILE config.Enabled is true
	if (!config.Enabled || currentConfig.CameraURL != config.CameraURL)
		currentCameraPromiseDirty = Symbol();
	const enabledFalseToTrue = !currentConfig.Enabled && config.Enabled;
	const cameraURLChangedWhileEnabled =
		currentConfig.CameraURL != config.CameraURL && config.Enabled;
	if (enabledFalseToTrue || cameraURLChangedWhileEnabled) startStream(config);
	currentConfig = config;
});
