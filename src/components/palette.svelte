<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { colors, CUSTOM_COLOR_EVENT, TOOLS } from '../utils/constants';
    import Tooltip from './tooltip.svelte';

    export let paletteColor = colors[0];
    export let background = 'none';
    export let changeTool: (tool: TOOLS) => void;
    export let toolType: TOOLS;

    let isColorsPanelOpen = false;

    const toggleColorsPanel = () => {
        if (toolType !== TOOLS.PEN) {
            changeTool(TOOLS.PEN);
        } else {
            isColorsPanelOpen = !isColorsPanelOpen;
        }
    };

    const dispatch = createEventDispatcher();

    const handleColorClick = (color: string) => {
        dispatch(CUSTOM_COLOR_EVENT, { color });
        paletteColor = color;

        toggleColorsPanel();

        changeTool(TOOLS.PEN);
    };

    const handleEraserClick = () => {
        dispatch(CUSTOM_COLOR_EVENT, { color: background });
        paletteColor = background;

        changeTool(TOOLS.ERASER);
    };
</script>

<section>
    <Tooltip text="write something down" delay={300}>
        <button
            on:click={() => changeTool(TOOLS.TEXT)}
            class={toolType === TOOLS.TEXT ? 'active' : 'inactive'}
            style:background
        >
            <img src="/pen.svg" alt="Pen" />
            <span class="visually-hidden">
                Select the pen tool to write on the canvas
            </span>
        </button>
    </Tooltip>
    <Tooltip text="reset your mistakes!!" delay={300}>
        <button
            on:click={handleEraserClick}
            class={toolType === TOOLS.ERASER ? 'active' : 'inactive'}
            style:background
        >
            <img src="/eraser.svg" alt="Eraser" />
            <span class="visually-hidden">
                Select the background color to clear the canvas
            </span>
        </button>
    </Tooltip>

    <Tooltip
        text="Choose a color to make the mistake... or click the dropper to select a color from the canvas"
        delay={300}
        hidden={isColorsPanelOpen}
    >
        <button
            on:click={toggleColorsPanel}
            class={toolType === TOOLS.PEN ? 'active' : 'inactive'}
        >
            <svg style:color={paletteColor} id="drop" viewBox="-50 -50 100 100">
                <g
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="0"
                    stroke-linecap="round"
                >
                    <path
                        d="M -38 12 a 38 38 0 0 0 76 0 q 0 -28 -38 -62 -38 34 -38 62"
                    />
                </g>
            </svg>
            {#if isColorsPanelOpen}
                <div class="flex-row color-panel">
                    {#each colors as color}
                        <button
                            on:click={() => handleColorClick(color)}
                            style:background={color}
                            title={`Select ${color}`}
                        >
                            <span class="visually-hidden">
                                Select the color {color}
                            </span>
                        </button>
                    {/each}
                </div>
            {/if}
        </button>
    </Tooltip>
</section>

<style>
    section {
        --size: 1.75rem;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: fixed;
        bottom: 2rem;
        left: 1rem;
        z-index: 10;
        background-color: #4a63796b;
        border-radius: 1rem;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }

    .color-panel {
        position: absolute;
        left: 150%;
        background-color: #00000016;
        color: white;
        padding: 0.5rem;
        font-size: x-small;
        border-radius: 0.25rem;
    }

    svg {
        flex-shrink: 0;
    }

    div {
        display: flex;
        gap: 0 0.5rem;
        align-items: center;
        overflow-x: auto;
    }

    .active {
        border: 2px solid dodgerblue;
        background-color: #fff !important;
    }
    .inactive {
        background-color: #00000016 !important;
        opacity: 0.5;
    }

    div button {
        flex-shrink: 0;
    }

    button {
        width: var(--size);
        height: var(--size);
        display: flex;
        justify-content: center;
        cursor: pointer;
        align-items: center;
        border: 2px solid transparent;
        border-radius: 50%;
        margin: 0;
    }
</style>
