/**
 * ModuLink TypeScript Examples
 * 
 * This file exports all the examples for easy importing and running.
 */

// Import the working demo
import { simpleDemo } from './simple-demo.js';

// Main function to run working examples
export async function runAllExamples() {
  console.log('🚀 ModuLink TypeScript Examples\n');
  console.log('================================\n');
  
  try {
    // Run the simple working demo
    await simpleDemo();
    
    console.log('\n✅ Examples completed successfully!');
    console.log('\nNote: More complex examples are available in the individual files');
    console.log('but may need TypeScript configuration adjustments to run properly.');
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}
