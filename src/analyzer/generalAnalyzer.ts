import { GeneralMetadata } from "../types/websiteMetadata";

/**
 * General website analyzer
 * Extracts basic information from any website
 */
export class GeneralAnalyzer {
	/**
	 * Analyze general website URL
	 */
	async analyze(url: string): Promise<GeneralMetadata> {
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; Obsidian Smart Bookmark)',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const html = await response.text();

			return this.extractMetadataFromHTML(html, url);
		} catch (error) {
			console.warn(`[SmartBookmark] Failed to analyze ${url}:`, error);
			return this.getFallbackMetadata(url);
		}
	}

	/**
	 * Extract metadata from HTML
	 */
	private extractMetadataFromHTML(html: string, url: string): GeneralMetadata {
		// Extract title
		const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
		const title = titleMatch ? titleMatch[1].trim() : "";

		// Extract meta description
		const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
		const description = descMatch ? descMatch[1].trim() : "";

		// Extract meta keywords
		const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
		const keywords = keywordsMatch
			? keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k)
			: [];

		// Infer category from URL and content
		const category = this.inferCategory(url, title, description);

		// Extract core function
		const coreFunction = this.extractCoreFunction(title, description, category);

		return {
			type: "general",
			title: title || "Untitled",
			description: description || "",
			keywords: keywords,
			category,
			coreFunction,
		};
	}

	/**
	 * Infer category from URL and content
	 */
	private inferCategory(url: string, title: string, description: string): string {
		const text = (url + " " + title + " " + description).toLowerCase();

		const categories: Array<{ category: string, keywords: string[] }> = [
			{ category: "design", keywords: ["design", "ui", "ux", "figma", "sketch", "dribbble", "behance"] },
			{ category: "development", keywords: ["code", "developer", "programming", "api", "github", "stack overflow"] },
			{ category: "productivity", keywords: ["productivity", "tool", "task", "calendar", "todo", "notion"] },
			{ category: "education", keywords: ["course", "learn", "tutorial", "education", "university", "school"] },
			{ category: "finance", keywords: ["finance", "stock", "trading", "investment", "crypto", "bank"] },
			{ category: "entertainment", keywords: ["game", "video", "music", "movie", "stream", "entertainment"] },
			{ category: "news", keywords: ["news", "article", "blog", "post", "journal"] },
			{ category: "ecommerce", keywords: ["shop", "store", "buy", "sell", "price", "product"] },
			{ category: "social", keywords: ["social", "community", "network", "chat", "messenger"] },
			{ category: "reference", keywords: ["wiki", "documentation", "reference", "manual", "guide"] },
		];

		for (const category of categories) {
			if (category.keywords.some(keyword => text.includes(keyword))) {
				return category.category;
			}
		}

		return "general";
	}

	/**
	 * Extract core function from title and description
	 */
	private extractCoreFunction(title: string, description: string, category: string): string {
		// If title is descriptive, use it
		if (title && title.length > 10 && title.length < 100) {
			return title;
		}

		// Otherwise, use first sentence of description
		if (description) {
			const firstSentence = description.split(/[.!]/)[0];
			if (firstSentence && firstSentence.length > 10) {
				return firstSentence.trim();
			}
		}

		// Fallback to category-based description
		const categoryDescriptions: Record<string, string> = {
			design: "Design and creative resources",
			development: "Development tools and resources",
			productivity: "Productivity and workflow tools",
			education: "Educational content and courses",
			finance: "Finance and investment resources",
			entertainment: "Entertainment and media",
			news: "News and articles",
			ecommerce: "E-commerce and shopping",
			social: "Social and community platforms",
			reference: "Reference and documentation",
		};

		return categoryDescriptions[category] || "General website";
	}

	/**
	 * Get fallback metadata
	 */
	private getFallbackMetadata(url: string): GeneralMetadata {
		const domain = new URL(url).hostname;

		return {
			type: "general",
			title: domain,
			description: `${domain}\nURL: ${url}`,
			keywords: [],
			category: "general",
			coreFunction: "Website",
		};
	}
}
