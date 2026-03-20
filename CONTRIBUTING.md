# Contributing to Smart Bookmark

Thank you for your interest in contributing to Smart Bookmark! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/obsidian-smart-bookmark.git
   cd obsidian-smart-bookmark
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the plugin:
   ```bash
   npm run build
   ```

5. Test in your Obsidian vault:
   - Copy the built files to your vault's `.obsidian/plugins/smart-bookmark` directory
   - Reload Obsidian
   - Enable the plugin

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Maintenance tasks

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for Firefox bookmarks
fix: resolve issue with Safari parser
docs: update installation instructions
refactor: improve code organization
test: add unit tests for bookmark parser
```

### Pull Request Process

1. Update documentation if needed
2. Write/update tests
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit a Pull Request with a clear description

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in tsconfig.json
- Provide proper type definitions
- Use interfaces for public APIs

### Code Style

- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Follow existing code patterns

### Error Handling

- Always handle errors gracefully
- Provide meaningful error messages
- Log errors for debugging

## Testing

### Manual Testing

Test your changes in Obsidian:
1. Build the plugin
2. Copy to test vault
3. Test various scenarios
4. Check console for errors

### Automated Testing (Future)

We plan to add automated tests. Contributions to the testing framework are welcome!

## Documentation

### Code Documentation

- Add JSDoc comments to public APIs
- Document complex algorithms
- Explain non-obvious logic

### User Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md for each release
- Keep documentation clear and concise

## Feature Requests

1. Check existing issues first
2. Create a new issue with the `enhancement` label
3. Describe the feature and use case
4. Provide examples if possible

## Bug Reports

1. Check existing issues first
2. Create a new issue with the `bug` label
3. Provide steps to reproduce
4. Include Obsidian version and OS
5. Attach relevant logs or screenshots

## Questions

Feel free to open an issue with the `question` label for any questions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Getting Help

- 📧 Email: your.email@example.com
- 💬 Discord: [Join our community](https://discord.gg/yourserver)
- 📖 Documentation: [Read the docs](https://github.com/yourusername/obsidian-smart-bookmark/wiki)

Thank you for contributing! 🎉
