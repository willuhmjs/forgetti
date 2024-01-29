import ort from 'onnxruntime-node';
import sharp from 'sharp';
import { writable, get } from 'svelte/store';
import type { Box, InferenceData } from '$lib/types';
import configStore from '$lib/configStore';

let currentConfig = get(configStore);
configStore.subscribe((c) => (currentConfig = c));

export const latestDetection = writable<InferenceData>();

let model: ort.InferenceSession;

// Initialize the model on import
(async function initializeModel() {
	const modelUrl = 'src/model.onnx'; // replace with your model path
	model = await ort.InferenceSession.create(modelUrl);
})();

// Detects objects in an image using YOLOv8 neural network
export async function detectObjects(buf: Buffer) {
	try {
		const [input, imgWidth, imgHeight] = await prepareInput(buf);
		const output = await runModel(input);
		const processed = {
			box: processOutput(output, imgWidth, imgHeight),
			buffer: buf.toString('base64')
		};
		latestDetection.set(processed);
	} catch (e) {
		console.error(e);
	}
}

// Runs YOLOv8 model
async function runModel(input: number[]) {
	input = new ort.Tensor(Float32Array.from(input), [1, 3, 640, 640]);
	const outputs = await model.run({ images: input });
	return outputs['output0'].data;
}

// Converts image to tensor for YOLOv8
async function prepareInput(buf: Buffer): Promise<[number[], number, number]> {
	const img = sharp(buf);
	const { width: imgWidth, height: imgHeight } = await img.metadata();

	if (!imgWidth || !imgHeight) {
		throw new Error('Cannot read image metadata');
	}

	const pixels = await img
		.removeAlpha()
		.resize({ width: 640, height: 640, fit: 'fill' })
		.raw()
		.toBuffer();

	const red: number[] = [],
		green: number[] = [],
		blue: number[] = [];
	for (let index = 0; index < pixels.length; index += 3) {
		red.push(pixels[index] / 255.0);
		green.push(pixels[index + 1] / 255.0);
		blue.push(pixels[index + 2] / 255.0);
	}

	return [[...red, ...green, ...blue], imgWidth, imgHeight];
}

// Converts YOLOv8 output to array of detected objects
function processOutput(output: any[], imgWidth: number, imgHeight: number) {
	let boxes: Box[] = [];
	for (let index = 0; index < 8400; index++) {
		const [classId, prob] = [...Array(80).keys()]
			.map((col) => [col, output[8400 * (col + 4) + index]])
			.reduce((accumulator, item) => (item[1] > accumulator[1] ? item : accumulator), [0, 0]);

		if (Math.round(prob * 100) < currentConfig.ConfidenceThreshold) continue;

		const xc = output[index];
		const yc = output[8400 + index];
		const w = output[2 * 8400 + index];
		const h = output[3 * 8400 + index];
		const x1 = ((xc - w / 2) / 640) * imgWidth;
		const y1 = ((yc - h / 2) / 640) * imgHeight;
		const x2 = ((xc + w / 2) / 640) * imgWidth;
		const y2 = ((yc + h / 2) / 640) * imgHeight;
		boxes.push({ x1, y1, x2, y2, prob: Math.round(prob * 100) });
	}

	boxes = boxes.sort((box1, box2) => box2.prob - box1.prob);
	const result: Box[] = [];
	while (boxes.length > 0) {
		result.push(boxes[0]);
		boxes = boxes.filter((box) => iou(boxes[0], box) < 0.7);
	}
	return result;
}

// Calculates Intersection-over-union (IoU) for two boxes
function iou(box1: Box, box2: Box) {
	return intersection(box1, box2) / union(box1, box2);
}

// Calculates union area of two boxes
function union(box1: Box, box2: Box) {
	const box1Area = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
	const box2Area = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);
	return box1Area + box2Area - intersection(box1, box2);
}

// Calculates intersection area of two boxes
function intersection(box1: Box, box2: Box) {
	const x1 = Math.max(box1.x1, box2.x1);
	const y1 = Math.max(box1.y1, box2.y1);
	const x2 = Math.min(box1.x2, box2.x2);
	const y2 = Math.min(box1.y2, box2.y2);
	return (x2 - x1) * (y2 - y1);
}
