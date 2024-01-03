import detectObjects from "$lib/server/model";

// TODO impl; detectObjects(Buffer)
import http from 'http';

http.get('http://192.168.50.236:8080/stream', (res) => {
  let imageBuffer = Buffer.alloc(0);

  res.on('data', async (chunk) => {
    imageBuffer = Buffer.concat([imageBuffer, chunk]);

    const start = imageBuffer.indexOf(Buffer.from([0xFF, 0xD8]));
    const end = imageBuffer.indexOf(Buffer.from([0xFF, 0xD9]));

    if (start !== -1 && end !== -1) {
        const image = imageBuffer.subarray(start, end + 2); imageBuffer = imageBuffer.subarray(end + 2);
        const detection = await detectObjects(image);
        console.log(detection)    
    }
  });
});