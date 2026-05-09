<script lang="ts">
	import { BoundingBox } from "svelte-bounding-box";
	import { Fa } from 'svelte-fa';
	import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import type { Box, Config, ConfigUpdateRequestPacket, ConfigUpdateResponsePacket, Printer } from '$lib/types';
	import { socketStore } from '$lib/wsClient';
	import { toast } from 'svelte-french-toast';
	import { fly } from "svelte/transition";
	import colorStore from "$lib/colorStore";
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

	$effect(() => {
		settingsSynced = JSON.stringify(coords) === JSON.stringify(coordinates);
	})

	

	onMount(() => {
		let img = new Image();
		img.src = "./nosignal.jpg";
		let lastBox: Box[];
		socketStore.subscribe((data) => {
			if (data?.purpose === 'inference' && data.printer.Name === printer.Name) {
				const { box, buffer } = data;
				lastBox = box;
				img.src = `data:image/jpeg;base64,${buffer}`;
				img.onload = () => drawCanvas(box);
			}
		});

		colorStore.subscribe(() => {
			drawCanvas(lastBox)
		});

		function drawCanvas(boxes: any[] = []) {
			const color = $colorStore;
			if (canvas) {
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(img, 0, 0);
					hasContent = true;

					ctx.strokeStyle = color;
					ctx.lineWidth = 5;
					ctx.font = '20px sans-serif';
					boxes.forEach(({ x1, y1, x2, y2, prob }: Box) => {
						ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
						ctx.fillStyle = color;
						const width = ctx.measureText(`failure ${prob}%`).width;
						ctx.fillRect(x1, y1, width + 10, 25);
						ctx.fillStyle = '#000000';
						ctx.fillText(`failure ${prob}%`, x1, y1 + 18);
					});
				}
			}
		}
	});

	const saveCoordinates = async () => {
		const configUpdate = { Coordinates: coords };
		toast.promise(
			fetch('/api/update_config', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					purpose: 'configUpdate',
					config: configUpdate
				} as ConfigUpdateRequestPacket)
			}).then(async (response) => {
				const data = (await response.json()) as ConfigUpdateResponsePacket;
				if (data.type !== 'success') {
					throw new Error('Failed to save coordinates.');
					}
					settingsSynced = true; 
				}),
				{
					loading: 'Saving coordinates...',
					success: 'Coordinates saved!',
					error: 'Error saving coordinates.'
				},
				{
					duration: 5000,
					position: 'bottom-right',
					style: ['background-color: var(--foreground);', 'color: white'].join('')
				}
			);
		};

	export function clearCoordinates() {
		coords = [];
		settingsSynced = false;
	};
</script>
<BoundingBox bind:coordinatesBoxes={coords} outerColor={$colorStore} innerColor="rgba(255,255,255,0.2)">
	<div class="preview">
		<canvas bind:this={canvas} class="preview-canvas"></canvas>
	</div>
</BoundingBox>
{#if !enabled && !hasContent}
	<img src="./nosignal.jpg" alt="No signal" class="preview-image" />
{/if}
{#if !settingsSynced}
<div class="buttonContainer">
	<button
		onclick={saveCoordinates}
		class="button button--primary button--fab saveButton"
		transition:fly={{ y: 100 }}
	>
		<Fa fw icon={faFloppyDisk} />
	</button>
	
</div>
{/if}

<style>
	.saveButton {
		font-size: 1.2rem;
	}

	.buttonContainer {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		overflow: hidden;
		display: flex;
		gap: 1rem;
		z-index: 20;
	}

	.preview {
		border-radius: var(--radius-md);
		overflow: hidden;
		border: 1px solid var(--border);
		background: #0f172a;
		box-shadow: var(--shadow-soft);
	}

	.preview-canvas,
	.preview-image {
		display: block;
		width: 100%;
		max-width: 640px;
		height: auto;
	}
</style>
