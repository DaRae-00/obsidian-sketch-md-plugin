<script>
	import {
		PenLine,
		Eraser,
		Pipette,
		Slash,
		MoveVertical,
		Import,
		File,
	} from "lucide-svelte";
	import { configStore, useConfig } from "src/\bstore/config";
	import { useDrawing, drawingStore } from "src/\bstore/main";
	import {
		lineColors,
		lineWeights,
		realLineWeights,
	} from "src/constant/const";
	import { insertImageToMarkdown } from "src/util/features";
	import { Colors } from "src/styles/colors";
	import { DrawMode } from "src/types/storeTypes";

	export let app;

	$: ({ color } = $drawingStore);
	$: ({ stage, fileName } = $configStore);

	let penLineActive = true;
	let eraserActive = false;
	let selectedColor = Colors.PRIMARY;
	let selectedLineWidth = 1;
	let isColorPickerActive = true;

	const changeMode = (newMode) => {
		penLineActive = newMode === DrawMode.Brush;
		eraserActive = newMode === DrawMode.Eraser;
		useDrawing.setMode(newMode);
	};

	const changeColor = (newColor, idx) => {
		isColorPickerActive = idx === -1;
		selectedColor = newColor;
		useDrawing.setColor(newColor);
		updateColorPickerState(idx);
	};

	const changeWeight = (newWeight) => {
		selectedLineWidth = newWeight;
		useDrawing.setStrokeWidth(realLineWeights[newWeight]);
		updateWeightPickerState(newWeight);
	};

	const updateColorPickerState = (activeIdx) => {
		lineColors.forEach((pc, i) => (pc.isActive = i === activeIdx));
	};

	const updateWeightPickerState = (activeWeight) => {
		lineWeights.forEach((lw) => (lw.isActive = lw.weight === activeWeight));
	};

	const handleCanvasExport = () => {
		const canvas = document.querySelector(".konvajs-content canvas");
		const dataUrl = canvas.toDataURL("image/png");
		insertImageToMarkdown(app, dataUrl, fileName);
	};

	const updateStageSize = (type, value) => {
		useConfig.updateStageSize(type, parseInt(value));
	};

	const fileNameChange = (event) => {
		let updatedFileName = event.target.value;

		// 공백 제거
		updatedFileName = updatedFileName.replace(/\s/g, "");

		// 길이 제한 (20자)
		if (updatedFileName.length > 20) {
			updatedFileName = updatedFileName.substring(0, 20);
		}

		// 스크립트 및 잠재적 위험한 문자 입력 방지
		// 허용되는 문자: 알파벳, 숫자, 대시(-), 밑줄(_), 점(.)
		updatedFileName = updatedFileName.replace(/[^a-zA-Z0-9_.-]/g, "");

		useConfig.updateFileName(updatedFileName);
	};
</script>

<div class="container">
	<div class="box">
		<button on:click={() => changeMode(DrawMode.Brush)}>
			<PenLine
				color={penLineActive ? Colors.ACTIVE : Colors.PRIMARY}
			/></button
		>
		{#key selectedColor}
			<button class="color-picker-box">
				<Pipette
					size={18}
					color={isColorPickerActive ? Colors.ACTIVE : Colors.PRIMARY}
				/>
				<input
					type="color"
					class="color-picker"
					value={color}
					on:change={(e) => changeColor(e.target.value, -1)}
				/>
			</button>
			{#each lineColors as pc, idx}
				<div class={pc.isActive ? "btn-active" : ""}>
					<div
						role="button"
						class="color-box"
						style="background-color: {pc.color}"
						on:mousedown={() => changeColor(pc.color, idx)}
						on:touchstart={() => changeColor(pc.color, idx)}
						tabindex={idx}
					></div>
				</div>
			{/each}
		{/key}
		<div class="alias-right">
			{#key selectedLineWidth}
				{#each lineWeights as lw}
					<button on:click={() => changeWeight(lw.weight)}>
						<Slash
							size={15}
							strokeWidth={lw.weight}
							absoluteStrokeWidth={true}
							color={lw.isActive ? Colors.ACTIVE : Colors.PRIMARY}
						/>
					</button>
				{/each}
			{/key}
		</div>
	</div>
	<div class="box">
		<button on:click={() => changeMode(DrawMode.Eraser)}>
			<Eraser color={eraserActive ? Colors.ACTIVE : Colors.PRIMARY} />
		</button>
	</div>
	<div class="box">
		<button> <MoveVertical color={Colors.PRIMARY} /></button>
		<input
			type="range"
			min="100"
			max="500"
			value={stage.height}
			on:change={() => updateStageSize("height", event.target.value)}
		/>
	</div>
	<div class="box">
		<button> <File color={Colors.PRIMARY} /></button>
		<input
			type="text"
			placeholder="file name"
			value={fileName}
			on:change={fileNameChange}
			maxlength="20"
		/>

		<div class="alias-right">
			<button on:click={handleCanvasExport}>
				<Import color={Colors.ACTIVE} />
			</button>
		</div>
	</div>
	<p class="filename-instructions">
		Filename should be less than 20 characters, no spaces, and only includes
		letters, numbers, dashes (-), and underscores (_).
	</p>
	<p class="filename-instructions">
		The file will be saved in the current root folder.
	</p>
</div>

<style>
	.container {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 5px;
	}

	.container > div {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		gap: 3px;
	}

	.color-box {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.color-picker-box {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 3px;
	}

	.color-picker {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		width: 23px;
		height: 20px;
		border-radius: 50%;
		background-color: transparent;
		border: none;
		cursor: pointer;
	}

	.color-picker::-webkit-color-swatch {
		border-radius: 50%;
		border: none;
		width: 23px;
		height: 20px;
	}

	.color-picker::-moz-color-swatch {
		border-radius: 50%;
		border: none;
		width: 23px;
		height: 20px;
	}

	.btn-active {
		border: 1px solid #674188;
		border-radius: 10%;
		padding: 2px;
	}

	.box {
		position: relative;
		width: 100%;
	}

	.alias-right {
		position: absolute;
		right: 0px;
		top: 0px;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.filename-instructions {
		margin-top: 1px;
		font-size: 8px;
		color: #666;
		line-height: 0.8;
	}

	input[type="text"] {
		width: 230px;
	}

	input[type="range"] {
		width: 230px;
	}
</style>
