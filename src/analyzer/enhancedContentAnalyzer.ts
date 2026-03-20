import { Bookmark, AnalyzedBookmark } from "../types";
import { WebsiteTypeDetector } from "./websiteTypeDetector";
import { YouTubeAnalyzer } from "./youtubeAnalyzer";
import { GitHubAnalyzer } from "./githubAnalyzer";
import { GeneralAnalyzer } from "./generalAnalyzer";
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
}

/**
 * Enhanced content analyzer
 * Uses specialized analyzers for different website types
 */
export class EnhancedContentAnalyzer {
	constructor(private options: EnhancedAnalysisOptions) {}

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
		const analyzer = new GeneralAnalyzer();
		return await analyzer.analyze(url);
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
