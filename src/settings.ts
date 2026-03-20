import { App, PluginSettingTab, Setting } from "obsidian";
import SmartBookmarkPlugin from "./main";
import { SmartBookmarkSettings, CloudAIProvider } from "./types";
import en from "./i18n/en";
import zh from "./i18n/zh";

/**
 * Settings tab for Smart Bookmark plugin
 */
export class SmartBookmarkSettingTab extends PluginSettingTab {
	plugin: SmartBookmarkPlugin;

	constructor(app: App, plugin: SmartBookmarkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const t = this.plugin.settings.defaultLanguage === "zh" ? zh : en;

		containerEl.empty();

		containerEl.createEl("h2", { text: t.settingsHeader });

		// Import path
		new Setting(containerEl)
			.setName(t.settingsImportPath)
			.setDesc(t.settingsImportPathDesc)
			.addText((text) =>
				text
					.setPlaceholder("/path/to/bookmarks")
					.setValue(this.plugin.settings.importPath)
					.onChange(async (value) => {
						this.plugin.settings.importPath = value;
						await this.plugin.saveSettings();
					})
			);

		// Output folder
		new Setting(containerEl)
			.setName(t.settingsOutputFolder)
			.setDesc(t.settingsOutputFolderDesc)
			.addText((text) =>
				text
					.setPlaceholder("Bookmarks")
					.setValue(this.plugin.settings.outputFolder)
					.onChange(async (value) => {
						this.plugin.settings.outputFolder = value;
						await this.plugin.saveSettings();
					})
			);

		// Note template
		new Setting(containerEl)
			.setName(t.settingsNoteTemplate)
			.setDesc(t.settingsNoteTemplateDesc)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("default", "Default")
					.addOption("minimal", "Minimal")
					.addOption("detailed", "Detailed")
					.setValue(this.plugin.settings.noteTemplate)
					.onChange(async (value) => {
						this.plugin.settings.noteTemplate = value;
						await this.plugin.saveSettings();
					})
			);

		// Include metadata
		new Setting(containerEl)
			.setName(t.settingsIncludeMetadata)
			.setDesc(t.settingsIncludeMetadataDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeMetadata)
					.onChange(async (value) => {
						this.plugin.settings.includeMetadata = value;
						await this.plugin.saveSettings();
					})
			);

		// Auto tag
		new Setting(containerEl)
			.setName(t.settingsAutoTag)
			.setDesc(t.settingsAutoTagDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoTag)
					.onChange(async (value) => {
						this.plugin.settings.autoTag = value;
						await this.plugin.saveSettings();
					})
			);

		// Group by folder
		new Setting(containerEl)
			.setName(t.settingsGroupByFolder)
			.setDesc(t.settingsGroupByFolderDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.groupByFolder)
					.onChange(async (value) => {
						this.plugin.settings.groupByFolder = value;
						await this.plugin.saveSettings();
					})
			);

		// Default language
		new Setting(containerEl)
			.setName(t.settingsDefaultLanguage)
			.setDesc(t.settingsDefaultLanguageDesc)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("en", t.languageEnglish)
					.addOption("zh", t.languageChinese)
					.setValue(this.plugin.settings.defaultLanguage)
					.onChange(async (value) => {
						this.plugin.settings.defaultLanguage = value as "en" | "zh";
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Document Mode" });

		// Single document mode
		new Setting(containerEl)
			.setName("Single Document Mode")
			.setDesc("Save all bookmarks to a single markdown file (recommended for AI and quick reference)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.singleDocumentMode)
					.onChange(async (value) => {
						this.plugin.settings.singleDocumentMode = value;
						await this.plugin.saveSettings();
					})
			);

		// Bookmark filename
		new Setting(containerEl)
			.setName("Bookmark File Name")
			.setDesc("Filename for the single document (e.g., Smart Bookmarks.md)")
			.addText((text) =>
				text
					.setPlaceholder("Smart Bookmarks.md")
					.setValue(this.plugin.settings.bookmarkFileName || "Smart Bookmarks.md")
					.onChange(async (value) => {
						this.plugin.settings.bookmarkFileName = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Sync Settings" });

		// Sync interval
		new Setting(containerEl)
			.setName("Sync Frequency")
			.setDesc("How often to sync bookmarks from browser")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("manual", "Manual")
					.addOption("hourly", "Hourly")
					.addOption("daily", "Daily")
					.addOption("weekly", "Weekly")
					.setValue(this.plugin.settings.syncInterval || "manual")
					.onChange(async (value) => {
						this.plugin.settings.syncInterval = value as any;
						await this.plugin.saveSettings();
						// Restart sync timer
						if ((this.plugin as any).restartSyncTimer) {
							(this.plugin as any).restartSyncTimer();
						}
					})
			);

		// Last sync time display
		if (this.plugin.settings.lastSyncTime) {
			const lastSync = new Date(this.plugin.settings.lastSyncTime);
			new Setting(containerEl)
				.setName("Last Sync")
				.setDesc(lastSync.toLocaleString())
				.addButton((btn) =>
					btn
						.setButtonText("Sync Now")
						.onClick(() => {
							if ((this.plugin as any).syncBookmarks) {
								(this.plugin as any).syncBookmarks();
							}
						})
				);
		}

		containerEl.createEl("h3", { text: "URL Validation Settings" });

		// Enable URL validation
		new Setting(containerEl)
			.setName("Validate URLs")
			.setDesc("Check if bookmark URLs are accessible")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.validateUrls)
					.onChange(async (value) => {
						this.plugin.settings.validateUrls = value;
						await this.plugin.saveSettings();
					})
			);

		// URL validation timeout
		new Setting(containerEl)
			.setName("URL Validation Timeout")
			.setDesc("Request timeout in seconds (default: 5)")
			.addSlider((slider) =>
				slider
					.setLimits(1, 30, 1)
					.setValue(this.plugin.settings.urlValidationTimeout || 5)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.urlValidationTimeout = value;
						await this.plugin.saveSettings();
					})
			);

		// URL whitelist
		new Setting(containerEl)
			.setName("URL Whitelist")
			.setDesc("URLs to skip validation (one per line)")
			.addTextArea((text) =>
				text
					.setPlaceholder("https://example.com\nhttps://trusted-site.com")
					.setValue(this.plugin.settings.urlWhitelist?.join('\n') || "")
					.onChange(async (value) => {
						this.plugin.settings.urlWhitelist = value.split('\n').filter(url => url.trim());
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Cloud AI Settings" });

		// Enable cloud AI
		new Setting(containerEl)
			.setName(t.settingsEnableCloudAI)
			.setDesc(t.settingsEnableCloudAIDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableCloudAI)
					.onChange(async (value) => {
						this.plugin.settings.enableCloudAI = value;
						await this.plugin.saveSettings();
					})
			);

		// Cloud AI provider
		new Setting(containerEl)
			.setName(t.settingsCloudAIProvider)
			.setDesc(t.settingsCloudAIProviderDesc)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("openai", t.providerOpenAI)
					.addOption("anthropic", t.providerAnthropic)
					.addOption("custom", t.providerCustom)
					.addOption("local", "Local (OpenAI Compatible)")
					.setValue(this.plugin.settings.cloudAIProvider || "openai")
					.onChange(async (value) => {
						this.plugin.settings.cloudAIProvider = value as CloudAIProvider;
						await this.plugin.saveSettings();
					})
			);

		// API Base URL (for local/custom providers)
		new Setting(containerEl)
			.setName("API Base URL")
			.setDesc("Base URL for local or custom OpenAI-compatible API (e.g., http://127.0.0.1:8000/v1)")
			.addText((text) =>
				text
					.setPlaceholder("http://127.0.0.1:8000/v1")
					.setValue(this.plugin.settings.cloudAIBaseURL || "")
					.onChange(async (value) => {
						this.plugin.settings.cloudAIBaseURL = value;
						await this.plugin.saveSettings();
					})
			);

		// API key
		new Setting(containerEl)
			.setName(t.settingsCloudAIAPIKey)
			.setDesc(t.settingsCloudAIAPIKeyDesc)
			.addText((text) =>
				text
					.setPlaceholder("sk-... (leave empty for local)")
					.setValue(this.plugin.settings.cloudAIAPIKey || "")
					.onChange(async (value) => {
						this.plugin.settings.cloudAIAPIKey = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
