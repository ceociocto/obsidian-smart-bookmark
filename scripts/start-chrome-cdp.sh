#!/bin/bash

# Start Chrome with Remote Debugging enabled
# This allows Obsidian Smart Bookmark plugin to access Chrome's sessions

set -e

# Configuration
CDP_PORT="${CDP_PORT:-9222}"
USER_DATA_DIR="/tmp/chrome-debug-profile"

echo "🚀 Starting Chrome with CDP enabled..."
echo "Port: $CDP_PORT"
echo "Profile: $USER_DATA_DIR"

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
	# macOS
	CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
	# Linux
	CHROME_PATH="/usr/bin/google-chrome"
	if [ ! -f "$CHROME_PATH" ]; then
		CHROME_PATH="/usr/bin/chromium-browser"
	fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
	# Windows
	CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
	if [ ! -f "$CHROME_PATH" ]; then
		CHROME_PATH="/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
	fi
else
	echo "❌ Unknown OS: $OSTYPE"
	exit 1
fi

# Check if Chrome exists
if [ ! -f "$CHROME_PATH" ]; then
	echo "❌ Chrome not found at: $CHROME_PATH"
	echo "Please update CHROME_PATH in this script"
	exit 1
fi

# Check if port is already in use
if lsof -Pi :$CDP_PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
	echo "⚠️  Port $CDP_PORT is already in use"
	echo "Chrome may already be running with CDP enabled"
	echo ""
	read -p "Continue anyway? (y/n): " -n 1 -r
	echo
	if [[ ! $REPLY =~ ^[Yy]$ ]]; then
		exit 1
	fi
fi

# Start Chrome
echo "🔧 Starting: $CHROME_PATH"
"$CHROME_PATH" \
	--remote-debugging-port=$CDP_PORT \
	--remote-debugging-address=127.0.0.1 \
	--user-data-dir="$USER_DATA_DIR" \
	--disable-web-security \
	--disable-features=TranslateUI \
	> /tmp/chrome-debug.log 2>&1 &

CHROME_PID=$!
echo "✅ Chrome started (PID: $CHROME_PID)"
echo ""
echo "📝 Log file: /tmp/chrome-debug.log"
echo "🔌 CDP endpoint: http://localhost:$CDP_PORT"
echo ""
echo "💡 To stop Chrome, run: kill $CHROME_PID"
echo ""
echo "⚠️  Security Note:"
echo "   - CDP is only accessible from localhost (127.0.0.1)"
echo "   - Never expose port $CDP_PORT to public networks"
echo "   - Close Chrome when not in use"
echo ""
echo "✨ Now enable Chrome CDP in Obsidian Smart Bookmark settings!"
