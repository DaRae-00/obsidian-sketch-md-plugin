export enum DrawMode {
	Brush = "brush",
	Eraser = "eraser",
}

export type Line = {
	mode: DrawMode;
	color: string;
	strokeWidth: number;
	points: number[];
};

export type DrawingState = {
	isPaint: boolean;
	mode: DrawMode;
	color: string;
	strokeWidth: number;
	lines: Line[];
};

export type ConfigState = {
	stage: {
		width: number;
		height: number;
	};
	eraserPointer: { x: number; y: number };
	fileName: string;
};
