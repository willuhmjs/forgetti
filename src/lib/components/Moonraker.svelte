<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faHourglassHalf,
		faRuler,
		faSpinner,
		faCube,
		faIndustry,
		faCheck,
		faTriangleExclamation
	} from '@fortawesome/free-solid-svg-icons';

	import type { MoonrakerResponsePacket, Printer } from '$lib/types';
	import { onMount, onDestroy } from 'svelte';
	import LoadingBar from './LoadingBar.svelte';

	interface Props {
		printer: Printer;
	}
	let { printer }: Props = $props();
	let latestStats: MoonrakerResponsePacket | null = $state(null);
	let connectionError = $state(false);
	let failCount = $state(0);
	let interval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		interval = setInterval(async () => {
			if (!printer.MoonrakerEnabled) return;
			try {
				const controller = new AbortController();
				const timeout = setTimeout(() => controller.abort(), 5000);
				const response = await fetch(
					new URL('/printer/objects/query?print_stats', printer.MoonrakerURL).href,
					{ signal: controller.signal }
				);
				clearTimeout(timeout);
				const r = await response.json();
				latestStats = r.result.status.print_stats;
				connectionError = false;
				failCount = 0;
			} catch {
				failCount++;
				if (failCount >= 3) connectionError = true;
			}
		}, 2000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	function getStateIcon(state: string) {
		switch (state) {
			case 'printing': return faSpinner;
			case 'paused': return faHourglassHalf;
			case 'complete': return faCheck;
			default: return faIndustry;
		}
	}

	function getStateColor(state: string) {
		switch (state) {
			case 'printing': return 'var(--green)';
			case 'paused': return 'var(--yellow)';
			case 'error': return 'var(--red)';
			default: return 'var(--text-muted)';
		}
	}
</script>

{#if connectionError}
	<div class="error-state">
		<Fa icon={faTriangleExclamation} />
		<p>Cannot reach Moonraker</p>
		<span>Check that {printer.MoonrakerURL} is accessible</span>
	</div>
{:else if latestStats}
	<div class="moonraker-grid">
		<div class="stat-card wide">
			<div class="stat-icon"><Fa icon={faCube} /></div>
			<div class="stat-info">
				<span class="stat-label">File</span>
				<span class="stat-value">{latestStats.filename || 'No file loaded'}</span>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon" style="color: {getStateColor(latestStats.state || '')}">
				<Fa icon={getStateIcon(latestStats.state || '')} spin={latestStats.state === 'printing'} />
			</div>
			<div class="stat-info">
				<span class="stat-label">State</span>
				<span class="stat-value state-badge" style="color: {getStateColor(latestStats.state || '')}">
					{(latestStats.state || 'idle').toUpperCase()}
				</span>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon"><Fa icon={faRuler} /></div>
			<div class="stat-info">
				<span class="stat-label">Filament</span>
				<span class="stat-value">{((latestStats.filament_used || 0) / 1000).toFixed(2)}m</span>
			</div>
		</div>
	</div>
{:else}
	<LoadingBar />
{/if}

<style>
	.moonraker-grid {
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

	.stat-card.wide {
		grid-column: 1 / -1;
	}

	.stat-icon {
		color: var(--brand);
		font-size: 0.875rem;
		width: 1.25rem;
		text-align: center;
		flex-shrink: 0;
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

	.state-badge {
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.03em;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1.5rem;
		color: var(--red);
		text-align: center;
		font-size: 1.25rem;
	}

	.error-state p {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.error-state span {
		font-size: 0.75rem;
		color: var(--text-muted);
	}
</style>
