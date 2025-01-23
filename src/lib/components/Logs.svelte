<script lang="ts">
	import logsStore from '$lib/logsStore';

	const exportLogs = async () => {
		const response = await fetch('/api/export_logs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify($logsStore)
		});
		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			a.download = `logs-${timestamp}.txt`
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
		} else {
			console.error('Failed to export logs');
		}
	};
</script>

<div class="appUpdate">
	<button class="exportButton" on:click={exportLogs}>Export Logs</button>
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
		margin: 10px auto;
		overflow-y: auto;
		gap: 10px;
		max-width: 700px;
	}

	@media (max-width: 710px) {
		.appUpdate {
			margin: 10px;
		}
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

	.exportButton {
		padding: 10px 20px;
		background-color: var(--brand);
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		transition: background-color 0.3s ease;
	}
</style>
