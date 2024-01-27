import axios, { type AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';
import si from 'systeminformation';
import configStore from '$lib/configStore';
import server from '$lib/server/wsServer';
import { detectObjects, latestDetection } from '$lib/server/model';
import type { Readable } from 'stream';
import { get } from 'svelte/store';
import { exec } from 'child_process';

let currentCameraPromiseDirty = Symbol();
let currentConfig = get(configStore);
startStream(currentConfig);

function execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Command execution failed: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Command execution failed with stderr: ${stderr}`);
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
				netRX: (netStats.rx_bytes / 1000),
				netTX: (netStats.tx_bytes / 1000),
				loadPercent: Math.round(loadPercent)
			})
		);
	}, 1000);

	const commands = ["git pull", "pnpm install", "pnpm build", "sudo systemctl restart forgetti"]
	socket.on("message", async (data) => {
		const jsonData = JSON.parse(data.toString());
		if (jsonData.purpose === "update") {
			for (const command of commands) {
			try {
					const output = await execCommand(command);
					socket.send(JSON.stringify({
						purpose: "logs",
						message: output,
						command: command,
						type: "success"
					}))
				} catch (error) {
					socket.send(JSON.stringify({
						purpose: "logs",
						message: error,
						command: command,
						type: "error"
					}))
				}
				}
		}
		
	})
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


