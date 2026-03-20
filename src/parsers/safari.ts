import { BrowserParser } from "./browserParser";
import { Bookmark } from "../types";

/**
 * Safari bookmarks parser
 * Safari bookmarks are stored in plist (XML) format
 */
export class SafariParser extends BrowserParser {
	async parse(content: string): Promise<Bookmark[]> {
		const bookmarks: Bookmark[] = [];

		try {
			// Parse XML plist format
			const data = this.parsePlist(content);
			this.extractBookmarks(data, bookmarks, "");

			return bookmarks;
		} catch (error) {
			console.error("Error parsing Safari bookmarks:", error);
			return [];
		}
	}

	private parsePlist(xml: string): any {
		// Basic plist parser for Safari bookmarks
		const result: any = {};

		// Extract dictionary items
		const dictPattern = /<dict>([\s\S]*?)<\/dict>/g;
		const stringPattern = /<key>(.*?)<\/key>\s*<string>(.*?)<\/string>/g;
		const arrayPattern = /<array>([\s\S]*?)<\/array>/g;
		const keyPattern = /<key>(.*?)<\/key>/g;

		const dictMatch = xml.match(dictPattern);
		if (dictMatch) {
			for (const dict of dictMatch) {
				let match;
				while ((match = keyPattern.exec(dict)) !== null) {
					const key = match[1];
					// Find the value
					const valueMatch = dict.substring(match.index).match(/<string>(.*?)<\/string>/);
					if (valueMatch) {
						result[key] = valueMatch[1];
					}
				}
			}
		}

		return result;
	}

	private extractBookmarks(
		node: any,
		bookmarks: Bookmark[],
		folder: string
	): void {
		if (!node || typeof node !== "object") return;

		// Safari bookmarks structure is complex, this is a simplified parser
		// For full support, you might need a proper plist parser library

		// Handle Children array
		if (node.Children && Array.isArray(node.Children)) {
			const newFolder = folder || (node.Title || "Uncategorized");

			for (const child of node.Children) {
				if (child.URIString) {
					// It's a bookmark
					const bookmark: Bookmark = {
						id: this.generateId(),
						title: this.cleanTitle(child.Title || "Untitled"),
						url: this.cleanUrl(child.URIString),
						dateAdded: Date.now(),
						folder: newFolder,
						tags: [],
					};

					if (this.isValidUrl(bookmark.url)) {
						bookmarks.push(bookmark);
					}
				} else {
					// It's a folder
					this.extractBookmarks(child, bookmarks, `${newFolder}/${child.Title || "Untitled"}`);
				}
			}
		}
	}
}
