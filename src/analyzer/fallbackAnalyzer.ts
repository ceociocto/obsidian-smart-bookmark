import { Bookmark, AnalyzedBookmark } from "../types";
import { GeneralMetadata } from "../types/websiteMetadata";

/**
 * Fallback analyzer for inaccessible websites
 * Uses URL patterns and known domain information
 */
export class FallbackAnalyzer {
	private knownDomains: Map<string, DomainInfo> = new Map();

	constructor() {
		this.initializeKnownDomains();
	}

	/**
	 * Analyze bookmark with fallback methods
	 */
	async analyze(bookmark: Bookmark): Promise<AnalyzedBookmark> {
		const url = new URL(bookmark.url);
		const domain = url.hostname;

		// Try to get domain-specific info
		const domainInfo = this.knownDomains.get(domain);

		// Extract info from URL structure
		const pathInfo = this.analyzePath(url.pathname);

		// Generate metadata
		const metadata: GeneralMetadata = {
			type: "general",
			title: bookmark.title || domain,
			description: this.generateDescription(domain, pathInfo, domainInfo),
			keywords: this.extractKeywords(domain, pathInfo, domainInfo),
			category: domainInfo?.category || pathInfo.category || "general",
			coreFunction: domainInfo?.coreFunction || pathInfo.coreFunction || "Website",
		};

		return {
			...bookmark,
			title: metadata.title,
			description: metadata.description,
			tags: this.generateTags(domain, metadata.category, metadata.keywords),
			metadata,
		};
	}

	/**
	 * Analyze URL path for patterns
	 */
	private analyzePath(pathname: string): PathInfo {
		const segments = pathname.split('/').filter(s => s.length > 0);

		const info: PathInfo = {
			segments,
			depth: segments.length,
			category: "general",
			coreFunction: "Website",
		};

		// Detect patterns from path segments
		const patternKeywords = [
			{ patterns: ['doc', 'docs', 'documentation'], category: 'documentation', function: 'Documentation' },
			{ patterns: ['api', 'rest', 'graphql'], category: 'development', function: 'API' },
			{ patterns: ['blog', 'post', 'article'], category: 'blog', function: 'Blog' },
			{ patterns: ['tutorial', 'guide', 'how-to'], category: 'education', function: 'Tutorial' },
			{ patterns: ['product', 'shop', 'store'], category: 'ecommerce', function: 'E-commerce' },
			{ patterns: ['app', 'dashboard', 'admin'], category: 'tool', function: 'Application' },
			{ patterns: ['download', 'file', 'assets'], category: 'resources', function: 'Resources' },
			{ patterns: ['news', 'press', 'media'], category: 'news', function: 'News' },
			{ patterns: ['about', 'team', 'contact'], category: 'information', function: 'Information' },
			{ patterns: ['login', 'signin', 'auth'], category: 'service', function: 'Authentication' },
		];

		for (const segment of segments) {
			const lowerSegment = segment.toLowerCase();

			for (const pattern of patternKeywords) {
				if (pattern.patterns.some(p => lowerSegment.includes(p))) {
					info.category = pattern.category as any;
					info.coreFunction = pattern.function;
					break;
				}
			}

			if (info.category !== "general") break;
		}

		return info;
	}

	/**
	 * Generate description from available info
	 */
	private generateDescription(
		domain: string,
		pathInfo: PathInfo,
		domainInfo?: DomainInfo
	): string {
		const parts: string[] = [];

		if (domainInfo?.description) {
			parts.push(domainInfo.description);
		} else {
			parts.push(`Website: ${domain}`);
		}

		if (pathInfo.coreFunction !== "Website") {
			parts.push(`Function: ${pathInfo.coreFunction}`);
		}

		if (pathInfo.segments.length > 0) {
			parts.push(`Path: /${pathInfo.segments.join('/')}`);
		}

		parts.push("\n*Note: Website content could not be fetched. This is a fallback analysis based on URL structure.*");

		return parts.join('\n');
	}

	/**
	 * Extract keywords from domain and path
	 */
	private extractKeywords(
		domain: string,
		pathInfo: PathInfo,
		domainInfo?: DomainInfo
	): string[] {
		const keywords: Set<string> = new Set();

		// Domain-based keywords
		const domainParts = domain.split('.');
		for (const part of domainParts) {
			if (part.length > 3 && !part.startsWith('www')) {
				keywords.add(part);
			}
		}

		// Path-based keywords
		for (const segment of pathInfo.segments) {
			// Remove common parameters
			if (!segment.match(/^[a-f0-9]{8,}$/i) && // UUIDs
				!segment.match(/^\d+$/) && // Numbers
				segment.length > 2 &&
				segment.length < 30) {
				// Clean segment
				const clean = segment.replace(/[-_]/g, ' ').trim();
				keywords.add(clean);
			}
		}

		// Domain info keywords
		if (domainInfo?.keywords) {
			for (const keyword of domainInfo.keywords) {
				keywords.add(keyword);
			}
		}

		return Array.from(keywords).slice(0, 8);
	}

	/**
	 * Generate tags from metadata
	 */
	private generateTags(
		domain: string,
		category: string,
		keywords: string[]
	): string[] {
		const tags: string[] = [];

		// Category tag
		tags.push(`#${category}`);

		// Domain tag
		const mainDomain = domain.replace(/^www\./, '').split('.')[0];
		tags.push(`#${mainDomain}`);

		// Top keywords
		for (const keyword of keywords.slice(0, 3)) {
			tags.push(`#${keyword.replace(/\s+/g, '').toLowerCase()}`);
		}

		return tags;
	}

	/**
	 * Initialize known domain information
	 */
	private initializeKnownDomains() {
		// Tech platforms
		this.knownDomains.set('github.com', {
			category: 'development',
			coreFunction: 'Code hosting and collaboration',
			keywords: ['github', 'code', 'git', 'repository'],
		});

		this.knownDomains.set('stackoverflow.com', {
			category: 'development',
			coreFunction: 'Q&A for programmers',
			keywords: ['stackoverflow', 'qa', 'programming'],
		});

		this.knownDomains.set('docs.rs', {
			category: 'documentation',
			coreFunction: 'Rust documentation',
			keywords: ['rust', 'documentation', 'crate'],
		});

		this.knownDomains.set('developer.mozilla.org', {
			category: 'documentation',
			coreFunction: 'Web development documentation',
			keywords: ['mdn', 'web', 'javascript', 'html', 'css'],
		});

		// Social media
		this.knownDomains.set('twitter.com', {
			category: 'social',
			coreFunction: 'Microblogging platform',
			keywords: ['twitter', 'social', 'microblog'],
		});

		this.knownDomains.set('linkedin.com', {
			category: 'social',
			coreFunction: 'Professional networking',
			keywords: ['linkedin', 'professional', 'networking'],
		});

		// News
		this.knownDomains.set('nytimes.com', {
			category: 'news',
			coreFunction: 'News and journalism',
			keywords: ['news', 'journalism', 'times'],
		});

		// Design
		this.knownDomains.set('dribbble.com', {
			category: 'design',
			coreFunction: 'Design showcase',
			keywords: ['dribbble', 'design', 'showcase', 'portfolio'],
		});

		this.knownDomains.set('behance.net', {
			category: 'design',
			coreFunction: 'Creative portfolio',
			keywords: ['behance', 'creative', 'portfolio', 'design'],
		});

		// Tools
		this.knownDomains.set('figma.com', {
			category: 'tool',
			coreFunction: 'Design tool',
			keywords: ['figma', 'design', 'collaboration'],
		});

		this.knownDomains.set('notion.so', {
			category: 'productivity',
			coreFunction: 'Productivity tool',
			keywords: ['notion', 'productivity', 'notes', 'wiki'],
		});

		this.knownDomains.set('trello.com', {
			category: 'productivity',
			coreFunction: 'Project management',
			keywords: ['trello', 'project', 'management', 'kanban'],
		});

		// E-commerce
		this.knownDomains.set('amazon.com', {
			category: 'ecommerce',
			coreFunction: 'E-commerce marketplace',
			keywords: ['amazon', 'shopping', 'marketplace'],
		});

		this.knownDomains.set('shopify.com', {
			category: 'ecommerce',
			coreFunction: 'E-commerce platform',
			keywords: ['shopify', 'ecommerce', 'store'],
		});

		// Education
		this.knownDomains.set('coursera.org', {
			category: 'education',
			coreFunction: 'Online courses',
			keywords: ['coursera', 'education', 'courses', 'mooc'],
		});

		this.knownDomains.set('udemy.com', {
			category: 'education',
			coreFunction: 'Online courses',
			keywords: ['udemy', 'education', 'courses'],
		});

		// Reference
		this.knownDomains.set('wikipedia.org', {
			category: 'reference',
			coreFunction: 'Encyclopedia',
			keywords: ['wikipedia', 'encyclopedia', 'reference'],
		});
	}
}

/**
 * Domain information
 */
interface DomainInfo {
	category: string;
	coreFunction: string;
	keywords: string[];
	description?: string;
}

/**
 * Path information
 */
interface PathInfo {
	segments: string[];
	depth: number;
	category: string;
	coreFunction: string;
}
