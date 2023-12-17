import { get, writable } from "svelte/store";

import { DrawMode } from "src/types/storeTypes";
import type { DrawingState } from "src/types/storeTypes";
import { Colors } from "src/styles/colors";

const initialState: DrawingState = {
	isPaint: false,
	mode: DrawMode.Brush,
	color: Colors.PRIMARY,
	strokeWidth: 3,
	lines: [
		{
			mode: DrawMode.Brush,
			color: Colors.PRIMARY,
			strokeWidth: 3,
			points: [],
		},
	],
};

export const drawingStore = writable<DrawingState>(initialState);

export const useDrawing = {
	subscribe: drawingStore.subscribe,
	get: () => get(drawingStore),
	set: (data: DrawingState) => drawingStore.set(data),
	update: drawingStore.update,
	init: () => drawingStore.set(initialState),
	setMode: (mode: DrawMode) => {
		drawingStore.update((state) => ({ ...state, mode }));
	},
	setColor: (color: string) => {
		drawingStore.update((state) => ({ ...state, color }));
	},
	setStrokeWidth: (strokeWidth: number) => {
		drawingStore.update((state) => ({ ...state, strokeWidth }));
	},
};
