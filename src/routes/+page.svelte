<script lang="ts">
	import LivePreview from '$lib/components/LivePreview.svelte';
	import System from '$lib/components/System.svelte';
	import Moonraker from '$lib/components/Moonraker.svelte';
	import Window from '$lib/components/Window.svelte';
	import Logs from '$lib/components/Logs.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import Fa from 'svelte-fa';
	import { fly } from 'svelte/transition';
	import { send, socketStore, connectionState } from '$lib/wsClient';
	import {
		faVideoCamera,
		faServer,
		faPowerOff,
		faSync,
		faPalette,
		faRotateRight,
		faPlay,
		faStop,
		faCogs,
		faFileLines,
		faGauge,
		faFloppyDisk,
		faSailboat,
		faTrash,
		faPlus,
		faChevronDown,
		faChevronRight,
		faBars,
		faXmark,
		faWifi,
		faCircle
	} from '@fortawesome/free-solid-svg-icons';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import type { Config, ConfigUpdateRequestPacket, ConfigUpdateResponsePacket } from '$lib/types';
	import toast from 'svelte-french-toast';
	import { onMount } from 'svelte';
	import colorStore from '$lib/colorStore';
	import THEME_COLORS from '$lib/colorMap';

	interface Props {
		data: Config;
	}

	let { data }: Props = $props();
	let liveData: Config = $state({ ...data });
	let liveDataUnsaved: Config = $state({ ...data });
	let selectedPrinter = $state(data.Printers[0]);
	let lp: LivePreview | undefined = $state();

	let activeView: 'dashboard' | 'settings' | 'logs' = $state('dashboard');
	let sidebarOpen = $state(false);
	let powerMenuOpen = $state(false);
	let lowPowerMode = $state(false);
	let updateRequested = $state(false);

	let confirmDialog: { title: string; message: string; confirmLabel: string; danger: boolean; onconfirm: () => void } | null = $state(null);
	let expandedPrinters = $state(new Set<number>([0]));

	const toastStyle = 'background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-subtle);';

	onMount(() => {
		document.documentElement.style.setProperty('--brand', data.BrandColor || '#f97316');
		colorStore.set(data.BrandColor || '#f97316');
		socketStore.subscribe((wsData) => {
			if (!wsData) return;
			if (wsData.purpose === 'appUpdate' && wsData.toastable) {
				updateRequested = false;
				toast[wsData.type](wsData.message, { duration: 5000, position: 'bottom-right', style: toastStyle });
			} else if (wsData?.purpose === 'system') {
				lowPowerMode = wsData.lowPowerMode;
			}
		});
	});

	let configSaving = $state(false);

	const updateConfig = async (config: Partial<Config>) => {
		configSaving = true;
		try {
			const response = await fetch('/api/update_config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ purpose: 'configUpdate', config } as ConfigUpdateRequestPacket)
			});
			if (!response.ok) throw new Error(`Server error: ${response.status}`);
			const result = (await response.json()) as ConfigUpdateResponsePacket;
			if (result.type === 'success') {
				liveData = { ...liveData, ...result.config };
				liveDataUnsaved = { ...liveData };
				return result.message;
			} else {
				throw new Error(result.message);
			}
		} catch (e) {
			throw e instanceof Error ? e : new Error(String(e));
		} finally {
			configSaving = false;
		}
	};

	const updateConfigToastable = async (config: Partial<Config>) => {
		if (configSaving) return;
		toast.promise(updateConfig(config), {
			loading: 'Saving...',
			success: (data) => `${data}`,
			error: (err) => `${err.toString()}`
		}, { duration: 3000, position: 'bottom-right', style: toastStyle });
	};

	const cycleThemeColor = () => {
		const currentIndex = THEME_COLORS.indexOf(liveData.BrandColor as any);
		const nextColor = THEME_COLORS[(currentIndex + 1) % THEME_COLORS.length];
		document.documentElement.style.setProperty('--brand', nextColor);
		colorStore.set(nextColor);
		updateConfig({ BrandColor: nextColor });
	};

	const requestUpdate = () => {
		updateRequested = true;
		send(JSON.stringify({ purpose: 'appUpdate' }));
	};

	const execCommand = (command: 'Shutdown' | 'Restart') => {
		confirmDialog = {
			title: command === 'Shutdown' ? 'Shut Down System' : 'Restart System',
			message: `Are you sure you want to ${command.toLowerCase()} the system? This will stop all monitoring.`,
			confirmLabel: command,
			danger: true,
			onconfirm: () => {
				fetch('/api/power', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ command })
				}).then(async (response) => {
					if (!response.ok) throw new Error(`Server error: ${response.status}`);
					const json = await response.json();
					toast.success(json.message, { duration: 5000, position: 'bottom-right', style: toastStyle });
				}).catch((e) => {
					toast.error(`${command} failed: ${e.message}`, { duration: 5000, position: 'bottom-right', style: toastStyle });
				});
				confirmDialog = null;
				powerMenuOpen = false;
			}
		};
	};

	const deletePrinter = (index: number) => {
		confirmDialog = {
			title: 'Remove Printer',
			message: `Are you sure you want to remove "${liveDataUnsaved.Printers[index]?.Name}"? This cannot be undone.`,
			confirmLabel: 'Remove',
			danger: true,
			onconfirm: () => {
				liveDataUnsaved.Printers = liveDataUnsaved.Printers.filter((_, i) => i !== index);
				expandedPrinters.delete(index);
				confirmDialog = null;
			}
		};
	};

	const addPrinter = () => {
		liveDataUnsaved.Printers = [...liveDataUnsaved.Printers, {
			Name: 'New Printer',
			CameraURL: '',
			WebcamAuthEnabled: false,
			CameraUsername: '',
			CameraPassword: '',
			MoonrakerEnabled: false,
			MoonrakerURL: '',
			MoonrakerPauseThreshold: 90
		}];
		expandedPrinters = new Set([...expandedPrinters, liveDataUnsaved.Printers.length - 1]);
	};

	function togglePrinterExpand(index: number) {
		const next = new Set(expandedPrinters);
		if (next.has(index)) next.delete(index);
		else next.add(index);
		expandedPrinters = next;
	}

	let hasUnsavedChanges = $derived(JSON.stringify(liveData) !== JSON.stringify(liveDataUnsaved));

	function navigate(view: typeof activeView) {
		activeView = view;
		sidebarOpen = false;
	}
</script>

<!-- Sidebar -->
<aside class="sidebar" class:open={sidebarOpen}>
	<div class="sidebar-header">
		<div class="brand">
			<div class="brand-icon">F</div>
			<span class="brand-name">Forgetti</span>
		</div>
		<button class="mobile-close" onclick={() => (sidebarOpen = false)}>
			<Fa icon={faXmark} />
		</button>
	</div>

	<nav class="sidebar-nav">
		<button class="nav-item" class:active={activeView === 'dashboard'} onclick={() => navigate('dashboard')}>
			<Fa icon={faGauge} fw />
			<span>Dashboard</span>
		</button>
		<button class="nav-item" class:active={activeView === 'settings'} onclick={() => navigate('settings')}>
			<Fa icon={faCogs} fw />
			<span>Settings</span>
			{#if hasUnsavedChanges}
				<span class="unsaved-dot"></span>
			{/if}
		</button>
		<button class="nav-item" class:active={activeView === 'logs'} onclick={() => navigate('logs')}>
			<Fa icon={faFileLines} fw />
			<span>Logs</span>
		</button>
	</nav>

	<div class="sidebar-footer">
		<div class="sidebar-actions">
			<button
				class="action-btn"
				onclick={() => updateConfigToastable({ Enabled: !liveData.Enabled })}
				title={liveData.Enabled ? 'Stop Detection' : 'Start Detection'}
			>
				<Fa icon={liveData.Enabled ? faStop : faPlay} color={liveData.Enabled ? 'var(--red)' : 'var(--green)'} />
			</button>
			<button class="action-btn" onclick={cycleThemeColor} title="Change Theme">
				<Fa icon={faPalette} color="var(--brand)" />
			</button>
			<button class="action-btn" onclick={requestUpdate} title="Check for Updates">
				<Fa icon={faSync} spin={updateRequested} color="var(--yellow)" />
			</button>
			<div class="power-group">
				<button class="action-btn" onclick={() => (powerMenuOpen = !powerMenuOpen)} title="Power">
					<Fa icon={faPowerOff} color="var(--red)" />
				</button>
				{#if powerMenuOpen}
					<div class="power-dropdown" transition:fly={{ y: 8, duration: 150 }}>
						<button onclick={() => execCommand('Shutdown')}>
							<Fa icon={faPowerOff} /> Shutdown
						</button>
						<button onclick={() => execCommand('Restart')}>
							<Fa icon={faRotateRight} /> Restart
						</button>
					</div>
				{/if}
			</div>
		</div>
		<div class="connection-status" class:connected={$connectionState === 'connected'} class:connecting={$connectionState === 'connecting'}>
			<Fa icon={$connectionState === 'connected' ? faWifi : faCircle} />
			<span>{$connectionState === 'connected' ? 'Connected' : $connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}</span>
		</div>
	</div>
</aside>

<!-- Main Content -->
<main class="main-content">
	<!-- Mobile Header -->
	<header class="mobile-header">
		<button class="hamburger" onclick={() => (sidebarOpen = true)}>
			<Fa icon={faBars} />
		</button>
		<span class="mobile-title">Forgetti</span>
		<div class="header-status">
			{#if liveData.Enabled}
				<span class="status-pill active"><span class="pulse-dot"></span> Active</span>
			{:else}
				<span class="status-pill">Inactive</span>
			{/if}
		</div>
	</header>

	{#if lowPowerMode}
		<div class="low-power-banner">
			Low Power Mode — reduced monitoring frequency
		</div>
	{/if}

	<!-- Dashboard View -->
	{#if activeView === 'dashboard'}
		<div class="page-content">
			{#if liveData.Printers.length > 1}
				<div class="printer-selector">
					{#each liveData.Printers as printer}
						<button
							class="printer-chip"
							class:active={selectedPrinter.Name === printer.Name}
							onclick={() => (selectedPrinter = printer)}
						>
							<span class="chip-dot" class:enabled={liveData.Enabled}></span>
							{printer.Name}
						</button>
					{/each}
				</div>
			{/if}

			<div class="dashboard-grid">
				<div class="grid-main">
					<Window title="Camera" icon={faVideoCamera}>
						{#snippet buttons()}
							<button onclick={() => lp?.clearCoordinates()} title="Clear region">
								<Fa icon={faTrash} />
							</button>
						{/snippet}
						<LivePreview printer={selectedPrinter} enabled={liveData.Enabled} coordinates={liveData.Coordinates} bind:this={lp} />
					</Window>
				</div>

				<div class="grid-side">
					<Window title="System" icon={faServer}>
						<System />
					</Window>

					{#if selectedPrinter.MoonrakerEnabled}
						<Window title="Moonraker" icon={faSailboat}>
							<Moonraker printer={selectedPrinter} />
						</Window>
					{/if}

					{#if liveData.DetectionHistory?.length > 0}
						<Window title="Recent Detections" icon={faVideoCamera}>
							<div class="detection-history">
								{#each liveData.DetectionHistory.slice(-5).reverse() as entry}
									<div class="history-entry">
										<div class="history-info">
											<span class="history-printer">{entry.printerName}</span>
											<span class="history-conf">{entry.confidence}% ({entry.boxCount} found)</span>
										</div>
										<span class="history-time">{entry.timestamp}</span>
									</div>
								{/each}
							</div>
						</Window>
					{/if}
				</div>
			</div>
		</div>

	<!-- Settings View -->
	{:else if activeView === 'settings'}
		<div class="page-content settings-page">
			<div class="settings-grid">
				<!-- Printers Section -->
				<section class="settings-section">
					<div class="section-header">
						<h2>Printers</h2>
						<button class="add-btn" onclick={addPrinter}>
							<Fa icon={faPlus} /> Add Printer
						</button>
					</div>
					{#each liveDataUnsaved.Printers as printer, i}
						<div class="printer-card">
							<button class="printer-card-header" onclick={() => togglePrinterExpand(i)}>
								<div class="printer-header-left">
									<Fa icon={expandedPrinters.has(i) ? faChevronDown : faChevronRight} />
									<span class="printer-name">{printer.Name || 'Unnamed Printer'}</span>
								</div>
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<span class="delete-btn" onclick={(e) => { e.stopPropagation(); deletePrinter(i); }}>
									<Fa icon={faTrash} />
								</span>
							</button>
							{#if expandedPrinters.has(i)}
								<div class="printer-card-body" transition:fly={{ y: -10, duration: 150 }}>
									<div class="field">
										<label for="pname-{i}">Printer Name</label>
										<input type="text" id="pname-{i}" bind:value={printer.Name} placeholder="My Printer" />
									</div>
									<div class="field">
										<label for="pcam-{i}">Camera URL</label>
										<input type="text" id="pcam-{i}" bind:value={printer.CameraURL} placeholder="http://camera/stream" />
									</div>
									<div class="field-row">
										<label for="pauth-{i}">Webcam Authentication</label>
										<label class="toggle">
											<input type="checkbox" id="pauth-{i}" bind:checked={printer.WebcamAuthEnabled} />
											<span class="toggle-slider"></span>
										</label>
									</div>
									{#if printer.WebcamAuthEnabled}
										<div class="field-group">
											<div class="field">
												<label for="puser-{i}">Username</label>
												<input type="text" id="puser-{i}" bind:value={printer.CameraUsername} placeholder="admin" />
											</div>
											<div class="field">
												<label for="ppass-{i}">Password</label>
												<input type="password" id="ppass-{i}" bind:value={printer.CameraPassword} placeholder="password" />
											</div>
										</div>
									{/if}
									<div class="field-row">
										<label for="pmoon-{i}">Moonraker Integration</label>
										<label class="toggle">
											<input type="checkbox" id="pmoon-{i}" bind:checked={printer.MoonrakerEnabled} />
											<span class="toggle-slider"></span>
										</label>
									</div>
									{#if printer.MoonrakerEnabled}
										<div class="field">
											<label for="pmurl-{i}">Moonraker URL</label>
											<input type="text" id="pmurl-{i}" bind:value={printer.MoonrakerURL} placeholder="http://moonraker/" />
										</div>
										<div class="field">
											<label for="pthresh-{i}">Pause Threshold: {printer.MoonrakerPauseThreshold}%</label>
											<input type="range" id="pthresh-{i}" min={liveDataUnsaved.ConfidenceThreshold} max="100" bind:value={printer.MoonrakerPauseThreshold} />
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</section>

				<!-- Detection Section -->
				<section class="settings-section">
					<div class="section-header">
						<h2>Detection</h2>
					</div>
					<div class="settings-card">
						<div class="field">
							<label for="conf">Confidence Threshold: {liveDataUnsaved.ConfidenceThreshold}%</label>
							<input type="range" id="conf" min="1" max="100" bind:value={liveDataUnsaved.ConfidenceThreshold} />
						</div>
						<div class="field">
							<label for="cpu">CPU Threshold: {liveDataUnsaved.MaxCPU}%</label>
							<input type="range" id="cpu" min="1" max="100" bind:value={liveDataUnsaved.MaxCPU} />
						</div>
						<div class="field">
							<label for="cooldown">Report Cooldown</label>
							<input type="text" id="cooldown" bind:value={liveDataUnsaved.ReportCooldown} placeholder="5 minutes" />
						</div>
						<div class="field">
							<label for="model">Model</label>
							<select id="model" bind:value={liveDataUnsaved.Model}>
								<option value="nano">Nano (fast, lighter)</option>
								<option value="small">Small (accurate, heavier)</option>
							</select>
						</div>
					</div>
				</section>

				<!-- Discord Section -->
				<section class="settings-section">
					<div class="section-header">
						<h2>Discord Notifications</h2>
					</div>
					<div class="settings-card">
						<div class="field-row">
							<label for="discord-enabled">Enable Discord</label>
							<label class="toggle">
								<input type="checkbox" id="discord-enabled" bind:checked={liveDataUnsaved.DiscordWebhookEnabled} />
								<span class="toggle-slider"></span>
							</label>
						</div>
						{#if liveDataUnsaved.DiscordWebhookEnabled}
							<div class="field">
								<label for="discord-url">Webhook URL</label>
								<input type="text" id="discord-url" bind:value={liveDataUnsaved.DiscordWebhookURL} placeholder="https://discord.com/api/webhooks/..." />
							</div>
							<div class="field-row">
								<label for="discord-ping">Ping User on Detection</label>
								<label class="toggle">
									<input type="checkbox" id="discord-ping" bind:checked={liveDataUnsaved.DiscordUserPingEnabled} />
									<span class="toggle-slider"></span>
								</label>
							</div>
							{#if liveDataUnsaved.DiscordUserPingEnabled}
								<div class="field">
									<label for="discord-uid">Discord User ID</label>
									<input type="text" id="discord-uid" bind:value={liveDataUnsaved.DiscordUserPing} placeholder="123456789012345678" />
								</div>
							{/if}
						{/if}
					</div>
				</section>
			</div>

			{#if hasUnsavedChanges}
				<div class="fab-container" transition:fly={{ y: 20, duration: 200 }}>
					<button class="fab" onclick={() => updateConfigToastable(liveDataUnsaved)} disabled={configSaving}>
						<Fa icon={faFloppyDisk} /> {configSaving ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			{/if}
		</div>

	<!-- Logs View -->
	{:else if activeView === 'logs'}
		<Logs />
	{/if}
</main>

{#if sidebarOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="sidebar-backdrop" onclick={() => (sidebarOpen = false)}></div>
{/if}

{#if confirmDialog}
	<ConfirmDialog
		title={confirmDialog.title}
		message={confirmDialog.message}
		confirmLabel={confirmDialog.confirmLabel}
		danger={confirmDialog.danger}
		onconfirm={confirmDialog.onconfirm}
		oncancel={() => (confirmDialog = null)}
	/>
{/if}

<style>
	/* ========== Sidebar ========== */
	.sidebar {
		width: 240px;
		background-color: var(--bg-secondary);
		border-right: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		height: 100vh;
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.sidebar-header {
		padding: 1.25rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.brand-icon {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		background: linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand), #000 25%));
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 800;
		font-size: 1rem;
		color: white;
	}

	.brand-name {
		font-weight: 700;
		font-size: 1.0625rem;
		letter-spacing: -0.01em;
	}

	.mobile-close {
		display: none;
		padding: 0.375rem;
		border-radius: var(--radius-sm);
		color: var(--text-muted);
	}

	.sidebar-nav {
		flex: 1;
		padding: 0.75rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.75rem;
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		transition: all var(--transition-fast);
		position: relative;
	}

	.nav-item:hover {
		background-color: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.nav-item.active {
		background-color: var(--bg-tertiary);
		color: var(--text-primary);
		font-weight: 600;
	}

	.nav-item.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 60%;
		background-color: var(--brand);
		border-radius: var(--radius-full);
	}

	.unsaved-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--brand);
		margin-left: auto;
	}

	.sidebar-footer {
		padding: 0.75rem;
		border-top: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.sidebar-actions {
		display: flex;
		gap: 0.25rem;
		justify-content: center;
	}

	.action-btn {
		padding: 0.5rem;
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		transition: all var(--transition-fast);
	}

	.action-btn:hover {
		background-color: var(--bg-tertiary);
	}

	.power-group {
		position: relative;
	}

	.power-dropdown {
		position: absolute;
		bottom: 100%;
		right: 0;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.25rem;
		box-shadow: var(--shadow-lg);
		min-width: 140px;
		margin-bottom: 0.25rem;
		z-index: 60;
	}

	.power-dropdown button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.625rem;
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
		color: var(--text-secondary);
		transition: all var(--transition-fast);
	}

	.power-dropdown button:hover {
		background-color: var(--bg-hover);
		color: var(--text-primary);
	}

	.connection-status {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.6875rem;
		color: var(--text-muted);
		justify-content: center;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.connection-status.connected {
		color: var(--green);
	}

	.connection-status.connecting {
		color: var(--yellow);
	}

	/* ========== Main Content ========== */
	.main-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.mobile-header {
		display: none;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background-color: var(--bg-secondary);
		border-bottom: 1px solid var(--border-subtle);
	}

	.hamburger {
		padding: 0.375rem;
		font-size: 1.125rem;
		color: var(--text-secondary);
	}

	.mobile-title {
		font-weight: 700;
		font-size: 1rem;
	}

	.status-pill {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		border-radius: var(--radius-full);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background-color: var(--bg-tertiary);
		color: var(--text-muted);
	}

	.status-pill.active {
		background-color: rgba(34, 197, 94, 0.15);
		color: var(--green);
	}

	.pulse-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--green);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	.header-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.low-power-banner {
		background-color: rgba(234, 179, 8, 0.15);
		color: var(--yellow);
		padding: 0.5rem 1rem;
		text-align: center;
		font-size: 0.8125rem;
		font-weight: 600;
		border-bottom: 1px solid rgba(234, 179, 8, 0.2);
	}

	/* ========== Dashboard ========== */
	.page-content {
		flex: 1;
		padding: 1.25rem;
		overflow-y: auto;
	}

	.printer-selector {
		display: flex;
		gap: 0.375rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.printer-chip {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 500;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		color: var(--text-secondary);
		transition: all var(--transition-fast);
	}

	.printer-chip:hover {
		border-color: var(--border);
		color: var(--text-primary);
	}

	.printer-chip.active {
		background-color: var(--bg-tertiary);
		border-color: var(--brand);
		color: var(--text-primary);
	}

	.chip-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--text-muted);
	}

	.chip-dot.enabled {
		background-color: var(--green);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: auto 340px;
		gap: 1rem;
		align-items: start;
	}

	.grid-main {
		min-width: 0;
		max-width: fit-content;
	}

	.grid-side {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* ========== Settings ========== */
	.settings-page {
		max-width: 1200px;
		margin: 0 auto;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		align-items: start;
	}

	.settings-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.settings-section:first-child {
		grid-column: 1 / -1;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.section-header h2 {
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.add-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-md);
		font-size: 0.8125rem;
		font-weight: 600;
		background-color: var(--brand);
		color: white;
		transition: all var(--transition-fast);
	}

	.add-btn:hover {
		filter: brightness(1.1);
	}

	.settings-card {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.printer-card {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.printer-card-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 1rem;
		transition: background-color var(--transition-fast);
	}

	.printer-card-header:hover {
		background-color: var(--bg-tertiary);
	}

	.printer-header-left {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		color: var(--text-secondary);
		font-size: 0.75rem;
	}

	.printer-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.delete-btn {
		padding: 0.375rem;
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		transition: all var(--transition-fast);
	}

	.delete-btn:hover {
		color: var(--red);
		background-color: rgba(239, 68, 68, 0.1);
	}

	.printer-card-body {
		padding: 0 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border-top: 1px solid var(--border-subtle);
	}

	.printer-card-body {
		padding-top: 1rem;
	}

	/* ========== Form Fields ========== */
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field label {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.field input[type='text'],
	.field input[type='password'],
	.field select {
		width: 100%;
		padding: 0.5rem 0.75rem;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-size: 0.875rem;
		transition: border-color var(--transition-fast);
	}

	.field input:focus,
	.field select:focus {
		outline: none;
		border-color: var(--brand);
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
	}

	.field input::placeholder {
		color: var(--text-muted);
	}

	.field select {
		appearance: none;
		background-image: url('data:image/svg+xml;utf8,<svg fill="%23a1a1aa" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>');
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		padding-right: 2rem;
	}

	.field input[type='range'] {
		width: 100%;
		height: 6px;
		appearance: none;
		background: var(--bg-primary);
		border-radius: var(--radius-full);
		outline: none;
	}

	.field input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--brand);
		cursor: pointer;
		border: 2px solid var(--bg-secondary);
	}

	.field-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.field-row label:first-child {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.field-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	/* Toggle Switch */
	.toggle {
		position: relative;
		display: inline-block;
		width: 36px;
		height: 20px;
		cursor: pointer;
	}

	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		inset: 0;
		background-color: var(--bg-hover);
		border-radius: var(--radius-full);
		transition: background-color var(--transition-fast);
	}

	.toggle-slider::before {
		content: '';
		position: absolute;
		height: 14px;
		width: 14px;
		left: 3px;
		bottom: 3px;
		background-color: var(--text-primary);
		border-radius: 50%;
		transition: transform var(--transition-fast);
	}

	.toggle input:checked + .toggle-slider {
		background-color: var(--brand);
	}

	.toggle input:checked + .toggle-slider::before {
		transform: translateX(16px);
	}

	/* ========== FAB ========== */
	.fab-container {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		z-index: 40;
	}

	.fab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background-color: var(--brand);
		color: white;
		border-radius: var(--radius-full);
		font-size: 0.875rem;
		font-weight: 600;
		box-shadow: var(--shadow-lg);
		transition: all var(--transition-fast);
	}

	.fab:hover:not(:disabled) {
		filter: brightness(1.1);
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(249, 115, 22, 0.3);
	}

	.fab:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* ========== Detection History ========== */
	.detection-history {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
	}

	.history-entry {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border-subtle);
		font-size: 0.8125rem;
	}

	.history-entry:last-child {
		border-bottom: none;
	}

	.history-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.history-printer {
		font-weight: 600;
	}

	.history-conf {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.history-time {
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	/* ========== Backdrop ========== */
	.sidebar-backdrop {
		display: none;
	}

	/* ========== Responsive ========== */
	@media (max-width: 768px) {
		.sidebar {
			position: fixed;
			left: -240px;
			top: 0;
			height: 100vh;
			transition: left var(--transition-normal);
			z-index: 100;
		}

		.sidebar.open {
			left: 0;
		}

		.mobile-close {
			display: block;
		}

		.mobile-header {
			display: flex;
		}

		.sidebar-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			background-color: rgba(0, 0, 0, 0.5);
			z-index: 90;
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
		}

		.field-group {
			grid-template-columns: 1fr;
		}

		.settings-page {
			padding: 0.75rem;
		}

		.settings-grid {
			grid-template-columns: 1fr;
		}

		.settings-section:first-child {
			grid-column: auto;
		}
	}

	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
