/**
 * Utility Functions Example
 * 
 * This example demonstrates the various utility functions available
 * in ModuLink TypeScript for advanced chain composition.
 */

import { 
  chain, 
  createContext, 
  parallel, 
  race, 
  retry, 
  when, 
  transform, 
  validate
} from '../index.js';
import type { IContext, ILink } from '../types.js';

// Define context for data processing
interface DataContext extends IContext {
  inputData?: any;
  processedData?: any;
  validationResult?: boolean;
  transformedData?: any;
  results?: any[];
  errors?: string[];
  attempts?: number;
}

// Sample processing functions
const fetchData: ILink<DataContext> = async (ctx) => {
  console.log('Fetching data...');
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ...ctx, inputData: { value: 42, status: 'active' } };
};

const processDataA: ILink<DataContext> = async (ctx) => {
  console.log('Processing A...');
  await new Promise(resolve => setTimeout(resolve, 150));
  return { ...ctx, resultA: 'A completed' };
};

const processDataB: ILink<DataContext> = async (ctx) => {
  console.log('Processing B...');
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...ctx, resultB: 'B completed' };
};

const processDataC: ILink<DataContext> = async (ctx) => {
  console.log('Processing C...');
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ...ctx, resultC: 'C completed' };
};

// Flaky function for retry demonstration
const flakyProcess: ILink<DataContext> = async (ctx) => {
  const attempt = (ctx.attempts || 0) + 1;
  console.log(`Flaky process attempt ${attempt}`);
  
  if (attempt < 3) {
    throw new Error(`Attempt ${attempt} failed`);
  }
  
  return { ...ctx, attempts: attempt, flakyResult: 'Finally succeeded!' };
};

// Parallel processing example
async function parallelExample() {
  console.log('=== Parallel Processing Example ===\n');
  
  const parallelChain = chain(
    fetchData,
    // Process A, B, and C in parallel
    parallel(
      processDataA,
      processDataB,
      processDataC
    ),
    (ctx: DataContext) => {
      console.log('All parallel processes completed');
      return { 
        ...ctx, 
        summary: `Results: ${ctx.resultA}, ${ctx.resultB}, ${ctx.resultC}` 
      };
    }
  );
  
  const context = createContext({ trigger: 'cli' });
  const result = await parallelChain(context);
  
  console.log('Parallel result:', {
    resultA: result.resultA,
    resultB: result.resultB,
    resultC: result.resultC,
    summary: result.summary
  });
}

// Race example - first one wins
async function raceExample() {
  console.log('\n=== Race Example ===\n');
  
  const fastProcess: ILink<DataContext> = async (ctx) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { ...ctx, winner: 'Fast process won!' };
  };
  
  const slowProcess: ILink<DataContext> = async (ctx) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...ctx, winner: 'Slow process won!' };
  };
  
  const raceChain = chain(
    // Race between fast and slow process
    race(fastProcess, slowProcess),
    (ctx: DataContext) => {
      console.log('Race completed');
      return ctx;
    }
  );
  
  const context = createContext({ trigger: 'cli' });
  const result = await raceChain(context);
  
  console.log('Race winner:', result.winner);
}

// Retry example
async function retryExample() {
  console.log('\n=== Retry Example ===\n');
  
  const retryChain = chain(
    // Retry flaky process up to 3 times with 100ms delay
    retry(flakyProcess, 3, 100),
    (ctx: DataContext) => {
      console.log(`Success after ${ctx.attempts} attempts`);
      return ctx;
    }
  );
  
  const context = createContext({ trigger: 'cli' });
  
  try {
    const result = await retryChain(context);
    console.log('Retry result:', {
      attempts: result.attempts,
      result: result.flakyResult
    });
  } catch (error) {
    console.error('Retry failed:', error);
  }
}

// Conditional processing with 'when'
async function conditionalExample() {
  console.log('\n=== Conditional Processing Example ===\n');
  
  const conditionalChain = chain(
    fetchData,
    // Only process if data is active
    when(
      (ctx: DataContext) => ctx.inputData?.status === 'active',
      (ctx: DataContext) => {
        console.log('Data is active, processing...');
        return { ...ctx, processed: true };
      }
    ),
    // Only validate if processed
    when(
      (ctx: DataContext) => ctx.processed === true,
      (ctx: DataContext) => {
        console.log('Validating processed data...');
        return { ...ctx, validated: true };
      }
    )
  );
  
  const context = createContext({ trigger: 'cli' });
  const result = await conditionalChain(context);
  
  console.log('Conditional result:', {
    inputData: result.inputData,
    processed: result.processed,
    validated: result.validated
  });
}

// Transform example
async function transformExample() {
  console.log('\n=== Transform Example ===\n');
  
  const transformChain = chain(
    fetchData,
    // Transform the data
    transform((ctx: DataContext) => ({
      ...ctx,
      transformedData: {
        originalValue: ctx.inputData?.value,
        doubledValue: (ctx.inputData?.value || 0) * 2,
        transformedAt: new Date().toISOString()
      }
    })),
    (ctx: DataContext) => {
      console.log('Transform completed');
      return ctx;
    }
  );
  
  const context = createContext({ trigger: 'cli' });
  const result = await transformChain(context);
  
  console.log('Transform result:', result.transformedData);
}

// Validation example
async function validationExample() {
  console.log('\n=== Validation Example ===\n');
  
  const validationChain = chain(
    fetchData,
    // Validate the data before processing
    validate(
      (ctx: DataContext) => {
        if (!ctx.inputData) return 'Input data is required';
        if (ctx.inputData.value < 0) return 'Value must be positive';
        if (ctx.inputData.status !== 'active') return 'Data must be active';
        return true;
      },
      (ctx: DataContext) => {
        console.log('Data validation passed, processing...');
        return { ...ctx, processedData: `Processed: ${ctx.inputData.value}` };
      }
    )
  );
  
  // Test with valid data
  console.log('Testing with valid data:');
  const validContext = createContext({ trigger: 'cli' });
  const validResult = await validationChain(validContext);
  console.log('Valid result:', validResult.processedData);
  
  // Test with invalid data
  console.log('\nTesting with invalid data:');
  const invalidChain = chain(
    (ctx: DataContext) => ({ ...ctx, inputData: { value: -10, status: 'inactive' } }),
    validate(
      (ctx: DataContext) => {
        if (ctx.inputData.value < 0) return 'Value must be positive';
        return true;
      },
      (ctx: DataContext) => ({ ...ctx, processed: true })
    )
  );
  
  try {
    await invalidChain(createContext({ trigger: 'cli' }));
  } catch (error) {
    console.log('Validation error:', (error as Error).message);
  }
}

// Chain composition example using regular chain
async function compositionExample() {
  console.log('\n=== Chain Composition Example ===\n');
  
  // Define simple transformation links
  const addOne: ILink<DataContext> = (ctx) => ({ 
    ...ctx, 
    value: (ctx.value || 0) + 1 
  });
  
  const multiplyByTwo: ILink<DataContext> = (ctx) => ({ 
    ...ctx, 
    value: (ctx.value || 0) * 2 
  });
  
  const toString: ILink<DataContext> = (ctx) => ({ 
    ...ctx, 
    result: `Result: ${ctx.value}` 
  });
  
  // Compose using chain (left-to-right execution)
  const composedChain = chain(addOne, multiplyByTwo, toString);
  
  console.log('Using chain composition:');
  const result = await composedChain(createContext({ value: 5 }));
  console.log('Chain result:', result.result); // Result: 12 ((5 + 1) * 2)
}

// Run all examples
async function main() {
  await parallelExample();
  await raceExample();
  await retryExample();
  await conditionalExample();
  await transformExample();
  await validationExample();
  await compositionExample();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  parallelExample,
  raceExample,
  retryExample,
  conditionalExample,
  transformExample,
  validationExample,
  compositionExample
};
