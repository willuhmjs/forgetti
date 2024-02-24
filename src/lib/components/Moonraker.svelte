<script lang="ts">
    type interval = NodeJS.Timeout | string | number | undefined;
    import Fa from 'svelte-fa';
    import { faHourglassHalf, faRuler, faSpinner, faSync } from '@fortawesome/free-solid-svg-icons';
    interface printStats {
            filename: string;
            total_duration: number;
            print_duration: number;
            filament_used: number;
            state: string;
            message: string;
        }
    let intervalId: interval;

    import type { Config } from "$lib/types";
	import { onMount } from "svelte";
    export let liveData: Config;
    let latestStats: printStats | null = null;
    onMount(() => {
        intervalId = setInterval(async () => {
            console.log(liveData.MoonrakerEnabled)
            if (!liveData.MoonrakerURL || !liveData.MoonrakerEnabled) return;
            //const url = new URL("/printer/objects/query?print_stats", liveData.MoonrakerURL);
            const url = new URL("https://mocki.io/v1/7a1cf4d3-f180-43c0-b22e-71040253ce59");
            try {
                const response = await fetch(url.href);
                latestStats = (await response.json()).result.status.print_stats
            } catch (e) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                console.error(e);
            }
        }, 1000);
        return () => clearInterval(intervalId as interval);
    });

</script>
<div>
    {#if latestStats}
        {#if latestStats.state === "printing"}
            <p>
                <Fa icon={faSpinner} spin />
                {latestStats.filename}
            </p>
            <p>
                <Fa icon={faRuler} />
                {(latestStats.filament_used/1000).toFixed(2)}m
            </p>
        {:else if latestStats.state === "standby"}
            <Fa icon={faHourglassHalf} />
            {latestStats.state}
        {/if}
    {:else}
		<Fa icon={faSync} spin />
    {/if}
</div>