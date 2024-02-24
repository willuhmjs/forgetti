<script lang="ts">
    type interval = NodeJS.Timeout | string | number | undefined;
    let intervalId: interval;

    import type { Config } from "$lib/types";
	import { onMount } from "svelte";
    export let liveData: Config;
    let latestStats = null;
    onMount(() => {
        intervalId = setInterval(async () => {
            console.log(liveData.MoonrakerEnabled)
            if (!liveData.MoonrakerURL || !liveData.MoonrakerEnabled) return;
            const url = new URL("/printer/objects/query?print_stats", liveData.MoonrakerURL);
            try {
                const response = await fetch(url.href);
                latestStats = await response.json();
            } catch (e) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
            }
        }, 1000);
        return () => clearInterval(intervalId as interval);
    });

</script>
{liveData.MoonrakerEnabled}
{Date.now()}