/**
 * ModuLink TypeScript Examples
 * 
 * This file exports all the examples for easy importing and running.
 */

// Re-export all examples
export { basicChainExample } from './basic-chain';
export { middlewareExample, transformMiddlewareExample } from './middleware';
export { httpContextExample, conditionalProcessingExample } from './http-context';
export {
  parallelExample,
  raceExample,
  retryExample,
  conditionalExample,
  transformExample,
  validationExample,
  compositionExample
} from './utilities';

// Main function to run all examples
export async function runAllExamples() {
  console.log('🚀 ModuLink TypeScript Examples\n');
  console.log('================================\n');
  
  try {
    // Import and run all examples
    const { basicChainExample } = await import('./basic-chain');
    const { middlewareExample, transformMiddlewareExample } = await import('./middleware');
    const { httpContextExample, conditionalProcessingExample } = await import('./http-context');
    const {
      parallelExample,
      raceExample,
      retryExample,
      conditionalExample,
      transformExample,
      validationExample,
      compositionExample
    } = await import('./utilities');
    
    // Run basic chain example
    console.log('1. Basic Chain Example');
    console.log('----------------------');
    await basicChainExample();
    
    console.log('\n\n2. Middleware Examples');
    console.log('----------------------');
    await middlewareExample();
    await transformMiddlewareExample();
    
    console.log('\n\n3. HTTP Context Examples');
    console.log('------------------------');
    await httpContextExample();
    await conditionalProcessingExample();
    
    console.log('\n\n4. Utility Function Examples');
    console.log('-----------------------------');
    await parallelExample();
    await raceExample();
    await retryExample();
    await conditionalExample();
    await transformExample();
    await validationExample();
    await compositionExample();
    
    console.log('\n\n✅ All examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run all examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
