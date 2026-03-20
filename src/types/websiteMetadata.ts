import { Bookmark } from "../types";

/**
 * Website type detection result
 */
export interface WebsiteType {
	type: "youtube" | "github" | "blog" | "news" | "ecommerce" | "tool" | "unknown";
	confidence: number;
	metadata?: Record<string, any>;
}

/**
 * Enhanced bookmark with website-specific data
 */
export interface EnhancedBookmark extends Bookmark {
	websiteType: WebsiteType;
	capability: string; // Website's core capability/function
	tags: string[]; // Extracted tags
	extractMetadata: Record<string, any>; // Website-specific metadata
}

/**
 * YouTube video metadata
 */
export interface YouTubeMetadata {
	type: "youtube";
	videoId: string;
	title: string;
	channel: string;
	channelId: string;
	description: string;
	duration?: string;
	publishedAt?: string;
	viewCount?: number;
	videoType: "tutorial" | "documentary" | "news" | "entertainment" | "review" | "podcast" | "unknown";
}

/**
 * GitHub repository metadata
 */
export interface GitHubMetadata {
	type: "github";
	owner: string;
	repo: string;
	description: string;
	stars?: number;
	forks?: number;
	language?: string;
	topics?: string[];
	homepage?: string;
	license?: string;
	updatedAt?: string;
	category: string; // e.g., "frontend", "backend", "devops", "ai"
	functions: string[]; // Key functions/features
}

/**
 * General website metadata
 */
export interface GeneralMetadata {
	type: "general";
	title: string;
	description: string;
	keywords: string[];
	category: string; // e.g., "design", "productivity", "education"
	coreFunction: string; // Main capability
}
