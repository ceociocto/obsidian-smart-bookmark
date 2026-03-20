import { GitHubMetadata } from "../types/websiteMetadata";

/**
 * GitHub repository analyzer
 * Extracts detailed information from GitHub repository URLs
 */
export class GitHubAnalyzer {
	private token: string | undefined;

	constructor(token?: string) {
		this.token = token;
	}

	/**
	 * Analyze GitHub repository URL
	 */
	async analyze(url: string): Promise<GitHubMetadata> {
		const { WebsiteTypeDetector } = await import('./websiteTypeDetector');
		const type = WebsiteTypeDetector.detect(url);

		if (type.type !== "github") {
			throw new Error("Not a GitHub URL");
		}

		const metadata = WebsiteTypeDetector.extractMetadata(url, type);
		const { owner, repo } = metadata;

		if (!owner || !repo) {
			throw new Error("Could not extract owner and repo from URL");
		}

		// Try to fetch from GitHub API if token is available
		if (this.token) {
			try {
				return await this.fetchFromAPI(owner, repo);
			} catch (error) {
				console.warn("[SmartBookmark] GitHub API failed, using fallback:", error);
			}
		}

		// Fallback: Return basic metadata
		return this.getFallbackMetadata(url, owner, repo);
	}

	/**
	 * Fetch repo details from GitHub API
	 */
	private async fetchFromAPI(owner: string, repo: string): Promise<GitHubMetadata> {
		const headers: HeadersInit = {
			"Accept": "application/vnd.github.v3+json",
		};

		if (this.token) {
			headers["Authorization"] = `token ${this.token}`;
		}

		const response = await fetch(
			`https://api.github.com/repos/${owner}/${repo}`,
			{ headers }
		);

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`);
		}

		const data = await response.json();

		return {
			type: "github",
			owner,
			repo,
			description: data.description || "",
			stars: data.stargazers_count || 0,
			forks: data.forks_count || 0,
			language: data.language || undefined,
			topics: data.topics || [],
			homepage: data.homepage || undefined,
			license: data.license?.name || undefined,
			updatedAt: data.updated_at,
			category: this.detectCategory(data.description, data.language),
			functions: this.extractFunctions(data.description, data.topics),
		};
	}

	/**
	 * Get fallback metadata without API
	 */
	private getFallbackMetadata(url: string, owner: string, repo: string): GitHubMetadata {
		return {
			type: "github",
			owner,
			repo,
			description: `GitHub Repository: ${owner}/${repo}\nURL: ${url}\n\nAdd GitHub token in settings to get full repository details.`,
			stars: undefined,
			forks: undefined,
			language: undefined,
			topics: [],
			homepage: undefined,
			license: undefined,
			updatedAt: undefined,
			category: "unknown",
			functions: [],
		};
	}

	/**
	 * Detect repository category from description and language
	 */
	private detectCategory(description: string, language?: string): string {
		const text = (description + " " + (language || "")).toLowerCase();

		const categories: Array<{ category: string, keywords: string[] }> = [
			{ category: "frontend", keywords: ["ui", "frontend", "react", "vue", "angular", "svelte", "css", "html"] },
			{ category: "backend", keywords: ["api", "backend", "server", "node", "python", "java", "go", "rust"] },
			{ category: "mobile", keywords: ["ios", "android", "react-native", "flutter", "mobile", "app"] },
			{ category: "devops", keywords: ["docker", "kubernetes", "ci", "cd", "infrastructure", "deployment"] },
			{ category: "ai/ml", keywords: ["ai", "ml", "machine learning", "deep learning", "neural", "tensorflow", "pytorch"] },
			{ category: "database", keywords: ["database", "sql", "mongodb", "redis", "postgres", "mysql"] },
			{ category: "tools", keywords: ["cli", "tool", "utility", "automation", "script"] },
		];

		for (const category of categories) {
			if (category.keywords.some(keyword => text.includes(keyword))) {
				return category.category;
			}
		}

		return "general";
	}

	/**
	 * Extract key functions/features from description and topics
	 */
	private extractFunctions(description: string, topics: string[]): string[] {
		const functions: string[] = [];

		// From topics (most reliable)
		for (const topic of topics) {
			if (topic.length > 2 && topic.length < 30) {
				functions.push(topic);
			}
		}

		// From description (extract key phrases)
		if (description) {
			const sentences = description.split(/[.!]/);
			for (const sentence of sentences) {
				const trimmed = sentence.trim();
				if (trimmed.length > 10 && trimmed.length < 100) {
					functions.push(trimmed);
					if (functions.length >= 5) break;
				}
			}
		}

		return functions.slice(0, 8); // Max 8 functions
	}
}
