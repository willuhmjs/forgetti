<script>
	import colorStore from "$lib/colorStore";
	import { BarLoader } from "svelte-loading-spinners";
    const { pause = $bindable(false) } = $props();
</script>
<div>
    <BarLoader color={$colorStore} size={"100"} {pause} />
</div>

<style>
    div {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding: 1rem;
        width: 100%;
    }
</style>