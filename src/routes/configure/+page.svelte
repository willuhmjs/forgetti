<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import toast from "svelte-french-toast";
	import liveData from '$lib/liveData';
	import type { Config, ConfigUpdateRequestPacket, ConfigUpdateResponsePacket } from '$lib/types';
	import { faGear } from '@fortawesome/free-solid-svg-icons';
    import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	export let data: Config;

	const updateConfig = async (config: Partial<Config>) => {
		return new Promise((resolve, reject) => {
			fetch('/api/update_config', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					purpose: "configUpdate",
					config
				} as ConfigUpdateRequestPacket)
			}).then(async response => {
				const data = await response.json() as ConfigUpdateResponsePacket;
				if (data.type === "success") {
					$liveData = { ...$liveData, ...data.config };
					resolve(data.message);
				} else {
					reject(data.message);
				}
			});
		});

	};

	const updateConfigToastable = async (config: Partial<Config>) => {
		toast.promise(updateConfig(config), {
			loading: 'Loading',
			success: (data) => `${data}`,
			error: (err) => `${err.toString()}`,
		}, {
			duration: 5000,
			position: 'bottom-right',
			style: [
				"background-color: var(--foreground);",
				"color: white",
			].join(""),
		})
	}
</script>

<div class="window-container">
	<Window title="General" icon={faGear}>
        <form on:submit|preventDefault={() => {
			updateConfigToastable({
				CameraURL: $liveData?.CameraURL,
			})
		}}>
			<input type="text" value={$liveData?.CameraURL} />
			<button type="submit">Submit</button>
		</form>
	</Window>

	<Window title="Discord" icon={faDiscord}>
        TODO IMPL
	</Window>
</div>

<style>
	.window-container {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: flex-start;
		padding: 10px;
	}
</style>