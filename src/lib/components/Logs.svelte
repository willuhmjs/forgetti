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
	<button class="button button--primary exportButton" on:click={exportLogs}>Export Logs</button>
	{#each $logsStore as update}
		<p class="surface-card update {update.type}">
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
		gap: 12px;
		max-width: 900px;
		width: min(100%, 900px);
	}

	@media (max-width: 710px) {
		.appUpdate {
			margin: 10px;
		}
	}

	.update {
		font-size: 0.9rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0;
		gap: 1rem;
		border-left: 3px solid transparent;
	}

	.update span:last-child {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	.success {
		border-left-color: var(--green);
		background: rgba(74, 222, 128, 0.12);
	}

	.error {
		border-left-color: var(--red);
		background: rgba(248, 113, 113, 0.12);
	}

	.exportButton {
		align-self: flex-start;
	}
</style>
