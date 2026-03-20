import { BrowserType } from "../types";
import { homedir } from "os";

/**
 * Get default bookmarks path based on OS and browser
 */
export function getDefaultBookmarksPath(browser: BrowserType): string {
	const platform = process.platform;
	const homeDir = homedir();

	if (platform === "darwin") {
		// macOS
		switch (browser) {
			case "chrome":
				return `${homeDir}/Library/Application Support/Google/Chrome/Default/Bookmarks`;
			case "safari":
				return `${homeDir}/Library/Safari/Bookmarks.plist`;
			case "edge":
				return `${homeDir}/Library/Application Support/Microsoft Edge/Default/Bookmarks`;
			case "firefox":
				// Firefox uses profiles, try to find default profile
				return `${homeDir}/Library/Application Support/Firefox/Profiles`;
			default:
				return "";
		}
	} else if (platform === "win32") {
		// Windows
		switch (browser) {
			case "chrome":
				return `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default\\Bookmarks`;
			case "safari":
				return `${process.env.LOCALAPPDATA}\\Apple Computer\\Safari\\Bookmarks.plist`;
			case "edge":
				return `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\User Data\\Default\\Bookmarks`;
			case "firefox":
				return `${process.env.APPDATA}\\Mozilla\\Firefox\\Profiles`;
			default:
				return "";
		}
	} else if (platform === "linux") {
		// Linux
		switch (browser) {
			case "chrome":
				return `${homeDir}/.config/google-chrome/Default/Bookmarks`;
			case "safari":
				return ""; // Safari not available on Linux
			case "edge":
				return `${homeDir}/.config/microsoft-edge/Default/Bookmarks`;
			case "firefox":
				return `${homeDir}/.mozilla/firefox`;
			default:
				return "";
		}
	}

	return "";
}

/**
 * Get a description for the default path
 */
export function getDefaultPathDescription(browser: BrowserType): string {
	const platform = process.platform;
	const descriptions: any = {
		darwin: {
			chrome: "MacOS: ~/Library/Application Support/Google/Chrome/Default/Bookmarks",
			safari: "MacOS: ~/Library/Safari/Bookmarks.plist",
			edge: "MacOS: ~/Library/Application Support/Microsoft Edge/Default/Bookmarks",
			firefox: "MacOS: ~/Library/Application Support/Firefox/Profiles"
		},
		win32: {
			chrome: "Windows: %LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Bookmarks",
			safari: "Windows: %LOCALAPPDATA%\\Apple Computer\\Safari\\Bookmarks.plist",
			edge: "Windows: %LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default\\Bookmarks",
			firefox: "Windows: %APPDATA%\\Mozilla\\Firefox\\Profiles"
		},
		linux: {
			chrome: "Linux: ~/.config/google-chrome/Default/Bookmarks",
			safari: "Safari not available on Linux",
			edge: "Linux: ~/.config/microsoft-edge/Default/Bookmarks",
			firefox: "Linux: ~/.mozilla/firefox"
		}
	};

	return descriptions[platform]?.[browser] || "";
}
