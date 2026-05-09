<script lang="ts">
	import LivePreview from '$lib/components/LivePreview.svelte';
	import System from '$lib/components/System.svelte';
	import Moonraker from '$lib/components/Moonraker.svelte';
	import Window from '$lib/components/Window.svelte';
	import Logs from '$lib/components/Logs.svelte';
	import Fa from 'svelte-fa';
	import { fly } from 'svelte/transition';
	import { send, socketStore } from '$lib/wsClient';
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
		faHome,
		faCog,
		faFloppyDisk,
		faSailboat,
		faTrash
	} from '@fortawesome/free-solid-svg-icons';
	import type { Config, ConfigUpdateRequestPacket, ConfigUpdateResponsePacket } from '$lib/types';
	import toast from 'svelte-french-toast';
	import { onMount } from 'svelte';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import colorStore from '$lib/colorStore';
	import colorMap from '$lib/colorMap';
	interface Props {
		data: Config;
	}

	let { data }: Props = $props();
	let liveData: Config = $state({ ...data });
	let liveDataUnsaved: Config = $state({ ...data });
	let selectedPrinter = $state(liveData.Printers[0]);
	const colors = ['var(--orange)', 'var(--red)', 'var(--green)', 'var(--blue)'];
	let color = data.BrandColor;
	let powerMenu: HTMLDivElement | undefined = $state();
	let lp: LivePreview;

	let activeWindow: 'home' | 'config' | 'logs' = $state('home');
	const updateConfig = async (config: Partial<Config>) => {
		return new Promise((resolve, reject) => {
			fetch('/api/update_config', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					purpose: 'configUpdate',
					config
				} as ConfigUpdateRequestPacket)
			}).then(async (response) => {
				const data = (await response.json()) as ConfigUpdateResponsePacket;
				if (data.type === 'success') {
					liveData = { ...liveData, ...data.config };
					liveDataUnsaved = { ...liveData }; // Update liveDataUnsaved with the new liveData
					resolve(data.message);
				} else {
					reject(data.message);
				}
			});
		});
	};

	const updateConfigToastable = async (config: Partial<Config>) => {
		toast.promise(
			updateConfig(config),
			{
				loading: 'Loading...',
				success: (data) => `${data}`,
				error: (err) => `${err.toString()}`
			},
			{
				duration: 5000,
				position: 'bottom-right',
				style: ['background-color: var(--foreground);', 'color: white'].join('')
			}
		);
	};

	const cycleThemeColor = () => {
		color = colors[(colors.indexOf(color) + 1) % colors.length];
		updateConfig({
			BrandColor: color
		});
		document.documentElement.style.setProperty('--brand', color);
		const colorValue = colorMap.get(color);
		if (colorValue) {
			colorStore.set(colorValue);
		}
	};

	let updateRequested = $state(false);
	
	const requestUpdate = () => {
		updateRequested = true;
		send(JSON.stringify({ purpose: 'appUpdate' }));
	};

	const openPowerWindow = () => {
		if (powerMenu) powerMenu.style.display = powerMenu!.style.display === 'none' ? 'block' : 'none';
	};

	const execCommand = (command: 'Shutdown' | 'Restart') => {
		fetch('/api/power', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ command })
		}).then(async (response) => {
			const json = await response.json();
			toast.success(json.message, {
				duration: 5000,
				position: 'bottom-right',
				style: ['background-color: var(--foreground);', 'color: white'].join('')
			});
		});
	};

	let lowPowerMode = $state(false);

	onMount(() => {
		if (powerMenu) {
			powerMenu.style.display = 'none';
		}
		document.documentElement.style.setProperty('--brand', data.BrandColor);
		const colorValue = colorMap.get(color);
		if (colorValue) {
			colorStore.set(colorValue);
		}
		socketStore.subscribe((data) => {
			if (!data) return;
			if (data.purpose === 'appUpdate' && data.toastable) {
				updateRequested = false;
				toast[data.type](data.message, {
					duration: 5000,
					position: 'bottom-right',
					style: ['background-color: var(--foreground);', 'color: white'].join('')
				});
			} else if (data?.purpose === 'system') {
			lowPowerMode = data.lowPowerMode;
		}
		});
	
	});
</script>

{#if lowPowerMode}
	<div class="low-power-banner">
		<p>Low Power Mode Enabled</p>
	</div>
{/if}

<div class="titlebar">
	<h3 class="title">Forgetti</h3>
	<div class="buttons">
		<button class="button button--icon nav-button" onclick={() => (activeWindow = 'home')}>
				<Fa icon={faHome} fw={true} color={activeWindow === 'home' ? 'var(--brand)' : ''} />
		</button>
		<button class="button button--icon nav-button" onclick={() => (activeWindow = 'config')}>
			<Fa icon={faCogs} fw={true} color={activeWindow === 'config' ? 'var(--brand)' : ''} />
		</button>
		<button class="button button--icon nav-button" onclick={() => (activeWindow = 'logs')}>
			<Fa icon={faFileLines} fw={true} color={activeWindow === 'logs' ? 'var(--brand)' : ''} />
		</button>
	</div>
	<div class="buttons">
		<button class="button button--icon" onclick={() => updateConfigToastable({ Enabled: !liveData.Enabled })}>
			<Fa
				icon={liveData.Enabled ? faStop : faPlay}
				color={liveData.Enabled ? 'var(--red)' : 'var(--green)'}
			/>
		</button>
		<button id="color" class="button button--icon" onclick={cycleThemeColor}>
			<Fa icon={faPalette} />
		</button>
		<button id="update" class="button button--icon" onclick={requestUpdate}>
			<Fa icon={faSync} spin={updateRequested} color="var(--yellow)" />
		</button>
		<button id="power" class="button button--icon" onclick={openPowerWindow}>
			<Fa icon={faPowerOff} />
		</button>
	</div>
	<div class="power-menu" bind:this={powerMenu}>
		<button class="power-menu-item" onclick={() => execCommand('Shutdown')}
			><Fa icon={faPowerOff} class="pm-icon" />Shutdown</button
		>
		<button class="power-menu-item" onclick={() => execCommand('Restart')}
			><Fa icon={faRotateRight} class="pm-icon" />Restart</button
		>
	</div>
</div>

{#if activeWindow === 'home'}
		<div class="printer-tabs">
	{#each liveData.Printers as printer}
			<button class="printer-tab" onclick={() => (selectedPrinter = printer)} class:active={selectedPrinter.Name === printer.Name}>
				{printer.Name}
			</button>
		{/each}
	</div>
	<div class="window-container">
	<Window title="Camera" icon={faVideoCamera}>
		{#snippet buttons()}
				<button onclick={lp.clearCoordinates} class="button button--icon title-button">
					<Fa icon={faTrash} />
				</button>
			{/snippet}
			<LivePreview printer={selectedPrinter} enabled={liveData.Enabled} coordinates={liveData.Coordinates} bind:this={lp} />
		</Window>

		<Window title="System" icon={faServer}>
			<System />
		</Window>

		{#if selectedPrinter.MoonrakerEnabled}
			<Window title="Moonraker" icon={faSailboat}>
				<Moonraker printer={selectedPrinter} />
			</Window>
		{/if}
	</div>
{:else if activeWindow === 'config'}
		<div class="window-container">
		<Window title="Printers" icon={faCog}>
			<div class="form">
				{#each liveDataUnsaved.Printers as printer, i}
					<div class="printer-config">
						<div class="inputGroup">
							<label for="PrinterName-{i}">Printer Name</label>
							<input
								type="text"
								id="PrinterName-{i}"
								bind:value={printer.Name}
								placeholder="My Printer"
							/>
						</div>
						<div class="inputGroup">
							<label for="CameraURL-{i}">Camera URL</label>
							<input
								type="text"
								id="CameraURL-{i}"
								bind:value={printer.CameraURL}
								placeholder="http://yourcameraurl.com"
							/>
						</div>
						<div class="inputGroup">
							<label for="WebcamAuthEnabled-{i}">Webcam Authentication</label>
							<input
								type="checkbox"
								id="WebcamAuthEnabled-{i}"
								bind:checked={printer.WebcamAuthEnabled}
							/>
						</div>
						{#if printer.WebcamAuthEnabled}
							<div class="inputGroup">
								<label for="CameraUsername-{i}">Username</label>
								<input
									type="text"
									id="CameraUsername-{i}"
									bind:value={printer.CameraUsername}
									placeholder="admin"
								/>
							</div>
							<div class="inputGroup">
								<label for="CameraPassword-{i}">Password</label>
								<input
									type="password"
									id="CameraPassword-{i}"
									bind:value={printer.CameraPassword}
									placeholder="password"
								/>
							</div>
						{/if}
						<div class="inputGroup">
							<label for="MoonrakerEnabled-{i}">Moonraker Enabled</label>
							<input
								type="checkbox"
								id="MoonrakerEnabled-{i}"
								bind:checked={printer.MoonrakerEnabled}
							/>
						</div>
						{#if printer.MoonrakerEnabled}
							<div class="inputGroup">
								<label for="MoonrakerURL-{i}">Moonraker URL</label>
								<input
									type="text"
									id="MoonrakerURL-{i}"
									bind:value={printer.MoonrakerURL}
									placeholder="http://yourmoonrakerurl.com"
								/>
							</div>
							<div class="inputGroup">
								<label for="MoonrakerPauseThreshold-{i}"
									>Pause Threshold ({printer.MoonrakerPauseThreshold}%)</label
								>
								<input
									type="range"
									id="MoonrakerPauseThreshold-{i}"
									min={liveDataUnsaved.ConfidenceThreshold}
									max="100"
									bind:value={printer.MoonrakerPauseThreshold}
								/>
							</div>
						{/if}
						<button class="button button--icon button--danger delete-printer" onclick={() => liveDataUnsaved.Printers.splice(i, 1)}>
							<Fa icon={faTrash} />
						</button>
					</div>
				{/each}
				<button class="button button--primary add-printer" onclick={() => liveDataUnsaved.Printers.push({ Name: 'New Printer', CameraURL: '', WebcamAuthEnabled: false, CameraUsername: '', CameraPassword: '', MoonrakerEnabled: false, MoonrakerURL: '', MoonrakerPauseThreshold: 90 })}>
					Add Printer
				</button>
			</div>
		</Window>
		<Window title="General" icon={faCog}>
			<div class="form">
				<div class="inputGroup">
					<label for="ConfidenceThreshold"
						>Confidence Threshold ({liveDataUnsaved.ConfidenceThreshold}%)</label
					>
					<input
						type="range"
						id="ConfidenceThreshold"
						min="1"
						max="100"
						bind:value={liveDataUnsaved.ConfidenceThreshold}
					/>
				</div>
				<div class="inputGroup">
					<label for="MaxCPU"
						>CPU Threshold ({liveDataUnsaved.MaxCPU}%)</label
					>
					<input
						type="range"
						id="MaxCPU"
						min="1"
						max="100"
						bind:value={liveDataUnsaved.MaxCPU}
					/>
				</div>
				<div class="inputGroup">
					<label for="ReportCooldown">Report Cooldown</label>
					<input
						type="text"
						id="ReportCooldown"
						bind:value={liveDataUnsaved.ReportCooldown}
						placeholder="5 minutes"
					/>
				</div>
				<div class="inputGroup">
					<label for="Model">Model</label>
					<select id="Model" bind:value={liveDataUnsaved.Model}>
						<option value="nano" selected>Nano</option>
						<option value="small">Small</option>
					</select>
				</div>
		</Window>

		<Window title="Discord" icon={faDiscord}>
			<div class="form">
				<div class="inputGroup">
					<label for="DiscordWebhookEnabled">Enabled</label>
					<input
						type="checkbox"
						id="DiscordWebhookEnabled"
						bind:checked={liveDataUnsaved.DiscordWebhookEnabled}
					/>
				</div>
				{#if liveDataUnsaved.DiscordWebhookEnabled}
					<div class="inputGroup">
						<label for="DiscordWebhookURL">Webhook URL</label>
						<input
							type="text"
							id="DiscordWebhookURL"
							bind:value={liveDataUnsaved.DiscordWebhookURL}
							placeholder="https://discord.com/api/webhooks/yourwebhookid/yourwebhooktoken"
						/>
					</div>
					<div class="inputGroup">
						<label for="DiscordUserPingEnabled">Ping User</label>
						<input
							type="checkbox"
							id="DiscordUserPingEnabled"
							bind:checked={liveDataUnsaved.DiscordUserPingEnabled}
						/>
					</div>
					{#if liveDataUnsaved.DiscordUserPingEnabled}
						<div class="inputGroup">
							<label for="DiscordUserPing">Ping User ID</label>
							<input
								type="text"
								id="DiscordUserPing"
								bind:value={liveDataUnsaved.DiscordUserPing}
								placeholder="969629831300005918"
							/>
						</div>
					{/if}
				{/if}
			</div>
		</Window>

		<Window title="Moonraker" icon={faSailboat}>
			<div class="form">
			</div>
		</Window>
	</div>

	<!-- only show if liveconfig differs from data -->
	{#if JSON.stringify(liveData) !== JSON.stringify(liveDataUnsaved)}
		<div class="saveButtonDiv">
			<button
				onclick={() => updateConfigToastable(liveDataUnsaved)}
				class="button button--primary button--fab saveButton"
				transition:fly={{ y: 100 }}
			>
				<Fa fw icon={faFloppyDisk} />
			</button>
		</div>
	{/if}
{:else if activeWindow === 'logs'}
	<Logs />
{/if}

<style>
	.window-container {
		display: grid;
		gap: 16px;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		align-items: start;
		padding: 0 4px 16px;
	}

	.printer-tabs {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.35rem;
		background-color: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 999px;
		width: fit-content;
	}

	.printer-tab {
		appearance: none;
		font: inherit;
		border: 1px solid transparent;
		border-radius: 999px;
		padding: 0.45rem 0.9rem;
		cursor: pointer;
		color: var(--text-muted);
		font-size: 0.9rem;
		transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
		background: transparent;
	}

	.printer-tab.active {
		background: var(--surface);
		border-color: var(--border);
		color: var(--text);
		box-shadow: 0 10px 24px rgba(2, 6, 23, 0.35);
	}

	.printer-tab:hover {
		background: var(--surface-3);
		color: var(--text);
	}

	.printer-config {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 1rem;
		display: grid;
		gap: 0.85rem;
		position: relative;
		background: var(--surface-2);
	}

	.delete-printer {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
	}

	.add-printer {
		align-self: flex-start;
	}

	.titlebar {
		position: sticky;
		top: 16px;
		z-index: 10;
		max-width: 100%;
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(34, 197, 94, 0.08)),
			var(--surface);
		padding: 1rem 1.25rem;
		margin: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		box-shadow: var(--shadow-soft);
		border-radius: var(--radius-lg);
		border: 1px solid var(--border);
		backdrop-filter: blur(12px);
		font-size: 18px;
	}

	.title {
		margin: 0;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.buttons {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.buttons #power {
		color: var(--red);
		border-color: rgba(248, 113, 113, 0.4);
		background: rgba(248, 113, 113, 0.12);
	}

	.buttons #color {
		color: var(--brand);
	}

	.buttons #update {
		color: var(--yellow);
	}

	.power-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background-color: var(--surface);
		min-width: 180px;
		box-shadow: var(--shadow-soft);
		z-index: 1;
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
		padding: 0.4rem;
		display: none;
	}

	.power-menu-item {
		appearance: none;
		font: inherit;
		color: inherit;
		padding: 0.6rem 0.75rem;
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		box-sizing: border-box;
		text-align: left;
		border: none;
		background: transparent;
		border-radius: var(--radius-sm);
		font-size: 0.95rem;
		cursor: pointer;
	}

	.power-menu-item:hover {
		background-color: var(--surface-2);
	}

	:global(.pm-icon) {
		margin-right: 0.5rem;
	}

	.form {
		width: 100%;
		max-width: 420px;
		margin: auto;
		padding: 0.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.inputGroup {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.inputGroup label {
		display: block;
		font-weight: 600;
		color: var(--text-muted);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.saveButtonDiv {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		overflow: hidden;
		z-index: 20;
	}

	.saveButton {
		font-size: 1.2rem;
	}

	.title-button {
		background: rgba(248, 113, 113, 0.15);
		border-color: rgba(248, 113, 113, 0.4);
		color: var(--red);
	}

	.low-power-banner {
		background-color: rgba(248, 113, 113, 0.15);
		color: var(--red);
		padding: 0.4rem 0.75rem;
		text-align: center;
		font-weight: 600;
		border: 1px solid rgba(248, 113, 113, 0.5);
		border-radius: var(--radius-sm);
	}

	@media screen and (max-width: 576px) {
		.titlebar {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.buttons {
			margin-top: 1rem;
		}

		.buttons button {
			margin: 0;
		}
	}
</style>
