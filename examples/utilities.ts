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
  validate,
  compose,
  pipe
} from 'modulink-ts';
import type { Context, Link } from 'modulink-ts';

// Define context for data processing
interface DataContext extends Context {
  inputData?: any;
  processedData?: any;
  validationResult?: boolean;
  transformedData?: any;
  results?: any[];
  errors?: string[];
  attempts?: number;
}

// Sample processing functions
const fetchData: Link<DataContext> = async (ctx) => {
  console.log('Fetching data...');
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ...ctx, inputData: { value: 42, status: 'active' } };
};

const processDataA: Link<DataContext> = async (ctx) => {
  console.log('Processing A...');
  await new Promise(resolve => setTimeout(resolve, 150));
  return { ...ctx, resultA: 'A completed' };
};

const processDataB: Link<DataContext> = async (ctx) => {
  console.log('Processing B...');
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...ctx, resultB: 'B completed' };
};

const processDataC: Link<DataContext> = async (ctx) => {
  console.log('Processing C...');
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ...ctx, resultC: 'C completed' };
};

// Flaky function for retry demonstration
const flakyProcess: Link<DataContext> = async (ctx) => {
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
  
  const parallelChain = chain<DataContext>(
    fetchData,
    // Process A, B, and C in parallel
    parallel<DataContext>(
      processDataA,
      processDataB,
      processDataC
    ),
    (ctx) => {
      console.log('All parallel processes completed');
      return { 
        ...ctx, 
        summary: `Results: ${ctx.resultA}, ${ctx.resultB}, ${ctx.resultC}` 
      };
    }
  );
  
  const context = createContext<DataContext>({ trigger: 'cli' });
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
  
  const fastProcess: Link<DataContext> = async (ctx) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { ...ctx, winner: 'Fast process won!' };
  };
  
  const slowProcess: Link<DataContext> = async (ctx) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...ctx, winner: 'Slow process won!' };
  };
  
  const raceChain = chain<DataContext>(
    // Race between fast and slow process
    race<DataContext>(fastProcess, slowProcess),
    (ctx) => {
      console.log('Race completed');
      return ctx;
    }
  );
  
  const context = createContext<DataContext>({ trigger: 'cli' });
  const result = await raceChain(context);
  
  console.log('Race winner:', result.winner);
}

// Retry example
async function retryExample() {
  console.log('\n=== Retry Example ===\n');
  
  const retryChain = chain<DataContext>(
    // Retry flaky process up to 3 times with 100ms delay
    retry<DataContext>(flakyProcess, 3, 100),
    (ctx) => {
      console.log(`Success after ${ctx.attempts} attempts`);
      return ctx;
    }
  );
  
  const context = createContext<DataContext>({ trigger: 'cli' });
  
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
  
  const conditionalChain = chain<DataContext>(
    fetchData,
    // Only process if data is active
    when<DataContext>(
      (ctx) => ctx.inputData?.status === 'active',
      (ctx) => {
        console.log('Data is active, processing...');
        return { ...ctx, processed: true };
      }
    ),
    // Only validate if processed
    when<DataContext>(
      (ctx) => ctx.processed === true,
      (ctx) => {
        console.log('Validating processed data...');
        return { ...ctx, validated: true };
      }
    )
  );
  
  const context = createContext<DataContext>({ trigger: 'cli' });
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
  
  const transformChain = chain<DataContext>(
    fetchData,
    // Transform the data
    transform<DataContext>((ctx) => ({
      ...ctx,
      transformedData: {
        originalValue: ctx.inputData?.value,
        doubledValue: (ctx.inputData?.value || 0) * 2,
        transformedAt: new Date().toISOString()
      }
    })),
    (ctx) => {
      console.log('Transform completed');
      return ctx;
    }
  );
  
  const context = createContext<DataContext>({ trigger: 'cli' });
  const result = await transformChain(context);
  
  console.log('Transform result:', result.transformedData);
}

// Validation example
async function validationExample() {
  console.log('\n=== Validation Example ===\n');
  
  const validationChain = chain<DataContext>(
    fetchData,
    // Validate the data before processing
    validate<DataContext>(
      (ctx) => {
        if (!ctx.inputData) return 'Input data is required';
        if (ctx.inputData.value < 0) return 'Value must be positive';
        if (ctx.inputData.status !== 'active') return 'Data must be active';
        return true;
      },
      (ctx) => {
        console.log('Data validation passed, processing...');
        return { ...ctx, processedData: `Processed: ${ctx.inputData.value}` };
      }
    )
  );
  
  // Test with valid data
  console.log('Testing with valid data:');
  const validContext = createContext<DataContext>({ trigger: 'cli' });
  const validResult = await validationChain(validContext);
  console.log('Valid result:', validResult.processedData);
  
  // Test with invalid data
  console.log('\nTesting with invalid data:');
  const invalidChain = chain<DataContext>(
    (ctx) => ({ ...ctx, inputData: { value: -10, status: 'inactive' } }),
    validate<DataContext>(
      (ctx) => {
        if (ctx.inputData.value < 0) return 'Value must be positive';
        return true;
      },
      (ctx) => ({ ...ctx, processed: true })
    )
  );
  
  try {
    await invalidChain(createContext<DataContext>({ trigger: 'cli' }));
  } catch (error) {
    console.log('Validation error:', error.message);
  }
}

// Compose and pipe examples
async function compositionExample() {
  console.log('\n=== Composition Example ===\n');
  
  // Using compose (right-to-left composition)
  const addOne: Link<DataContext> = (ctx) => ({ 
    ...ctx, 
    value: (ctx.value || 0) + 1 
  });
  
  const multiplyByTwo: Link<DataContext> = (ctx) => ({ 
    ...ctx, 
    value: (ctx.value || 0) * 2 
  });
  
  const toString: Link<DataContext> = (ctx) => ({ 
    ...ctx, 
    result: `Result: ${ctx.value}` 
  });
  
  // Compose: toString(multiplyByTwo(addOne(ctx)))
  const composedFunction = compose<DataContext>(toString, multiplyByTwo, addOne);
  
  console.log('Using compose (right-to-left):');
  const composeResult = await composedFunction(createContext<DataContext>({ value: 5 }));
  console.log('Compose result:', composeResult.result); // Result: 12 ((5 + 1) * 2)
  
  // Using pipe (left-to-right composition)
  const pipedFunction = pipe<DataContext>(addOne, multiplyByTwo, toString);
  
  console.log('\nUsing pipe (left-to-right):');
  const pipeResult = await pipedFunction(createContext<DataContext>({ value: 5 }));
  console.log('Pipe result:', pipeResult.result); // Result: 12 (same as compose)
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

if (require.main === module) {
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
