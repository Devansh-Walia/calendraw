<script lang="ts">
    interface Day {
        name: string;
        enabled: boolean;
        date: Date;
    }
    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    var days: Day[] = [];

    function initMonth() {
        let daysLocal: Day[] = [];
        let monthAbbrev = monthNames[month].slice(0, 3);

        var daysInThisMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < daysInThisMonth; i++) {
            let d = new Date(year, month, i + 1);
            if (i == 0)
                daysLocal.push({
                    name: monthAbbrev + ' ' + (i + 1),
                    enabled: true,
                    date: d,
                });
            else daysLocal.push({ name: '' + (i + 1), enabled: true, date: d });
        }

        days = daysLocal;
    }

    $: month, year, initMonth();
    console.log(days);
</script>

<div class="console">
    <button on:click={() => (month = (month + 1) % 12)}>&lt;</button>
    <h1>{monthNames[month]} {year}</h1>
    <button on:click={() => (month = (month - 1 + 12) % 12)}>&gt;</button>
</div>
<div class="calender">
    {#each days as day}
        <div class="day crooked {day.enabled ? 'enabled' : 'disabled'}">
            {day.name}
        </div>
    {/each}
</div>

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
    .calender {
        display: grid;
        justify-content: center;
        align-items: center;
        grid-template-columns: repeat(7, 1fr);
    }
    .calender > .day {
        display: inline-block;
        line-height: 2rem;
        border: 1px solid #000;
        padding: 5px;
        min-height: 7rem;
        margin: 0.2rem;
    }

    .crooked {
        border-top-left-radius: 255px 15px;
        border-top-right-radius: 15px 225px;
        border-bottom-right-radius: 225px 15px;
        border-bottom-left-radius: 15px 255px;
    }
</style>
