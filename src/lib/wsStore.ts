import { readable } from 'svelte/store';
import { transform } from 'cloud-url-resolver';
import type { SystemInfo } from './types';

export default readable<SystemInfo | any>(null, (set) => {
	const socket = new WebSocket(transform(2221, 'ws'));

	socket.addEventListener('message', function (event) {
		const data = JSON.parse(event.data);
		set(data);
	});

	return () => {
		socket.close();
	};
});
