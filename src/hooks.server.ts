import axios, { type AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';
import si from "systeminformation";
import configStore from '$lib/configStore';
import server from '$lib/server/ws';
import { detectObjects, latestDetection } from '$lib/server/model';
import type { Readable } from 'stream';
import { get } from 'svelte/store';

let currentCameraPromiseDirty = Symbol();
let currentConfig = get(configStore);
startStream(currentConfig);

server.on('connection', (socket) => {
	latestDetection.subscribe((val) => {
		socket.send(JSON.stringify({purpose: "inference", ...val}));
	});

	// send os data to client
	setInterval(async () => {
		const osData = {
			OS: await si.osInfo(),
			Load: await si.currentLoad(),
			Mem: await si.mem(),
			Temp: await si.cpuTemperature(),
			Network: await si.networkInterfaces().then(interfaces => 
				interfaces.map(iface => ({
					iface: iface.iface,
					ip4: iface.ip4,
					stats: si.networkStats(iface.iface)
				}))
			)
		};
		console.log(osData);
	}, 1000)
});

latestDetection.subscribe((val) => {
	if (val?.box?.length) console.log(val.box);
});

async function startStream(config: any) {
	const trackedSymbol = currentCameraPromiseDirty;
	const mjpegConsumer = new MjpegConsumer();

	const requestConfig: AxiosRequestConfig = {
		url: config.General.CameraURL,
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
	if (!config.General.Enabled || currentConfig.General.CameraURL != config.General.CameraURL)
		currentCameraPromiseDirty = Symbol();
	const enabledFalseToTrue = !currentConfig.General.Enabled && config.General.Enabled;
	const cameraURLChangedWhileEnabled =
		currentConfig.General.CameraURL != config.General.CameraURL && config.General.Enabled;
	if (enabledFalseToTrue || cameraURLChangedWhileEnabled) startStream(config);
	currentConfig = config;
});
