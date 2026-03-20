import { Bookmark, AnalyzedBookmark } from "../types";
import { WebsiteTypeDetector } from "./websiteTypeDetector";
import { YouTubeAnalyzer } from "./youtubeAnalyzer";
import { GitHubAnalyzer } from "./githubAnalyzer";
import { GeneralAnalyzer } from "./generalAnalyzer";
import { FallbackAnalyzer } from "./fallbackAnalyzer";
import { CDPManager } from "../utils/cdpManager";
import { YouTubeMetadata, GitHubMetadata, GeneralMetadata } from "../types/websiteMetadata";

/**
 * Analysis options
 */
export interface EnhancedAnalysisOptions {
	fetchMetadata: boolean;
	extractKeywords: boolean;
	aiAnalysis: boolean;
	youtubeAPIKey?: string;
	githubToken?: string;
	useChromeCDP?: boolean;
	chromeCDPPort?: number;
}

/**
 * Enhanced content analyzer
 * Uses specialized analyzers for different website types
 */
export class EnhancedContentAnalyzer {
	private cdpManager?: CDPManager;

	constructor(private options: EnhancedAnalysisOptions) {
		// Initialize CDP manager if enabled
		if (options.useChromeCDP) {
			const port = options.chromeCDPPort || 9222;
			this.cdpManager = new CDPManager(port);
			this.connectCDP();
		}
	}

	/**
	 * Connect to Chrome CDP
	 */
	private async connectCDP() {
		if (!this.cdpManager) return;

		const connected = await this.cdpManager.connect();
		if (connected) {
			console.log('[SmartBookmark] Chrome CDP connected successfully');
		} else {
			console.warn('[SmartBookmark] Chrome CDP connection failed, will use fallback');
		}
	}

	/**
	 * Analyze bookmark with enhanced capabilities
	 */
	async analyze(bookmark: Bookmark): Promise<AnalyzedBookmark> {
		// Detect website type
		const websiteType = WebsiteTypeDetector.detect(bookmark.url);

		// Use appropriate analyzer based on type
		let metadata: YouTubeMetadata | GitHubMetadata | GeneralMetadata;

		switch (websiteType.type) {
			case "youtube":
				metadata = await this.analyzeYouTube(bookmark.url);
				break;

			case "github":
				metadata = await this.analyzeGitHub(bookmark.url);
				break;

			default:
				metadata = await this.analyzeGeneral(bookmark.url);
				break;
		}

		// Convert to AnalyzedBookmark format
		return this.toAnalyzedBookmark(bookmark, metadata, websiteType);
	}

	/**
	 * Analyze YouTube video
	 */
	private async analyzeYouTube(url: string): Promise<YouTubeMetadata> {
		const analyzer = new YouTubeAnalyzer(this.options.youtubeAPIKey);
		return await analyzer.analyze(url);
	}

	/**
	 * Analyze GitHub repository
	 */
	private async analyzeGitHub(url: string): Promise<GitHubMetadata> {
		const analyzer = new GitHubAnalyzer(this.options.githubToken);
		return await analyzer.analyze(url);
	}

	/**
	 * Analyze general website
	 */
	private async analyzeGeneral(url: string): Promise<GeneralMetadata> {
		// Try CDP first if enabled
		if (this.cdpManager && this.options.useChromeCDP) {
			try {
				const cdpContent = await this.cdpManager.getPageContent(url);

				return {
					type: "general",
					title: cdpContent.title || "Untitled",
					description: cdpContent.description || "",
					keywords: this.extractKeywords(cdpContent.content),
					category: this.inferCategory(cdpContent.title + " " + cdpContent.description),
					coreFunction: cdpContent.description || "Website",
				};
			} catch (error) {
				console.warn('[SmartBookmark] CDP analysis failed, falling back:', error);
			}
		}

		// Try normal analyzer
		const analyzer = new GeneralAnalyzer();

		try {
			return await analyzer.analyze(url);
		} catch (error) {
			console.warn(`[SmartBookmark] Failed to fetch ${url}, using fallback:`, error);

			// Use fallback analyzer
			const fallbackAnalyzer = new FallbackAnalyzer();
			const result = await fallbackAnalyzer.analyze({
				id: "fallback",
				title: "Untitled",
				url,
			});

			return result.metadata as GeneralMetadata;
		}
	}

	/**
	 * Extract keywords from content
	 */
	private extractKeywords(content: string): string[] {
		if (!content) return [];

		const words = content.toLowerCase().split(/\s+/);
		const keywords: string[] = [];

		// Remove common words
		const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were']);

		for (const word of words) {
			if (word.length > 3 && !stopWords.has(word)) {
				keywords.push(word);
				if (keywords.length >= 5) break;
			}
		}

		return keywords;
	}

	/**
	 * Infer category from text
	 */
	private inferCategory(text: string): string {
		const lowerText = text.toLowerCase();

		const categories: Array<{ category: string, keywords: string[] }> = [
			{ category: "documentation", keywords: ["doc", "guide", "tutorial", "api", "reference"] },
			{ category: "blog", keywords: ["blog", "post", "article", "news"] },
			{ category: "design", keywords: ["design", "ui", "ux", "interface"] },
			{ category: "development", keywords: ["code", "developer", "programming", "software"] },
			{ category: "productivity", keywords: ["tool", "app", "software", "productivity"] },
		];

		for (const category of categories) {
			if (category.keywords.some(k => lowerText.includes(k))) {
				return category.category;
			}
		}

		return "general";
	}

	/**
	 * Convert enhanced metadata to AnalyzedBookmark format
	 */
	private toAnalyzedBookmark(
		bookmark: Bookmark,
		metadata: YouTubeMetadata | GitHubMetadata | GeneralMetadata,
		websiteType: { type: string }
	): AnalyzedBookmark {
		const analyzed: AnalyzedBookmark = {
			...bookmark,
			tags: [],
			metadata: {},
		};

		// Handle YouTube metadata
		if (metadata.type === "youtube") {
			analyzed.title = metadata.title;
			analyzed.description = metadata.description;
			analyzed.tags = [
				"#youtube",
				"#video",
				`#${metadata.videoType}`,
				`#${metadata.channel.replace(/\s+/g, '').toLowerCase()}`,
			];
			analyzed.metadata = {
				title: metadata.title,
				description: metadata.description,
				category: metadata.videoType,
				author: metadata.channel,
				publishedDate: metadata.publishedAt,
				keywords: ["YouTube", metadata.videoType, "Video"],
			};
		}

		// Handle GitHub metadata
		if (metadata.type === "github") {
			analyzed.title = `${metadata.repo}`;
			analyzed.description = metadata.description;
			analyzed.tags = [
				"#github",
				`#${metadata.category}`,
				...(metadata.topics?.map(t => `#${t}`) || []),
			];
			analyzed.metadata = {
				title: `${metadata.owner}/${metadata.repo}`,
				description: metadata.description,
				category: metadata.category,
				summary: `${metadata.stars || 0} ⭐ | ${metadata.forks || 0} 🔀 | ${metadata.language || 'Unknown'}`,
				keywords: [...(metadata.topics || []), "GitHub", metadata.category],
			};
		}

		// Handle general metadata
		if (metadata.type === "general") {
			analyzed.title = metadata.title;
			analyzed.description = metadata.description;
			analyzed.tags = [
				`#${metadata.category}`,
				...metadata.keywords.slice(0, 3).map(k => `#${k}`),
			];
			analyzed.metadata = {
				title: metadata.title,
				description: metadata.description,
				category: metadata.category,
				keywords: metadata.keywords,
			};
		}

		return analyzed;
	}
}

/**
 * Factory for creating enhanced content analyzer
 */
export class EnhancedContentAnalyzerFactory {
	static create(options: EnhancedAnalysisOptions): EnhancedContentAnalyzer {
		return new EnhancedContentAnalyzer(options);
	}
}
