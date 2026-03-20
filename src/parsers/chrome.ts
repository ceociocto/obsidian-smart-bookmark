import { BrowserParser } from "./browserParser";
import { Bookmark } from "../types";

/**
 * Chrome/Edge bookmarks parser
 * Chrome bookmarks are stored in JSON format
 */
export class ChromeParser extends BrowserParser {
	async parse(content: string): Promise<Bookmark[]> {
		const data = JSON.parse(content);
		const bookmarks: Bookmark[] = [];

		this.extractBookmarks(data, bookmarks, "");

		return bookmarks;
	}

	private extractBookmarks(
		node: any,
		bookmarks: Bookmark[],
		folder: string
	): void {
		if (!node) return;

		// Handle bookmark bar and other roots
		if (node.type === "folder" || node.type === "text/x-moz-place-container") {
			const newFolder = folder ? `${folder}/${node.title}` : node.title;

			if (node.children) {
				for (const child of node.children) {
					this.extractBookmarks(child, bookmarks, newFolder);
				}
			}
		}

		// Handle bookmarks
		if (node.type === "url") {
			const bookmark: Bookmark = {
				id: this.generateId(),
				title: this.cleanTitle(node.title),
				url: this.cleanUrl(node.url),
				dateAdded: node.date_added ? this.formatDate(node.date_added) : Date.now(),
				folder: folder || "Uncategorized",
				tags: [],
			};

			if (this.isValidUrl(bookmark.url)) {
				bookmarks.push(bookmark);
			}
		}

		// Handle other nodes that might have children
		if (node.children && !node.type) {
			for (const child of node.children) {
				this.extractBookmarks(child, bookmarks, folder);
			}
		}
	}
}
