import { Plugin } from "obsidian";
import { SketchMDModal } from "src/modal/mainModal";

export default class SketchMD extends Plugin {
	async onload() {
		const ribbonIconEl = this.addRibbonIcon(
			"file-signature",
			"sketch-md",
			(evt: MouseEvent) => {
				new SketchMDModal(this.app).open();
			}
		);
	}
}
