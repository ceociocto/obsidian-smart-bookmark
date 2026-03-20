import { Plugin, TFile, Notice, normalizePath } from "obsidian";
import * as fs from "fs";
import * as path from "path";
import { Bookmark, BrowserType, SmartBookmarkSettings, AnalyzedBookmark, ImportProgress } from "./types";
import { ParserFactory } from "./parsers/browserParser";
import { ContentAnalyzer } from "./analyzer/contentAnalyzer";
import { NoteGenerator } from "./generator/noteGenerator";
import { SingleDocumentGenerator } from "./generator/singleDocumentGenerator";
import { ImportModal } from "./modals/importModal";
import { ProgressModal } from "./modals/progressModal";
import { SmartBookmarkSettingTab } from "./settings";
import en from "./i18n/en";
import zh from "./i18n/zh";

/**
 * Smart Bookmark Plugin for Obsidian
 *
 * Main plugin class that orchestrates bookmark import, analysis, and note generation
 */
export default class SmartBookmarkPlugin extends Plugin {
	settings: SmartBookmarkSettings;
	private progressModal: ProgressModal | null = null;
	private syncTimer: NodeJS.Timeout | null = null;

	async onload() {
		console.log("Loading Smart Bookmark plugin");

		// Load settings
		await this.loadSettings();

		// Add command to import bookmarks
		this.addCommand({
			id: "import-bookmarks",
			name: en.cmdImportBookmarks,
			callback: () => this.showImportModal(),
		});

		// Add command to open settings
		this.addCommand({
			id: "open-settings",
			name: en.cmdOpenSettings,
			callback: () => this.openSettingTab(),
		});

		// Add command to validate URLs
		this.addCommand({
			id: "validate-urls",
			name: "Validate Bookmarks URLs",
			callback: () => this.validateBookmarks(),
		});

		// Add command to clean invalid URLs
		this.addCommand({
			id: "clean-invalid-urls",
			name: "Remove Invalid Bookmarks",
			callback: () => this.cleanInvalidBookmarks(),
		});

		// Add ribbon icon
		const ribbonIconEl = this.addRibbonIcon("bookmark", en.pluginName, () => {
			this.showImportModal();
		});

		// Add settings tab
		this.addSettingTab(new SmartBookmarkSettingTab(this.app, this));

		// Setup sync timer
		this.setupSyncTimer();
	}

	onunload() {
		console.log("Unloading Smart Bookmark plugin");

		// Clear sync timer
		if (this.syncTimer) {
			clearTimeout(this.syncTimer);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{
				importPath: "",
				outputFolder: "Bookmarks",
				noteTemplate: "default",
				includeMetadata: true,
				enableCloudAI: false,
				cloudAIProvider: "openai",
				cloudAIAPIKey: "",
				cloudAIBaseURL: "",
				defaultLanguage: "en",
				autoTag: true,
				groupByFolder: false,
				singleDocumentMode: true,
				bookmarkFileName: "Smart Bookmarks.md",
				syncInterval: "manual",
				lastSyncTime: undefined,
				validateUrls: false,
				urlValidationTimeout: 5,
				urlWhitelist: [],
				useEnhancedAnalyzer: true,
				youtubeAPIKey: "",
				githubToken: "",
				enableFallbackAnalyzer: true,
				useChromeCDP: false,
				chromeCDPPort: 9222,
			},
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Show import modal
	 */
	private showImportModal() {
		const lang: "en" | "zh" = this.settings.defaultLanguage as "en" | "zh";
		const t = lang === "zh" ? zh : en;
		new ImportModal(
			this.app,
			lang,
			async (browser: BrowserType, path: string) => {
				await this.importBookmarks(browser, path);
			}
		).open();
	}

	/**
	 * Import bookmarks from browser file
	 */
	private async importBookmarks(browser: BrowserType, filePath: string) {
		const t = this.settings.defaultLanguage === "zh" ? zh : en;

		try {
			// Validate AI configuration if enabled
			if (this.settings.enableCloudAI) {
				const { AIConfigValidator } = await import('./utils/aiValidator');
				const validation = await AIConfigValidator.validate(
					this.settings.cloudAIProvider!,
					this.settings.cloudAIAPIKey,
					this.settings.cloudAIBaseURL
				);

				if (!validation.valid) {
					const message = AIConfigValidator.getValidationMessage(
						false,
						validation.error,
						this.settings.defaultLanguage as "en" | "zh"
					);
					new Notice(message);
					console.error("[SmartBookmark] AI validation failed:", validation.error);
					// Continue import without AI
					this.settings.enableCloudAI = false;
				} else {
					new Notice(AIConfigValidator.getValidationMessage(
						true,
						undefined,
						this.settings.defaultLanguage as "en" | "zh"
					));
				}
			}

			new Notice(t.msgImportStarted);

			// Read file content
			// Detect if path is absolute - if so, use system fs, otherwise use vault adapter
			let content: string;
			if (path.isAbsolute(filePath)) {
				// Use system file system for absolute paths
				console.log(`[SmartBookmark] Reading absolute path: ${filePath}`);
				content = fs.readFileSync(filePath, 'utf-8');
				console.log(`[SmartBookmark] File size: ${content.length} bytes`);
			} else {
				// Use vault adapter for relative paths
				const adapter = this.app.vault.adapter;
				content = await adapter.read(filePath);
			}

			// Parse bookmarks
			console.log(`[SmartBookmark] Parsing bookmarks from ${browser}...`);
			const parser = ParserFactory.create(browser);
			const bookmarks = await parser.parse(content);
			console.log(`[SmartBookmark] Found ${bookmarks.length} bookmarks`);

			if (bookmarks.length === 0) {
				new Notice(t.msgNoBookmarksFound);
				return;
			}

			new Notice(t.msgBookmarksParsed.replace("{{count}}", bookmarks.length.toString()));

			// Create progress modal
			const lang: "en" | "zh" = this.settings.defaultLanguage as "en" | "zh";
			this.progressModal = new ProgressModal(this.app, lang, bookmarks.length);
			this.progressModal.open();

			// Process bookmarks
			await this.processBookmarks(bookmarks);

		} catch (error) {
			console.error("Import error:", error);
			new Notice(t.msgImportFailed.replace("{{error}}", (error as Error).message));
		}
	}

	/**
	 * Process bookmarks: analyze and generate notes
	 */
	private async processBookmarks(bookmarks: Bookmark[]) {
		const t = this.settings.defaultLanguage === "zh" ? zh : en;
		let processed = 0;
		let failed = 0;
		const progress: ImportProgress = {
			total: bookmarks.length,
			processed: 0,
			failed: 0,
		};

		// Create analyzer
		let analyzer: any;

		if (this.settings.useEnhancedAnalyzer) {
			const { EnhancedContentAnalyzer } = await import('./analyzer/enhancedContentAnalyzer');
			analyzer = new EnhancedContentAnalyzer({
				fetchMetadata: this.settings.includeMetadata,
				extractKeywords: this.settings.autoTag,
				aiAnalysis: this.settings.enableCloudAI,
				youtubeAPIKey: this.settings.youtubeAPIKey,
				githubToken: this.settings.githubToken,
				useChromeCDP: this.settings.useChromeCDP,
				chromeCDPPort: this.settings.chromeCDPPort,
			});
		} else {
			const { ContentAnalyzer } = await import('./analyzer/contentAnalyzer');
			analyzer = new ContentAnalyzer({
				fetchMetadata: this.settings.includeMetadata,
				extractKeywords: this.settings.autoTag,
				aiAnalysis: this.settings.enableCloudAI,
			});
		}

		// Analyze bookmarks
		const analyzedBookmarks: AnalyzedBookmark[] = [];
		for (let i = 0; i < bookmarks.length; i++) {
			const bookmark = bookmarks[i];
			progress.current = `Analyzing: ${bookmark.title}`;

			// Update progress modal
			if (this.progressModal) {
				this.progressModal.updateProgress(progress);
			}

			try {
				const analyzed = await analyzer.analyze(bookmark);
				analyzedBookmarks.push(analyzed);
				processed++;
			} catch (error) {
				console.error(`Error analyzing ${bookmark.url}:`, error);
				failed++;
			}

			progress.processed = i + 1;
		}

		// Generate notes
		if (this.settings.singleDocumentMode) {
			// Single document mode
			await this.createSingleDocument(analyzedBookmarks);
		} else {
			// Multi document mode (original)
			const generator = new NoteGenerator(
				this.settings.noteTemplate as any,
				this.settings.defaultLanguage as "en" | "zh"
			);

			for (let i = 0; i < analyzedBookmarks.length; i++) {
				const bookmark = analyzedBookmarks[i];
				progress.current = `Generating: ${bookmark.title}`;

				if (this.progressModal) {
					this.progressModal.updateProgress(progress);
				}

				try {
					await this.createNote(bookmark, generator);
				} catch (error) {
					console.error(`Error creating note for ${bookmark.url}:`, error);
					failed++;
				}
			}
		}

		progress.processed = bookmarks.length;
		progress.failed = failed;

		if (this.progressModal) {
			this.progressModal.updateProgress(progress);
		}

		new Notice(t.msgNotesGenerated.replace("{{count}}", (bookmarks.length - failed).toString()));
	}

	/**
	 * Create a note from bookmark
	 */
	private async createNote(bookmark: AnalyzedBookmark, generator: NoteGenerator) {
		const t = this.settings.defaultLanguage === "zh" ? zh : en;

		// Generate note content
		const content = generator.generateNote(bookmark);

		// Determine output path
		let folder = this.settings.outputFolder;

		if (this.settings.groupByFolder && bookmark.folder) {
			folder = `${this.settings.outputFolder}/${bookmark.folder.replace(/\//g, "/")}`;
		}

		folder = normalizePath(folder);

		// Ensure folder exists
		if (!(await this.app.vault.adapter.exists(folder))) {
			await this.app.vault.createFolder(folder);
		}

		// Generate filename
		let filename = bookmark.title || "Untitled";
		filename = filename
			.replace(/[<>:"/\\|?*]/g, "")
			.replace(/\s+/g, " ")
			.trim()
			.substring(0, 100);
		filename = `${filename}.md`;

		const filepath = `${folder}/${filename}`;

		// Create note
		if (!(await this.app.vault.adapter.exists(filepath))) {
			await this.app.vault.create(filepath, content);
		} else {
			// File exists, append or skip
			console.warn(`Note already exists: ${filepath}`);
		}
	}

	/**
	 * Create or update single document with all bookmarks
	 */
	private async createSingleDocument(bookmarks: AnalyzedBookmark[]) {
		const t = this.settings.defaultLanguage === "zh" ? zh : en;

		// Determine output path
		const folder = normalizePath(this.settings.outputFolder);

		// Ensure folder exists
		if (!(await this.app.vault.adapter.exists(folder))) {
			await this.app.vault.createFolder(folder);
		}

		// Generate filename
		const filename = this.settings.bookmarkFileName || "Smart Bookmarks.md";
		const filepath = `${folder}/${filename}`;

		// Create generator
		const generator = new SingleDocumentGenerator(this.settings.defaultLanguage as "en" | "zh");

		// Read existing content if file exists
		let existingContent: string | undefined;
		if (await this.app.vault.adapter.exists(filepath)) {
			existingContent = await this.app.vault.adapter.read(filepath);
		}

		// Generate document content
		const content = generator.generateDocument(bookmarks, existingContent);

		// Create or update file
		if (!(await this.app.vault.adapter.exists(filepath))) {
			await this.app.vault.create(filepath, content);
			new Notice(`${t.pluginName}: Created ${filename}`);
		} else {
			await this.app.vault.adapter.write(filepath, content);
			new Notice(`${t.pluginName}: Updated ${filename}`);
		}
	}

	/**
	 * Validate bookmark URLs
	 */
	private async validateBookmarks() {
		if (!this.settings.singleDocumentMode) {
			new Notice("URL validation requires single document mode");
			return;
		}

		const t = this.settings.defaultLanguage === "zh" ? zh : en;
		new Notice("Starting URL validation...");

		try {
			// Read bookmark file
			const folder = normalizePath(this.settings.outputFolder);
			const filename = this.settings.bookmarkFileName;
			const filepath = `${folder}/${filename}`;

			if (!(await this.app.vault.adapter.exists(filepath))) {
				new Notice("Bookmark file not found. Import bookmarks first.");
				return;
			}

			const content = await this.app.vault.adapter.read(filepath);
			const { URLValidator } = await import('./utils/urlValidator');

			// Extract URLs from content
			const urlRegex = /\*\*URL\*\*: (https?:\/\/[^\s\n]+)/g;
			const urls: string[] = [];
			let match;
			while ((match = urlRegex.exec(content)) !== null) {
				urls.push(match[1]);
			}

			if (urls.length === 0) {
				new Notice("No URLs found in bookmarks");
				return;
			}

			// Validate URLs
			const validator = new URLValidator(
				this.settings.urlValidationTimeout,
				this.settings.urlWhitelist || []
			);

			const result = await validator.checkURLs(urls, 10);

			const message = `Validation complete: ${result.valid} valid, ${result.invalid} invalid`;
			new Notice(message);
			console.log(`[SmartBookmark] ${message}`);

			if (result.invalid > 0) {
				console.table(result.invalidUrls);
			}
		} catch (error) {
			console.error("[SmartBookmark] Validation error:", error);
			new Notice(`Validation error: ${(error as Error).message}`);
		}
	}

	/**
	 * Clean invalid bookmarks
	 */
	private async cleanInvalidBookmarks() {
		if (!this.settings.singleDocumentMode) {
			new Notice("URL validation requires single document mode");
			return;
		}

		const t = this.settings.defaultLanguage === "zh" ? zh : en;
		new Notice("Starting invalid bookmark cleanup...");

		try {
			// Read bookmark file
			const folder = normalizePath(this.settings.outputFolder);
			const filename = this.settings.bookmarkFileName;
			const filepath = `${folder}/${filename}`;

			if (!(await this.app.vault.adapter.exists(filepath))) {
				new Notice("Bookmark file not found. Import bookmarks first.");
				return;
			}

			const content = await this.app.vault.adapter.read(filepath);
			const { URLValidator } = await import('./utils/urlValidator');

			// Extract URLs from content
			const urlRegex = /\*\*URL\*\*: (https?:\/\/[^\s\n]+)/g;
			const urls: string[] = [];
			let match;
			while ((match = urlRegex.exec(content)) !== null) {
				urls.push(match[1]);
			}

			if (urls.length === 0) {
				new Notice("No URLs found in bookmarks");
				return;
			}

			// Validate URLs
			const validator = new URLValidator(
				this.settings.urlValidationTimeout,
				this.settings.urlWhitelist || []
			);

			const result = await validator.checkURLs(urls, 10);

			if (result.invalid === 0) {
				new Notice("No invalid bookmarks found");
				return;
			}

			// Remove invalid bookmarks from content
			let cleanedContent = content;
			let removed = 0;

			for (const invalidUrl of result.invalidUrls) {
				// Find and remove the bookmark block
				const bookmarkPattern = new RegExp(
					`### .+\\n\\n- \\*\\*URL\\*\\*: ${invalidUrl.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^-]+?---\\n\\n`,
					'g'
				);
				const matches = cleanedContent.match(bookmarkPattern);
				if (matches) {
					cleanedContent = cleanedContent.replace(bookmarkPattern, '');
					removed++;
				}
			}

			// Write cleaned content
			await this.app.vault.adapter.write(filepath, cleanedContent);
			new Notice(`Removed ${removed} invalid bookmarks`);
		} catch (error) {
			console.error("[SmartBookmark] Cleanup error:", error);
			new Notice(`Cleanup error: ${(error as Error).message}`);
		}
	}

	/**
	 * Sync bookmarks (for scheduled sync)
	 */
	async syncBookmarks() {
		if (!this.settings.importPath || this.settings.syncInterval === "manual") {
			return;
		}

		const browser: BrowserType = this.detectBrowserFromPath(this.settings.importPath);
		await this.importBookmarks(browser, this.settings.importPath);

		// Update last sync time
		this.settings.lastSyncTime = Date.now();
		await this.saveSettings();
	}

	/**
	 * Detect browser type from file path
	 */
	private detectBrowserFromPath(filePath: string): BrowserType {
		const lowerPath = filePath.toLowerCase();
		if (lowerPath.includes('chrome')) return 'chrome';
		if (lowerPath.includes('edge')) return 'edge';
		if (lowerPath.includes('safari')) return 'safari';
		if (lowerPath.includes('firefox')) return 'firefox';
		return 'chrome'; // Default
	}

	/**
	 * Restart sync timer
	 */
	restartSyncTimer() {
		// Clear existing timer
		if (this.syncTimer) {
			clearTimeout(this.syncTimer);
		}

		// Set up new timer
		this.setupSyncTimer();
	}

	/**
	 * Setup sync timer based on interval
	 */
	private setupSyncTimer() {
		if (this.settings.syncInterval === "manual") {
			return;
		}

		const intervals = {
			hourly: 60 * 60 * 1000,
			daily: 24 * 60 * 60 * 1000,
			weekly: 7 * 24 * 60 * 60 * 1000,
		};

		const interval = intervals[this.settings.syncInterval] || intervals.daily;

		this.syncTimer = setTimeout(async () => {
			await this.syncBookmarks();
			this.setupSyncTimer(); // Schedule next sync
		}, interval);

		console.log(`[SmartBookmark] Next sync in ${this.settings.syncInterval}`);
	}

	/**
	 * Open settings tab
	 */
	private openSettingTab() {
		(this.app as any).setting.open();
		(this.app as any).setting.openTabById("smart-bookmark");
	}
}
