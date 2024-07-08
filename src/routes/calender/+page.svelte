<script lang="ts">
    import { onMount } from 'svelte';

    import Canvas from '../../components/canvas.svelte';
    import Palette from '../../components/palette.svelte';
    import {
        CANVAS_KEY,
        colors,
        dayNames,
        monthNames,
        TOOLS,
    } from '../../utils/constants';
    import type { CanvasData, Day } from '../../utils/types';
    import { getLocalStorage, setLocalStorage } from '../../utils/helpers';

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    let canvasState: CanvasData = {};

    let toolType = TOOLS.PEN;

    const changeTool = (tool: TOOLS) => {
        toolType = tool;
    };

    let days: Day[] = [];
    let background = 'none';
    let paletteColor = colors[0];

    function initMonth() {
        const daysLocal: Day[] = [];

        var daysInThisMonth = new Date(year, month + 1, 0).getDate();
        var firstDay = new Date(year, month, 1).getDay();

        for (let index = 0; index < firstDay; index++) {
            daysLocal.push({
                name: '',
                enabled: false,
                date: new Date(year, month, 0),
                id: Math.random().toString(),
            });
        }

        for (let index = 0; index < daysInThisMonth; index++) {
            let thisDate = new Date(year, month, index + 1);
            let id = `${year}-${month}-${thisDate.getDate()}`;

            daysLocal.push({
                id,
                name: `${index + 1}`,
                enabled: true,
                date: thisDate,
                state: canvasState[id],
            });
        }

        days = daysLocal;
    }

    const decreaseMonth = () => {
        if (month === 0) {
            month = 11;
            year -= 1;
        } else {
            month = (month - 1 + 12) % 12;
        }
    };

    const increaseMonth = () => {
        if (month === 11) {
            month = 0;
            year += 1;
        } else {
            month = (month + 1) % 12;
        }
    };

    function handleCanvasChange(canvasId: string, state: string) {
        canvasState[canvasId] = state;
        setLocalStorage(CANVAS_KEY, canvasState);
    }

    $: month, year, initMonth();

    onMount(async () => {
        canvasState = await getLocalStorage(CANVAS_KEY);

        initMonth();
    });
</script>

<div class="console">
    <button on:click={decreaseMonth}>&lt;</button>
    <h1>{monthNames[month]} {year}</h1>
    <button on:click={increaseMonth}>&gt;</button>
</div>

<div class="calendar divide-x divide-y crooked">
    {#each dayNames as dayName}
        <div class="patrick-hand text-center title">{dayName}</div>
    {/each}

    {#each days as day}
        {@const { date, enabled, name, id, state } = day}
        {@const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()}

        {#key id}
            <div
                class="day {enabled ? 'crooked' : ''} {isToday
                    ? 'is-active'
                    : ''}"
            >
                <span class="caption">{name}</span>
                <Canvas
                    {toolType}
                    canvasId={id ?? ''}
                    {paletteColor}
                    {background}
                    {handleCanvasChange}
                    savedDataURL={state ?? ''}
                />
            </div>
        {/key}
    {/each}
</div>

<Palette
    {paletteColor}
    {background}
    {changeTool}
    on:color={({ detail }) => {
        paletteColor = detail.color;
    }}
/>

<style>
    .console {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .console > button {
        margin: 1rem;
        outline: none;
        border: none;
        background: none;
        font-size: 1rem;
        cursor: pointer;
    }

    .console > h1 {
        width: 20rem;
    }
    .calendar {
        display: grid;
        justify-content: center;
        align-items: center;
        grid-template-columns: repeat(7, 1fr);
        border: 1px solid black;
        padding: 2rem;
    }
    .calendar > .day {
        display: inline-block;
        line-height: 2rem;
        text-align: center;
        padding: 5px;
        max-height: 7rem;
        max-width: 7rem;
        margin: 0.2rem;
        position: relative;
    }

    .caption {
        text-align: center;
        z-index: -1;
        position: absolute;
        width: 100%;
        pointer-events: none;
        user-select: none;
    }
    .is-active {
        border-color: dodgerblue;
        border-width: 3px;
    }

    .crooked {
        border-top-left-radius: 255px 15px;
        border-top-right-radius: 15px 225px;
        border-bottom-right-radius: 225px 15px;
        border-bottom-left-radius: 15px 255px;
    }
    .title {
        font-weight: bold;
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
</style>
