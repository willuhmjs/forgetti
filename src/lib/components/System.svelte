<script lang="ts">
    import { onMount } from 'svelte';
    import socketStore from "$lib/wsStore";
    import type { SystemInfo } from '$lib/types';
    import Fa from "svelte-fa";
    import { faSync } from '@fortawesome/free-solid-svg-icons';
    let socketData: SystemInfo;

    onMount(() => {
        socketStore.subscribe((data) => {
			if (data?.purpose === "system") {
                socketData = data
			}
		})
    })
</script>
<div>
{#if socketData}
    <p>{socketData.distro} {socketData.release} ({socketData.codename})</p>
    <p>{socketData.platform} {socketData.kernel}</p>
{:else}
    <Fa icon={faSync} spin />
{/if}
</div>
