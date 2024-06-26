<script lang="ts">
    import Canvas from '../../components/canvas.svelte';
    import Palette from '../../components/palette.svelte';
    import { colors, dayNames, monthNames } from '../../utils/constants';
    import type { Day } from '../../utils/types';

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    var days: Day[] = [];

    const background = 'none';

    let color = colors[0];
    const paletteColor = color;

    function initMonth() {
        let daysLocal: Day[] = [];

        var daysInThisMonth = new Date(year, month + 1, 0).getDate();

        var firstDay = new Date(year, month, 1).getDay();

        for (let index = 0; index < firstDay; index++) {
            daysLocal.push({
                name: '',
                enabled: false,
                date: new Date(year, month, 0),
            });
        }

        for (let index = 0; index < daysInThisMonth; index++) {
            let thisDate = new Date(year, month, index + 1);
            daysLocal.push({
                name: `${index + 1}`,
                enabled: true,
                date: thisDate,
            });
        }

        days = daysLocal;
    }

    $: month, year, initMonth();
</script>

<div class="console">
    <button on:click={() => (month = (month + 1) % 12)}>&lt;</button>
    <h1>{monthNames[month]} {year}</h1>
    <button on:click={() => (month = (month - 1 + 12) % 12)}>&gt;</button>
</div>
<div class="calendar divide-x divide-y crooked">
    {#each dayNames as dayName}
        <div class="patrick-hand text-center title">{dayName}</div>
    {/each}

    {#each days as day}
        <div
            class="day {day.enabled ? 'crooked' : ''} {day.date.getDate() ===
                now.getDate() &&
            day.date.getMonth() === now.getMonth() &&
            day.date.getFullYear() === now.getFullYear()
                ? 'is-active'
                : ''}"
        >
            <span class="caption"> {day.name}</span>
            <Canvas {color} {background} />
        </div>
    {/each}
</div>

<Palette
    {paletteColor}
    {background}
    on:color={({ detail }) => {
        color = detail.color;
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
