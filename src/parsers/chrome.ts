import { BrowserParser } from "./browserParser";
import { Bookmark } from "../types";

/**
 * Chrome/Edge bookmarks parser
 * Chrome bookmarks are stored in JSON format
 */
export class ChromeParser extends BrowserParser {

	/**
	 * Convert Chrome timestamp (WebKit format) to Unix timestamp (milliseconds)
	 * Chrome timestamp: microseconds since 1601-01-01 UTC
	 * Unix timestamp: milliseconds since 1970-01-01 UTC
	 */
	private convertChromeDate(chromeTimestamp: string | number): number {
		try {
			// Convert to number if string
			const timestamp = typeof chromeTimestamp === 'string' ? parseFloat(chromeTimestamp) : chromeTimestamp;

			// Chrome uses WebKit timestamp (microseconds since 1601-01-01)
			// Convert to Unix timestamp (milliseconds since 1970-01-01)
			// Formula: (chrome_timestamp / 1,000,000) - 11,644,473,600 seconds
			const unixSeconds = (timestamp / 1_000_000) - 11_644_473_600;

			// Convert to milliseconds
			return unixSeconds * 1000;
		} catch (error) {
			console.error(`[SmartBookmark] Error converting Chrome date: ${chromeTimestamp}`, error);
			return Date.now();
		}
	}
	async parse(content: string): Promise<Bookmark[]> {
		const data = JSON.parse(content);
		const bookmarks: Bookmark[] = [];

		console.log("[SmartBookmark] Parsing Chrome bookmarks...");
		console.log("[SmartBookmark] Root keys:", Object.keys(data));

		// Chrome bookmarks are organized under 'roots'
		if (data.roots) {
			console.log("[SmartBookmark] Processing roots:", Object.keys(data.roots));
			for (const rootKey of Object.keys(data.roots)) {
				const rootNode = data.roots[rootKey];
				console.log(`[SmartBookmark] Processing root: ${rootKey}`);
				this.extractBookmarks(rootNode, bookmarks, rootKey);
			}
		} else {
			console.log("[SmartBookmark] No 'roots' found, processing data directly");
			this.extractBookmarks(data, bookmarks, "");
		}

		console.log(`[SmartBookmark] Extracted ${bookmarks.length} bookmarks`);
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
				dateAdded: node.date_added ? this.convertChromeDate(node.date_added) : Date.now(),
				folder: folder || "Uncategorized",
				tags: [],
			};

			console.log(`[SmartBookmark] Found bookmark: ${bookmark.title} -> ${bookmark.url}`);
			console.log(`[SmartBookmark] URL valid: ${this.isValidUrl(bookmark.url)}`);

			if (this.isValidUrl(bookmark.url)) {
				bookmarks.push(bookmark);
			}
		}

		// Handle other nodes that might have children (like roots)
		if (node.children && !node.type) {
			console.log(`[SmartBookmark] Processing node with children (no type): ${Object.keys(node)}`);
			for (const child of node.children) {
				this.extractBookmarks(child, bookmarks, folder);
			}
		}
	}
}
