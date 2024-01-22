<script lang="ts">
    import Fa from "svelte-fa";
    import { faPowerOff, faSync, faPalette } from "@fortawesome/free-solid-svg-icons";
	import type { Config } from "$lib/types";
    export let data: Config;
    const colors = ["#f97316", "#ff0000", "#00ff00", "#0000ff"];
    let color = data.Hidden.BrandColor;

    const cycleThemeColor = () => {
        color = colors[(colors.indexOf(color) + 1) % colors.length];
        fetch('/api/configure', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category: "Hidden",
                key: "BrandColor",
                value: color
            })
        });
        document.documentElement.style.setProperty("--brand", color);
    };

    const requestUpdate = () => {
    };

    const openPowerWindow = () => {
    };
</script>

<div class="titlebar">
    <h3 class="title">Forgetti</h3>
    <div class="buttons">
        <button id="color" on:click={cycleThemeColor}>
            <Fa icon={faPalette}/>
        </button>
        <button id="update" on:click={requestUpdate}>
            <Fa icon={faSync}/>
        </button>
        <button id="power" on:click={openPowerWindow}>
            <Fa icon={faPowerOff}/>
        </button>
    </div>
</div>

<style>
    .titlebar {
        max-width: 100%;
        background-color: var(--foreground);
        padding: 1rem;
        margin: 0;
        display: flex;
        justify-content: space-between;
        font-size: 18px;

    }

    .title {
        margin: 0;
    }

    .buttons button {
        all: unset;
        margin-left: 1rem;
    }

    .buttons button:hover {
        cursor: pointer;
    }

    .buttons #power {
        color: var(--power);
    }

    .buttons #color {
        color: var(--brand);
    }

</style>