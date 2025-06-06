# ModuLink TypeScript Examples

This directory contains comprehensive examples demonstrating the features and capabilities of ModuLink TypeScript.

## Running Examples

### Run All Examples
```bash
npm run examples
```

### Run Individual Examples
```bash
# Build first
npm run build

# Run specific example
node dist/examples/basic-chain.js
node dist/examples/middleware.js
node dist/examples/http-context.js
node dist/examples/utilities.js
```

## Example Files

### 1. Basic Chain (`basic-chain.ts`)
Demonstrates fundamental chain creation and execution with type safety:
- Creating custom context types
- Type-safe link functions
- Chain execution with error handling
- Basic TypeScript integration

### 2. Middleware (`middleware.ts`)
Shows middleware capabilities:
- Input/output middleware positioning
- Performance timing middleware
- Custom middleware creation
- Middleware chaining and composition
- Transform middleware usage

### 3. HTTP Context (`http-context.ts`)
Web application examples:
- HTTP-specific context types
- Authentication and authorization chains
- Request validation and processing
- Conditional route handling
- Error handling for web requests

### 4. Utilities (`utilities.ts`)
Advanced utility function examples:
- Parallel execution (`parallel()`)
- Race conditions (`race()`)
- Retry logic (`retry()`)
- Conditional processing (`when()`)
- Data transformation (`transform()`)
- Validation (`validate()`)
- Function composition (`compose()`, `pipe()`)

## Key Features Demonstrated

### Type Safety
- Custom context interfaces extending base types
- Generic type parameters for reusable components
- Compile-time type checking
- IntelliSense support

### Performance
- Parallel processing capabilities
- Timing and performance middleware
- Efficient chain execution
- Race condition handling

### Error Handling
- Graceful error propagation
- Custom error handlers
- Retry mechanisms
- Validation with custom messages

### Middleware System
- Multi-level middleware positioning
- Reusable middleware components
- Performance tracking
- Request/response transformation

## Usage Patterns

### Basic Chain Pattern
```typescript
const chain = chain<MyContext>(
  link1,
  link2,
  link3
);

const result = await chain(context);
```

### Middleware Pattern
```typescript
const enhancedChain = chain<MyContext>(
  // ... links
)
  .use(timingMiddleware)
  .onInput(validationMiddleware)
  .onOutput(responseMiddleware);
```

### Conditional Pattern
```typescript
const conditionalChain = chain<MyContext>(
  when(condition, thenLink),
  // ... other links
);
```

### Parallel Pattern
```typescript
const parallelChain = chain<MyContext>(
  parallel(
    processA,
    processB,
    processC
  ),
  combineResults
);
```

## Context Types

### HTTP Context
```typescript
interface MyHttpContext extends HttpContext {
  user?: User;
  authToken?: string;
  // ... custom properties
}
```

### Custom Context
```typescript
interface MyContext extends Context {
  data?: any;
  processed?: boolean;
  // ... custom properties
}
```

## Best Practices

1. **Define Custom Context Types**: Always extend base context types for type safety
2. **Use Generic Parameters**: Make reusable components with generic types
3. **Error Handling**: Implement proper error handling at appropriate levels
4. **Middleware Positioning**: Use input/output middleware strategically
5. **Performance Monitoring**: Add timing middleware for performance insights
6. **Validation**: Validate inputs early in the chain
7. **Modular Design**: Keep links focused on single responsibilities

## Learning Path

1. Start with `basic-chain.ts` to understand core concepts
2. Move to `middleware.ts` to learn about middleware systems
3. Explore `http-context.ts` for web application patterns
4. Study `utilities.ts` for advanced composition techniques

Each example is self-contained and includes detailed comments explaining the concepts and patterns used.
