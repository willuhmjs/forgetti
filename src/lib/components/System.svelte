<script lang="ts">
	import CircularBar from './CircularBar.svelte';
	import Fa from 'svelte-fa';
	import {
		faQuestionCircle,
		type IconDefinition,
		faServer,
		faTemperatureLow,
		faTemperatureHigh,
		faWifi,
		faUpload,
		faDownload
	} from '@fortawesome/free-solid-svg-icons';
	import { faWindows, faApple, faLinux } from '@fortawesome/free-brands-svg-icons';
	import LoadingBar from './LoadingBar.svelte';

	// Static placeholder values
	let socketData = {
		distro: 'Ubuntu',
		release: '20.04',
		codename: 'Focal Fossa',
		platform: 'linux',
		kernel: '5.4.0-42-generic',
		cpuTemp: 55,
		netTX: 2048,
		netRX: 4096,
		memPercent: 45,
		loadPercent: 30
	};

	function convertToLargestUnit(kilobytes: number) {
		let units = ['KB', 'MB', 'GB', 'TB', 'PB'];
		let index = 0;

		while (kilobytes >= 1024 && index < units.length - 1) {
			kilobytes /= 1024;
			index++;
		}

		return `${kilobytes.toFixed(2)} ${units[index]}`;
	}

	let platformIcon: IconDefinition = faQuestionCircle;

	if (socketData.platform.toLowerCase().includes('win')) {
		platformIcon = faWindows;
	} else if (socketData.platform.toLowerCase().includes('mac')) {
		platformIcon = faApple;
	} else if (socketData.platform.toLowerCase().includes('linux')) {
		platformIcon = faLinux;
	}
</script>

<div class="systemContainer">
	<div>
		<p class="spec">
			<span class="icon"><Fa icon={platformIcon} /></span>{socketData.distro}
			{socketData.release} {socketData.codename ? `(${socketData.codename})` : ''}
		</p>
		<p class="spec">
			<span class="icon"><Fa icon={faServer} /></span>{socketData.platform}
			{socketData.kernel}
		</p>
		<p class="spec">
			<span class="icon"
				><Fa icon={socketData.cpuTemp > 60 ? faTemperatureHigh : faTemperatureLow} /></span
			>{socketData.cpuTemp}°C
		</p>
		<p class="spec">
			<span class="icon"><Fa icon={faWifi} /></span>{convertToLargestUnit(socketData.netTX)}
			<span class="icon"> <Fa icon={faUpload} /></span> / {convertToLargestUnit(socketData.netRX)}
			<span class="icon">
				<Fa icon={faDownload} />
			</span>
		</p>
	</div>
	<div class="circularBarContainer">
		<div class="circularBarWrapper">
			<div class="circularBarSubContainer">
				<CircularBar
					bind:value={socketData.memPercent}
					color="var(--brand)"
					trackColor="var(--background)"
					textColor="#fff"
				/>
			</div>
			<p>MEM</p>
		</div>
		<div class="circularBarWrapper">
			<div class="circularBarSubContainer">
				<CircularBar
					bind:value={socketData.loadPercent}
					color="var(--brand)"
					trackColor="var(--background)"
					textColor="#fff"
				/>
			</div>
			<p>CPU</p>
		</div>
	</div>
</div>

<style>
	.spec {
		font-size: 0.9rem;
	}

	.spec .icon:first-of-type {
		margin-right: 0.5rem;
	}

	.spec .icon {
		color: var(--brand);
	}

	.circularBarWrapper {
		text-align: center;
		margin: auto;
	}

	.systemContainer {
		display: flex;
		padding: 0 1rem;
		gap: 1.5rem;
		justify-content: space-between;
		align-items: middle;
	}

	.circularBarSubContainer {
		width: 75px;
		height: 75px;
	}

	.circularBarContainer {
		display: flex;
		gap: 0.75rem;
	}
</style>
