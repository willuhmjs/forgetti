<script>
	import colorStore from "$lib/colorStore";
	import { BarLoader } from "svelte-loading-spinners";

</script>
<div>
    <BarLoader color={$colorStore}/>
</div>
