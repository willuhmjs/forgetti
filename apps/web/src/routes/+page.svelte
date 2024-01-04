<script lang="ts">
	import { onMount } from "svelte";
    import type { Box } from "$lib/types";

    onMount(() => {
        const socket = new WebSocket('ws://localhost:2221');
        socket.onmessage = ({ data }) => {
            const { box, buffer } = JSON.parse(data);
            drawCanvas(buffer, box);
        }
    });
    let canvas: HTMLCanvasElement;
    // place canvas 
    function drawCanvas(base64Buffer: string, boxes: any[]) {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Buffer}`;
        img.onload = () => {
        if (canvas) {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                ctx.strokeStyle = "#00FF00";
                ctx.lineWidth = 3;
                ctx.font = "18px serif";
                boxes.forEach(({x1, y1, x2, y2, prob}: Box) => {
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                    ctx.fillStyle = "#00ff00";
                    const width = ctx.measureText("spaghetti").width;
                    ctx.fillRect(x1, y1, width + 10, 25);
                    ctx.fillStyle = "#000000";
                    ctx.fillText("spaghetti", x1, y1 + 18);
                });
            }
        }
        };
    }

</script>
<canvas bind:this={canvas}/>
