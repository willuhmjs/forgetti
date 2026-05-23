<script lang="ts">
	import { BoundingBox } from 'svelte-bounding-box';
	import { Fa } from 'svelte-fa';
	import { faFloppyDisk, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import type { Box, Config, ConfigUpdateRequestPacket, ConfigUpdateResponsePacket, Printer } from '$lib/types';
	import { socketStore } from '$lib/wsClient';
	import { toast } from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import colorStore from '$lib/colorStore';

	interface Props {
		printer: Printer;
		enabled: boolean;
		coordinates: Config['Coordinates'];
	}

	let { printer, enabled, coordinates }: Props = $props();
	let canvas: HTMLCanvasElement | undefined = $state();
	let coords = $state(coordinates || []);
	let settingsSynced = $state(true);
	let hasContent = $state(false);
	let detecting = $state(false);

	$effect(() => {
		settingsSynced = JSON.stringify(coords) === JSON.stringify(coordinates);
	});

	onMount(() => {
		let img = new Image();
		img.src = './nosignal.jpg';
		let lastBox: Box[];

		socketStore.subscribe((data) => {
			if (data?.purpose === 'inference' && data.printer.Name === printer.Name) {
				const { box, buffer } = data;
				lastBox = box;
				detecting = box.length > 0;
				img.src = `data:image/jpeg;base64,${buffer}`;
				img.onload = () => drawCanvas(box);
			}
		});

		colorStore.subscribe(() => {
			drawCanvas(lastBox);
		});

		function drawCanvas(boxes: Box[] = []) {
			const color = $colorStore;
			if (!canvas) return;
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;
			ctx.drawImage(img, 0, 0);
			hasContent = true;

			ctx.strokeStyle = color;
			ctx.lineWidth = 3;
			ctx.font = 'bold 16px -apple-system, sans-serif';
			boxes.forEach(({ x1, y1, x2, y2, prob }: Box) => {
				const alpha = Math.min((prob || 50) / 100 + 0.3, 1);
				ctx.strokeStyle = color;
				ctx.globalAlpha = alpha;
				ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

				const label = `${prob}%`;
				const textWidth = ctx.measureText(label).width;
				ctx.fillStyle = color;
				ctx.fillRect(x1, y1 - 22, textWidth + 12, 22);
				ctx.fillStyle = '#000';
				ctx.globalAlpha = 1;
				ctx.fillText(label, x1 + 6, y1 - 5);
			});
			ctx.globalAlpha = 1;
		}
	});

	const saveCoordinates = async () => {
		toast.promise(
			fetch('/api/update_config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					purpose: 'configUpdate',
					config: { Coordinates: coords }
				} as ConfigUpdateRequestPacket)
			}).then(async (response) => {
				const data = (await response.json()) as ConfigUpdateResponsePacket;
				if (data.type !== 'success') throw new Error('Failed to save coordinates.');
				settingsSynced = true;
			}),
			{
				loading: 'Saving...',
				success: 'Coordinates saved!',
				error: 'Error saving coordinates.'
			},
			{
				duration: 3000,
				position: 'bottom-right',
				style: 'background-color: var(--bg-secondary); color: var(--text-primary);'
			}
		);
	};

	export function clearCoordinates() {
		coords = [];
		settingsSynced = false;
	}
</script>

<div class="preview-container" class:detecting>
	<BoundingBox bind:coordinatesBoxes={coords} outerColor={$colorStore} innerColor="rgba(255,255,255,0.15)">
		<div class="canvas-wrapper">
			<canvas bind:this={canvas}></canvas>
		</div>
	</BoundingBox>

	{#if !enabled && !hasContent}
		<div class="offline-overlay">
			<Fa icon={faVideoSlash} />
			<p>Camera offline</p>
			<span>Enable detection to start monitoring</span>
		</div>
	{/if}

	{#if enabled && hasContent}
		<div class="status-badge" class:active={detecting}>
			<span class="status-dot"></span>
			{detecting ? 'DETECTING' : 'MONITORING'}
		</div>
	{/if}
</div>

{#if !settingsSynced}
	<div class="coord-actions" transition:fly={{ y: 20, duration: 200 }}>
		<button class="save-btn" onclick={saveCoordinates}>
			<Fa icon={faFloppyDisk} /> Save Region
		</button>
	</div>
{/if}

<style>
	.preview-container {
		position: relative;
		border-radius: var(--radius-md);
		overflow: hidden;
		background-color: var(--bg-primary);
		transition: box-shadow var(--transition-normal);
	}

	.preview-container.detecting {
		box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
	}

	.canvas-wrapper {
		line-height: 0;
	}

	canvas {
		max-width: 100%;
		height: auto;
		display: block;
	}

	.offline-overlay {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 3rem 2rem;
		color: var(--text-muted);
		font-size: 1.5rem;
		text-align: center;
	}

	.offline-overlay p {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.offline-overlay span {
		font-size: 0.8125rem;
	}

	.status-badge {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		background-color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		border-radius: var(--radius-full);
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--green);
	}

	.status-badge.active {
		color: var(--red);
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: currentColor;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	.coord-actions {
		display: flex;
		justify-content: center;
		padding: 0.75rem 0 0;
	}

	.save-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background-color: var(--brand);
		color: white;
		border-radius: var(--radius-md);
		font-size: 0.8125rem;
		font-weight: 600;
		transition: all var(--transition-fast);
	}

	.save-btn:hover {
		filter: brightness(1.1);
		transform: translateY(-1px);
	}
</style>
