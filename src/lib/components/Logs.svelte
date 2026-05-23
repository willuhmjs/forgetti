<script lang="ts">
	import logsStore from '$lib/logsStore';
	import Fa from 'svelte-fa';
	import { faDownload, faArrowDown, faInbox } from '@fortawesome/free-solid-svg-icons';
	import { onMount, tick } from 'svelte';

	let filter: 'all' | 'success' | 'error' = $state('all');
	let search = $state('');
	let logContainer: HTMLDivElement | undefined = $state();
	let autoScroll = $state(true);

	let filteredLogs = $derived(
		$logsStore.filter((log) => {
			if (filter !== 'all' && log.type !== filter) return false;
			if (search && !log.message.toLowerCase().includes(search.toLowerCase()) &&
				!log.command.toLowerCase().includes(search.toLowerCase())) return false;
			return true;
		})
	);

	$effect(() => {
		if (filteredLogs.length && autoScroll && logContainer) {
			tick().then(() => {
				logContainer?.scrollTo({ top: logContainer.scrollHeight, behavior: 'smooth' });
			});
		}
	});

	function handleScroll() {
		if (!logContainer) return;
		const { scrollTop, scrollHeight, clientHeight } = logContainer;
		autoScroll = scrollHeight - scrollTop - clientHeight < 50;
	}

	const exportLogs = async () => {
		const response = await fetch('/api/export_logs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify($logsStore)
		});
		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
		}
	};

	function scrollToBottom() {
		logContainer?.scrollTo({ top: logContainer.scrollHeight, behavior: 'smooth' });
		autoScroll = true;
	}
</script>

<div class="logs-panel">
	<div class="logs-toolbar">
		<div class="filter-group">
			<button class="filter-btn" class:active={filter === 'all'} onclick={() => (filter = 'all')}>All</button>
			<button class="filter-btn" class:active={filter === 'success'} onclick={() => (filter = 'success')}>
				<span class="dot green"></span> Success
			</button>
			<button class="filter-btn" class:active={filter === 'error'} onclick={() => (filter = 'error')}>
				<span class="dot red"></span> Error
			</button>
		</div>
		<div class="toolbar-right">
			<input type="text" class="search-input" placeholder="Search logs..." bind:value={search} />
			<button class="icon-btn" onclick={exportLogs} title="Export logs">
				<Fa icon={faDownload} />
			</button>
		</div>
	</div>

	<div class="log-list" bind:this={logContainer} onscroll={handleScroll}>
		{#if filteredLogs.length === 0}
			<div class="empty-state">
				<Fa icon={faInbox} />
				<p>No logs to display</p>
			</div>
		{:else}
			{#each filteredLogs as log}
				<div class="log-entry" class:error={log.type === 'error'} class:success={log.type === 'success'}>
					<div class="log-content">
						<span class="log-command">{log.command}</span>
						<span class="log-message">{log.message}</span>
					</div>
					<span class="log-time">{log.time}</span>
				</div>
			{/each}
		{/if}
	</div>

	{#if !autoScroll}
		<button class="scroll-btn" onclick={scrollToBottom}>
			<Fa icon={faArrowDown} />
		</button>
	{/if}
</div>

<style>
	.logs-panel {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 4rem);
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
		position: relative;
	}

	.logs-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		gap: 0.25rem;
		background-color: var(--bg-secondary);
		border-radius: var(--radius-md);
		padding: 0.25rem;
		border: 1px solid var(--border-subtle);
	}

	.filter-btn {
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 0.375rem;
		transition: all var(--transition-fast);
	}

	.filter-btn.active {
		background-color: var(--bg-hover);
		color: var(--text-primary);
	}

	.filter-btn:hover:not(.active) {
		color: var(--text-primary);
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}
	.dot.green { background-color: var(--green); }
	.dot.red { background-color: var(--red); }

	.toolbar-right {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.search-input {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.375rem 0.75rem;
		color: var(--text-primary);
		font-size: 0.8125rem;
		width: 180px;
		transition: border-color var(--transition-fast);
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--brand);
	}

	.icon-btn {
		padding: 0.5rem;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		transition: all var(--transition-fast);
	}

	.icon-btn:hover {
		background-color: var(--bg-hover);
		color: var(--text-primary);
	}

	.log-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.log-entry {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0.625rem 0.75rem;
		background-color: var(--bg-secondary);
		border-radius: var(--radius-sm);
		border-left: 3px solid var(--border);
		font-size: 0.8125rem;
		gap: 1rem;
	}

	.log-entry.success {
		border-left-color: var(--green);
	}

	.log-entry.error {
		border-left-color: var(--red);
	}

	.log-content {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.log-command {
		font-weight: 600;
		color: var(--text-secondary);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.log-message {
		color: var(--text-primary);
		word-break: break-word;
	}

	.log-time {
		color: var(--text-muted);
		font-size: 0.6875rem;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem;
		color: var(--text-muted);
		font-size: 1.5rem;
	}

	.empty-state p {
		font-size: 0.875rem;
	}

	.scroll-btn {
		position: absolute;
		bottom: 1.5rem;
		right: 1.5rem;
		background-color: var(--brand);
		color: white;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-md);
		transition: transform var(--transition-fast);
	}

	.scroll-btn:hover {
		transform: scale(1.1);
	}
</style>
