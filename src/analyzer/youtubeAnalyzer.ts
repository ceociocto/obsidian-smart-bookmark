import { YouTubeMetadata } from "../types/websiteMetadata";

/**
 * YouTube video analyzer
 * Extracts detailed information from YouTube video URLs
 */
export class YouTubeAnalyzer {
	private apiKey: string | undefined;

	constructor(apiKey?: string) {
		this.apiKey = apiKey;
	}

	/**
	 * Analyze YouTube video URL
	 */
	async analyze(url: string): Promise<YouTubeMetadata> {
		const { WebsiteTypeDetector } = await import('./websiteTypeDetector');
		const type = WebsiteTypeDetector.detect(url);

		if (type.type !== "youtube") {
			throw new Error("Not a YouTube URL");
		}

		const metadata = WebsiteTypeDetector.extractMetadata(url, type);
		const videoId = metadata.videoId;

		if (!videoId) {
			throw new Error("Could not extract video ID from URL");
		}

		// Try to fetch from YouTube API if API key is available
		if (this.apiKey) {
			try {
				return await this.fetchFromAPI(videoId);
			} catch (error) {
				console.warn("[SmartBookmark] YouTube API failed, using fallback:", error);
			}
		}

		// Fallback: Return basic metadata
		return this.getFallbackMetadata(url, videoId);
	}

	/**
	 * Fetch video details from YouTube Data API
	 */
	private async fetchFromAPI(videoId: string): Promise<YouTubeMetadata> {
		const response = await fetch(
			`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.apiKey}`
		);

		if (!response.ok) {
			throw new Error(`YouTube API error: ${response.status}`);
		}

		const data = await response.json();

		if (!data.items || data.items.length === 0) {
			throw new Error("Video not found");
		}

		const video = data.items[0];
		const snippet = video.snippet;

		return {
			type: "youtube",
			videoId,
			title: snippet.title,
			channel: snippet.channelTitle,
			channelId: snippet.channelId,
			description: this.summarizeDescription(snippet.description || ""),
			duration: this.formatDuration(video.contentDetails.duration),
			publishedAt: snippet.publishedAt,
			viewCount: parseInt(video.statistics?.viewCount || "0"),
			videoType: this.detectVideoType(snippet.title, snippet.description || ""),
		};
	}

	/**
	 * Get fallback metadata without API
	 */
	private getFallbackMetadata(url: string, videoId: string): YouTubeMetadata {
		return {
			type: "youtube",
			videoId,
			title: "YouTube Video",
			channel: "Unknown Channel",
			channelId: "",
			description: `Video ID: ${videoId}\nURL: ${url}\n\nAdd YouTube API key in settings to get full video details.`,
			duration: undefined,
			publishedAt: undefined,
			viewCount: undefined,
			videoType: "unknown",
		};
	}

	/**
	 * Summarize YouTube description
	 */
	private summarizeDescription(description: string): string {
		if (!description) return "";

		// Take first 2 paragraphs or first 500 characters
		const paragraphs = description.split('\n\n');
		let summary = "";

		for (const paragraph of paragraphs) {
			if (paragraph.trim()) {
				summary += paragraph + "\n\n";
				if (summary.length > 500) break;
			}
		}

		return summary.trim();
	}

	/**
	 * Format YouTube duration (PT1H2M3S -> 1:02:03)
	 */
	private formatDuration(duration: string): string {
		const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
		if (!match) return "";

		const hours = parseInt(match[1] || "0");
		const minutes = parseInt(match[2] || "0");
		const seconds = parseInt(match[3] || "0");

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}

		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	/**
	 * Detect video type from title and description
	 */
	private detectVideoType(title: string, description: string): YouTubeMetadata["videoType"] {
		const text = (title + " " + description).toLowerCase();

		const patterns: Array<{ type: YouTubeMetadata["videoType"], keywords: string[] }> = [
			{ type: "tutorial", keywords: ["tutorial", "how to", "guide", "learn", "course"] },
			{ type: "review", keywords: ["review", "vs", "comparison", "test"] },
			{ type: "documentary", keywords: ["documentary", "history", "explainer"] },
			{ type: "podcast", keywords: ["podcast", "interview", "talk"] },
			{ type: "news", keywords: ["news", "update", "breaking", "report"] },
		];

		for (const pattern of patterns) {
			if (pattern.keywords.some(keyword => text.includes(keyword))) {
				return pattern.type;
			}
		}

		return "unknown";
	}
}
