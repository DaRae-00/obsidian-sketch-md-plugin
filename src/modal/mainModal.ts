import type { SvelteComponent } from "svelte";

import { App, Modal } from "obsidian";

import SketchMD from "../page/SketchMD.svelte";
import { isDocumentActive } from "src/util/features";

export class SketchMDModal extends Modal {
	canvasComponent!: SvelteComponent;
	modalName: string = "sketch-md-modal";
	width: number = 500;
	height: number = 400;
	isValidOpen: boolean = false;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl, titleEl } = this;
		this.isValidOpen = isDocumentActive(this.app);
		titleEl.setText(this.modalName);

		if (!this.isValidOpen) {
			const textElement = document.createElement("p");
			textElement.textContent =
				"Please create and open the edit document first.";

			contentEl.appendChild(textElement);
		} else {
			setTimeout(() => {
				this.width = contentEl.offsetWidth;
				this.height = contentEl.offsetHeight;
			}, 0);

			this.canvasComponent = new SketchMD({
				target: contentEl,
				props: {
					app: this.app,
					width: this.width,
					height: this.height,
				},
			});
		}
	}

	onClose() {
		this.canvasComponent.$destroy();
	}
}
