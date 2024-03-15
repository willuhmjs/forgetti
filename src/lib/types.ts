type ResponseType = 'error' | 'success';

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
	Model: 'nano' | 'small' | 'medium';
	ReportCooldown: string;
	BrandColor: string;
	DiscordWebhookEnabled: boolean;
	DiscordWebhookURL: string;
	DiscordUserPingEnabled: boolean;
	DiscordUserPing: string;
	MoonrakerEnabled: boolean;
	MoonrakerURL: string;
	MoonrakerPauseThreshold: number;
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

interface printStats {
	filename: string;
	total_duration: number;
	print_duration: number;
	filament_used: number;
	state: string;
	message: string;
}

export interface MoonrakerResponsePacket extends Partial<printStats> {
	purpose: 'moonraker';
	type: ResponseType;
}

// request packets
export interface AppUpdateRequestPacket {
	purpose: 'appUpdate';
}

export interface ConfigUpdateRequestPacket {
	purpose: 'configUpdate';
	config: Partial<Config>;
}
