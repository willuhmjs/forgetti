<script lang="ts">
	import { onMount } from 'svelte';
	import socketStore from '$lib/wsStore';
	import CircularBar from './CircularBar.svelte';
	import type { SystemInfo } from '$lib/types';
	import Fa from 'svelte-fa';
	import {
		faSync,
		faQuestionCircle,
		type IconDefinition,
		faServer,
		faTemperatureLow,
		faTemperatureHigh,
		faWifi,
		faUpload,
		faDownload
	} from '@fortawesome/free-solid-svg-icons';
	import { faWindows, faApple, faLinux } from '@fortawesome/free-brands-svg-icons';

	let socketData: SystemInfo;

	onMount(() => {
		socketStore.subscribe((data) => {
			if (data?.purpose === 'system') {
				socketData = data;
			}
		});
	});

	let platformIcon: IconDefinition = faQuestionCircle;

	$: {
		if (socketData?.platform) {
			if (socketData.platform.toLowerCase().includes('win')) {
				platformIcon = faWindows;
			} else if (socketData.platform.toLowerCase().includes('mac')) {
				platformIcon = faApple;
			} else if (socketData.platform.toLowerCase().includes('linux')) {
				platformIcon = faLinux;
			}
		}
	}
</script>

<div class="systemContainer">
	{#if socketData}
        <div>
		<p class="spec">
			<span class="icon"><Fa icon={platformIcon} /></span>{socketData.distro}
			{socketData.release} ({socketData.codename})
		</p>
		<p class="spec">
			<span class="icon"><Fa icon={faServer} /></span>{socketData.platform}
			{socketData.kernel}
		</p>
		<p class="spec">
			<span class="icon"
				><Fa icon={socketData.cpuTemp > 60 ? faTemperatureHigh : faTemperatureLow} /></span
			>{socketData.cpuTemp}
		</p>
		<p class="spec">
			<span class="icon"><Fa icon={faWifi} /></span>{socketData.netTX}
			<Fa icon={faUpload} /> / {socketData.netRX}
			<Fa icon={faDownload} />
		</p>
    </div>
    <div class="circularBarContainer">
		<div class="circularBarWrapper">

        <div class="circularBarSubContainer">
			<CircularBar
				bind:value={socketData.memPercent}
				color="var(--brand)"
				trackColor="var(--background)"
				textColor="#fff"
			/>
		</div>
		<p>MEM</p>
	</div>
		<div class="circularBarWrapper">
			<div class="circularBarSubContainer">
			<CircularBar
				bind:value={socketData.loadPercent}
				color="var(--brand)"
				trackColor="var(--background)"
				textColor="#fff"
			/>
		</div>
		<p>CPU</p>

		</div>
    </div>
	{:else}
		<Fa icon={faSync} spin />
	{/if}
</div>

<style>
	.spec {
		font-size: 1rem;
	}

	.spec .icon {
		margin-right: 0.5rem;
	}

	.circularBarWrapper {
        text-align: center;
		margin: auto;
	}

    .systemContainer {
        display: flex;
        padding: 0 1rem;
        gap: 1.5rem;
        justify-content: space-between;
        align-items: middle;
}

	.circularBarSubContainer {
		width: 75px;
		height: 75px;
	}

    .circularBarContainer {
        display: flex;
        gap: 0.75rem;
    }


</style>
