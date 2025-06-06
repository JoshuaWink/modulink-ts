/**
 * ModuLink TypeScript Tests
 * 
 * Comprehensive test suite ensuring TypeScript wrapper maintains full functionality
 * and type safety while preserving API compatibility with modulink-js.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  chain, 
  createModuLink,
  createContext,
  createHttpContext,
  createCronContext,
  createCliContext,
  createMessageContext,
  createErrorContext,
  getCurrentTimestamp,
  utils,
  when,
  errorHandler,
  validate,
  retry,
  transform,
  addData,
  pick,
  omit,
  parallel,
  race
} from '../src/index.js';

import type { 
  Context, 
  Ctx,
  HttpContext,
  Link, 
  Middleware,
  EnhancedChain 
} from '../src/types.js';

describe('ModuLink TypeScript Wrapper', () => {
  describe('Basic Chain Functionality', () => {
    it('should create and execute a basic chain with type safety', async () => {
      interface TestContext extends Context {
        initial?: boolean;
        link1?: boolean;
        link2?: boolean;
        value?: number;
      }

      const link1: Link<TestContext> = (ctx) => {
        return { ...ctx, link1: true, value: (ctx.value || 0) + 1 };
      };

      const link2: Link<TestContext> = (ctx) => {
        return { ...ctx, link2: true, value: (ctx.value || 0) * 2 };
      };

      const chainFn = chain(link1, link2);
      const result = await chainFn({ initial: true, value: 5 });

      expect(result.initial).toBe(true);
      expect(result.link1).toBe(true);
      expect(result.link2).toBe(true);
      expect(result.value).toBe(12); // (5 + 1) * 2
    });

    it('should support async links', async () => {
      interface AsyncContext extends Context {
        asyncResult?: string;
        delay?: number;
      }

      const asyncLink: Link<AsyncContext> = async (ctx) => {
        await new Promise(resolve => setTimeout(resolve, ctx.delay || 10));
        return { ...ctx, asyncResult: 'completed' };
      };

      const chainFn = chain(asyncLink);
      const result = await chainFn({ delay: 10 });

      expect(result.asyncResult).toBe('completed');
    });
  });

  describe('Middleware Support', () => {
    it('should support middleware with use()', async () => {
      interface MiddlewareContext extends Context {
        initial?: boolean;
        link1?: boolean;
        middleware1?: boolean;
        globalMiddleware?: boolean;
      }

      const link1: Link<MiddlewareContext> = (ctx) => {
        return { ...ctx, link1: true };
      };

      const middleware1: Middleware<MiddlewareContext> = (ctx) => {
        return { ...ctx, middleware1: true };
      };

      const globalMiddleware: Middleware<MiddlewareContext> = (ctx) => {
        return { ...ctx, globalMiddleware: true };
      };

      const chainFn = chain(link1)
        .use(globalMiddleware)
        .use.onInput(middleware1);

      const result = await chainFn({ initial: true });

      expect(result.initial).toBe(true);
      expect(result.link1).toBe(true);
      expect(result.middleware1).toBe(true);
      expect(result.globalMiddleware).toBe(true);
    });

    it('should support input and output middleware positioning', async () => {
      interface PositionContext extends Context {
        inputMiddleware?: boolean;
        outputMiddleware?: boolean;
        link?: boolean;
        order?: string[];
      }

      const inputMiddleware: Middleware<PositionContext> = (ctx) => {
        const order = ctx.order || [];
        return { ...ctx, inputMiddleware: true, order: [...order, 'input'] };
      };

      const outputMiddleware: Middleware<PositionContext> = (ctx) => {
        const order = ctx.order || [];
        return { ...ctx, outputMiddleware: true, order: [...order, 'output'] };
      };

      const mainLink: Link<PositionContext> = (ctx) => {
        const order = ctx.order || [];
        return { ...ctx, link: true, order: [...order, 'link'] };
      };

      const chainFn = chain(mainLink)
        .onInput(inputMiddleware)
        .onOutput(outputMiddleware);

      const result = await chainFn({ order: [] });

      expect(result.inputMiddleware).toBe(true);
      expect(result.outputMiddleware).toBe(true);
      expect(result.link).toBe(true);
      expect(result.order).toEqual(['input', 'link', 'output']);
    });
  });

  describe('Context Types', () => {
    it('should create typed contexts', () => {
      const basicCtx = createContext({ test: 'value' });
      expect(basicCtx.test).toBe('value');
      expect(basicCtx.timestamp).toBeDefined();

      const httpCtx = createHttpContext({ 
        method: 'GET', 
        url: '/test',
        body: { data: 'test' }
      });
      expect(httpCtx.trigger).toBe('http');
      expect(httpCtx.method).toBe('GET');
      expect(httpCtx.url).toBe('/test');
      expect(httpCtx.body.data).toBe('test');

      const cronCtx = createCronContext({ 
        cronExpression: '0 * * * *' 
      });
      expect(cronCtx.trigger).toBe('cron');
      expect(cronCtx.cronExpression).toBe('0 * * * *');

      const cliCtx = createCliContext({ 
        args: ['--verbose'],
        command: 'test'
      });
      expect(cliCtx.trigger).toBe('cli');
      expect(cliCtx.args).toEqual(['--verbose']);
      expect(cliCtx.command).toBe('test');

      const msgCtx = createMessageContext({ 
        topic: 'user.created',
        message: { userId: 123 }
      });
      expect(msgCtx.trigger).toBe('message');
      expect(msgCtx.topic).toBe('user.created');
      expect(msgCtx.message.userId).toBe(123);
    });

    it('should create error contexts', () => {
      const error = new Error('Test error');
      const errorCtx = createErrorContext(error);
      
      expect(errorCtx.error.message).toBe('Test error');
      expect(errorCtx.error.name).toBe('Error');
      expect(errorCtx.error.stack).toBeDefined();
    });

    it('should generate timestamps', () => {
      const timestamp = getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Utility Functions', () => {
    it('should support conditional execution with when()', async () => {
      interface ConditionalContext extends Context {
        shouldExecute?: boolean;
        executed?: boolean;
        value?: number;
      }

      const executeLink: Link<ConditionalContext> = (ctx) => {
        return { ...ctx, executed: true };
      };

      const conditionalChain = when(
        (ctx: ConditionalContext) => ctx.shouldExecute === true,
        executeLink
      );

      const result1 = await conditionalChain({ shouldExecute: true });
      expect(result1.executed).toBe(true);

      const result2 = await conditionalChain({ shouldExecute: false });
      expect(result2.executed).toBeUndefined();
    });

    it('should support data transformation utilities', async () => {
      interface TransformContext extends Context {
        data?: any;
        picked?: any;
        omitted?: any;
        added?: any;
        transformed?: any;
      }

      const transformLink = transform((ctx: TransformContext) => ({
        ...ctx,
        transformed: `processed-${ctx.data}`
      }));

      const addDataLink = addData({
        added: 'new-value'
      });

      const pickLink = pick(['data', 'added', 'transformed']);

      const chainFn = chain(
        transformLink,
        addDataLink,
        pickLink
      );

      const result = await chainFn({ data: 'test', extra: 'remove' });

      expect(result.transformed).toBe('processed-test');
      expect(result.added).toBe('new-value');
      expect(result.data).toBe('test');
      expect(result.extra).toBeUndefined(); // Should be picked out
    });

    it('should support parallel execution', async () => {
      interface ParallelContext extends Context {
        value?: number;
        link1?: boolean;
        link2?: boolean;
        link3?: boolean;
      }

      const link1: Link<ParallelContext> = async (ctx) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { ...ctx, link1: true };
      };

      const link2: Link<ParallelContext> = async (ctx) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { ...ctx, link2: true };
      };

      const link3: Link<ParallelContext> = async (ctx) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { ...ctx, link3: true };
      };

      const parallelLink = parallel(link1, link2, link3);
      const chainFn = chain(parallelLink);

      const startTime = Date.now();
      const result = await chainFn({ value: 1 });
      const endTime = Date.now();

      expect(result.link1).toBe(true);
      expect(result.link2).toBe(true);
      expect(result.link3).toBe(true);
      // Should complete faster than sequential execution
      expect(endTime - startTime).toBeLessThan(25);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      interface ErrorContext extends Context {
        shouldError?: boolean;
        beforeError?: boolean;
        afterError?: boolean;
      }

      const errorLink: Link<ErrorContext> = (ctx) => {
        if (ctx.shouldError) {
          throw new Error('Test error');
        }
        return { ...ctx, beforeError: true };
      };

      const afterErrorLink: Link<ErrorContext> = (ctx) => {
        return { ...ctx, afterError: true };
      };

      const chainFn = chain(errorLink, afterErrorLink);

      const result = await chainFn({ shouldError: true });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Test error');
      expect(result.beforeError).toBeUndefined();
      expect(result.afterError).toBeUndefined(); // Chain stops on error
    });

    it('should support error handling middleware', async () => {
      interface ErrorHandlingContext extends Context {
        shouldError?: boolean;
        errorHandled?: boolean;
      }

      const erroringLink: Link<ErrorHandlingContext> = (ctx) => {
        if (ctx.shouldError) {
          throw new Error('Test error');
        }
        return ctx;
      };

      const errorHandlerMiddleware = errorHandler((error: any, ctx: ErrorHandlingContext) => {
        return { ...ctx, errorHandled: true };
      });

      const chainFn = chain(erroringLink).use(errorHandlerMiddleware);

      const result = await chainFn({ shouldError: true });

      expect(result.error).toBeDefined();
      expect(result.errorHandled).toBe(true);
    });
  });

  describe('ModuLink Instance', () => {
    it('should create ModuLink instances', () => {
      const modulink = createModuLink();
      
      expect(modulink).toBeDefined();
      expect(typeof modulink.use).toBe('function');
      expect(typeof modulink.connect).toBe('function');
    });

    it('should support instance-level middleware', () => {
      const modulink = createModuLink();
      const middleware = (ctx: Context) => ctx;
      
      const result = modulink.use(middleware);
      expect(result).toBe(modulink); // Should return self for chaining
    });
  });
});

describe('Type Safety', () => {
  it('should enforce type constraints at compile time', () => {
    // These tests primarily ensure TypeScript compilation passes
    // with proper type constraints

    interface StrictContext extends Context {
      requiredField: string;
      optionalField?: number;
    }

    const strictLink: Link<StrictContext> = (ctx) => {
      // TypeScript should enforce that requiredField exists
      const field = ctx.requiredField; // Should not error
      return { ...ctx, optionalField: 42 };
    };

    const chainFn = chain(strictLink);
    
    // This should compile fine
    expect(typeof chainFn).toBe('function');
  });

  it('should provide proper IntelliSense support', () => {
    // This test ensures the types are properly exported
    // and available for IntelliSense

    interface TestContext extends Context {
      testField: string;
    }

    const link: Link<TestContext> = (ctx) => {
      // IntelliSense should suggest 'testField' here
      return { ...ctx, testField: ctx.testField.toUpperCase() };
    };

    expect(typeof link).toBe('function');
  });
});
