<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faHourglassHalf,
		faRuler,
		faSpinner,
		faSync,
		faCube,
		faIndustry
	} from '@fortawesome/free-solid-svg-icons';

	import type { MoonrakerResponsePacket } from '$lib/types';
	import { onMount } from 'svelte';
	import { socketStore } from '$lib/wsClient';
	let latestStats: MoonrakerResponsePacket | null = null;
	onMount(() => {
		socketStore.subscribe((data) => {
			if (data?.purpose === 'moonraker') {
				if (data.state === 'error')
					return console.log('Error in Moonraker component. Please check server logs.');
				latestStats = data;
			}
		});
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
