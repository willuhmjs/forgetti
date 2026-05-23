declare module 'onnxruntime-node' {
	export class InferenceSession {
		static create(path: string): Promise<InferenceSession>;
		run(feeds: Record<string, Tensor>): Promise<Record<string, Tensor>>;
	}
	export class Tensor {
		constructor(data: Float32Array, dims: number[]);
		data: any[];
	}
}

declare module 'mjpeg-consumer';
