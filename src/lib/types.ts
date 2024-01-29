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
		Enabled: boolean;
		CameraURL: string;
		ConfidenceThreshold: number;
		BrandColor: string;
}

// response packets
export interface SystemResponsePacket {
	purpose: 'system';
	distro: string;
	platform: string;
	release: string;
	codename: string;
	kernel: string;
	memPercent: number;
	cpuTemp: number;
	netiface: string;
	netRX: number;
	netTX: number;
	loadPercent: number;
}

export interface InferenceResponsePacket extends InferenceData {
	purpose: 'inference'
}