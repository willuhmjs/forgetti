<script lang="ts">
	import logsStore from '$lib/logsStore';
</script>

<div class="appUpdate">
	{#each $logsStore as update}
		<p class="update {update.type}">
			<span>{update.command}: {update.message}</span>
			<span>{update.time}</span>
		</p>
	{/each}
</div>

<style>
	.appUpdate {
		display: flex;
		flex-direction: column;
		margin: 20px auto;
		overflow-y: auto;
		gap: 10px;
		max-width: 700px;
	}

	.update {
		padding: 10px;
		border-radius: 5px;
		font-size: 14px;
		display: flex;
		justify-content: space-between;
		margin: 0;
	}

	.success {
		background-color: var(--green);
	}

	.error {
		background-color: var(--red);
	}
</style>
