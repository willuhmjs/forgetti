import detectObjects from '$lib/server/model';
import http from 'http';

http.get('http://localhost:8080/stream', (res) => {
	let imageBuffer = Buffer.alloc(0);

	res.on('data', async (chunk) => {
		imageBuffer = Buffer.concat([imageBuffer, chunk]);
		const start = imageBuffer.indexOf(Buffer.from([0xff, 0xd8]));
		const end = imageBuffer.indexOf(Buffer.from([0xff, 0xd9]));

		if (start !== -1 && end !== -1) {
			const image = imageBuffer.subarray(start, end + 2);
			imageBuffer = imageBuffer.subarray(end + 2);
			const detection = await detectObjects(image);
			console.log(detection);
		}
	});
});
