import { AnalyzedBookmark, Language } from "../types";

/**
 * Single document generator for Obsidian
 * Generates one consolidated markdown file for all bookmarks
 */
export class SingleDocumentGenerator {
	constructor(private language: Language = "en") {}

	/**
	 * Generate single document from all bookmarks
	 */
	generateDocument(bookmarks: AnalyzedBookmark[], existingContent?: string): string {
		// Parse existing content if provided (for updates)
		const existingBookmarks = existingContent ? this.parseExistingBookmarks(existingContent) : new Map<string, AnalyzedBookmark>();

		// Merge bookmarks (new overrides existing)
		for (const bookmark of bookmarks) {
			existingBookmarks.set(bookmark.url, bookmark);
		}

		// Generate document
		return this.generateMarkdown(Array.from(existingBookmarks.values()));
	}

	/**
	 * Parse existing document to extract bookmarks
	 */
	private parseExistingBookmarks(content: string): Map<string, AnalyzedBookmark> {
		const bookmarks = new Map<string, AnalyzedBookmark>();
		const lines = content.split('\n');

		let currentBookmark: Partial<AnalyzedBookmark> | null = null;

		for (const line of lines) {
			// Match URL line
			const urlMatch = line.match(/^\- \*\*URL\*\*: (.+)$/);
			if (urlMatch) {
				if (currentBookmark && currentBookmark.url) {
					bookmarks.set(currentBookmark.url, currentBookmark as AnalyzedBookmark);
				}
				currentBookmark = { url: urlMatch[1] };
			}

			// Match title line
			const titleMatch = line.match(/^### (.+)$/);
			if (titleMatch && currentBookmark) {
				currentBookmark.title = titleMatch[1];
			}

			// Match tags
			const tagsMatch = line.match(/^\- \*\*Tags\*\*: (.+)$/);
			if (tagsMatch && currentBookmark) {
				currentBookmark.tags = tagsMatch[1].split(',').map(t => t.trim().replace('#', ''));
			}

			// Match folder
			const folderMatch = line.match(/^\- \*\*Folder\*\*: (.+)$/);
			if (folderMatch && currentBookmark) {
				currentBookmark.folder = folderMatch[1];
			}

			// Match description/capability
			const descMatch = line.match(/^\- \*\*Capability\*\*: (.+)$/);
			if (descMatch && currentBookmark) {
				if (!currentBookmark.metadata) currentBookmark.metadata = {};
				currentBookmark.metadata.description = descMatch[1];
			}
		}

		// Don't forget the last bookmark
		if (currentBookmark && currentBookmark.url) {
			bookmarks.set(currentBookmark.url, currentBookmark as AnalyzedBookmark);
		}

		return bookmarks;
	}

	/**
	 * Generate markdown from bookmarks
	 */
	private generateMarkdown(bookmarks: AnalyzedBookmark[]): string {
		const header = this.getHeader();
		const sections = new Map<string, AnalyzedBookmark[]>();

		// Group by folder
		for (const bookmark of bookmarks) {
			const folder = bookmark.folder || "Uncategorized";
			if (!sections.has(folder)) {
				sections.set(folder, []);
			}
			sections.get(folder)!.push(bookmark);
		}

		// Generate content
		let content = header;
		content += '\n\n';
		content += `> Last updated: ${new Date().toISOString()}\n\n`;

		for (const [folder, folderBookmarks] of sections.entries()) {
			content += `## 📁 ${folder}\n\n`;

			for (const bookmark of folderBookmarks) {
				content += this.formatBookmark(bookmark);
			}

			content += '\n---\n\n';
		}

		return content;
	}

	/**
	 * Get document header
	 */
	private getHeader(): string {
		const headers = {
			en: '# Smart Bookmarks\n\nOrganized collection of useful websites and their capabilities.',
			zh: '# 智能书签\n\n整理的实用网站及其能力集合。'
		};
		return headers[this.language] || headers.en;
	}

	/**
	 * Format a single bookmark
	 */
	private formatBookmark(bookmark: AnalyzedBookmark): string {
		const metadata = bookmark.metadata || {};
		const capability = metadata.description || metadata.summary || "";
		const tags = bookmark.tags || metadata.keywords || [];

		let content = `### ${bookmark.title}\n\n`;
		content += `- **URL**: ${bookmark.url}\n`;

		if (capability) {
			content += `- **Capability**: ${capability}\n`;
		}

		if (bookmark.folder) {
			content += `- **Folder**: ${bookmark.folder}\n`;
		}

		if (tags.length > 0) {
			content += `- **Tags**: ${tags.map(t => '#' + t).join(' ')}\n`;
		}

		if (bookmark.dateAdded) {
			const date = new Date(bookmark.dateAdded).toISOString().split('T')[0];
			content += `- **Date Added**: ${date}\n`;
		}

		content += '\n';

		return content;
	}

	/**
	 * Set language
	 */
	setLanguage(language: Language): void {
		this.language = language;
	}
}
