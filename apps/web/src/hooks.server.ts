import axios, { type AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';

import server from "$lib/server/ws";
import { detectObjects, latestDetection } from '$lib/server/model';
import {  } from 'axios';

let counter = 0;
let isProcessing = false;

server.on("connection", socket => {
    latestDetection.subscribe((val) => {
        socket.send(JSON.stringify(val));
    });

    const mjpegConsumer = new MjpegConsumer();

	const requestConfig: AxiosRequestConfig = {
		url: 'http://localhost:8080/stream',
		responseType: 'stream',
	};

	axios(requestConfig).then(response => {
        const stream = response.data.pipe(mjpegConsumer);
        stream.on('data', async (frame: Buffer) => {
            counter++;
            if (counter % 2 === 0 && !isProcessing) {
                try {
                    isProcessing = true;
                    await detectObjects(frame);
                    counter = 0;
                } catch (e) {
                    console.error(e);
                } finally {
                    isProcessing = false;
                }
            }
        });
    }).catch(error => {
        console.error(error);
    });
});