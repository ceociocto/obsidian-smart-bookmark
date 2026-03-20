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
					.setValue(this.plugin.settings.cloudAIProvider || "openai")
					.onChange(async (value) => {
						this.plugin.settings.cloudAIProvider = value as CloudAIProvider;
						await this.plugin.saveSettings();
					})
			);

		// API key
		new Setting(containerEl)
			.setName(t.settingsCloudAIAPIKey)
			.setDesc(t.settingsCloudAIAPIKeyDesc)
			.addText((text) =>
				text
					.setPlaceholder("sk-...")
					.setValue(this.plugin.settings.cloudAIAPIKey || "")
					.onChange(async (value) => {
						this.plugin.settings.cloudAIAPIKey = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
