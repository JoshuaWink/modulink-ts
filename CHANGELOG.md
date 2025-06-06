# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-06-06

### Added
- Initial release of ModuLink TypeScript wrapper
- Complete TypeScript type definitions for modulink-js
- Zero-overhead TypeScript wrapper maintaining 100% API compatibility
- Comprehensive test suite with 16 test cases covering:
  - Basic chain functionality with type safety
  - Middleware support (input, output, global)
  - Context type creation and validation
  - Utility functions (when, transform, parallel, etc.)
  - Error handling
  - ModuLink instance creation
- Complete documentation with README.md, examples, and API reference
- Build system with TypeScript compilation and declaration generation
- Example files demonstrating:
  - Basic chain usage
  - Middleware patterns
  - HTTP context handling
  - Utility function usage
- Contributing guidelines and project structure
- CI/CD pipeline with GitHub Actions
- Apache 2.0 license

### Features
- **Full TypeScript Support**: Complete type definitions with generics
- **Zero Runtime Overhead**: Pure type layer over modulink-js
- **100% API Compatibility**: Identical to modulink-js API
- **IntelliSense & Autocomplete**: Rich IDE support
- **Compile-time Safety**: Catch errors before runtime
- **Generic Context Types**: Custom context object types
- **Comprehensive Test Coverage**: Full test suite included

### Dependencies
- modulink-js: ^3.0.0 (runtime dependency)
- TypeScript: ^5.8.3 (dev dependency)
- Vitest: ^3.2.2 (dev dependency)

### Supported Node.js Versions
- Node.js 16.x and higher

[Unreleased]: https://github.com/JoshuaWink/modulink-ts/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/JoshuaWink/modulink-ts/releases/tag/v1.0.0
