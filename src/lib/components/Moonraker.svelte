<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faHourglassHalf,
		faRuler,
		faSpinner,
		faCube,
		faIndustry
	} from '@fortawesome/free-solid-svg-icons';
	import LoadingBar from './LoadingBar.svelte';

	// Static placeholder values
	let latestStats = {
		filename: 'example.gcode',
		state: 'printing',
		filament_used: 12345
	};
</script>

<div class="moonrakerContainer">
	<div>
		{#if latestStats}
			{#if latestStats.state !== 'standbys'}
				<p class="spec">
					<span class="icon">
						<Fa icon={faCube} />
					</span>
					{latestStats.filename || "No file loaded"}
				</p>
				<p class="spec">
					<span class="icon">
						{#if latestStats.state == 'printing'}
							<Fa icon={faSpinner} spin />
						{:else if latestStats.state == 'paused'}
							<Fa icon={faHourglassHalf} />
						{:else}
							<Fa icon={faIndustry} />
						{/if}
					</span>
					{latestStats.state.toUpperCase()}
				</p>
				<p class="spec">
					<span class="icon">
						<Fa icon={faRuler} />
					</span>
					{(latestStats.filament_used / 1000).toFixed(2)}m
				</p>
			{:else}
				<p class="spec">
					<span class="icon">
						<Fa icon={faHourglassHalf} />
					</span>
					{latestStats.state.toUpperCase()}
				</p>
			{/if}
		{:else}
			<LoadingBar />
		{/if}
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

	.moonrakerContainer {
		display: flex;
		padding: 0 1rem;
		gap: 1.5rem;
		justify-content: space-between;
		align-items: middle;
		width: 100%;
	}
</style>
