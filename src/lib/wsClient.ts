import { readable } from 'svelte/store';
import { transform } from 'cloud-url-resolver';
import type { SystemResponsePacket, InferenceResponsePacket, AppUpdateResponsePacket } from './types';

let socket: WebSocket;

export const socketStore = readable<SystemResponsePacket | InferenceResponsePacket | AppUpdateResponsePacket>(undefined, (set) => {
	socket = new WebSocket(transform(2221, 'ws'));

	socket.addEventListener('message', function (event) {
		const data = JSON.parse(event.data);
		set(data);
	});

	return () => {
		socket.close();
	};
});

export const send = (message: any) => {
	socket.send(message)
}