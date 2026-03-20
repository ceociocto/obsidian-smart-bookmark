# Smart Bookmark - Fallback Analyzer for Inaccessible Websites

## Problem

Some websites block direct HTTP requests, making it impossible to fetch their content via standard `fetch()` or similar methods:

1. **Anti-bot systems**: User-Agent detection, IP blocking
2. **CORS restrictions**: Cross-Origin Resource Sharing blocks
3. **Login requirements**: Authenticated content
4. **JavaScript rendering**: Dynamic content not available in initial HTML
5. **Rate limiting**: Too many requests from same IP
6. **Captcha challenges**: Human verification required

## Current Solution: Fallback Analyzer

The fallback analyzer uses URL structure and known domain information to generate metadata when direct fetching fails.

### How It Works

1. **URL Pattern Analysis**
   - Extracts domain name
   - Analyzes path segments
   - Detects patterns (docs, api, blog, tutorial, etc.)

2. **Known Domain Database**
   - Pre-defined info for popular platforms
   - Includes: category, core function, keywords
   - Examples: GitHub, Stack Overflow, Dribbble, Notion

3. **Smart Keyword Extraction**
   - Domain-based: `github.com` → `github`, `code`
   - Path-based: `/docs/api` → `docs`, `api`
   - Removes UUIDs, numbers, common params

4. **Automatic Categorization**
   - Maps patterns to categories
   - Development, design, education, ecommerce, etc.

### Example Output

**URL**: `https://docs.python.org/3/library/stdtypes.html`

**Fallback Analysis**:
```markdown
### Python Documentation
- **URL**: https://docs.python.org/3/library/stdtypes.html
- **Capability**: Standard Types — Python documentation
- **Tags**: #documentation #python #stdtypes #library
```

### Known Domains

| Domain | Category | Function |
|--------|----------|----------|
| github.com | development | Code hosting and collaboration |
| stackoverflow.com | development | Q&A for programmers |
| twitter.com | social | Microblogging platform |
| dribbble.com | design | Design showcase |
| figma.com | tool | Design tool |
| notion.so | productivity | Productivity tool |
| amazon.com | ecommerce | E-commerce marketplace |
| nytimes.com | news | News and journalism |
| wikipedia.org | reference | Encyclopedia |

## Future Solutions

### 1. Browser Extension Integration (Recommended)

Create a browser extension that communicates with the Obsidian plugin:

**Architecture**:
```
Obsidian Plugin ←→ WebSocket ←→ Browser Extension ←→ Browser
```

**Flow**:
1. Obsidian plugin sends URL via WebSocket
2. Browser extension opens URL in browser
3. Extension reads DOM, cookies, rendered content
4. Extension sends content back to plugin
5. Plugin processes and generates notes

**Benefits**:
- ✅ Full access to rendered content
- ✅ Authenticated content support
- ✅ No CORS restrictions
- ✅ JavaScript execution
- ✅ User's cookies and sessions

**Implementation**:
- Chrome Extension API
- WebSocket communication
- Content Script for DOM access
- Background Service Worker for persistence

### 2. Obsidian Native Browser

Use Obsidian's built-in Electron browser:

```typescript
const { BrowserWindow } = require('electron');
const win = new BrowserWindow({ show: false });
win.loadURL(bookmark.url);

// Wait for page load
win.webContents.on('did-finish-load', async () => {
  const content = await win.webContents.executeJavaScript(`
    document.querySelector('meta[name="description"]')?.content
  `);
  // Process content...
});
```

**Benefits**:
- ✅ No external dependencies
- ✅ JavaScript rendering
- ✅ Basic anti-bot bypass

**Limitations**:
- ❌ No user cookies/sessions
- ❌ Still detectable as automated
- ❌ Resource intensive

### 3. Proxy Services

Use third-party content extraction APIs:

**Options**:
- **Readability**: Mozilla's text extraction
- **Mercury**: Content extraction by Postlight
- **Diffbot**: AI-powered extraction
- **Aylien**: NLP-based extraction

**Example**:
```javascript
const response = await fetch(
  `https://mercury.postlight.com/parser?url=${encodeURIComponent(url)}&api_key=YOUR_KEY`
);
const content = await response.json();
// content.title, content.content, etc.
```

**Benefits**:
- ✅ Fast and simple
- ✅ Anti-bot bypass
- ✅ Clean content extraction

**Limitations**:
- ❌ Requires API key
- ❌ Rate limits
- ❌ Paid services
- ❌ No authenticated content

### 4. Headless Browser

Use Puppeteer/Playwright to render pages:

```typescript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle0' });

const content = await page.evaluate(() => {
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content,
    content: document.body.innerText,
  };
});

await browser.close();
```

**Benefits**:
- ✅ JavaScript rendering
- ✅ Customizable user agent
- ✅ Can handle dynamic content

**Limitations**:
- ❌ Resource intensive
- ❌ Still detectable
- ❌ No user sessions
- ❌ Requires Node.js + Puppeteer

### 5. Hybrid Approach (Best)

Combine multiple methods:

```
1. Try direct fetch (fastest)
   ↓ fails
2. Try browser extension (best quality)
   ↓ not installed
3. Try proxy service (good quality)
   ↓ rate limit
4. Use fallback analyzer (always works)
```

## Current Implementation

The fallback analyzer is **active by default** and automatically activates when:

- Network request fails
- HTTP status 403 (Forbidden)
- HTTP status 429 (Rate Limit)
- CORS error
- Timeout
- Invalid response

**Settings**:
```
Settings → Enhanced Analysis Settings → Enable Fallback Analyzer
```

## Known Limitations

1. **No dynamic content**: Cannot see JavaScript-rendered content
2. **No authentication**: Cannot access logged-in content
3. **Limited metadata**: Only URL structure and known domains
4. **Generic descriptions**: Not as detailed as full content analysis

## Future Roadmap

### Phase 1: Browser Extension (Next)
- [ ] Chrome extension development
- [ ] WebSocket communication
- [ ] DOM content extraction
- [ ] Installation and setup guide

### Phase 2: Enhanced Fallback
- [ ] More known domains
- [ ] User-defined domain rules
- [ ] Machine learning categorization
- [ ] Community-contributed domain database

### Phase 3: Hybrid Integration
- [ ] Priority-based method selection
- [ ] Performance metrics
- [ ] Automatic fallback optimization
- [ ] User preference configuration

## Testing

Test fallback analyzer with blocked URLs:

```javascript
// Should use fallback
https://stackoverflow.com/questions/12345
https://twitter.com/username/status/12345
https://github.com/username/repo
```

## Contributing

Add new domains to the fallback analyzer:

```typescript
this.knownDomains.set('example.com', {
  category: 'category',
  coreFunction: 'Function description',
  keywords: ['keyword1', 'keyword2'],
  description: 'Optional description',
});
```
