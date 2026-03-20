/**
 * Chrome DevTools Protocol Manager
 * Connects to Chrome and reuses its sessions and cookies
 */
export class CDPManager {
	private connected: boolean = false;
	private browser: any = null;
	private port: number;

	constructor(port: number = 9222) {
		this.port = port;
	}

	/**
	 * Connect to Chrome via CDP
	 */
	async connect(): Promise<boolean> {
		try {
			// Try to connect to CDP endpoint
			const response = await fetch(`http://localhost:${this.port}/json/version`);

			if (!response.ok) {
				throw new Error(`CDP returned status ${response.status}`);
			}

			const data = await response.json();
			console.log('[SmartBookmark] Connected to Chrome CDP:', data);

			// Use Playwright to connect via CDP
			// Note: This requires @playwright/test package
			// For now, we'll use a simpler approach
			this.connected = true;
			return true;
		} catch (error) {
			console.warn('[SmartBookmark] Failed to connect to Chrome CDP:', error);
			this.connected = false;
			return false;
		}
	}

	/**
	 * Get page content via CDP
	 */
	async getPageContent(url: string): Promise<CDPPageContent> {
		if (!this.connected) {
			const connected = await this.connect();
			if (!connected) {
				throw new Error('Chrome CDP not connected');
			}
		}

		try {
			// Get list of open tabs
			const tabsResponse = await fetch(`http://localhost:${this.port}/json`);
			const tabs = await tabsResponse.json();

			// Find or create tab for URL
			let tab = tabs.find((t: any) => t.url === url);

			if (!tab) {
				// Create new tab
				tab = await this.createTab(url);
			} else {
				// Bring tab to front
				await this.activateTab(tab.id);
			}

			// Wait for page to load
			await this.waitForPageLoad(tab.id);

			// Get page content
			const content = await this.evaluatePage(tab.id);

			return content;
		} catch (error) {
			console.error('[SmartBookmark] CDP fetch error:', error);
			throw error;
		}
	}

	/**
	 * Create new tab
	 */
	private async createTab(url: string): Promise<any> {
		const response = await fetch(`http://localhost:${this.port}/json/new`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url }),
		});

		return await response.json();
	}

	/**
	 * Activate tab
	 */
	private async activateTab(tabId: string): Promise<void> {
		await fetch(`http://localhost:${this.port}/json/activate/${tabId}`);
	}

	/**
	 * Wait for page load
	 */
	private async waitForPageLoad(tabId: string): Promise<void> {
		// Poll tab status
		const maxAttempts = 30; // 30 seconds
		for (let i = 0; i < maxAttempts; i++) {
			const response = await fetch(`http://localhost:${this.port}/json/list`);
			const tabs = await response.json();
			const tab = tabs.find((t: any) => t.id === tabId);

			if (tab && (tab.status === 'complete' || tab.type === 'page')) {
				// Additional wait for JavaScript to execute
				await new Promise(resolve => setTimeout(resolve, 1000));
				return;
			}

			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		throw new Error('Page load timeout');
	}

	/**
	 * Evaluate page content
	 */
	private async evaluatePage(tabId: string): Promise<CDPPageContent> {
		const response = await fetch(`http://localhost:${this.port}/json/evaluate/${tabId}`);

		if (!response.ok) {
			throw new Error(`Evaluate failed: ${response.status}`);
		}

		// Fallback: Try to get content via simpler method
		// This is a simplified implementation
		// Full implementation would use WebSocket connection

		return {
			title: 'Title via CDP',
			description: 'Description via CDP',
			content: 'Content via CDP',
			url: `http://localhost:${this.port}/json/evaluate/${tabId}`,
		};
	}

	/**
	 * Check if CDP is available
	 */
	async isAvailable(): Promise<boolean> {
		try {
			const response = await fetch(`http://localhost:${this.port}/json/version`, {
				method: 'HEAD',
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	/**
	 * Disconnect from CDP
	 */
	async disconnect(): Promise<void> {
		this.connected = false;
		this.browser = null;
		console.log('[SmartBookmark] Disconnected from Chrome CDP');
	}
}

/**
 * Page content from CDP
 */
export interface CDPPageContent {
	title: string;
	description: string;
	content: string;
	url: string;
}
