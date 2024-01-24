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
	General: {
		Enabled: boolean;
		CameraURL: string;
		ConfidenceThreshold: number;
	};
	Hidden: {
		BrandColor: string;
	};
}

export interface SystemInfo {
	purpose: "system";
	distro: string;
	platform: string;
	release: string;
	memPercent: number;
	cpuTemp: number;
	cpuTempMax: number;
	netiface: string;
	netRX: number;
	netTX: number;
	loadPercent: number;
}