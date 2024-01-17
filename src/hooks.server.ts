import axios, { AxiosRequestConfig } from 'axios';
import MjpegConsumer from 'mjpeg-consumer';
import config from "$config";
import server from "$lib/server/ws";
import { detectObjects, latestDetection } from '$lib/server/model';

server.on("connection", socket => {
    latestDetection.subscribe((val) => {
        socket.send(JSON.stringify(val));
    });

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

    axios(requestConfig).then(response => {
        const stream = response.data.pipe(mjpegConsumer);

        stream.on('data', (frame: Buffer) => {
            if (frame && !processing) {
                try {
                    process(frame);
                } catch (e) {
                    console.error(e);
                }
            }
        });

            
    }).catch(error => {
        console.error(error);
    }); 
});