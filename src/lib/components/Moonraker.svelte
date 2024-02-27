<script lang="ts">
	type interval = NodeJS.Timeout | string | number | undefined;
	import Fa from 'svelte-fa';
	import { faHourglassHalf, faRuler, faSpinner, faSync, faCube, faIndustry } from '@fortawesome/free-solid-svg-icons';
	interface printStats {
		filename: string;
		total_duration: number;
		print_duration: number;
		filament_used: number;
		state: string;
		message: string;
	}
	let intervalId: interval;

	import type { Config } from '$lib/types';
	import { onMount } from 'svelte';
	export let liveData: Config;
	let latestStats: printStats | null = null;
	onMount(() => {
		intervalId = setInterval(async () => {
			if (!liveData.MoonrakerURL || !liveData.MoonrakerEnabled) return;
			const url = new URL("/printer/objects/query?print_stats", liveData.MoonrakerURL);
			try {
				const response = await fetch(url.href);
				latestStats = (await response.json()).result.status.print_stats;
			} catch (e) {
				console.error(e);
			}
		}, 1000);
		return () => clearInterval(intervalId as interval);
	});
</script>

<div class="moonrakerContainer">
    <div>
	{#if latestStats}
		{#if latestStats.state !== 'standby'}
            <p class="spec">
                <span class="icon">
                    <Fa icon={faCube} />
                </span>
                {latestStats.filename}
            </p>
            <p class="spec">
                <span class="icon">
                    {#if latestStats.state == 'printing'}
                        <Fa icon={faSpinner} spin />
                    {:else if latestStats.state == 'paused'}
                        <Fa icon={faHourglassHalf} />
                    {:else}
                        <Fa icon={faIndustry} />
                    {/if}
                </span>
                {latestStats.state.toUpperCase()}
            </p>
            <p class="spec">
                <span class="icon">
                    <Fa icon={faRuler} />
                </span>
                {(latestStats.filament_used / 1000).toFixed(2)}m
            </p>
		{:else}
        <p class="spec">
            <span class="icon">
                <Fa icon={faHourglassHalf} />
            </span>
            {latestStats.state.toUpperCase()}
        </p>
		{/if}
	{:else}
		<Fa icon={faSync} spin />
	{/if}
    </div>
</div>

<style>
    .spec {
		font-size: 0.9rem;
	}

	.spec .icon:first-of-type {
		margin-right: 0.5rem;
	}

	.spec .icon {
		color: var(--brand);
	}

	.moonrakerContainer {
		display: flex;
		padding: 0 1rem;
		gap: 1.5rem;
		justify-content: space-between;
		align-items: middle;
	}

</style>