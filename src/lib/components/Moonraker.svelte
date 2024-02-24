<script lang="ts">
    let intervalId: string | number | NodeJS.Timeout | null | undefined = null;

    import type { Config } from "$lib/types";
	import { onDestroy, onMount } from "svelte";
    export let liveData: Config;
   
    onMount(() => {
        intervalId = setInterval(async () => {
            console.log(liveData.MoonrakerEnabled)
            if (!liveData.MoonrakerURL || !liveData.MoonrakerEnabled) return;
            const url = new URL("/printer/objects/query?print_stats", liveData.MoonrakerURL);
            try {
                const response = await fetch(url.href);
                const json = await response.json();
            } catch (e) {
            }
        }, 1000);
    });

    onDestroy(() => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    });
</script>
{liveData.MoonrakerEnabled}
{Date.now()}