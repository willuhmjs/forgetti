import axios, { type AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';
import configStore from "$lib/configStore";
import server from "$lib/server/ws";
import { detectObjects, latestDetection } from '$lib/server/model';
import type { Readable } from 'stream';
import { get } from 'svelte/store';

let currentCameraPromiseDirty: Symbol | null;
let currentConfig = get(configStore);

server.on("connection", socket => {
    latestDetection.subscribe((val) => {
        socket.send(JSON.stringify(val));
    });
})

async function startStream(config: any) {
    const trackedSymbol = currentCameraPromiseDirty;
    const mjpegConsumer = new MjpegConsumer();

    const requestConfig: AxiosRequestConfig = {
        url: config['CameraURL'],
        responseType: 'stream',
    };

    let processing = false;
    const process = async (frameBuffer: Buffer) => {
        processing = true;
        await detectObjects(frameBuffer);
        processing = false;
    }

    try {
        const response = await axios(requestConfig)
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

configStore.subscribe(config => {
    if (currentConfig.CameraURL != config.CameraURL) currentCameraPromiseDirty = Symbol(Math.random().toString());
    startStream(config)
});
