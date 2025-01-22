<script lang="ts">
	import { BoundingBox } from "svelte-bounding-box";
	import { Fa } from 'svelte-fa';
	import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import type { Box, Config, ConfigUpdateRequestPacket, ConfigUpdateResponsePacket } from '$lib/types';
	import { socketStore } from '$lib/wsClient';
	import { toast } from 'svelte-french-toast';
	import { fly } from "svelte/transition";
	import colorStore from "$lib/colorStore";
	interface Props {
		data: Config;
	}

	let { data }: Props = $props();
	let canvas: HTMLCanvasElement = $state();
	let storedCoords = typeof localStorage !== 'undefined' ? localStorage.getItem('coordinates') : null;
	let coords = storedCoords ? JSON.parse(storedCoords) : data.Coordinates || [];
	let settingsSynced = $state(true);
	let hasContent = $state(false);

	$effect(() => {
		settingsSynced = JSON.stringify(coords) === JSON.stringify(data.Coordinates);
	})

	

	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			storedCoords = localStorage.getItem('coordinates');
		}
		let img = new Image();
		img.src = "./nosignal.jpg";
		let lastBox: Box[];
		socketStore.subscribe((data) => {
			if (data?.purpose === 'inference') {
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
		localStorage.setItem('coordinates', JSON.stringify(coords));
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
		localStorage.removeItem('coordinates');
	};
</script>
<BoundingBox outerColor={$colorStore} innerColor="rgba(255,255,255,0.2)">
	<div style="margin-bottom: -4px;">
		<canvas bind:this={canvas} style="max-width: 640px; height: 100%;"></canvas>
	</div>
</BoundingBox>

{#if !data.Enabled && !hasContent}
	<img src="./nosignal.jpg" alt="No signal" style="max-width: 640px; height: 100%;" />
{/if}
{#if !settingsSynced}
<div class="buttonContainer">
	<button
		onclick={saveCoordinates}
		class="saveButton"
		transition:fly={{ y: 100 }}
	>
		<Fa fw icon={faFloppyDisk} />
	</button>
	
</div>
{/if}

<style>
	.saveButtonDiv {
		position: fixed;
		left: 0;
		bottom: 0;
		overflow: hidden;
	}

	.saveButton {
		background-color: var(--brand);
		color: white;
		bottom: none;
		border-radius: 50%;
		padding: 0.8rem;
		font-size: 1.5rem;
		margin-bottom: 1rem;
		margin-left: 1rem;
	}

	.buttonContainer {
		position: fixed;
		left: 0;
		bottom: 0;
		overflow: hidden;
		display: flex;
		gap: 1rem;
	}
</style>