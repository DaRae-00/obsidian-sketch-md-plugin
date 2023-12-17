<script>
	import { onDestroy, onMount } from "svelte";
	import { Stage, Layer, Line } from "svelte-konva";
	import { DrawMode } from "src/types/storeTypes";
	import { useDrawing, drawingStore } from "src/\bstore/main";
	import { configStore, useConfig } from "src/\bstore/config";

	export let width;
	export let height = 100;

	let unsubscribeDrawing, unsubscribeConfig;
	let lines = [];
	let isPainting = false;
	let isErasing = false;
	let isEraserMode = false;
	let stageConfig = { width, height };
	let eraserConfig = { x: 0, y: 0 };

	/***************************************************************************
	 * drawing lines
	 ****************************************************************************/

	const handlePointerDown = (e, isTouch = false) => {
		isPainting = true;
		const pos = getPointerPosition(e, isTouch);
		addNewLine(pos);
	};

	const handlePointerMove = (e, isTouch = false) => {
		if (!isPainting) return;
		const pos = getPointerPosition(e, isTouch);
		updateLastLine(pos);
	};

	const handlePointerUp = () => {
		isPainting = false;
		drawingStore.update((state) => ({ ...state, isPainting: false }));
	};

	const getPointerPosition = (e, isTouch) => {
		let target = e.detail.target;

		if (typeof target.getPointerPosition !== "function") {
			target = target.parent.parent;
		}

		return isTouch ? e.detail.evt.touches[0] : target.getPointerPosition();
	};

	const addNewLine = (pos) => {
		drawingStore.update((state) => {
			const newLine = {
				color: state.color || "#C3ACD0",
				mode: state.mode,
				strokeWidth: state.strokeWidth,
				points: [pos.x, pos.y],
			};
			return {
				...state,
				isPainting: true,
				lines: [...state.lines, newLine],
			};
		});
	};

	const updateLastLine = (pos) => {
		drawingStore.update((state) => {
			let lastLine = state.lines[state.lines.length - 1];
			lastLine = {
				...lastLine,
				points: [...lastLine.points, pos.x, pos.y],
			};
			return { ...state, lines: [...state.lines.slice(0, -1), lastLine] };
		});
	};

	/***************************************************************************
	 * eraser pointer
	 ****************************************************************************/

	const mobileTouchStartEvt = (e) => {
		if (!isEraserMode) return;
		const touchPos = getTouchPosition(e);
		updateEraserConfig(touchPos);
		isErasing = true;
	};

	const mobileTouchMoveEvt = (e) => {
		if (!isErasing || !isEraserMode) return;
		const touchPos = getTouchPosition(e);
		updateEraserConfig(touchPos);
	};

	const mobileTouchEndEvt = () => {
		if (!isEraserMode) return;
		resetEraserConfig();
		isErasing = false;
	};

	const getTouchPosition = (e) => {
		if (e.touches[0].touchType !== "stylus") return;

		const canvasBounds = e.target.getBoundingClientRect();
		const touch = e.touches[0];
		const scaleX = canvasBounds.width / e.target.offsetWidth;
		const scaleY = canvasBounds.height / e.target.offsetHeight;

		const x = (touch.clientX - canvasBounds.left + 5) * scaleX;
		const y = (touch.clientY - canvasBounds.top + 40) * scaleY;

		return { x, y };
	};

	const updateEraserConfig = (pos) => {
		configStore.update((state) => ({ ...state, eraserPointer: pos }));
	};

	const resetEraserConfig = () => {
		configStore.update((state) => ({
			...state,
			eraserPointer: { x: -10, y: -10 },
		}));
	};

	/***************************************************************************
	 * subscriptions
	 ****************************************************************************/

	const initializeSubscriptions = () => {
		unsubscribeDrawing = drawingStore.subscribe((state) => {
			lines = state.lines;
			isEraserMode = state.mode === DrawMode.Eraser;
		});

		unsubscribeConfig = configStore.subscribe((state) => {
			stageConfig = state.stage;
			eraserConfig = state.eraserPointer;
		});
	};

	const setStageConfig = () => {
		configStore.update((state) => ({ ...state, stage: stageConfig }));
	};

	const cleanupSubscriptions = () => {
		useDrawing.init();
		useConfig.init();
		unsubscribeDrawing();
		unsubscribeConfig();
	};

	/***************************************************************************
	 * lifecycle
	 ****************************************************************************/

	onMount(() => {
		initializeSubscriptions();
		setStageConfig();
	});

	onDestroy(cleanupSubscriptions);
</script>

<div
	style="position: relative; width: {stageConfig.width}; height: {stageConfig.height} "
	class="container"
	on:touchstart={mobileTouchStartEvt}
	on:touchmove={mobileTouchMoveEvt}
	on:touchend={mobileTouchEndEvt}
>
	<div
		class={isEraserMode && eraserConfig.x !== -10 ? "custom-cursor" : ""}
		style="left: {eraserConfig.x}px; top: {eraserConfig.y}px;"
	></div>
	<div class:eraser-cursor={isEraserMode}>
		<Stage
			config={{ width: stageConfig.width, height: stageConfig.height }}
			on:mousedown={handlePointerDown}
			on:mouseup={handlePointerUp}
			on:mousemove={handlePointerMove}
			on:touchstart={handlePointerDown}
			on:touchend={handlePointerUp}
			on:touchmove={handlePointerMove}
		>
			<Layer>
				{#each lines as line}
					<Line
						config={{
							stroke: line.color,
							strokeWidth:
								line.mode === DrawMode.Brush
									? line.strokeWidth
									: 10,
							globalCompositeOperation:
								line.mode === DrawMode.Brush
									? "source-over"
									: "destination-out",
							lineCap: "round",
							lineJoin: "round",
							points: line.points,
							tension: 0.5,
							opacity: line.mode === DrawMode.Brush ? 0.8 : 1,
						}}
					/>
				{/each}
			</Layer>
		</Stage>
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		border: 2px solid #674188;
		border-radius: 10px;
	}

	.eraser-cursor {
		cursor:
			url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dashed"><path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/><path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7"/><path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8"/><path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69"/><path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/><path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7"/><path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8"/><path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69"/></svg>')
				12 12,
			auto;
	}

	.custom-cursor {
		position: fixed;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dashed"><path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/><path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7"/><path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8"/><path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69"/><path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/><path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7"/><path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8"/><path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69"/></svg>');
		background-size: cover; /* 배경 이미지 사이즈 조정 */
		pointer-events: none;
		z-index: 9999;
	}
</style>
