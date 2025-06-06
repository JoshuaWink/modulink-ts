# ModuLink TypeScript

TypeScript wrapper for [modulink-js](https://github.com/JoshuaWink/modulink-js) providing full type safety and IntelliSense support while maintaining 100% API compatibility.

## Overview

ModuLink TypeScript is a zero-overhead TypeScript wrapper that adds comprehensive type definitions to the modulink-js library. It provides the same powerful composable function chains and multi-level middleware system with the added benefits of TypeScript's compile-time safety and enhanced developer experience.

## Features

- ✅ **Full TypeScript Support** - Complete type definitions with generics
- ✅ **Zero Runtime Overhead** - Pure type layer over modulink-js
- ✅ **100% API Compatibility** - Identical to modulink-js API
- ✅ **IntelliSense & Autocomplete** - Rich IDE support
- ✅ **Compile-time Safety** - Catch errors before runtime
- ✅ **Generic Context Types** - Custom context object types
- ✅ **Comprehensive Test Coverage** - Full test suite included

## Installation

```bash
npm install modulink-ts
```

## Quick Start

```typescript
import { chain, createContext } from 'modulink-ts';
import type { Context, Link } from 'modulink-ts';

// Define your context type
interface UserContext extends Context {
  userId?: string;
  userData?: {
    name: string;
    email: string;
  };
  processed?: boolean;
}

// Create type-safe links
const fetchUser: Link<UserContext> = async (ctx) => {
  // TypeScript knows ctx has userId, userData, etc.
  const userData = await getUserById(ctx.userId);
  return { ...ctx, userData };
};

const processUser: Link<UserContext> = (ctx) => {
  // Full IntelliSense support
  console.log(\`Processing user: \${ctx.userData?.name}\`);
  return { ...ctx, processed: true };
};

// Create and execute chain
const userChain = chain(fetchUser, processUser);
const result = await userChain({ userId: '123' });

console.log(result.processed); // TypeScript knows this exists
```

## Core Concepts

### Enhanced Context Types

```typescript
import type { Ctx, HttpContext, CronContext } from 'modulink-ts';

// Base enhanced context with metadata
interface MyContext extends Ctx {
  customField: string;
}

// HTTP-specific context
interface ApiContext extends HttpContext {
  apiKey: string;
  requestId: string;
}
```

### Type-Safe Links

```typescript
import type { Link } from 'modulink-ts';

// Strongly typed link functions
const validateInput: Link<ApiContext> = (ctx) => {
  if (!ctx.apiKey) {
    throw new Error('API key required');
  }
  return ctx;
};

const logRequest: Link<ApiContext> = (ctx) => {
  console.log(\`Request \${ctx.requestId} from \${ctx.method} \${ctx.url}\`);
  return ctx;
};
```

### Middleware with Type Safety

```typescript
import { chain } from 'modulink-ts';
import type { Middleware } from 'modulink-ts';

const timingMiddleware: Middleware<MyContext> = (ctx) => {
  const startTime = Date.now();
  return {
    ...ctx,
    timings: { ...ctx.timings, startTime }
  };
};

const myChain = chain(validateInput, processData)
  .use(timingMiddleware)
  .onInput(logRequest)
  .onOutput(logResponse);
```

## Advanced Usage

### Custom Context Types

```typescript
interface OrderProcessingContext extends Context {
  orderId: string;
  order?: Order;
  inventory?: InventoryItem[];
  payment?: PaymentResult;
  shipping?: ShippingResult;
  completed?: boolean;
}

const validateOrder: Link<OrderProcessingContext> = async (ctx) => {
  const order = await getOrder(ctx.orderId);
  if (!order) {
    throw new Error(\`Order \${ctx.orderId} not found\`);
  }
  return { ...ctx, order };
};

const checkInventory: Link<OrderProcessingContext> = async (ctx) => {
  const inventory = await checkInventoryForOrder(ctx.order!);
  return { ...ctx, inventory };
};

const processPayment: Link<OrderProcessingContext> = async (ctx) => {
  const payment = await processOrderPayment(ctx.order!);
  return { ...ctx, payment };
};

const orderChain = chain(
  validateOrder,
  checkInventory,
  processPayment
);
```

### Utility Functions

```typescript
import { when, transform, parallel, retry } from 'modulink-ts';

// Conditional execution
const conditionalProcessing = when(
  (ctx: OrderProcessingContext) => ctx.order?.total > 100,
  applyDiscount
);

// Data transformation
const addMetadata = transform((ctx: OrderProcessingContext) => ({
  ...ctx,
  metadata: {
    processedAt: new Date().toISOString(),
    version: '1.0'
  }
}));

// Parallel execution
const parallelValidation = parallel(
  validateUser,
  validatePayment,
  validateInventory
);

// Retry with error handling
const reliableApiCall = retry(callExternalApi, 3, 1000);
```

### Error Handling

```typescript
import { errorHandler } from 'modulink-ts';

const handleOrderErrors = errorHandler((error: any, ctx: OrderProcessingContext) => {
  console.error(\`Order processing failed: \${error.message}\`);
  return {
    ...ctx,
    error: {
      message: error.message,
      orderId: ctx.orderId,
      timestamp: new Date().toISOString()
    }
  };
});

const orderChain = chain(validateOrder, processOrder)
  .use(handleOrderErrors);
```

## API Reference

### Types

- `Context` - Base context interface
- `Ctx` - Enhanced context with ModuLink metadata
- `HttpContext`, `CronContext`, `CliContext`, `MessageContext` - Specialized contexts
- `Link<T>` - Function that processes context
- `Middleware<T>` - Middleware function type
- `Chain<T>` - Async chain function
- `EnhancedChain<T>` - Chain with middleware API

### Functions

- `chain(...links)` - Create a new chain
- `createModuLink(app?)` - Create ModuLink instance
- `createContext(data?)` - Create basic context
- `createHttpContext(data?)` - Create HTTP context
- `when(condition, thenChain)` - Conditional execution
- `transform(transformer)` - Data transformation
- `parallel(...links)` - Parallel execution
- `retry(chain, maxRetries?, delayMs?)` - Retry logic

## Relationship to modulink-js

ModuLink TypeScript is a pure TypeScript wrapper around modulink-js:

- **Runtime**: Uses modulink-js as a dependency
- **Types**: Adds comprehensive TypeScript definitions
- **API**: 100% compatible with modulink-js API
- **Performance**: Zero runtime overhead
- **Maintenance**: Single source of truth in modulink-js

This approach ensures:
- JavaScript users can stay on modulink-js
- TypeScript users get full type safety
- Bug fixes and features implemented once
- Easy migration path between packages

## Migration from modulink-js

Migrating from modulink-js to modulink-ts is straightforward:

1. **Install**: `npm install modulink-ts`
2. **Update imports**: Change `modulink-js` to `modulink-ts`
3. **Add types**: Optionally add TypeScript interfaces for your contexts
4. **No code changes**: Your existing logic works unchanged

```typescript
// Before (modulink-js)
import { chain } from 'modulink-js';

// After (modulink-ts)
import { chain } from 'modulink-ts';
import type { Context, Link } from 'modulink-ts';
```

## Development

```bash
# Clone the repository
git clone https://github.com/JoshuaWink/modulink-ts.git
cd modulink-ts

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## Contributing

Contributions are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for details.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## Related Projects

- [modulink-js](https://github.com/JoshuaWink/modulink-js) - Core JavaScript implementation
- [modulink-py](https://github.com/JoshuaWink/modulink-py) - Python implementation

## Support

- 📖 [Documentation](https://github.com/JoshuaWink/modulink-ts/wiki)
- 🐛 [Issues](https://github.com/JoshuaWink/modulink-ts/issues)
- 💬 [Discussions](https://github.com/JoshuaWink/modulink-ts/discussions)
