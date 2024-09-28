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

    let textElements: {
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }[] = [];
    let selectedTextElement: number | null = null;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let editingText = false;

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
        [TOOLS.HAND]: 'cursor-hand',
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
        canvas.addEventListener('dblclick', handleDoubleClick);
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
        canvas.removeEventListener('dblclick', handleDoubleClick);
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
                if (!editingText) {
                    const textWidth = context.measureText('Text').width;
                    const textHeight = 16;
                    textElements.push({
                        text: 'Text',
                        x,
                        y,
                        width: textWidth,
                        height: textHeight,
                    });
                    drawTextElements();
                }
                break;
            case TOOLS.HAND:
                const index = selectTextElement(x, y);
                if (index !== null) {
                    selectedTextElement = index;
                    isDragging = true;
                    const textElement = textElements[index];
                    dragOffsetX = x - textElement.x;
                    dragOffsetY = y - textElement.y;
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
        if (isDragging && selectedTextElement !== null) {
            const [x, y] = getEventCoordinates(event);
            const textElement = textElements[selectedTextElement];
            textElement.x = x - dragOffsetX;
            textElement.y = y - dragOffsetY;
            drawTextElements();
            return;
        }

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
        isDragging = false;
        selectedTextElement = null;
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

    function drawTextElements() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        textElements.forEach(({ text, x, y }) => {
            context.font = '16px Arial';
            context.fillText(text, x, y);
        });
    }

    function selectTextElement(x: number, y: number) {
        for (let i = 0; i < textElements.length; i++) {
            const { x: textX, y: textY, width, height } = textElements[i];
            if (
                x >= textX &&
                x <= textX + width &&
                y >= textY - height &&
                y <= textY
            ) {
                return i;
            }
        }
        return null;
    }

    function handleDoubleClick(event: MouseEvent) {
        const [x, y] = getEventCoordinates(event);
        const index = selectTextElement(x, y);
        if (index !== null) {
            selectedTextElement = index;
            editingText = true;
            const textElement = textElements[index];
            const input = document.createElement('input');
            input.type = 'text';
            input.value = textElement.text;
            input.style.position = 'absolute';
            input.hidden;
            input.style.left = `${textElement.x}px`;
            input.style.top = `${textElement.y - textElement.height}px`;
            input.style.fontSize = '16px';
            input.style.fontFamily = 'Arial';
            input.onblur = () => {
                textElement.text = input.value;
                editingText = false;
                document.body.removeChild(input);
                drawTextElements();
            };
            document.body.appendChild(input);
            input.focus();
        }
    }

    onMount(() => {
        initCanvas(false);
        canvas.addEventListener('dblclick', handleDoubleClick);
    });

    onDestroy(() => {
        removeEventListeners();
        canvas.removeEventListener('dblclick', handleDoubleClick);
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
    .cursor-hand {
        cursor: grab;
    }
</style>
