<script lang="ts">
	import { onMount } from 'svelte';
	import type { Box, Config } from '$lib/types';
	import { socketStore } from '$lib/wsClient';
	import colorMap from '$lib/colorMap';
	export let data: Config;
	let canvas: HTMLCanvasElement;

	onMount(() => {
		let img = new Image();

		socketStore.subscribe((data) => {
			if (data?.purpose === 'inference') {
				const { box, buffer } = data;
				img.src = `data:image/jpeg;base64,${buffer}`;
				img.onload = () => drawCanvas(box);
			}
		});

		function drawCanvas(boxes: any[]) {
			if (canvas) {
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(img, 0, 0);

					ctx.strokeStyle = colorMap.get(data.BrandColor) || '#ffffff';
					ctx.lineWidth = 5;
					ctx.font = '20px sans-serif';
					boxes.forEach(({ x1, y1, x2, y2, prob }: Box) => {
						ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
						ctx.fillStyle = colorMap.get(data.BrandColor) || '#ffffff';
						const width = ctx.measureText(`failure ${prob}%`).width;
						ctx.fillRect(x1, y1, width + 10, 25);
						ctx.fillStyle = '#000000';
						ctx.fillText(`failure ${prob}%`, x1, y1 + 18);
					});
				}
			}
		}
	});
</script>

<div style="margin-bottom: -4px;">
	<canvas bind:this={canvas} style="max-width: 640px; height: 100%;" />
</div>
