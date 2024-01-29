import { readable } from 'svelte/store';
import { transform } from 'cloud-url-resolver';
import type { SystemResponsePacket, InferenceResponsePacket } from './types';
import { onMount } from 'svelte';

let socket: WebSocket;

export const socketStore = readable<SystemResponsePacket | InferenceResponsePacket>(null, (set) => {
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