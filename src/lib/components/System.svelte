<script lang="ts">
    import { onMount } from 'svelte';
    import socketStore from "$lib/wsStore";
	import CircularBar from './CircularBar.svelte';
    import type { SystemInfo } from '$lib/types';
    import Fa from "svelte-fa";
    import { faSync, faQuestionCircle, type IconDefinition, faServer, faTemperatureLow, faTemperatureHigh } from '@fortawesome/free-solid-svg-icons';
    import { faWindows, faApple, faLinux } from '@fortawesome/free-brands-svg-icons';

    let socketData: SystemInfo;

    onMount(() => {
        socketStore.subscribe((data) => {
			if (data?.purpose === "system") {
                socketData = data
			}
		})
    })

    let platformIcon: IconDefinition = faQuestionCircle;

    $: {
        if (socketData?.platform) {
            if (socketData.platform.toLowerCase().includes('win')) {
                platformIcon = faWindows;
            } else if (socketData.platform.toLowerCase().includes('mac')) {
                platformIcon = faApple;
            } else if (socketData.platform.toLowerCase().includes('linux')) {
                platformIcon = faLinux;
            }
        }
    }
</script>
<div>
{#if socketData}
    <CircularBar bind:value={socketData.memPercent} color="var(--brand)" trackColor="var(--background)" textColor="#fff"/>
    <CircularBar bind:value={socketData.loadPercent} color="var(--brand)" trackColor="var(--background)" textColor="#fff"/>
    <p><Fa icon={platformIcon} /> {socketData.distro} {socketData.release} ({socketData.codename})</p>
    <p><Fa icon={faServer} />{socketData.platform} {socketData.kernel}</p>
    <p><Fa icon={socketData.cpuTemp > 60 ? faTemperatureHigh : faTemperatureLow}/>{socketData.cpuTemp}</p>
{:else}
    <Fa icon={faSync} spin />
{/if}
</div>
