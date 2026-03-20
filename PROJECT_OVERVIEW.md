# Smart Bookmark - Project Overview

## Quick Start

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run dev

# Run tests (when implemented)
npm test
```

## Project Structure

```
obsidian-smart-bookmark/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI/CD pipeline
│       └── release.yml         # Release automation
├── resources/
│   └── icon.svg                # Plugin icon
├── src/
│   ├── main.ts                 # Plugin entry point (≈6500 lines)
│   ├── settings.ts             # Settings UI (≈4700 lines)
│   ├── modals/
│   │   ├── importModal.ts      # Import dialog (≈2000 lines)
│   │   └── progressModal.ts    # Progress indicator (≈2900 lines)
│   ├── parsers/
│   │   ├── browserParser.ts    # Base parser (≈1400 lines)
│   │   ├── chrome.ts           # Chrome parser (≈1500 lines)
│   │   ├── edge.ts             # Edge parser (≈300 lines)
│   │   ├── firefox.ts          # Firefox parser (≈2900 lines)
│   │   └── safari.ts           # Safari parser (≈2300 lines)
│   ├── analyzer/
│   │   ├── contentAnalyzer.ts  # Content analysis (≈4700 lines)
│   │   └── types.ts            # Analyzer types (≈700 lines)
│   ├── generator/
│   │   ├── noteGenerator.ts    # Note generation (≈3200 lines)
│   │   └── templates.ts         # Note templates (≈1500 lines)
│   ├── i18n/
│   │   ├── en.ts               # English translations (≈2900 lines)
│   │   └── zh.ts               # Chinese translations (≈2300 lines)
│   ├── api/
│   │   └── cloudClient.ts      # Cloud AI client (≈2200 lines)
│   └── types/
│       └── index.ts            # Global types (≈1700 lines)
├── .gitignore
├── .npmrc
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── MANIFEST.json               # Obsidian plugin manifest
├── package.json
├── README.md
├── SECURITY.md
├── TODO.md
├── tsconfig.json
├── esbuild.config.mjs
├── version-bump.mjs
└── versions.json
```

## Key Components

### 1. Plugin Core (`src/main.ts`)
- Plugin initialization
- Command registration
- Ribbon icon
- Main workflow orchestration

### 2. Browser Parsers (`src/parsers/`)
- **Chrome**: JSON format parser
- **Safari**: Plist format parser (simplified)
- **Edge**: Inherits from Chrome parser
- **Firefox**: HTML export and JSON format parser

### 3. Content Analyzer (`src/analyzer/contentAnalyzer.ts`)
- URL metadata extraction
- Keyword extraction
- Category guessing
- Placeholder for AI analysis

### 4. Note Generator (`src/generator/`)
- Template-based note creation
- Frontmatter generation
- Markdown formatting
- Three templates: Default, Minimal, Detailed

### 5. Cloud AI Client (`src/api/cloudClient.ts`)
- Reserved for future AI integration
- Supports multiple providers (OpenAI, Anthropic, Custom)
- Factory pattern for client creation

### 6. Internationalization (`src/i18n/`)
- English and Chinese translations
- Easy to add more languages
- Consistent translation keys

### 7. Settings (`src/settings.ts`)
- Comprehensive settings UI
- All plugin configuration options
- Real-time updates

## Technology Stack

- **Language**: TypeScript
- **Build Tool**: esbuild
- **Platform**: Obsidian Plugin API
- **Target**: ES6+ (Node.js compatible)
- **Package Manager**: npm

## Feature Status

### ✅ Implemented
- Multi-browser bookmark parsing
- Content metadata extraction
- Keyword extraction
- Category guessing
- Note generation with templates
- i18n support (EN/ZH)
- Settings page
- Import progress modal
- Cloud AI client structure (reserved)

### 🚧 In Progress
- Actual page content fetching
- Enhanced metadata extraction
- Proper Firefox SQLite parsing
- Better Safari plist parsing

### 🔮 Future
- Cloud AI integration
- Bookmark synchronization
- Advanced search
- Custom templates editor
- Browser extension

## Development Workflow

1. **Make changes**: Edit TypeScript files
2. **Build**: `npm run build`
3. **Test**: Copy to test vault `.obsidian/plugins/smart-bookmark`
4. **Reload**: Reload Obsidian or use hot reload

## GitHub Actions

### CI Pipeline
- Runs on push to `main` and `develop`
- Tests on Node.js 18.x and 20.x
- Builds and lints the plugin
- Type checking with TypeScript

### Release Pipeline
- Runs on version tags (e.g., `v1.0.0`)
- Builds the plugin
- Creates GitHub release
- Attaches build artifacts

## Publishing to GitHub

```bash
# Create a new repository on GitHub first
git remote add origin https://github.com/yourusername/obsidian-smart-bookmark.git
git branch -M main
git push -u origin main
```

## Next Steps

1. **Create GitHub repository**
   - Go to https://github.com/new
   - Create "obsidian-smart-bookmark" repository
   - Copy the remote URL

2. **Push to GitHub**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Optional: Protect main branch**
   - Go to repository settings
   - Branches → Add rule
   - Require pull request reviews
   - Require status checks to pass

4. **Enable GitHub Actions**
   - Go to Actions tab
   - Enable workflows

5. **Add collaborators** (if needed)
   - Settings → Collaborators
   - Add team members

## Notes

- **Firefox Support**: Currently supports HTML export. Full SQLite parsing requires additional dependencies.
- **Safari Support**: Plist parsing is simplified. For production, use a proper plist parser library.
- **Cloud AI**: Infrastructure is in place, but actual API calls are not implemented.
- **Testing**: No automated tests yet. Manual testing in Obsidian is recommended.

## License

MIT License - See LICENSE file for details

---

**Status**: ✅ Ready for GitHub upload and initial release
**Version**: 0.1.0
**Last Updated**: 2026-03-20
