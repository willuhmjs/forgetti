<script lang="ts">
	import logsStore from '$lib/logsStore';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { Fa } from 'svelte-fa';
	import { faFileExport } from '@fortawesome/free-solid-svg-icons';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import { toast } from 'svelte-french-toast';
	import type { Config } from '$lib/types';
	import configStore from '$lib/server/configStore';

	let config: Config;
	let discordWebhookEnabled = false;

	onMount(() => {
		configStore.subscribe((value) => {
			config = value;
			discordWebhookEnabled = config.DiscordWebhookEnabled;
		});
	});

	const exportLogsToFile = () => {
		const logs = get(logsStore);
		const logText = logs.map(log => `${log.time} - ${log.command}: ${log.message}`).join('\n');
		const blob = new Blob([logText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'logs.txt';
		a.click();
		URL.revokeObjectURL(url);
	};

	const exportLogsToDiscord = async () => {
		const logs = get(logsStore);
		const logText = logs.map(log => `${log.time} - ${log.command}: ${log.message}`).join('\n');
		const response = await fetch('/api/export_logs_to_discord', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ logs: logText })
		});
		const data = await response.json();
		if (data.type === 'success') {
			toast.success('Logs exported to Discord successfully!', {
				duration: 5000,
				position: 'bottom-right',
				style: ['background-color: var(--foreground);', 'color: white'].join('')
			});
		} else {
			toast.error('Failed to export logs to Discord.', {
				duration: 5000,
				position: 'bottom-right',
				style: ['background-color: var(--foreground);', 'color: white'].join('')
			});
		}
	};
</script>

<div class="appUpdate">
	{#each $logsStore as update}
		<p class="update {update.type}">
			<span>{update.command}: {update.message}</span>
			<span>{update.time}</span>
		</p>
	{/each}
</div>

<div class="buttonContainer">
	<button onclick={exportLogsToFile} class="exportButton">
		<Fa icon={faFileExport} /> Export to File
	</button>
	{#if discordWebhookEnabled}
		<button onclick={exportLogsToDiscord} class="exportButton">
			<Fa icon={faDiscord} /> Export to Discord
		</button>
	{/if}
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

	.buttonContainer {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-top: 20px;
	}

	.exportButton {
		background-color: var(--brand);
		color: white;
		border: none;
		border-radius: 5px;
		padding: 10px 20px;
		font-size: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.exportButton:hover {
		filter: brightness(0.85);
	}
</style>
