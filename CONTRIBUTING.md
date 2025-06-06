# Contributing to ModuLink TypeScript

Thank you for your interest in contributing to ModuLink TypeScript! This document provides guidelines for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Getting Started

ModuLink TypeScript is a TypeScript wrapper for [modulink-js](https://github.com/JoshuaWink/modulink-js) that provides full type safety while maintaining 100% API compatibility. Before contributing, please:

1. Read the [README.md](./README.md) to understand the project
2. Check the [issues](https://github.com/JoshuaWink/modulink-ts/issues) for existing bug reports or feature requests
3. Familiarize yourself with the [modulink-js](https://github.com/JoshuaWink/modulink-js) core library

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/modulink-ts.git
   cd modulink-ts
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Start Development**
   ```bash
   npm run dev  # Watches for changes and rebuilds
   ```

## Project Structure

```
modulink-ts/
├── src/
│   ├── index.ts          # Main wrapper exports
│   ├── types.ts          # TypeScript type definitions
│   └── modulink-js.d.ts  # Module declaration
├── __tests__/
│   └── index.test.ts     # Test suite
├── dist/                 # Built output
├── examples/             # Usage examples
└── docs/                 # Documentation
```

## Code Style

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use generics for reusable type-safe functions
- Document complex types with JSDoc comments
- Follow consistent naming conventions:
  - `PascalCase` for types and interfaces
  - `camelCase` for variables and functions
  - `UPPER_CASE` for constants

### Example Type Definition

```typescript
/**
 * Enhanced context with metadata and performance tracking
 */
export interface Ctx extends Context {
  /** Type of trigger ('http', 'cron', 'cli', 'message') */
  trigger?: string;
  /** ISO timestamp */
  timestamp?: string;
  // ... other properties
}

/**
 * Link function type - can be sync or async
 */
export type Link<TContext extends Context = Context> = (
  ctx: TContext
) => TContext | Promise<TContext>;
```

### Code Formatting

- Use Prettier for consistent formatting
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Max line length: 80 characters

## Testing

### Writing Tests

- All new features must include tests
- Tests should cover both TypeScript type checking and runtime behavior
- Use descriptive test names that explain the expected behavior
- Include edge cases and error scenarios

### Test Structure

```typescript
describe('Feature Name', () => {
  it('should behave correctly when...', async () => {
    // Arrange
    const context = createContext({ ... });
    
    // Act
    const result = await someFunction(context);
    
    // Assert
    expect(result).toEqual(expectedValue);
    expect(result).toHaveProperty('expectedProperty');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Type Safety Requirements

Since this is a TypeScript wrapper, type safety is paramount:

1. **All exports must be properly typed**
2. **Generic types should be used where appropriate**
3. **No `any` types unless absolutely necessary**
4. **Type definitions must match modulink-js runtime behavior**
5. **Breaking changes to types require major version bump**

## Submitting Changes

### Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Changes**
   - Follow the code style guidelines
   - Add/update tests as needed
   - Update documentation if applicable

3. **Test Your Changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue with specific component"
   ```

5. **Push and Create PR**
   ```bash
   git push origin your-branch-name
   ```

### Commit Message Format

Use conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### PR Requirements

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated (if applicable)
- [ ] Types are properly defined
- [ ] No breaking changes (or properly documented)
- [ ] PR description explains the changes

## Reporting Issues

### Bug Reports

Include the following information:

1. **Environment**
   - Node.js version
   - TypeScript version
   - modulink-ts version
   - Operating system

2. **Reproduction Steps**
   - Minimal code example
   - Expected behavior
   - Actual behavior
   - Error messages (if any)

3. **Additional Context**
   - Screenshots (if applicable)
   - Related issues
   - Possible solutions

### Feature Requests

Include:

1. **Use Case** - Why is this feature needed?
2. **Proposed Solution** - How should it work?
3. **Alternatives** - What alternatives have you considered?
4. **Additional Context** - Any other relevant information

## Community Guidelines

- Be respectful and constructive in all interactions
- Help others learn and grow
- Focus on the code and technical aspects
- Follow the project's code of conduct
- Ask questions if you're unsure about anything

## Getting Help

- Create an issue for bugs or feature requests
- Join discussions in existing issues
- Check the [modulink-js documentation](https://github.com/JoshuaWink/modulink-js) for core concepts
- Review existing code and tests for examples

## Recognition

Contributors will be recognized in:
- CHANGELOG.md
- README.md contributors section
- GitHub contributors list

Thank you for contributing to ModuLink TypeScript! 🚀
