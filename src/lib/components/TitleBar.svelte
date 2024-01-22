<script lang="ts">
    import Fa from "svelte-fa";
    import { faPowerOff, faSync, faPalette } from "@fortawesome/free-solid-svg-icons";

    const cycleThemeColor = () => {
        const colors = ["#f97316", "#ff0000", "#00ff00", "#0000ff"];
        const root = document.documentElement;
        const currentColor = root.style.getPropertyValue("--brand");
        const index = colors.indexOf(currentColor);
        const nextColor = colors[(index + 1) % colors.length];
        root.style.setProperty("--brand", nextColor);
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