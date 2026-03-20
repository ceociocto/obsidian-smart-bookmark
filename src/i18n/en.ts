export default {
	// Plugin name and description
	pluginName: "Smart Bookmark",
	pluginDesc: "Import browser bookmarks, analyze websites, and organize them into structured Obsidian notes",

	// Commands
	cmdImportBookmarks: "Import browser bookmarks",
	cmdOpenSettings: "Open settings",

	// Settings
	settingsHeader: "Smart Bookmark Settings",
	settingsImportPath: "Import Path",
	settingsImportPathDesc: "Path to browser bookmarks file",
	settingsOutputFolder: "Output Folder",
	settingsOutputFolderDesc: "Folder to save generated notes",
	settingsNoteTemplate: "Note Template",
	settingsNoteTemplateDesc: "Template for generated notes",
	settingsIncludeMetadata: "Include Metadata",
	settingsIncludeMetadataDesc: "Add metadata to generated notes",
	settingsEnableCloudAI: "Enable Cloud AI",
	settingsEnableCloudAIDesc: "Use cloud AI for advanced analysis",
	settingsCloudAIProvider: "Cloud AI Provider",
	settingsCloudAIProviderDesc: "AI service provider",
	settingsCloudAIAPIKey: "API Key",
	settingsCloudAIAPIKeyDesc: "API key for cloud AI service",
	settingsDefaultLanguage: "Default Language",
	settingsDefaultLanguageDesc: "Language for generated notes",
	settingsAutoTag: "Auto Tag",
	settingsAutoTagDesc: "Automatically add tags based on content",
	settingsGroupByFolder: "Group by Folder",
	settingsGroupByFolderDesc: "Organize notes by bookmark folders",

	// Modals
	importModalTitle: "Import Bookmarks",
	importModalDesc: "Select browser and provide path to bookmarks file",
	importModalBrowserLabel: "Browser",
	importModalBrowserPlaceholder: "Select browser",
	importModalPathLabel: "Bookmarks Path",
	importModalPathPlaceholder: "/path/to/bookmarks",
	importModalImportButton: "Import",
	importModalCancelButton: "Cancel",

	progressModalTitle: "Importing Bookmarks",
	progressModalProcessing: "Processing",
	progressModalCompleted: "Completed",
	progressModalFailed: "Failed",
	progressModalDoneButton: "Done",

	// Messages
	msgImportStarted: "Import started",
	msgImportCompleted: "Import completed successfully",
	msgImportFailed: "Import failed: {{error}}",
	msgBookmarksParsed: "Parsed {{count}} bookmarks",
	msgNotesGenerated: "Generated {{count}} notes",
	msgNoBookmarksFound: "No bookmarks found",
	msgInvalidPath: "Invalid file path",
	msgUnsupportedBrowser: "Unsupported browser",
	msgAnalysisError: "Analysis error: {{error}}",
	msgNoteSaved: "Note saved: {{path}}",
	msgCloudAIDisabled: "Cloud AI is disabled",
	msgMissingAPIKey: "API key is required for cloud AI",

	// Browser names
	browserChrome: "Chrome",
	browserSafari: "Safari",
	browserEdge: "Edge",
	browserFirefox: "Firefox",

	// Languages
	languageEnglish: "English",
	languageChinese: "Chinese",

	// Cloud AI providers
	providerOpenAI: "OpenAI",
	providerAnthropic: "Anthropic",
	providerCustom: "Custom",

	// Status
	statusReady: "Ready",
	statusProcessing: "Processing...",
	statusCompleted: "Completed",
	statusError: "Error",
} as const;
