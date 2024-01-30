import { readable } from 'svelte/store';
import type { AppUpdateResponsePacket } from './types';
import { socketStore } from "$lib/wsClient";

export default readable<AppUpdateResponsePacket[]>([{
    purpose: "appUpdate",
    message: "Logs initialized",
    command: "meta",
    type: "success",
    toastable: false
}], (_, update) => {
    if (typeof window !== 'undefined') {
        socketStore.subscribe(data => {
            if (data.purpose === "appUpdate") {
                // append data to array
                update(current => [...current, data])
            }
        })
    }
});
