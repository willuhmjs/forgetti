import axios, { AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';

import server from "$lib/server/ws";
import { detectObjects, latestDetection } from '$lib/server/model';

let counter = 0;

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
        let frameBuffer: Buffer | null = null;

        stream.on('data', (frame: Buffer) => {
            frameBuffer = frame;
        });

        setInterval(async () => {
            if (frameBuffer) {
                try {
                    await detectObjects(frameBuffer);
                    counter = 0;
                } catch (e) {
                    console.error(e);
                }
                frameBuffer = null;
            }
        }, 1000); // process frame every 1000ms (1 second)
    }).catch(error => {
        console.error(error);
    });
});