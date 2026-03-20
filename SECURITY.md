# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in Smart Bookmark, please report it responsibly.

### How to Report

Send an email to: your.email@example.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Proof of concept (if applicable)

### What to Expect

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will work on a fix and coordinate a release with you
- You will be credited in the security advisory

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Yes    |

## Security Best Practices

### For Users

- Only install from trusted sources
- Keep the plugin updated
- Review the source code before installing
- Be cautious with API keys - never share them

### For Developers

- Sanitize all user input
- Use HTTPS for all network requests
- Never log sensitive information
- Follow security best practices for TypeScript

## API Key Security

The plugin supports cloud AI services which may require API keys:

- API keys are stored locally in your Obsidian settings
- Keys are never transmitted to our servers
- Keys are only used to make requests to the specified AI service provider
- We recommend using environment variables or vault encryption for sensitive data

## Known Issues

There are currently no known security issues.

## Disclosure Policy

We follow responsible disclosure:

1. Report privately
2. Acknowledge and triage
3. Fix and test
4. Coordinate release
5. Publish advisory

Thank you for helping keep Smart Bookmark secure! 🔒
