<script lang="ts">
	import LivePreview from '$lib/components/LivePreview.svelte';
	export let data;
</script>

<LivePreview />

<form action="?/configure" method="POST">
	{#each Object.entries(data) as [key, value]}
		<label>
			<span>{key}</span>
			<input type="text" name={key} {value} />
		</label>
	{/each}
	<button type="submit">Save</button>
</form>
