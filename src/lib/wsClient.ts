import { readable, writable } from 'svelte/store';
import { transform } from 'cloud-url-resolver';
import type {
	SystemResponsePacket,
	InferenceResponsePacket,
	AppUpdateResponsePacket,
	MoonrakerResponsePacket
} from './types';

let socket: WebSocket;
let reconnectTimer: ReturnType<typeof setTimeout>;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

export const connectionState = writable<'connecting' | 'connected' | 'disconnected'>('disconnected');

export const socketStore = readable<
	SystemResponsePacket | InferenceResponsePacket | AppUpdateResponsePacket | MoonrakerResponsePacket
>(undefined, (set) => {
	if (typeof WebSocket === 'undefined') return;

	function connect() {
		connectionState.set('connecting');
		socket = new WebSocket(transform(2221, 'ws'));

		socket.addEventListener('open', () => {
			connectionState.set('connected');
			reconnectDelay = 1000;
		});

		socket.addEventListener('message', (event) => {
			set(JSON.parse(event.data));
		});

		socket.addEventListener('close', () => {
			connectionState.set('disconnected');
			scheduleReconnect();
		});

		socket.addEventListener('error', () => {
			connectionState.set('disconnected');
		});
	}

	function scheduleReconnect() {
		clearTimeout(reconnectTimer);
		reconnectTimer = setTimeout(() => {
			reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
			connect();
		}, reconnectDelay);
	}

	connect();

	return () => {
		clearTimeout(reconnectTimer);
		socket?.close();
	};
});

export const send = (message: any) => {
	if (socket?.readyState === WebSocket.OPEN) {
		socket.send(message);
	}
};
