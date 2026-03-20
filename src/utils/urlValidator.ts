/**
 * URL validation utility
 * Checks if URLs are accessible and returns health status
 */
import { URLValidationResult, URLHealthCheckResult } from "../types";

export class URLValidator {
	private timeout: number;
	private whitelist: Set<string>;

	constructor(timeout: number = 5, whitelist: string[] = []) {
		this.timeout = timeout * 1000; // Convert to milliseconds
		this.whitelist = new Set(whitelist.map(url => this.normalizeUrl(url)));
	}

	/**
	 * Normalize URL for comparison
	 */
	private normalizeUrl(url: string): string {
		return url.replace(/\/$/, '').toLowerCase();
	}

	/**
	 * Check if URL is in whitelist
	 */
	isWhitelisted(url: string): boolean {
		const normalized = this.normalizeUrl(url);
		return this.whitelist.has(normalized);
	}

	/**
	 * Check if URL is accessible
	 */
	async checkURL(url: string): Promise<URLValidationResult> {
		// Check whitelist
		if (this.isWhitelisted(url)) {
			return {
				url,
				valid: true,
				status: 200,
			};
		}

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), this.timeout);

			const response = await fetch(url, {
				method: 'HEAD', // Use HEAD for faster check
				signal: controller.signal,
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; Obsidian Smart Bookmark)',
				},
			});

			clearTimeout(timeoutId);

			// Consider 2xx and 3xx as valid
			const valid = response.status >= 200 && response.status < 400;

			return {
				url,
				valid,
				status: response.status,
			};
		} catch (error) {
			// Try GET if HEAD fails (some servers don't support HEAD)
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), this.timeout);

				const response = await fetch(url, {
					method: 'GET',
					signal: controller.signal,
					headers: {
						'User-Agent': 'Mozilla/5.0 (compatible; Obsidian Smart Bookmark)',
					},
				});

				clearTimeout(timeoutId);

				const valid = response.status >= 200 && response.status < 400;

				return {
					url,
					valid,
					status: response.status,
				};
			} catch (getError) {
				return {
					url,
					valid: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				};
			}
		}
	}

	/**
	 * Check multiple URLs concurrently
	 */
	async checkURLs(urls: string[], concurrency: number = 5): Promise<URLHealthCheckResult> {
		const results: URLValidationResult[] = [];
		let valid = 0;
		let invalid = 0;

		// Process URLs in batches
		for (let i = 0; i < urls.length; i += concurrency) {
			const batch = urls.slice(i, i + concurrency);
			const batchResults = await Promise.all(
				batch.map(url => this.checkURL(url))
			);

			results.push(...batchResults);

			for (const result of batchResults) {
				if (result.valid) {
					valid++;
				} else {
					invalid++;
				}
			}
		}

		const invalidUrls = results.filter(r => !r.valid);

		return {
			total: urls.length,
			valid,
			invalid,
			invalidUrls,
		};
	}

	/**
	 * Update whitelist
	 */
	updateWhitelist(whitelist: string[]): void {
		this.whitelist = new Set(whitelist.map(url => this.normalizeUrl(url)));
	}

	/**
	 * Update timeout
	 */
	updateTimeout(timeout: number): void {
		this.timeout = timeout * 1000;
	}
}
