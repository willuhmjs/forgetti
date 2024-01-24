<script lang="ts">
	import { onMount } from 'svelte';
	import type { Box, Config } from '$lib/types';
	import { transform } from "cloud-url-resolver";
	export let data: Config;
	let canvas: HTMLCanvasElement;

	onMount(() => {
		let img = new Image();
		const socket = new WebSocket(
			transform(2221, "ws")
		);
		socket.onmessage = ({ data }) => {
			const json_data = JSON.parse(data);
				if (json_data.purpose === "inference") {
				const { box, buffer } = JSON.parse(data);
				img.src = `data:image/jpeg;base64,${buffer}`;
				img.onload = () => drawCanvas(box);
			}
		};

		function drawCanvas(boxes: any[]) {
			if (canvas) {
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(img, 0, 0);
					ctx.strokeStyle = data.Hidden.BrandColor;
					ctx.lineWidth = 3;
					ctx.font = '18px sans-serif';
					boxes.forEach(({ x1, y1, x2, y2, prob }: Box) => {
						ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
						ctx.fillStyle = data.Hidden.BrandColor;
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

<div style="margin-bottom: -4px">
	<canvas bind:this={canvas} />
</div>
