import { App, Modal, Setting } from "obsidian";
import { BrowserType } from "../types";
import { getDefaultBookmarksPath, getDefaultPathDescription } from "../utils/defaultPaths";
import en from "../i18n/en";
import zh from "../i18n/zh";

/**
 * Import modal for selecting browser and file path
 */
export class ImportModal extends Modal {
	private browser: BrowserType = "chrome";
	private filePath: string = "";
	private language: "en" | "zh" = "en";
	private onImport: (browser: BrowserType, path: string) => void;

	constructor(
		app: App,
		language: "en" | "zh",
		onImport: (browser: BrowserType, path: string) => void
	) {
		super(app);
		this.language = language;
		this.onImport = onImport;
		// Initialize with default path for default browser
		this.filePath = getDefaultBookmarksPath(this.browser) || "";
	}

	onOpen() {
		const { contentEl } = this;
		const t = this.language === "zh" ? zh : en;

		contentEl.createEl("h2", { text: t.importModalTitle });

		// Browser selection
		const pathTextComponent: { setValue: (value: string) => any } = {} as any;

		new Setting(contentEl)
			.setName(t.importModalBrowserLabel)
			.addDropdown((dropdown) => {
				dropdown
					.addOption("chrome", t.browserChrome)
					.addOption("safari", t.browserSafari)
					.addOption("edge", t.browserEdge)
					.addOption("firefox", t.browserFirefox)
					.setValue(this.browser)
					.onChange((value) => {
						this.browser = value as BrowserType;
						// Update path when browser changes
						const defaultPath = getDefaultBookmarksPath(this.browser);
						if (pathTextComponent.setValue) {
							pathTextComponent.setValue(defaultPath || "");
						}
						this.filePath = defaultPath || "";
					});
			});

		// File path input
		new Setting(contentEl)
			.setName(t.importModalPathLabel)
			.setDesc(t.importModalDesc)
			.addText((text) => {
				text
					.setPlaceholder(t.importModalPathPlaceholder)
					.setValue(this.filePath)
					.onChange((value) => {
						this.filePath = value;
					});
				pathTextComponent.setValue = (value: string) => text.setValue(value);
				return text;
			});

		// Buttons
		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText(t.importModalCancelButton)
					.onClick(() => {
						this.close();
					})
			)
			.addButton((btn) =>
				btn
					.setCta()
					.setButtonText(t.importModalImportButton)
					.onClick(() => {
						if (this.filePath.trim()) {
							this.onImport(this.browser, this.filePath.trim());
							this.close();
						}
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
