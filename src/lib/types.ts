type ResponseType = 'error' | 'success';

export interface Box {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	prob?: number;
}

export interface InferenceData {
	box: Box[];
	buffer: string;
	printer: Printer;
}

export interface DetectionHistoryEntry {
	timestamp: string;
	printerName: string;
	confidence: number;
	boxCount: number;
}

export interface Printer {
	Name: string;
	CameraURL: string;
	WebcamAuthEnabled: boolean;
	CameraUsername: string;
	CameraPassword: string;
	MoonrakerEnabled: boolean;
	MoonrakerURL: string;
	MoonrakerPauseThreshold: number;
}

export interface Config {
	Enabled: boolean;
	ConfidenceThreshold: number;
	Model: 'nano' | 'small';
	ReportCooldown: string;
	BrandColor: string;
	DiscordWebhookEnabled: boolean;
	DiscordWebhookURL: string;
	DiscordUserPingEnabled: boolean;
	DiscordUserPing: string;
	MaxCPU: number;
	Coordinates: Coordinates[];
	Printers: Printer[];
	DetectionHistory: DetectionHistoryEntry[];
}

export interface Coordinates {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

export interface SystemResponsePacket {
	lowPowerMode: boolean;
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
	purpose: 'inference';
}

export interface AppUpdateResponsePacket {
	purpose: 'appUpdate';
	message: string;
	command: string;
	type: ResponseType;
	toastable: boolean;
	time: string;
}

export interface ConfigUpdateResponsePacket {
	message: string;
	type: ResponseType;
	purpose: 'configUpdate';
	config?: Config;
}

interface PrintStats {
	filename: string;
	total_duration: number;
	print_duration: number;
	filament_used: number;
	state: string;
	message: string;
}

export interface MoonrakerResponsePacket extends Partial<PrintStats> {
	purpose: 'moonraker';
	type: ResponseType;
}

export interface AppUpdateRequestPacket {
	purpose: 'appUpdate';
}

export interface ConfigUpdateRequestPacket {
	purpose: 'configUpdate';
	config: Partial<Config>;
	coordinates?: Coordinates[];
}
