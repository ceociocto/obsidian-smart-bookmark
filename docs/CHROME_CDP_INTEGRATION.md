# Sharing Chrome Login State with Obsidian

## Solutions Overview

| Solution | Complexity | Cookie Support | Session Support | Data Access |
|----------|------------|----------------|-----------------|--------------|
| CDP (Chrome DevTools Protocol) | Medium | ✅ | ✅ | ✅ Full |
| Browser Extension + Native Messaging | High | ✅ | ✅ | ✅ Full |
| Chrome Profile Sharing | Low | ✅ | ❌ | ✅ Limited |
| Cookie File Parsing | Low | ⚠️ (encrypted) | ❌ | ⚠️ Limited |

## Solution 1: Chrome DevTools Protocol (CDP) - RECOMMENDED

### How It Works

Connect to a running Chrome instance and reuse its sessions.

### Implementation

#### Step 1: Start Chrome with Remote Debugging

```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --remote-debugging-port=9222 \
  --user-data-dir=C:\temp\chrome-debug-profile
```

#### Step 2: Connect via CDP in Obsidian Plugin

```typescript
import { chromium } from 'playwright';

class CDPCookieManager {
  private browser: any = null;

  async connect() {
    // Connect to Chrome CDP
    this.browser = await chromium.connectOverCDP('http://localhost:9222');

    console.log('Connected to Chrome via CDP');
  }

  async getPageContent(url: string): Promise<string> {
    const context = this.browser.contexts()[0];
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });

    const content = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        content: document.body.innerText.substring(0, 2000),
      };
    });

    await page.close();
    return content;
  }

  async getCookies(url: string): Promise<any[]> {
    const context = this.browser.contexts()[0];
    return await context.cookies({ url });
  }

  async disconnect() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
```

#### Step 3: Use in Smart Bookmark Plugin

```typescript
// In enhancedContentAnalyzer.ts
if (this.options.useChromeCDP) {
  const cdpManager = new CDPCookieManager();
  await cdpManager.connect();

  try {
    const content = await cdpManager.getPageContent(bookmark.url);
    // Process content...
  } finally {
    await cdpManager.disconnect();
  }
}
```

### Pros & Cons

✅ **Pros**:
- Full access to Chrome's cookies and sessions
- Can access authenticated content
- Works with all Chrome extensions
- Real-time sync

❌ **Cons**:
- Requires Chrome to be running with debug mode
- Security risk (anyone can connect to CDP)
- Need to start Chrome with specific flags

### Security Considerations

- **Never expose CDP port to public internet**
- Use `--remote-debugging-address=127.0.0.1`
- Set firewall rules to block external access
- Consider using authentication token

---

## Solution 2: Browser Extension + Native Messaging

### Architecture

```
Obsidian Plugin ←→ Native Messaging Host ←→ Chrome Extension ←→ Chrome
         (WebSocket)        (stdio)              (API)
```

### Implementation

#### Step 1: Chrome Extension (content script)

```javascript
// chrome-extension/content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    (async () => {
      const response = {
        url: request.url,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        content: document.body.innerText.substring(0, 2000),
        cookies: await chrome.cookies.getAll({ url: request.url }),
      };
      sendResponse(response);
    })();
    return true; // Keep message channel open for async response
  }
});
```

#### Step 2: Native Messaging Host (Node.js)

```typescript
// native-messaging-host.js

const fs = require('fs');
const net = require('net');
const WebSocket = require('ws');

// WebSocket server for Obsidian
const wsServer = new WebSocket.Server({ port: 28476 });

wsServer.on('connection', (ws) => {
  console.log('Obsidian connected');

  ws.on('message', async (message) => {
    const request = JSON.parse(message);

    if (request.type === 'getPageContent') {
      // Send to Chrome extension via native messaging
      const extensionMessage = {
        extensionId: 'your-extension-id',
        action: 'getPageContent',
        url: request.url,
      };

      // Forward to Chrome
      const chromeResponse = await sendToChrome(extensionMessage);

      // Send back to Obsidian
      ws.send(JSON.stringify(chromeResponse));
    }
  });
});

// Chrome native messaging interface
function sendToChrome(message: any): Promise<any> {
  return new Promise((resolve) => {
    // Native messaging happens via stdin/stdout
    const messageLength = Buffer.byteLength(JSON.stringify(message));

    const header = Buffer.alloc(4);
    header.writeUInt32LE(messageLength, 0);

    const process = require('child_process').spawn(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ['--message-to=your-extension-id'],
      { stdio: ['pipe', 'pipe', 'pipe'] }
    );

    process.stdin.write(header);
    process.stdin.write(JSON.stringify(message));

    let response = '';
    process.stdout.on('data', (data) => {
      const length = data.readUInt32LE(0);
      const json = data.slice(4, 4 + length).toString();
      response = JSON.parse(json);
      process.kill();
      resolve(response);
    });
  });
}
```

#### Step 3: Chrome Extension (background)

```javascript
// chrome-extension/background.js

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
      // Open tab if not already open
      chrome.tabs.query({ url: request.url }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, request, sendResponse);
        } else {
          chrome.tabs.create({ url: request.url, active: false }, (tab) => {
            // Wait for tab to load
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
              if (tabId === tab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.tabs.sendMessage(tabId, request, sendResponse);
              }
            });
          });
        }
        return true; // Async response
      });
    }
  },
  'your-extension-id' // Extension ID
);
```

#### Step 4: Obsidian Plugin Integration

```typescript
// In main.ts

class ChromeExtensionBridge {
  private ws: WebSocket | null = null;

  async connect() {
    this.ws = new WebSocket('ws://localhost:28476');

    await new Promise((resolve) => {
      this.ws!.onopen = resolve;
    });

    console.log('Connected to Chrome Extension Bridge');
  }

  async getPageContent(url: string): Promise<any> {
    if (!this.ws) {
      await this.connect();
    }

    return new Promise((resolve) => {
      this.ws!.once('message', (data) => {
        resolve(JSON.parse(data.toString()));
      });

      this.ws!.send(JSON.stringify({
        type: 'getPageContent',
        url,
      }));
    });
  }
}
```

### Pros & Cons

✅ **Pros**:
- No need to run Chrome in debug mode
- Works with normal Chrome
- Full access to cookies and sessions
- Can interact with page (scroll, click, etc.)

❌ **Cons**:
- Requires Chrome extension installation
- More complex to set up
- Needs native messaging host
- Multiple moving parts

---

## Solution 3: Chrome Profile Sharing (Simpler)

### Implementation

```typescript
import { chromium } from 'playwright';

class ChromeProfileManager {
  private browser: any = null;

  async launch() {
    this.browser = await chromium.launchPersistentContext(
      '/Users/YOUR_USERNAME/Library/Application Support/Google/Chrome/Default',
      {
        headless: false,
        viewport: null,
      }
    );
  }

  async getPageContent(url: string): Promise<string> {
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const content = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        content: document.body.innerText.substring(0, 2000),
      };
    });

    await page.close();
    return content;
  }

  async close() {
    await this.browser.close();
  }
}
```

### Pros & Cons

✅ **Pros**:
- Simple to implement
- Reuses Chrome's cookies
- Works with most authenticated sites

❌ **Cons**:
- Can't run while Chrome is open (profile lock)
- No session state (only cookies)
- May have conflicts

---

## Solution 4: Cookie File Parsing (Limited)

### Implementation

```typescript
import sqlite3 from 'sqlite3';
import { Cookie } from 'playwright';

class ChromeCookieParser {
  private dbPath: string;

  constructor(profilePath: string) {
    this.dbPath = `${profilePath}/Network/Cookies`;
  }

  async getCookies(url: string): Promise<Cookie[]> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);

      db.all(
        `SELECT name, value, host_key, path, expires_utc, is_secure, is_httponly
         FROM cookies
         WHERE host_key = ?`,
        [new URL(url).hostname],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }

          const cookies: Cookie[] = rows.map(row => ({
            name: row.name,
            value: row.value,
            domain: row.host_key,
            path: row.path,
            expires: row.expires_utc,
            secure: row.is_secure,
            httpOnly: row.is_httponly,
            sameSite: 'Lax',
          }));

          db.close();
          resolve(cookies);
        }
      );
    });
  }
}
```

### Pros & Cons

✅ **Pros**:
- Simple to implement
- Works even when Chrome is closed

❌ **Cons**:
- **Cookies are encrypted** on modern Chrome
- No session state
- Requires profile path
- May not work for all cookies

---

## Recommended Approach: Hybrid

Combine solutions for best results:

```
1. Try CDP (if Chrome running in debug mode)
   ↓ not available
2. Try Chrome Extension Bridge (best quality)
   ↓ not installed
3. Try direct fetch (fastest)
   ↓ blocked
4. Use fallback analyzer (always works)
```

### Implementation

```typescript
class HybridContentFetcher {
  private cdpManager?: CDPCookieManager;
  private extensionBridge?: ChromeExtensionBridge;

  async fetch(url: string): Promise<any> {
    // Method 1: CDP
    if (this.cdpManager) {
      try {
        return await this.cdpManager.getPageContent(url);
      } catch (e) {
        console.warn('CDP failed:', e);
      }
    }

    // Method 2: Extension Bridge
    if (this.extensionBridge) {
      try {
        return await this.extensionBridge.getPageContent(url);
      } catch (e) {
        console.warn('Extension bridge failed:', e);
      }
    }

    // Method 3: Direct fetch
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (e) {
      console.warn('Direct fetch failed:', e);
    }

    // Method 4: Fallback
    return await this.fallbackAnalyzer.analyze(url);
  }
}
```

---

## Quick Start: CDP Method

### 1. Create startup script

```bash
#!/bin/bash
# start-chrome-cdp.sh

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile \
  --disable-features=TranslateUI \
  > /tmp/chrome-debug.log 2>&1 &
```

### 2. Start Chrome

```bash
bash start-chrome-cdp.sh
```

### 3. Test CDP connection

```bash
curl http://localhost:9222/json/version
```

### 4. Update Obsidian plugin

```typescript
// In settings
settings: {
  useChromeCDP: true,
  cdpPort: 9222,
}
```

---

## Security Notes

⚠️ **Important**:
- CDP exposes full browser control
- Only bind to 127.0.0.1
- Never expose to network
- Consider using authentication token
- Review all CDP connections

---

## Next Steps

### For Smart Bookmark Plugin

1. **Phase 1**: Add CDP support
   - [ ] Add settings option
   - [ ] Implement CDP connection
   - [ ] Test with authenticated sites

2. **Phase 2**: Develop Chrome Extension
   - [ ] Create extension manifest
   - [ ] Implement content script
   - [ ] Build native messaging host
   - [ ] Integrate with plugin

3. **Phase 3**: Hybrid implementation
   - [ ] Priority-based method selection
   - [ ] Performance monitoring
   - [ ] User configuration

---

## Resources

- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Native Messaging](https://developer.chrome.com/docs/extensions/mv3/nativeMessaging/)
- [Playwright CDP](https://playwright.dev/docs/api/class-cdpsession)
- [Chrome Cookie Encryption](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/components/os_crypt/)

---

## Conclusion

**Best solution**: CDP (Chrome DevTools Protocol)

- Full access to Chrome's state
- Works with authenticated content
- Relatively simple to implement
- No extension required

**Start with**: CDP implementation in Smart Bookmark plugin
**Future enhancement**: Chrome Extension Bridge for fallback
