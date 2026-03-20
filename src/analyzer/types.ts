import { AnalyzedBookmark } from "../types";

/**
 * Metadata extraction result
 */
export interface Metadata {
	title?: string;
	description?: string;
	keywords?: string[];
	category?: string;
	language?: string;
	author?: string;
	publishedDate?: string;
	summary?: string;
}

/**
 * Analysis options
 */
export interface AnalysisOptions {
	fetchMetadata: boolean;
	extractKeywords: boolean;
	aiAnalysis: boolean;
	cloudProvider?: string;
	apiKey?: string;
}

/**
 * Cloud AI service interface (reserved for future use)
 */
export interface CloudAIClient {
	analyze(url: string): Promise<Metadata>;
	summarize(content: string): Promise<string>;
	extractKeywords(content: string): Promise<string[]>;
}
