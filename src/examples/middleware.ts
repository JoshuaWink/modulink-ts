/**
 * Middleware Example
 * 
 * This example demonstrates how to use middleware with type-safe chains
 * for logging, timing, and data transformation.
 */

import { chain, createContext, timing, logging, transformMiddleware } from '../index.js';
import type { IContext, ILink, IMiddleware } from '../types.js';

// Define context type for API processing
interface ApiContext extends IContext {
  requestId?: string;
  endpoint?: string;
  method?: string;
  requestData?: any;
  responseData?: any;
  status?: number;
  processingTime?: number;
}

// Custom middleware for request ID generation
const requestIdMiddleware: IMiddleware<ApiContext> = (ctx: ApiContext) => {
  if (!ctx.requestId) {
    ctx.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return ctx;
};

// Custom middleware for API response validation
const responseValidationMiddleware: IMiddleware<ApiContext> = (ctx: ApiContext) => {
  if (ctx.responseData && !ctx.status) {
    ctx.status = 200; // Default success status
  }
  return ctx;
};

// Link functions
const authenticateRequest: ILink<ApiContext> = async (ctx) => {
  console.log(`[${ctx.requestId}] Authenticating ${ctx.method} request to ${ctx.endpoint}`);
  
  // Simulate authentication delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return { ...ctx, authenticated: true };
};

const processRequest: ILink<ApiContext> = async (ctx) => {
  console.log(`[${ctx.requestId}] Processing request data`);
  
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const responseData = {
    result: 'success',
    processedAt: new Date().toISOString(),
    requestData: ctx.requestData
  };
  
  return { ...ctx, responseData };
};

const sendResponse: ILink<ApiContext> = (ctx) => {
  console.log(`[${ctx.requestId}] Sending response with status ${ctx.status}`);
  
  return {
    ...ctx,
    sent: true,
    completedAt: new Date().toISOString()
  };
};

// Create chain with middleware
async function middlewareExample() {
  console.log('=== Middleware Example ===\n');
  
  // Create enhanced chain with middleware
  const apiChain = chain(
    authenticateRequest,
    processRequest,
    sendResponse
  )
    // Add timing middleware for performance tracking
    .use(timing('api-request'))
    // Add custom request ID middleware
    .use(requestIdMiddleware)
    // Add input middleware (runs before each link)
    .onInput((ctx: ApiContext) => {
      console.log(`[${ctx.requestId}] Input middleware: Processing started`);
      return ctx;
    })
    // Add output middleware (runs after each link)
    .onOutput(responseValidationMiddleware)
    .onOutput((ctx: ApiContext) => {
      console.log(`[${ctx.requestId}] Output middleware: Link completed`);
      return ctx;
    });
  
  // Create context
  const context = createContext({
    endpoint: '/api/users',
    method: 'POST',
    requestData: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    trigger: 'http'
  });
  
  try {
    // Execute chain with middleware
    const result = await apiChain(context);
    
    console.log('\n=== Chain Result ===');
    console.log('Request ID:', result.requestId);
    console.log('Status:', result.status);
    console.log('Response Data:', result.responseData);
    console.log('Timing:', result.timings);
    console.log('Completed At:', result.completedAt);
    
  } catch (error) {
    console.error('Chain execution failed:', error);
  }
}

// Transform middleware example
async function transformMiddlewareExample() {
  console.log('\n=== Transform Middleware Example ===\n');
  
  // Simple processing chain
  const transformChain = chain(
    (ctx: ApiContext) => {
      console.log('Processing data...');
      return { ...ctx, step1: 'completed' };
    },
    (ctx: ApiContext) => {
      console.log('Finalizing...');
      return { ...ctx, step2: 'completed' };
    }
  )
    // Transform input data
    .onInput(transformMiddleware((ctx: ApiContext) => ({
      transformedAt: new Date().toISOString(),
      originalData: ctx.requestData
    })))
    // Transform output data
    .onOutput(transformMiddleware((ctx: ApiContext) => ({
      finalizedAt: new Date().toISOString(),
      summary: `Processed ${ctx.step1} and ${ctx.step2}`
    })));
  
  const context = createContext({
    requestData: { input: 'test data' },
    trigger: 'cli'
  });
  
  const result = await transformChain(context);
  
  console.log('Transform Result:', {
    transformedAt: result.transformedAt,
    finalizedAt: result.finalizedAt,
    summary: result.summary,
    originalData: result.originalData
  });
}

// Run examples
async function main() {
  await middlewareExample();
  await transformMiddlewareExample();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { middlewareExample, transformMiddlewareExample };
