export default {
	// Plugin name and description
	pluginName: "智能书签",
	pluginDesc: "导入浏览器书签，分析网站内容，并整理成结构化的 Obsidian 笔记",

	// Commands
	cmdImportBookmarks: "导入浏览器书签",
	cmdOpenSettings: "打开设置",

	// Settings
	settingsHeader: "智能书签设置",
	settingsImportPath: "导入路径",
	settingsImportPathDesc: "浏览器书签文件路径",
	settingsOutputFolder: "输出文件夹",
	settingsOutputFolderDesc: "保存生成的笔记的文件夹",
	settingsNoteTemplate: "笔记模板",
	settingsNoteTemplateDesc: "生成笔记的模板",
	settingsIncludeMetadata: "包含元数据",
	settingsIncludeMetadataDesc: "在生成的笔记中添加元数据",
	settingsEnableCloudAI: "启用云端 AI",
	settingsEnableCloudAIDesc: "使用云端 AI 进行高级分析",
	settingsCloudAIProvider: "云端 AI 提供商",
	settingsCloudAIProviderDesc: "AI 服务提供商",
	settingsCloudAIAPIKey: "API 密钥",
	settingsCloudAIAPIKeyDesc: "云端 AI 服务的 API 密钥（本地提供商可选）",
	settingsDefaultLanguage: "默认语言",
	settingsDefaultLanguageDesc: "生成笔记的语言",
	settingsAutoTag: "自动标签",
	settingsAutoTagDesc: "根据内容自动添加标签",
	settingsGroupByFolder: "按文件夹分组",
	settingsGroupByFolderDesc: "按书签文件夹组织笔记",
	settingsEnableFallbackAnalyzer: "启用备用分析器",
	settingsEnableFallbackAnalyzerDesc: "当网站阻止直接访问时使用基于 URL 的分析",

	// Modals
	importModalTitle: "导入书签",
	importModalDesc: "选择浏览器并提供书签文件路径",
	importModalBrowserLabel: "浏览器",
	importModalBrowserPlaceholder: "选择浏览器",
	importModalPathLabel: "书签路径",
	importModalPathPlaceholder: "/path/to/bookmarks",
	importModalImportButton: "导入",
	importModalCancelButton: "取消",

	progressModalTitle: "导入书签中",
	progressModalProcessing: "处理中",
	progressModalCompleted: "已完成",
	progressModalFailed: "失败",
	progressModalDoneButton: "完成",

	// Messages
	msgImportStarted: "开始导入",
	msgImportCompleted: "导入成功完成",
	msgImportFailed: "导入失败：{{error}}",
	msgBookmarksParsed: "解析了 {{count}} 个书签",
	msgNotesGenerated: "生成了 {{count}} 个笔记",
	msgNoBookmarksFound: "未找到书签",
	msgInvalidPath: "无效的文件路径",
	msgUnsupportedBrowser: "不支持的浏览器",
	msgAnalysisError: "分析错误：{{error}}",
	msgNoteSaved: "笔记已保存：{{path}}",
	msgCloudAIDisabled: "云端 AI 已禁用",
	msgMissingAPIKey: "云端 AI 需要 API 密钥",

	// Browser names
	browserChrome: "Chrome",
	browserSafari: "Safari",
	browserEdge: "Edge",
	browserFirefox: "Firefox",

	// Languages
	languageEnglish: "English",
	languageChinese: "中文",

	// Cloud AI providers
	providerOpenAI: "OpenAI",
	providerAnthropic: "Anthropic",
	providerCustom: "自定义",

	// Connection test
	btnTestConnection: "测试连接",
	msgTestingConnection: "测试连接中...",
	msgConnectionSuccess: "连接成功",
	msgConnectionFailed: "连接失败：{{error}}",
	msgEnableCloudAIFirst: "请先启用云端 AI",

	// Status
	statusReady: "就绪",
	statusProcessing: "处理中...",
	statusCompleted: "已完成",
	statusError: "错误",
} as const;
