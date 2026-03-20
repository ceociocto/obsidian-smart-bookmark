import { App, Modal } from "obsidian";
import { ImportProgress } from "../types";
import en from "../i18n/en";
import zh from "../i18n/zh";

/**
 * Progress modal for showing import status
 */
export class ProgressModal extends Modal {
	private progress: ImportProgress;
	private language: "en" | "zh";
	private progressEl: HTMLElement;
	private statusEl: HTMLElement;
	private messageEl: HTMLElement;

	constructor(
		app: App,
		language: "en" | "zh",
		total: number
	) {
		super(app);
		this.language = language;
		this.progress = {
			total: total,
			processed: 0,
			failed: 0,
		};
	}

	onOpen() {
		const { contentEl } = this;
		const t = this.language === "zh" ? zh : en;

		contentEl.createEl("h2", { text: t.progressModalTitle });

		// Status text
		this.statusEl = contentEl.createEl("p", {
			text: `${t.statusProcessing}: 0/${this.progress.total}`,
		});

		// Progress bar container
		const progressContainer = contentEl.createEl("div", {
			cls: "progress-container",
			attr: {
				style: "width: 100%; height: 20px; background: var(--background-modifier-border); border-radius: 10px; overflow: hidden;",
			},
		});

		// Progress bar
		this.progressEl = progressContainer.createEl("div", {
			cls: "progress-bar",
			attr: {
				style: "height: 100%; background: var(--interactive-accent); transition: width 0.3s; width: 0%;",
			},
		});

		// Current processing item
		this.messageEl = contentEl.createEl("p", {
			text: "",
			cls: "progress-message",
			attr: {
				style: "margin-top: 20px; color: var(--text-muted);",
			},
		});

		// Done button (initially hidden)
		const doneButton = contentEl.createEl("button", {
			text: t.progressModalDoneButton,
			cls: "mod-cta",
			attr: {
				style: "margin-top: 20px; display: none;",
			},
		});
		doneButton.onclick = () => {
			this.close();
		};

		// Store reference for later
		(this as any).doneButton = doneButton;
	}

	/**
	 * Update progress
	 */
	updateProgress(progress: ImportProgress): void {
		this.progress = progress;

		const t = this.language === "zh" ? zh : en;
		const percentage = (progress.processed / progress.total) * 100;

		// Update status
		this.statusEl.textContent = `${t.statusProcessing}: ${progress.processed}/${progress.total}`;

		// Update progress bar
		this.progressEl.style.width = `${percentage}%`;

		// Update current item
		if (progress.current) {
			this.messageEl.textContent = progress.current;
		}

		// Show done button if complete
		if (progress.processed >= progress.total) {
			const t_complete = this.language === "zh" ? zh : en;
			this.statusEl.textContent = `${t_complete.progressModalCompleted}: ${progress.processed}/${progress.total} (${progress.failed} ${t_complete.progressModalFailed})`;

			if ((this as any).doneButton) {
				(this as any).doneButton.style.display = "block";
			}
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
