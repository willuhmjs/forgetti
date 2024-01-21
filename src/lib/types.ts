export interface Box {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	prob: number;
}

export interface InferenceData {
	box: Box[];
	buffer: string;
}


export interface Config {
    Enabled: boolean
    CameraURL: string,
	ConfidenceThreshold: number
}