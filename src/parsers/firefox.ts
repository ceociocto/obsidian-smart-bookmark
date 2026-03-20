import { BrowserParser } from "./browserParser";
import { Bookmark } from "../types";

/**
 * Firefox bookmarks parser
 * Firefox bookmarks are stored in places.sqlite database
 * Since we can't directly access SQLite in Obsidian plugins,
 * we'll provide an import method for exported HTML/JSON
 */
export class FirefoxParser extends BrowserParser {
	async parse(content: string): Promise<Bookmark[]> {
		const bookmarks: Bookmark[] = [];

		try {
			// Firefox can export bookmarks as HTML
			if (content.trim().startsWith("<!DOCTYPE NETSCAPE-Bookmark-file-1>")) {
				return this.parseHTML(content);
			}

			// Try JSON format
			const data = JSON.parse(content);
			if (data.children) {
				this.extractBookmarks(data, bookmarks, "");
			}

			return bookmarks;
		} catch (error) {
			console.error("Error parsing Firefox bookmarks:", error);
			return [];
		}
	}

	/**
	 * Parse Firefox HTML bookmark export
	 */
	private parseHTML(html: string): Bookmark[] {
		const bookmarks: Bookmark[] = [];
		const linkRegex = /<DT><A HREF="([^"]+)"[^>]*>([^<]+)<\/A>/g;
		const folderRegex = /<DT><H3[^>]*>([^<]+)<\/H3>/g;
		const dlRegex = /<DL>([\s\S]*?)<\/DL>/g;

		const links = html.match(linkRegex) || [];
		const folders = html.match(folderRegex) || [];

		let currentFolder = "Uncategorized";

		// Extract folders
		for (const folder of folders) {
			const folderMatch = folder.match(/<DT><H3[^>]*>([^<]+)<\/H3>/);
			if (folderMatch) {
				currentFolder = folderMatch[1].trim();
			}
		}

		// Extract links
		for (const link of links) {
			const linkMatch = link.match(/<DT><A HREF="([^"]+)"[^>]*>([^<]+)<\/A>/);
			if (linkMatch) {
				const bookmark: Bookmark = {
					id: this.generateId(),
					title: this.cleanTitle(linkMatch[2]),
					url: this.cleanUrl(linkMatch[1]),
					dateAdded: Date.now(),
					folder: currentFolder,
					tags: [],
				};

				if (this.isValidUrl(bookmark.url)) {
					bookmarks.push(bookmark);
				}
			}
		}

		return bookmarks;
	}

	private extractBookmarks(
		node: any,
		bookmarks: Bookmark[],
		folder: string
	): void {
		if (!node) return;

		if (node.type === "text/x-moz-place-container") {
			const newFolder = folder ? `${folder}/${node.title}` : node.title;

			if (node.children) {
				for (const child of node.children) {
					this.extractBookmarks(child, bookmarks, newFolder);
				}
			}
		}

		if (node.type === "text/x-moz-place" && node.uri) {
			const bookmark: Bookmark = {
				id: this.generateId(),
				title: this.cleanTitle(node.title || "Untitled"),
				url: this.cleanUrl(node.uri),
				dateAdded: Date.now(),
				folder: folder || "Uncategorized",
				tags: [],
			};

			if (this.isValidUrl(bookmark.url)) {
				bookmarks.push(bookmark);
			}
		}

		if (node.children && !node.type) {
			for (const child of node.children) {
				this.extractBookmarks(child, bookmarks, folder);
			}
		}
	}
}
