import { readable } from 'svelte/store';
import { transform } from 'cloud-url-resolver';
import type {
	SystemResponsePacket,
	InferenceResponsePacket,
	AppUpdateResponsePacket,
	MoonrakerResponsePacket
} from './types';

let socket: WebSocket;

export const socketStore = readable<
	SystemResponsePacket | InferenceResponsePacket | AppUpdateResponsePacket | MoonrakerResponsePacket
>(undefined, (set) => {
	if (typeof WebSocket !== 'undefined') {
		socket = new WebSocket(transform(2221, 'ws'));

		socket.addEventListener('message', function (event) {
			const data = JSON.parse(event.data);
			set(data);
		});

		return () => {
			socket.close();
		};
	} else {
		console.error('WebSocket is not defined');
	}
});

export const send = (message: any) => {
	if (typeof WebSocket !== 'undefined') {
		socket.send(message);
	} else {
		console.error('WebSocket is not defined');
	}
};
