import configStore from '$lib/configStore';
import { get } from 'svelte/store';

export function load() {
	return get(configStore);
}
