<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    import { TOOLS } from '../utils/constants';

    export let paletteColor: string;
    export let background = 'none';
    export let canvasId: string;
    export let savedDataURL: string;
    export let toolType: TOOLS;
    export let handleCanvasChange: (key: string, value: string) => void;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let isDrawing = false;
    let wasChanged = false;

    $: if (context) {
        context.strokeStyle = paletteColor;
        context.fillStyle = paletteColor;
    }

    $: if (savedDataURL) {
        loadCanvasState();
    }

    const toolCursors = {
        [TOOLS.ERASER]: 'cursor-eraser',
        [TOOLS.PEN]: 'cursor-pen',
        [TOOLS.TEXT]: 'cursor-text',
    };

    function initCanvas() {
        if (!canvas) return;

        context = canvas.getContext('2d')!;
        context.lineWidth = 2;

        const rect = canvas.parentElement?.getBoundingClientRect();
        canvas.height = rect?.height || 0;
        canvas.width = rect?.width || 0;

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
                context.beginPath();
                context.moveTo(x, y);
        }

        wasChanged = true;
    }

    function handleMove(event: MouseEvent | TouchEvent) {
        if (!isDrawing || toolType !== TOOLS.PEN) return;

        const [x, y] = getEventCoordinates(event);
        context.lineTo(x, y);
        context.stroke();
    }

    function handleEnd() {
        isDrawing = false;
    }

    function handleLeave() {
        handleEnd();

        if (wasChanged) {
            const dataURL = canvas.toDataURL('image/png');
            handleCanvasChange(canvasId, dataURL);
            wasChanged = false;
        }
    }

    onMount(initCanvas);

    onDestroy(() => {
        removeEventListeners();
        if (context && canvas) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
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
