import { get, writable } from "svelte/store";

import type { ConfigState } from "src/types/storeTypes";

const initialState: ConfigState = {
	stage: {
		width: 530,
		height: 100,
	},
	eraserPointer: { x: -10, y: -10 },
	fileName: "sketch-md",
};

export const configStore = writable<ConfigState>(initialState);

export const useConfig = {
	subscribe: configStore.subscribe,
	get: () => get(configStore),
	set: (data: ConfigState) => configStore.set(data),
	update: configStore.update,
	init: () => configStore.set(initialState),
	updateStageSize: (type: "width" | "height", value: number) => {
		configStore.update((state) => {
			const newStage = { ...state.stage, [type]: value };
			return { ...state, stage: newStage };
		});
	},
	updateEraserPointer: (x: number, y: number) => {
		configStore.update((state) => {
			return { ...state, eraserPointer: { x, y } };
		});
	},

	updateFileName: (fileName: string) => {
		configStore.update((state) => {
			return { ...state, fileName };
		});
	},
};
