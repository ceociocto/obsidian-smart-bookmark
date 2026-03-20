import { WebsiteType } from "../types/websiteMetadata";

/**
 * Website type detector
 * Identifies the type of website from URL and can infer additional metadata
 */
export class WebsiteTypeDetector {
	private static patterns = {
		youtube: [
			/^https?:\/\/(www\.)?youtube\.com\/watch/i,
			/^https?:\/\/(www\.)?youtube\.com\/shorts/i,
			/^https?:\/\/youtu\.be\//i,
		],
		github: [
			/^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+\/?$/i,
		],
		blog: [
			/^https?:\/\/(www\.)?medium\.com/i,
			/^https?:\/\/(www\.)?substack\.com/i,
			/^https?:\/\/[^\/]+\.blogspot\.com/i,
			/^https?:\/\/[^\/]+\.wordpress\.com/i,
		],
		news: [
			/^https?:\/\/(www\.)?nytimes\.com/i,
			/^https?:\/\/(www\.)?washingtonpost\.com/i,
			/^https?:\/\/(www\.)?bbc\.com/i,
			/^https?:\/\/(www\.)?reuters\.com/i,
		],
		ecommerce: [
			/^https?:\/\/(www\.)?amazon\.com/i,
			/^https?:\/\/(www\.)?shopify\.com/i,
		],
		tool: [
			/^https?:\/\/(www\.)?figma\.com/i,
			/^https?:\/\/(www\.)?notion\.so/i,
			/^https?:\/\/(www\.)?trello\.com/i,
		],
	};

	/**
	 * Detect website type from URL
	 */
	static detect(url: string): WebsiteType {
		const normalizedUrl = url.toLowerCase();

		for (const [type, patterns] of Object.entries(this.patterns)) {
			for (const pattern of patterns) {
				if (pattern.test(normalizedUrl)) {
					return {
						type: type as WebsiteType['type'],
						confidence: 1.0,
					};
				}
			}
		}

		// Try to infer type from URL path and domain
		const inferredType = this.inferFromUrl(url);
		if (inferredType) {
			return inferredType;
		}

		return {
			type: "unknown",
			confidence: 0.0,
		};
	}

	/**
	 * Infer website type from URL patterns
	 */
	private static inferFromUrl(url: string): WebsiteType | null {
		const lowerUrl = url.toLowerCase();

		// Blog patterns
		if (/\/blog\/|\/posts\/|\/article\/|\/news\//i.test(lowerUrl)) {
			return { type: "blog", confidence: 0.7 };
		}

		// Tool patterns
		if (/\/app\/|\/tool\/|\/dashboard\//i.test(lowerUrl)) {
			return { type: "tool", confidence: 0.8 };
		}

		// Ecommerce patterns
		if (/\/shop\/|\/product\/|\/store\/|\/cart\//i.test(lowerUrl)) {
			return { type: "ecommerce", confidence: 0.9 };
		}

		return null;
	}

	/**
	 * Extract additional metadata based on website type
	 */
	static extractMetadata(url: string, type: WebsiteType): Record<string, any> {
		switch (type.type) {
			case "youtube":
				return this.extractYouTubeMetadata(url);

			case "github":
				return this.extractGitHubMetadata(url);

			default:
				return {};
		}
	}

	/**
	 * Extract YouTube video ID from URL
	 */
	private static extractYouTubeMetadata(url: string): Record<string, any> {
		let videoId = "";

		// youtube.com/watch?v=VIDEO_ID
		const watchMatch = url.match(/[?&]v=([^&]+)/);
		if (watchMatch) {
			videoId = watchMatch[1];
		}

		// youtu.be/VIDEO_ID
		const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
		if (shortMatch) {
			videoId = shortMatch[1];
		}

		// youtube.com/shorts/VIDEO_ID
		const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);
		if (shortsMatch) {
			videoId = shortsMatch[1];
		}

		return { videoId };
	}

	/**
	 * Extract GitHub repo info from URL
	 */
	private static extractGitHubMetadata(url: string): Record<string, any> {
		const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
		if (match) {
			return {
				owner: match[1],
				repo: match[2],
			};
		}

		return {};
	}
}
