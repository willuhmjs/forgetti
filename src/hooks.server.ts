import axios, { type AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';
import detectionHandler from '$lib/server/detectionHandler';
import si from 'systeminformation';
import configStore from '$lib/server/configStore';
import ms from 'ms';
import server from '$lib/server/wsServer';
import { detectObjects, latestDetection, initializeModel } from '$lib/server/model';
import type { Readable } from 'stream';
import type { Box } from '$lib/types';
import { get } from 'svelte/store';
import { exec } from 'child_process';
import { dev } from '$app/environment';
import type { AppUpdateRequestPacket, AppUpdateResponsePacket } from '$lib/types';
import { doCoordinatesIntersect, getImageDimensions, translateCoordinatesArray } from '$lib/server/imageUtils';

let lastReport = 0;
let currentCameraPromiseDirty = Symbol();
let currentConfig = get(configStore);
if (currentConfig.Enabled) startStream(currentConfig);

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

let lastCPUReading = 0;

server.on('connection', (socket) => {
	latestDetection.subscribe((val) => {
		socket.send(JSON.stringify({ purpose: 'inference', ...val }));
	});

	// send os data, moonraker data to client

	setInterval(async () => {
		const osInfo = await si.osInfo();
		const loadPercent = (await si.currentLoad()).currentLoad;
		const mem = await si.mem(); // .used / .total * 100
		const cpuTemp = await si.cpuTemperature(); // .main + .max
		const netStats = (await si.networkStats())[0];
		lastCPUReading = loadPercent
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

	setInterval(async () => {
		if (!currentConfig.MoonrakerURL || !currentConfig.MoonrakerEnabled) return;
		const url = new URL('/printer/objects/query?print_stats', currentConfig.MoonrakerURL);
		try {
			const response = await fetch(url.href);
			const latestStats = (await response.json()).result.status.print_stats;
			socket.send(
				JSON.stringify({
					purpose: 'moonraker',
					type: 'success',
					...latestStats
				})
			);
		} catch (e: any) {
			socket.send(
				JSON.stringify({
					purpose: 'moonraker',
					type: 'error',
					message: (e?.message || e) as string
				})
			);
			console.error(e);
		}
	}, 1000);

	const commands = ['git pull', 'pnpm install --frozen-lockfile', 'pnpm build'];
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
			let errored = false;
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
					errored = true;
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
			if (errored) return;
			socket.send(
				JSON.stringify({
					purpose: 'appUpdate',
					message: 'Restarting app...',
					command: 'meta',
					type: 'success',
					toastable: true,
					time: new Date().toLocaleTimeString('en-US')
				})
			);
			process.exit(1);
		}
	});
});

latestDetection.subscribe(async (data) => {
	const boundingBoxes = currentConfig.Coordinates;
	if (!data?.buffer) return;
	const { width, height } = await getImageDimensions(data.buffer);
	
	const adjustedCoordinates = currentConfig.Coordinates.length > 0 ? translateCoordinatesArray(boundingBoxes, width, 640) : [{
		x1: 0,
		y1: 0,
		x2: width || 0,
		y2: height || 0
		}
	];
	const dci = doCoordinatesIntersect(adjustedCoordinates, data?.box || [])
	if (
		dci &&
		Date.now() - lastReport > ms(currentConfig.ReportCooldown)
	) {
		console.log('Detected object in zone');
		lastReport = Date.now();
		detectionHandler(data);
	}
});

async function startStream(config: any) {
	await initializeModel();
	const trackedSymbol = currentCameraPromiseDirty;
	const mjpegConsumer = new MjpegConsumer();
	const requestConfig: AxiosRequestConfig = {
		url: config.CameraURL,
		responseType: 'stream',
		headers: {
			Authorization: `Basic ${Buffer.from(
				`${config.CameraUsername}:${config.CameraPassword}`
			).toString('base64')}`
		}
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

		stream.on('data', async (frame: Buffer) => {
			if (frame && !processing) {
				try {
					
					if (lastCPUReading > currentConfig.MaxCPU) return;
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
	if (
		!config.Enabled ||
		currentConfig.CameraURL != config.CameraURL ||
		currentConfig.Model != config.Model
	)
		currentCameraPromiseDirty = Symbol();
	const enabledFalseToTrue = !currentConfig.Enabled && config.Enabled;
	const cameraURLChangedWhileEnabled =
		currentConfig.CameraURL != config.CameraURL && config.Enabled;
	const modelChangedWhileEnabled = currentConfig.Model != config.Model && config.Enabled;
	if (enabledFalseToTrue || cameraURLChangedWhileEnabled || modelChangedWhileEnabled)
		startStream(config);
	currentConfig = config;
});
