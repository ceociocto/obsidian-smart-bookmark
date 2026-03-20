# Smart Bookmark Plugin for Obsidian

Import browser bookmarks, analyze websites, and organize them into structured Obsidian notes with AI-powered insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Obsidian](https://img.shields.io/badge/Obsidian-0.15.0+-blue.svg)](https://obsidian.md)

## Features

- 📥 **Multi-Browser Support**: Import bookmarks from Chrome, Safari, Edge, and Firefox
- 🔍 **Smart Analysis**: Extract metadata, keywords, and categories automatically
- 📝 **Structured Notes**: Generate well-organized Obsidian notes with frontmatter
- 🌐 **Multi-Language**: Support for English and Chinese (with i18n framework)
- 🤖 **AI-Ready**: Reserved API endpoints for future cloud AI integration
- 🏷️ **Auto Tagging**: Automatically generate tags based on content analysis
- 📁 **Flexible Organization**: Group notes by folder or use custom organization

## Installation

### From GitHub Releases (Recommended)

1. Download the latest release from [GitHub Releases](https://github.com/yourusername/obsidian-smart-bookmark/releases)
2. Extract the downloaded zip file
3. Copy the extracted folder to your Obsidian vault's `.obsidian/plugins` directory
4. Enable the plugin in Obsidian's Community Plugins settings

### Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/obsidian-smart-bookmark.git
   ```

2. Install dependencies:
   ```bash
   cd obsidian-smart-bookmark
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Copy the generated files to your Obsidian vault's `.obsidian/plugins/smart-bookmark` directory
5. Enable the plugin in Obsidian's Community Plugins settings

## Usage

### Importing Bookmarks

1. Open the command palette (`Cmd/Ctrl + P`)
2. Search for "Smart Bookmark: Import browser bookmarks"
3. Select your browser type (Chrome, Safari, Edge, or Firefox)
4. Provide the path to your browser's bookmarks file
5. Click "Import" to start the import process

### Browser Bookmark File Locations

#### Chrome/Edge
- **macOS**: `~/Library/Application Support/Google/Chrome/Default/Bookmarks`
- **Windows**: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Bookmarks`
- **Linux**: `~/.config/google-chrome/Default/Bookmarks`

#### Safari
- **macOS**: `~/Library/Safari/Bookmarks.plist`

#### Firefox
- **macOS**: `~/Library/Application Support/Firefox/Profiles/[profile]/places.sqlite`
- **Windows**: `%APPDATA%\Mozilla\Firefox\Profiles\[profile]\places.sqlite`
- **Linux**: `~/.mozilla/firefox/[profile]/places.sqlite`

> **Note**: For Firefox, export your bookmarks as HTML (Bookmarks → Show All Bookmarks → Import and Backup → Export to HTML)

### Settings

Configure the plugin via Settings → Community Plugins → Smart Bookmark:

- **Import Path**: Default path to browser bookmarks file
- **Output Folder**: Folder where generated notes will be saved (default: `Bookmarks`)
- **Note Template**: Choose between Default, Minimal, or Detailed templates
- **Include Metadata**: Add metadata to generated notes
- **Auto Tag**: Automatically generate tags based on content
- **Group by Folder**: Organize notes by bookmark folders
- **Default Language**: Language for generated notes (English/Chinese)
- **Enable Cloud AI**: Enable cloud AI for advanced analysis (future feature)
- **Cloud AI Provider**: Choose AI service provider (OpenAI/Anthropic/Custom)
- **API Key**: API key for cloud AI service

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/obsidian-smart-bookmark.git
   cd obsidian-smart-bookmark
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Building

Build the plugin for production:
```bash
npm run build
```

Build in watch mode for development:
```bash
npm run dev
```

### Project Structure

```
obsidian-smart-bookmark/
├── src/
│   ├── main.ts                    # Plugin entry point
│   ├── settings.ts                # Settings tab
│   ├── modals/                    # UI modals
│   │   ├── importModal.ts
│   │   └── progressModal.ts
│   ├── parsers/                   # Browser bookmark parsers
│   │   ├── browserParser.ts
│   │   ├── chrome.ts
│   │   ├── safari.ts
│   │   └── firefox.ts
│   ├── analyzer/                  # Content analysis
│   │   ├── contentAnalyzer.ts
│   │   └── types.ts
│   ├── generator/                 # Note generation
│   │   ├── noteGenerator.ts
│   │   └── templates.ts
│   ├── i18n/                      # Internationalization
│   │   ├── en.ts
│   │   └── zh.ts
│   ├── api/                       # Cloud AI client (reserved)
│   │   └── cloudClient.ts
│   └── types/                     # TypeScript types
│       └── index.ts
├── resources/
│   └── icon.svg
├── package.json
├── tsconfig.json
├── MANIFEST.json
├── README.md
└── CHANGELOG.md
```

### Testing in Obsidian

1. Build the plugin: `npm run build`
2. Create a symlink or copy the folder to your test vault's `.obsidian/plugins` directory
3. Reload Obsidian or use the developer hot reload (Ctrl/Cmd + R)

### Adding New Languages

1. Create a new file in `src/i18n/` (e.g., `fr.ts`)
2. Export the translation object with the same keys as `en.ts`
3. Import in `main.ts` and add to language dropdown

## Roadmap

- [ ] Full cloud AI integration (OpenAI, Anthropic, etc.)
- [ ] Enhanced metadata extraction (fetching actual page content)
- [ ] Bookmark synchronization
- [ ] Advanced search and filtering
- [ ] Bookmark deduplication
- [ ] Custom note templates
- [ ] Batch operations
- [ ] Export/Import plugin settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Obsidian plugin development documentation
- The open-source community
- All contributors and users

## Support

- 📧 Email: your.email@example.com
- 💬 Discord: [Join our community](https://discord.gg/yourserver)
- 🐛 Issues: [Report bugs](https://github.com/yourusername/obsidian-smart-bookmark/issues)

## Star History

If you find this plugin helpful, please consider giving it a ⭐ on GitHub!
