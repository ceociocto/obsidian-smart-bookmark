import { Bookmark, BrowserType } from "../types";

/**
 * Base parser interface for browser bookmarks
 */
export abstract class BrowserParser {
	abstract parse(content: string): Promise<Bookmark[]>;

	protected generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	protected formatDate(timestamp: number): number {
		return timestamp * 1000; // Convert to milliseconds
	}

	protected cleanTitle(title: string): string {
		return title.trim().replace(/\s+/g, " ");
	}

	protected cleanUrl(url: string): string {
		return url.trim();
	}

	protected isValidUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}
}

/**
 * Parser factory
 */
export class ParserFactory {
	static create(browser: BrowserType): BrowserParser {
		switch (browser) {
			case "chrome":
				const { ChromeParser } = require("./chrome");
				return new ChromeParser();
			case "safari":
				const { SafariParser } = require("./safari");
				return new SafariParser();
			case "edge":
				const { EdgeParser } = require("./edge");
				return new EdgeParser();
			case "firefox":
				const { FirefoxParser } = require("./firefox");
				return new FirefoxParser();
			default:
				throw new Error(`Unsupported browser: ${browser}`);
		}
	}

	static supportedBrowsers(): BrowserType[] {
		return ["chrome", "safari", "edge", "firefox"];
	}
}
