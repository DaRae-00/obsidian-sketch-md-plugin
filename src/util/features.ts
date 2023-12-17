import { MarkdownView, type App } from "obsidian";

export function isDocumentActive(app: App) {
	// 현재 활성화된 뷰를 가져옵니다.
	const activeView = app.workspace.getActiveViewOfType(MarkdownView);

	return activeView !== null;
}

export function insertImageToMarkdown(
	app: App,
	dataUrl: string,
	name?: string
) {
	// 현재 활성화된 마크다운 뷰를 가져옵니다.
	const markdownView = app.workspace.getActiveViewOfType(MarkdownView);

	if (!markdownView) {
		return;
	}

	// 현재 편집기의 인스턴스를 가져옵니다.
	const editor = markdownView.editor;
	if (!editor) {
		return;
	}

	saveImageToFile(app, dataUrl, editor, name);
}

function dataUrlToBlob(dataUrl: string) {
	return fetch(dataUrl).then((res) => res.blob());
}

function getUniqueFileName(fileName?: string) {
	const date = new Date();
	const timestamp = date.getTime();
	return `${fileName || "sketch-md"}-${timestamp}.png`;
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as ArrayBuffer);
		reader.onerror = reject;
		reader.readAsArrayBuffer(blob);
	});
}

async function saveImageToFile(
	app: App,
	dataUrl: string,
	editor: any,
	name?: string
) {
	const fileName = getUniqueFileName(name);
	const filePath = `./${fileName}`;
	const blob = await dataUrlToBlob(dataUrl);
	const arrayBuffer = await blobToArrayBuffer(blob);

	// Save the image file to the file system
	await app.vault.createBinary(filePath, arrayBuffer);

	// Insert image link into the markdown file
	const markdownImageText = `![Drawing](${filePath})`;
	editor.replaceSelection(markdownImageText);
}
