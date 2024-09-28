<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    import { TOOLS } from '../utils/constants';

    export let paletteColor: string;
    export let background = 'none';
    export let canvasId: string;
    export let savedDataURL: string | undefined;
    export let toolType: TOOLS;
    export let key: string;
    export let handleCanvasChange: (key: string, value: string) => void;
    export let strokeWidth = 2;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let isDrawing = false;
    let wasChanged = false;
    let points: { x: number; y: number }[] = [];

    $: if (context) {
        context.strokeStyle = paletteColor;
        context.fillStyle = paletteColor;
    }

    $: if (savedDataURL) {
        loadCanvasState();
    }

    $: if (key && canvas) {
        initCanvas(true);
    }

    const toolCursors = {
        [TOOLS.ERASER]: 'cursor-eraser',
        [TOOLS.PEN]: 'cursor-pen',
        [TOOLS.TEXT]: 'cursor-text',
    };

    function initCanvas(clear = false) {
        if (!canvas) return;

        context = canvas.getContext('2d')!;
        context.lineWidth = strokeWidth;

        const rect = canvas.parentElement?.getBoundingClientRect();
        canvas.height = rect?.height || 0;
        canvas.width = rect?.width || 0;

        if (clear) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        loadCanvasState();
        addEventListeners();
    }

    function loadCanvasState() {
        if (!savedDataURL || !context) return;

        const img = new Image();
        img.src = savedDataURL;
        img.onload = () => context.drawImage(img, 0, 0);
    }

    function addEventListeners() {
        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('touchstart', handleStart);
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('touchmove', handleMove);
        canvas.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('touchend', handleEnd);
        canvas.addEventListener('mouseleave', handleLeave);
    }

    function removeEventListeners() {
        if (!canvas) return;
        canvas.removeEventListener('mousedown', handleStart);
        canvas.removeEventListener('touchstart', handleStart);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('touchmove', handleMove);
        canvas.removeEventListener('mouseup', handleEnd);
        canvas.removeEventListener('touchend', handleEnd);
        canvas.removeEventListener('mouseleave', handleLeave);
    }

    function getEventCoordinates(
        event: MouseEvent | TouchEvent,
    ): [number, number] {
        const rect = canvas.getBoundingClientRect();
        if (event instanceof MouseEvent) {
            return [event.clientX - rect.left, event.clientY - rect.top];
        } else {
            const touch = event.touches[0];
            return [touch.clientX - rect.left, touch.clientY - rect.top];
        }
    }

    function handleStart(event: MouseEvent | TouchEvent) {
        const [x, y] = getEventCoordinates(event);

        switch (toolType) {
            case TOOLS.ERASER:
                context.clearRect(0, 0, canvas.width, canvas.height);
                break;
            case TOOLS.TEXT:
                const text = prompt('Enter your text:');
                if (text) {
                    context.font = '16px Arial';
                    context.fillText(text, x, y);
                }
                break;
            default:
                isDrawing = true;
                points.push({ x, y });
                context.beginPath();
                context.moveTo(x, y);
        }

        wasChanged = true;
    }

    function handleMove(event: MouseEvent | TouchEvent) {
        if (!isDrawing || toolType !== TOOLS.PEN) return;

        const [x, y] = getEventCoordinates(event);
        points.push({ x, y });

        context.beginPath();
        context.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 2; i++) {
            const c = (points[i].x + points[i + 1].x) / 2;
            const d = (points[i].y + points[i + 1].y) / 2;
            context.quadraticCurveTo(points[i].x, points[i].y, c, d);
        }

        context.quadraticCurveTo(
            points[points.length - 2].x,
            points[points.length - 2].y,
            points[points.length - 1].x,
            points[points.length - 1].y,
        );

        context.lineWidth = strokeWidth + Math.random();
        context.globalAlpha = 0.8 + Math.random() * 0.2;
        context.stroke();
    }

    function handleEnd() {
        isDrawing = false;
        points = [];
    }

    function handleLeave() {
        handleEnd();

        if (wasChanged) {
            const dataURL = canvas.toDataURL('image/png');
            handleCanvasChange(canvasId, dataURL);
            wasChanged = false;
        }
    }

    onMount(() => initCanvas(false));

    onDestroy(() => {
        removeEventListeners();
    });
</script>

<canvas
    class={toolCursors[toolType] || ''}
    style={`background: ${background}; color: ${paletteColor}`}
    bind:this={canvas}
/>

<style>
    .cursor-eraser {
        cursor: url('/eraser.svg'), pointer;
    }
    .cursor-pen {
        cursor:
            url('/pen.svg') 2 10,
            pointer;
    }
    .cursor-text {
        cursor: text;
    }
</style>
