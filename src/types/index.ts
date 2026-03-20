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
	cloudAIProvider?: CloudAIProvider;
	cloudAIAPIKey?: string;
	cloudAIBaseURL?: string; // For custom/local providers
	defaultLanguage: string;
	autoTag: boolean;
	groupByFolder: boolean;
	singleDocumentMode: boolean; // Use single document for all bookmarks
	bookmarkFileName: string; // Filename for single document mode

	// Sync settings
	syncInterval: "manual" | "hourly" | "daily" | "weekly"; // Sync frequency
	lastSyncTime?: number; // Last sync timestamp

	// URL validation settings
	validateUrls: boolean; // Enable URL validation
	urlValidationTimeout: number; // Request timeout in seconds
	urlWhitelist: string[]; // URLs to skip validation

	// Enhanced analysis settings
	useEnhancedAnalyzer: boolean; // Use specialized analyzers
	youtubeAPIKey?: string; // YouTube Data API key
	githubToken?: string; // GitHub API token
}

/**
 * Sync interval options
 */
export type SyncInterval = "manual" | "hourly" | "daily" | "weekly";

/**
 * URL validation result
 */
export interface URLValidationResult {
	url: string;
	valid: boolean;
	status?: number;
	error?: string;
}

/**
 * URL health check result
 */
export interface URLHealthCheckResult {
	total: number;
	valid: number;
	invalid: number;
	invalidUrls: URLValidationResult[];
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
export type CloudAIProvider = "openai" | "anthropic" | "custom" | "local";

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
