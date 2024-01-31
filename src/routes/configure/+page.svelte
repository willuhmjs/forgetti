<script>
	import Window from '$lib/components/Window.svelte';
	import { faGear } from '@fortawesome/free-solid-svg-icons';
    import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	export let data;
</script>

<div class="window-container">
	<Window title="General" icon={faGear}>
        TODO IMPL
	</Window>

	<Window title="Discord" icon={faDiscord}>
        TODO IMPL
	</Window>
</div>

<style>
	.window-container {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: flex-start;
		padding: 10px;
	}
</style>