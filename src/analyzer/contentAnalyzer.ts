import { AnalyzedBookmark, Bookmark } from "../types";
import { AnalysisOptions, Metadata } from "./types";

/**
 * Content analyzer for bookmarks
 * Extracts metadata and insights from bookmark URLs
 */
export class ContentAnalyzer {
	constructor(private options: AnalysisOptions = {
		fetchMetadata: true,
		extractKeywords: true,
		aiAnalysis: false,
	}) {}

	/**
	 * Analyze a single bookmark
	 */
	async analyze(bookmark: Bookmark): Promise<AnalyzedBookmark> {
		const analyzed: AnalyzedBookmark = { ...bookmark };

		if (this.options.fetchMetadata) {
			analyzed.metadata = await this.extractMetadata(bookmark.url);
		}

		if (this.options.extractKeywords && analyzed.metadata) {
			analyzed.metadata.keywords = await this.extractKeywords(bookmark);
		}

		if (this.options.aiAnalysis) {
			// Reserved for future cloud AI integration
			await this.performAIAnalysis(analyzed);
		}

		return analyzed;
	}

	/**
	 * Analyze multiple bookmarks
	 */
	async analyzeBatch(bookmarks: Bookmark[]): Promise<AnalyzedBookmark[]> {
		return Promise.all(bookmarks.map(b => this.analyze(b)));
	}

	/**
	 * Extract metadata from URL
	 * Note: In a real plugin, you'd need to fetch the page content
	 * This is a simplified version that extracts info from URL and title
	 */
	private async extractMetadata(url: string): Promise<Metadata> {
		try {
			const urlObj = new URL(url);
			const domain = urlObj.hostname;
			const path = urlObj.pathname;

			// Extract basic info from URL structure
			const metadata: Metadata = {
				title: "",
				description: `Bookmark from ${domain}`,
				keywords: this.extractDomainKeywords(domain),
				category: this.guessCategory(url),
			};

			// In a full implementation, you would:
			// 1. Fetch the HTML content
			// 2. Parse <title>, <meta description>, <meta keywords>
			// 3. Extract OpenGraph tags
			// 4. Parse structured data (JSON-LD)

			return metadata;
		} catch (error) {
			console.error(`Error extracting metadata from ${url}:`, error);
			return {
				description: "Unable to extract metadata",
			};
		}
	}

	/**
	 * Extract keywords from bookmark
	 */
	private async extractKeywords(bookmark: Bookmark): Promise<string[]> {
		const keywords: string[] = [];

		// Add URL domain-based keywords
		const urlKeywords = this.extractDomainKeywords(new URL(bookmark.url).hostname);
		keywords.push(...urlKeywords);

		// Extract keywords from title
		const titleWords = bookmark.title
			.toLowerCase()
			.split(/\s+/)
			.filter(word => word.length > 3 && !this.isStopWord(word));

		keywords.push(...titleWords);

		// Add folder as a keyword if exists
		if (bookmark.folder) {
			keywords.push(bookmark.folder.toLowerCase());
		}

		// Deduplicate and limit
		return [...new Set(keywords)].slice(0, 10);
	}

	/**
	 * Extract keywords from domain
	 */
	private extractDomainKeywords(domain: string): string[] {
		const parts = domain.split(".");
		const keywords: string[] = [];

		// Extract meaningful parts (skip www, com, etc.)
		for (const part of parts) {
			if (part.length > 3 && !["www", "com", "org", "net", "io", "co"].includes(part)) {
				keywords.push(part);
			}
		}

		return keywords;
	}

	/**
	 * Guess category from URL
	 */
	private guessCategory(url: string): string {
		const domain = new URL(url).hostname.toLowerCase();

		if (domain.includes("github") || domain.includes("gitlab")) {
			return "Development";
		}
		if (domain.includes("stackoverflow") || domain.includes("reddit")) {
			return "Community";
		}
		if (domain.includes("youtube") || domain.includes("vimeo")) {
			return "Video";
		}
		if (domain.includes("news") || domain.includes("blog")) {
			return "News";
		}
		if (domain.includes("shop") || domain.includes("store")) {
			return "Shopping";
		}

		return "General";
	}

	/**
	 * Check if word is a stop word
	 */
	private isStopWord(word: string): boolean {
		const stopWords = new Set([
			"the", "and", "for", "are", "but", "not", "you", "all", "can",
			"her", "was", "one", "our", "out", "with", "this", "that", "from",
			"they", "will", "have", "been", "more", "when", "into", "some",
			"such", "than", "them", "very", "just", "over", "also", "your",
			"about", "would", "there", "their", "what", "which", "while",
		]);

		return stopWords.has(word);
	}

	/**
	 * Perform AI analysis (reserved for future use)
	 */
	private async performAIAnalysis(bookmark: AnalyzedBookmark): Promise<void> {
		// This is a placeholder for future cloud AI integration
		// When implemented, this would:
		// 1. Call cloud AI service
		// 2. Get enhanced metadata
		// 3. Generate summary
		// 4. Extract insights

		if (this.options.aiAnalysis) {
			console.log(`AI analysis for ${bookmark.url} - reserved for future implementation`);
		}
	}
}
