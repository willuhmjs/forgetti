<script>
	import { onMount } from "svelte";

    $: d = "";
    onMount(() => {
        const socket = new WebSocket('ws://localhost:2221');
        socket.onmessage = ({ data }) => {
            d = data;
        }
    });

</script>

{d}