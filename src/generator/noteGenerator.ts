import { AnalyzedBookmark, Language } from "../types";
import { DEFAULT_TEMPLATE, TEMPLATE_MAP, TemplateType } from "./templates";

/**
 * Note generator for Obsidian
 * Generates structured markdown notes from analyzed bookmarks
 */
export class NoteGenerator {
	constructor(
		private template: TemplateType = "default",
		private language: Language = "en"
	) {}

	/**
	 * Generate note content from bookmark
	 */
	generateNote(bookmark: AnalyzedBookmark): string {
		const template = TEMPLATE_MAP[this.template] || DEFAULT_TEMPLATE;
		return this.applyTemplate(template, bookmark);
	}

	/**
	 * Generate multiple notes
	 */
	generateNotes(bookmarks: AnalyzedBookmark[]): Map<string, string> {
		const notes = new Map<string, string>();

		for (const bookmark of bookmarks) {
			const filename = this.generateFilename(bookmark);
			const content = this.generateNote(bookmark);
			notes.set(filename, content);
		}

		return notes;
	}

	/**
	 * Generate safe filename from bookmark
	 */
	private generateFilename(bookmark: AnalyzedBookmark): string {
		let filename = bookmark.title || "Untitled";

		// Remove invalid characters
		filename = filename
			.replace(/[<>:"/\\|?*]/g, "")
			.replace(/\s+/g, " ")
			.trim();

		// Limit length
		if (filename.length > 100) {
			filename = filename.substring(0, 100);
		}

		return `${filename}.md`;
	}

	/**
	 * Apply template with bookmark data
	 */
	private applyTemplate(template: string, bookmark: AnalyzedBookmark): string {
		const metadata = bookmark.metadata || {};

		const replacements: Record<string, string> = {
			title: bookmark.title || "Untitled",
			url: bookmark.url,
			dateAdded: this.formatDate(bookmark.dateAdded || Date.now()),
			folder: bookmark.folder || "Uncategorized",
			tags: this.formatTags(bookmark.tags || metadata.keywords || []),
			category: metadata.category || "General",
			description: metadata.description || bookmark.description || "",
			keywords: this.formatKeywords(metadata.keywords || []),
			language: metadata.language || "",
			author: metadata.author || "",
			publishedDate: metadata.publishedDate || "",
			summary: metadata.summary || "",
			lastUpdated: this.formatDate(Date.now()),
		};

		let content = template;

		// Replace all placeholders
		for (const [key, value] of Object.entries(replacements)) {
			const regex = new RegExp(`{{${key}}}`, "g");
			content = content.replace(regex, value);
		}

		return content;
	}

	/**
	 * Format tags as YAML list
	 */
	private formatTags(tags: string[]): string {
		if (!tags || tags.length === 0) return "[]";
		return `["${tags.join('", "')}"]`;
	}

	/**
	 * Format keywords as comma-separated list
	 */
	private formatKeywords(keywords: string[]): string {
		if (!keywords || keywords.length === 0) return "None";
		return keywords.join(", ");
	}

	/**
	 * Format date
	 */
	private formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toISOString().split("T")[0];
	}

	/**
	 * Set template type
	 */
	setTemplate(template: TemplateType): void {
		this.template = template;
	}

	/**
	 * Set language
	 */
	setLanguage(language: Language): void {
		this.language = language;
	}
}
