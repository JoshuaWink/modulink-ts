/**
 * HTTP Context Example
 * 
 * This example demonstrates working with HTTP-specific contexts
 * and building web application handlers with type safety.
 */

import { chain, createHttpContext, when, errorHandler } from '../index.js';
import type { IHttpContext, ILink } from '../types.js';

// Define extended HTTP context for our web app
interface WebAppContext extends IHttpContext {
  user?: {
    id: string;
    name: string;
    role: string;
  };
  authToken?: string;
  validationErrors?: string[];
  responseBody?: any;
}

// Authentication link
const authenticate: ILink<WebAppContext> = async (ctx) => {
  console.log(`Authenticating ${ctx.method} request to ${ctx.url}`);
  
  const authHeader = ctx.headers?.['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  
  // Simulate token validation
  if (token === 'valid-token') {
    return {
      ...ctx,
      authToken: token,
      user: {
        id: '123',
        name: 'John Doe',
        role: 'admin'
      }
    };
  } else {
    throw new Error('Invalid token');
  }
};

// Authorization link
const authorize: ILink<WebAppContext> = (ctx) => {
  if (!ctx.user) {
    throw new Error('User not authenticated');
  }
  
  // Check if user has required permissions
  if (ctx.url?.includes('/admin') && ctx.user.role !== 'admin') {
    throw new Error('Insufficient permissions');
  }
  
  console.log(`User ${ctx.user.name} authorized for ${ctx.url}`);
  return ctx;
};

// Validate request data
const validateRequest: ILink<WebAppContext> = (ctx) => {
  const errors: string[] = [];
  
  if (ctx.method === 'POST' || ctx.method === 'PUT') {
    if (!ctx.body) {
      errors.push('Request body is required');
    } else {
      if (ctx.body.name && ctx.body.name.length < 2) {
        errors.push('Name must be at least 2 characters');
      }
      if (ctx.body.email && !ctx.body.email.includes('@')) {
        errors.push('Invalid email format');
      }
    }
  }
  
  if (errors.length > 0) {
    return { ...ctx, validationErrors: errors };
  }
  
  return ctx;
};

// Process the main business logic
const processRequest: ILink<WebAppContext> = async (ctx) => {
  if (ctx.validationErrors && ctx.validationErrors.length > 0) {
    return {
      ...ctx,
      responseBody: {
        error: 'Validation failed',
        details: ctx.validationErrors
      }
    };
  }
  
  console.log(`Processing ${ctx.method} request for user ${ctx.user?.name}`);
  
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let responseBody;
  
  switch (ctx.method) {
    case 'GET':
      responseBody = {
        message: 'Data retrieved successfully',
        data: { id: 1, name: 'Sample Data', owner: ctx.user?.name }
      };
      break;
    case 'POST':
      responseBody = {
        message: 'Resource created successfully',
        data: { id: Date.now(), ...ctx.body, createdBy: ctx.user?.name }
      };
      break;
    case 'PUT':
      responseBody = {
        message: 'Resource updated successfully',
        data: { ...ctx.body, updatedBy: ctx.user?.name }
      };
      break;
    case 'DELETE':
      responseBody = {
        message: 'Resource deleted successfully'
      };
      break;
    default:
      responseBody = { message: 'Method not supported' };
  }
  
  return { ...ctx, responseBody };
};

// Send HTTP response
const sendResponse: ILink<WebAppContext> = (ctx) => {
  let status = 200;
  
  if (ctx.validationErrors && ctx.validationErrors.length > 0) {
    status = 400;
  } else if (ctx.method === 'POST') {
    status = 201;
  }
  
  console.log(`Sending ${status} response`);
  
  return {
    ...ctx,
    response: {
      status,
      body: ctx.responseBody,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': ctx.requestId || 'unknown'
      }
    }
  };
};

// Create different chains for different scenarios
async function httpContextExample() {
  console.log('=== HTTP Context Example ===\n');
  
  // Main application chain
  const appChain = chain(
    authenticate,
    authorize,
    validateRequest,
    processRequest,
    sendResponse
  )
    .use(errorHandler((error: Error, ctx: WebAppContext) => {
      console.error('Request failed:', error.message);
      return {
        ...ctx,
        response: {
          status: error.message.includes('auth') ? 401 : 
                 error.message.includes('permission') ? 403 : 500,
          body: { error: error.message }
        }
      };
    }));
  
  // Test scenarios
  const scenarios = [
    {
      name: 'Valid GET request',
      context: createHttpContext({
        method: 'GET',
        url: '/api/data',
        headers: {
          'authorization': 'Bearer valid-token'
        }
      })
    },
    {
      name: 'Valid POST request',
      context: createHttpContext({
        method: 'POST',
        url: '/api/users',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      })
    },
    {
      name: 'Invalid POST request (validation error)',
      context: createHttpContext({
        method: 'POST',
        url: '/api/users',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: {
          name: 'J', // Too short
          email: 'invalid-email' // Invalid format
        }
      })
    },
    {
      name: 'Unauthorized request',
      context: createHttpContext({
        method: 'GET',
        url: '/api/data',
        headers: {
          'authorization': 'Bearer invalid-token'
        }
      })
    },
    {
      name: 'Admin-only request',
      context: createHttpContext({
        method: 'GET',
        url: '/admin/settings',
        headers: {
          'authorization': 'Bearer valid-token'
        }
      })
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);
    try {
      const result = await appChain(scenario.context);
      console.log('Response:', {
        status: result.response?.status,
        body: result.response?.body
      });
    } catch (error) {
      console.error('Unhandled error:', error);
    }
  }
}

// Conditional processing example
async function conditionalProcessingExample() {
  console.log('\n\n=== Conditional Processing Example ===\n');
  
  // Chain with conditional logic
  const conditionalChain = chain(
    // Only authenticate if not a public endpoint
    when(
      (ctx: WebAppContext) => !ctx.url?.includes('/public'),
      authenticate
    ),
    // Only validate admin permissions for admin routes
    when(
      (ctx: WebAppContext) => Boolean(ctx.url?.includes('/admin')),
      authorize
    ),
    processRequest,
    sendResponse
  );
  
  const publicRequest = createHttpContext({
    method: 'GET',
    url: '/public/info'
  });
  
  console.log('Processing public request...');
  const result = await conditionalChain(publicRequest);
  console.log('Public response:', result.response);
}

// Run examples
async function main() {
  await httpContextExample();
  await conditionalProcessingExample();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { httpContextExample, conditionalProcessingExample };
