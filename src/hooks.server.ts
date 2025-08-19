import axios, { type AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';
import detectionHandler from '$lib/server/detectionHandler';
import si, { battery } from 'systeminformation';
import configStore from '$lib/server/configStore';
import ms from 'ms';
import server from '$lib/server/wsServer';
import { detectObjects, latestDetection, initializeModel } from '$lib/server/model';
import type { Readable } from 'stream';
import type { Box, Printer } from '$lib/types';
import { get } from 'svelte/store';
import { exec } from 'child_process';
import { dev } from '$app/environment';
import type { AppUpdateRequestPacket, AppUpdateResponsePacket } from '$lib/types';
import { doCoordinatesIntersect, getImageDimensions, translateCoordinatesArray } from '$lib/server/imageUtils';

let lastReport = 0;
let currentConfig = get(configStore);
const streams = new Map<string, { symbol: symbol; stream: Readable }>();

if (currentConfig.Enabled) {
	for (const printer of currentConfig.Printers) {
		startStream(printer);
	}
}

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
let lowPowerMode = false;

async function checkBatteryStatus() {
	const batteryInfo = await battery();
	if (batteryInfo.hasBattery && batteryInfo.percent < 20) {
		lowPowerMode = true;
	} else {
		lowPowerMode = false;
	}
}

server.on('connection', (socket) => {
	latestDetection.subscribe((val) => {
		socket.send(JSON.stringify({ purpose: 'inference', ...val }));
	});

	// send os data, moonraker data to client

	setInterval(async () => {
		await checkBatteryStatus();
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
				loadPercent: Math.round(loadPercent),
				lowPowerMode: lowPowerMode
			})
		);
	}, lowPowerMode ? 5000 : 1000);


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
	if (!width || !height) return;
	const adjustedCoordinates = currentConfig.Coordinates.length > 0 ? translateCoordinatesArray(boundingBoxes, width, 640) : [{
		x1: 0,
		y1: 0,
		x2: width,
		y2: height
		}
	];
	const dci = doCoordinatesIntersect(adjustedCoordinates, data?.box || [])
	if (
		dci &&
		Date.now() - lastReport > ms(currentConfig.ReportCooldown)
	) {
		lastReport = Date.now();
		detectionHandler(data);
	}
});

async function startStream(printer: Printer) {
	await initializeModel();
	const trackedSymbol = Symbol();
	const mjpegConsumer = new MjpegConsumer();
	const requestConfig: AxiosRequestConfig = {
		url: printer.CameraURL,
		responseType: 'stream',
		headers: {
			Authorization: `Basic ${Buffer.from(
				`${printer.CameraUsername}:${printer.CameraPassword}`
			).toString('base64')}`
		}
	};

	let processing = false;
	const process = async (frameBuffer: Buffer) => {
		processing = true;
		await detectObjects(frameBuffer, printer);
		processing = false;
	};

	try {
		const response = await axios(requestConfig);
		const stream: Readable = response.data.pipe(mjpegConsumer);

		stream.on('data', async (frame: Buffer) => {
			if (frame && !processing) {
				try {
					
					if (lastCPUReading > (lowPowerMode ? 50 : currentConfig.MaxCPU)) return;
					process(frame);
				} catch (e) {
					console.error(e);
				}
			}

			const currentStream = streams.get(printer.Name);
			if (currentStream?.symbol !== trackedSymbol) {
				stream.destroy();
				return;
			}
		});
		streams.set(printer.Name, { symbol: trackedSymbol, stream });
	} catch (e) {
		console.error(e);
	}
}

configStore.subscribe((config) => {
	if (!config.Enabled) {
		for (const [name, stream] of streams) {
			stream.stream.destroy();
			streams.delete(name);
		}
	} else {
		const oldPrinters = new Map(currentConfig.Printers.map((p) => [p.Name, p]));
		const newPrinters = new Map(config.Printers.map((p) => [p.Name, p]));

		// stop old streams
		for (const [name, printer] of oldPrinters) {
			if (!newPrinters.has(name)) {
				const stream = streams.get(name);
				if (stream) {
					stream.stream.destroy();
					streams.delete(name);
				}
			}
		}

		// start new or updated streams
		for (const [name, printer] of newPrinters) {
			const oldPrinter = oldPrinters.get(name);
			if (!oldPrinter) {
				startStream(printer);
			} else {
				if (
					oldPrinter.CameraURL !== printer.CameraURL ||
					oldPrinter.CameraUsername !== printer.CameraUsername ||
					oldPrinter.CameraPassword !== printer.CameraPassword
				) {
					const stream = streams.get(name);
					if (stream) {
						stream.stream.destroy();
						streams.delete(name);
					}
					startStream(printer);
				}
			}
		}
	}

	if (currentConfig.Model !== config.Model) {
		initializeModel();
	}

	currentConfig = config;
});
