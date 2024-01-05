import axios from 'axios';
import MjpegConsumer from 'mjpeg-consumer';

import server from "$lib/server/ws";
import { detectObjects, latestDetection } from '$lib/server/model';

let counter = 0;

server.on("connection", socket => {
    latestDetection.subscribe((val) => {
        socket.send(JSON.stringify(val));
    });

    const mjpegConsumer = new MjpegConsumer();

    const requestConfig = {
        url: 'http://localhost:8080/stream',
        responseType: 'stream',
    };

    axios(requestConfig).then(response => {
        response.data.pipe(mjpegConsumer)
            .on('data', async (frame: Buffer) => {
                counter++;
                if (counter % 2 === 0) {
                    await detectObjects(frame);
                }
            });
    }).catch(error => {
        console.error(error);
    });
});