/**
 * Bookmark entry from various browsers
 */
export interface Bookmark {
	id: string;
	title: string;
	url: string;
	dateAdded?: number;
	folder?: string;
	tags?: string[];
	description?: string;
	[key: string]: any;
}

/**
 * Analyzed bookmark with metadata
 */
export interface AnalyzedBookmark extends Bookmark {
	metadata?: {
		title?: string;
		description?: string;
		keywords?: string[];
		category?: string;
		language?: string;
		author?: string;
		publishedDate?: string;
		summary?: string;
	};
}

/**
 * Note generation template
 */
export interface NoteTemplate {
	name: string;
	content: string;
	default: boolean;
}

/**
 * Plugin settings
 */
export interface SmartBookmarkSettings {
	importPath: string;
	outputFolder: string;
	noteTemplate: string;
	includeMetadata: boolean;
	enableCloudAI: boolean;
	cloudAIProvider?: string;
	cloudAIAPIKey?: string;
	defaultLanguage: string;
	autoTag: boolean;
	groupByFolder: boolean;
}

/**
 * Language code
 */
export type Language = "en" | "zh";

/**
 * Browser type
 */
export type BrowserType = "chrome" | "safari" | "edge" | "firefox";

/**
 * Cloud AI provider
 */
export type CloudAIProvider = "openai" | "anthropic" | "custom";

/**
 * Analysis result from content analyzer
 */
export interface AnalysisResult {
	success: boolean;
	bookmark: AnalyzedBookmark;
	errors?: string[];
}

/**
 * Import progress
 */
export interface ImportProgress {
	total: number;
	processed: number;
	failed: number;
	current?: string;
}

/**
 * Modal data
 */
export interface ModalData {
	bookmarks: Bookmark[];
	analysisOptions?: AnalysisOptions;
}

/**
 * Analysis options
 */
export interface AnalysisOptions {
	fetchMetadata: boolean;
	extractKeywords: boolean;
	aiAnalysis: boolean;
}
