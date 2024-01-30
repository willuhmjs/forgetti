import configStore from '$lib/server/configStore';
import { get } from 'svelte/store';

export function load() {
	return get(configStore);
}
