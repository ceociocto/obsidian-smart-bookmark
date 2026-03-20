# Quick Reference - Smart Bookmark Plugin

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/obsidian-smart-bookmark.git
cd obsidian-smart-bookmark

# Install dependencies
npm install

# Build plugin
npm run build

# Copy to your Obsidian vault
cp -r . /path/to/your/vault/.obsidian/plugins/smart-bookmark
```

## Browser Bookmark Locations

### Chrome/Edge
- **macOS**: `~/Library/Application Support/Google/Chrome/Default/Bookmarks`
- **Windows**: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Bookmarks`
- **Linux**: `~/.config/google-chrome/Default/Bookmarks`

### Safari
- **macOS**: `~/Library/Safari/Bookmarks.plist`

### Firefox
- Export as HTML: Bookmarks → Show All Bookmarks → Import and Backup → Export to HTML

## Key Commands

| Command | Description |
|---------|-------------|
| `Smart Bookmark: Import browser bookmarks` | Open import dialog |
| `Smart Bookmark: Open settings` | Open plugin settings |

## Note Templates

### Default Template
```markdown
---
title: "{{title}}"
url: "{{url}}"
date_added: {{dateAdded}}
folder: {{folder}}
tags: {{tags}}
category: {{category}}
description: "{{description}}"
keywords: {{keywords}}
---

# {{title}}

## Description
{{description}}

## Category
{{category}}

## Tags
{{tags}}

## Source
[{{title}}]({{url}})
```

### Minimal Template
```markdown
---
title: "{{title}}"
url: "{{url}}"
date_added: {{dateAdded}}
tags: {{tags}}
---

# [{{title}}]({{url}})

{{description}}

---

**Category**: {{category}} | **Folder**: {{folder}}
```

### Detailed Template
Includes all metadata fields: language, author, published_date, summary

## Settings Reference

| Setting | Default | Description |
|---------|---------|-------------|
| Import Path | "" | Default path to bookmarks file |
| Output Folder | "Bookmarks" | Folder for generated notes |
| Note Template | "default" | Template to use |
| Include Metadata | true | Add metadata to notes |
| Auto Tag | true | Generate tags automatically |
| Group by Folder | false | Organize by bookmark folders |
| Default Language | "en" | Language for notes (en/zh) |
| Enable Cloud AI | false | Use cloud AI (future) |
| Cloud AI Provider | "openai" | AI service provider |
| API Key | "" | API key for AI service |

## File Structure

```
Bookmarks/
├── Development/
│   ├── GitHub - Open Source Projects.md
│   └── Stack Overflow - Programming Questions.md
├── News/
│   ├── Tech News Site.md
│   └── Blog - Technology.md
└── General/
    └── Example Website.md
```

## Development Commands

```bash
# Development mode (watch)
npm run dev

# Production build
npm run build

# Bump version
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0

# Git commands
git add .
git commit -m "feat: add new feature"
git push
```

## Troubleshooting

### Import fails
- Check file path is correct
- Ensure browser is closed (for Firefox SQLite)
- Verify file permissions

### Notes not generated
- Check output folder exists
- Verify template is valid
- Check Obsidian console for errors

### Cloud AI not working
- Check API key is set
- Verify provider is selected
- Ensure internet connection

## Keyboard Shortcuts

- `Cmd/Ctrl + P` - Open command palette
- `Cmd/Ctrl + ,` - Open settings
- `Cmd/Ctrl + R` - Reload Obsidian (for hot reload)

## Common Use Cases

### 1. Import Chrome Bookmarks
1. Open command palette
2. Select "Import browser bookmarks"
3. Choose "Chrome"
4. Enter path: `~/Library/Application Support/Google/Chrome/Default/Bookmarks`
5. Click "Import"

### 2. Organize by Folder
1. Go to Settings → Smart Bookmark
2. Enable "Group by Folder"
3. Re-import bookmarks
4. Notes will be organized in subfolders

### 3. Custom Tags
1. Import bookmarks
2. Edit generated notes
3. Add custom tags in frontmatter
4. Notes retain your changes on re-import

## API Reference

### BrowserParser
```typescript
const parser = ParserFactory.create("chrome");
const bookmarks = await parser.parse(fileContent);
```

### ContentAnalyzer
```typescript
const analyzer = new ContentAnalyzer({
  fetchMetadata: true,
  extractKeywords: true,
  aiAnalysis: false
});
const analyzed = await analyzer.analyze(bookmark);
```

### NoteGenerator
```typescript
const generator = new NoteGenerator("default", "en");
const content = generator.generateNote(analyzedBookmark);
```

## Resources

- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [esbuild Documentation](https://esbuild.github.io/)
- [Project GitHub](https://github.com/yourusername/obsidian-smart-bookmark)

## Support

- 📧 Email: your.email@example.com
- 💬 Discord: [Join community](https://discord.gg/yourserver)
- 🐛 Issues: [Report bugs](https://github.com/yourusername/obsidian-smart-bookmark/issues)

---

**Version**: 0.1.0
**Last Updated**: 2026-03-20
