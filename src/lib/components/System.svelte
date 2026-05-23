<script lang="ts">
	import { onMount } from 'svelte';
	import { socketStore } from '$lib/wsClient';
	import CircularBar from './CircularBar.svelte';
	import type { SystemResponsePacket } from '$lib/types';
	import Fa from 'svelte-fa';
	import {
		faQuestionCircle,
		type IconDefinition,
		faServer,
		faTemperatureLow,
		faTemperatureHigh,
		faArrowUp,
		faArrowDown
	} from '@fortawesome/free-solid-svg-icons';
	import { faWindows, faApple, faLinux } from '@fortawesome/free-brands-svg-icons';
	import LoadingBar from './LoadingBar.svelte';

	let socketData: SystemResponsePacket | undefined = $state();

	onMount(() => {
		socketStore.subscribe((data) => {
			if (data?.purpose === 'system') {
				socketData = data;
			}
		});
	});

	function formatBytes(kilobytes: number) {
		const units = ['KB', 'MB', 'GB', 'TB'];
		let i = 0;
		while (kilobytes >= 1024 && i < units.length - 1) {
			kilobytes /= 1024;
			i++;
		}
		return `${kilobytes.toFixed(1)} ${units[i]}`;
	}

	let platformIcon: IconDefinition = $state(faQuestionCircle);

	$effect(() => {
		if (socketData?.platform) {
			const p = socketData.platform.toLowerCase();
			if (p.includes('win')) platformIcon = faWindows;
			else if (p.includes('mac') || p.includes('darwin')) platformIcon = faApple;
			else if (p.includes('linux')) platformIcon = faLinux;
		}
	});
</script>

{#if socketData}
	<div class="system-grid">
		<div class="stat-card">
			<div class="stat-icon"><Fa icon={platformIcon} /></div>
			<div class="stat-info">
				<span class="stat-label">Platform</span>
				<span class="stat-value">{socketData.distro} {socketData.release}</span>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon"><Fa icon={faServer} /></div>
			<div class="stat-info">
				<span class="stat-label">Kernel</span>
				<span class="stat-value">{socketData.kernel}</span>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon" class:hot={socketData.cpuTemp > 60}>
				<Fa icon={socketData.cpuTemp > 60 ? faTemperatureHigh : faTemperatureLow} />
			</div>
			<div class="stat-info">
				<span class="stat-label">Temperature</span>
				<span class="stat-value">{socketData.cpuTemp}°C</span>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon"><Fa icon={faArrowUp} /></div>
			<div class="stat-info">
				<span class="stat-label">Upload</span>
				<span class="stat-value">{formatBytes(socketData.netTX)}</span>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon"><Fa icon={faArrowDown} /></div>
			<div class="stat-info">
				<span class="stat-label">Download</span>
				<span class="stat-value">{formatBytes(socketData.netRX)}</span>
			</div>
		</div>

		<div class="gauges">
			<div class="gauge">
				<div class="gauge-ring">
					<CircularBar
						bind:value={socketData.loadPercent}
						color="var(--brand)"
						trackColor="var(--bg-primary)"
						textColor="var(--text-primary)"
					/>
				</div>
				<span class="gauge-label">CPU</span>
			</div>
			<div class="gauge">
				<div class="gauge-ring">
					<CircularBar
						bind:value={socketData.memPercent}
						color="var(--brand)"
						trackColor="var(--bg-primary)"
						textColor="var(--text-primary)"
					/>
				</div>
				<span class="gauge-label">MEM</span>
			</div>
		</div>
	</div>
{:else}
	<LoadingBar />
{/if}

<style>
	.system-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.625rem;
		width: 100%;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.75rem;
		background-color: var(--bg-tertiary);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-subtle);
	}

	.stat-icon {
		color: var(--brand);
		font-size: 0.875rem;
		width: 1.25rem;
		text-align: center;
		flex-shrink: 0;
	}

	.stat-icon.hot {
		color: var(--red);
	}

	.stat-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.stat-label {
		font-size: 0.625rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.stat-value {
		font-size: 0.8125rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gauges {
		grid-column: 1 / -1;
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		padding: 0.5rem 0;
	}

	.gauge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.gauge-ring {
		width: 64px;
		height: 64px;
	}

	.gauge-label {
		font-size: 0.6875rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}
</style>
