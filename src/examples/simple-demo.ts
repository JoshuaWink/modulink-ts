/**
 * Simple Demo - Working Example
 * 
 * This is a simplified example that works with the current type definitions.
 */

import { chain, createContext } from '../index.js';
import type { IContext, ILink } from '../types.js';

// Define a simple context type
interface SimpleContext extends IContext {
  value?: number;
  result?: string;
  processed?: boolean;
}

// Simple link functions without complex typing
const addTen = (ctx: SimpleContext): SimpleContext => {
  console.log('Adding 10 to value');
  return { ...ctx, value: (ctx.value || 0) + 10 };
};

const multiplyByTwo = (ctx: SimpleContext): SimpleContext => {
  console.log('Multiplying by 2');
  return { ...ctx, value: (ctx.value || 0) * 2 };
};

const createResult = (ctx: SimpleContext): SimpleContext => {
  console.log('Creating result string');
  return { ...ctx, result: `Final value: ${ctx.value}`, processed: true };
};

// Async example
const asyncProcess = async (ctx: SimpleContext): Promise<SimpleContext> => {
  console.log('Processing asynchronously...');
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ...ctx, value: (ctx.value || 0) + 5 };
};

// Simple chain demo
export async function simpleDemo() {
  console.log('=== Simple Chain Demo ===\n');
  
  // Create a simple chain
  const simpleChain = chain(
    addTen,
    asyncProcess,
    multiplyByTwo,
    createResult
  );
  
  // Create context
  const context = createContext({ 
    value: 5,
    trigger: 'demo'
  });
  
  try {
    // Execute the chain
    const result = await simpleChain(context);
    
    console.log('\nChain completed successfully!');
    console.log('Input value:', 5);
    console.log('Final result:', result.result);
    console.log('Processed:', result.processed);
    
    return result;
  } catch (error) {
    console.error('Chain execution failed:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  simpleDemo().catch(console.error);
}
