/**
 * Basic Chain Example
 * 
 * This example demonstrates how to create and use type-safe chains
 * with ModuLink TypeScript.
 */

import { chain, createContext } from '../src/index.js';
import type { IContext, ILink } from '../src/types.js';

// Define a custom context type
interface UserContext extends IContext {
  userId?: string;
  userData?: {
    name: string;
    email: string;
    age: number;
  };
  processed?: boolean;
  validated?: boolean;
}

// Type-safe link functions
const fetchUser: Link<UserContext> = async (ctx) => {
  console.log(`Fetching user: ${ctx.userId}`);
  
  // Simulate API call
  const userData = {
    name: "John Doe",
    email: "john@example.com",
    age: 30
  };
  
  return { ...ctx, userData };
};

const validateUser: Link<UserContext> = (ctx) => {
  if (!ctx.userData || !ctx.userData.email) {
    throw new Error('User data is invalid');
  }
  
  console.log(`Validating user: ${ctx.userData.name}`);
  return { ...ctx, validated: true };
};

const processUser: Link<UserContext> = (ctx) => {
  if (!ctx.validated) {
    throw new Error('User not validated');
  }
  
  console.log(`Processing user: ${ctx.userData?.name}`);
  return { ...ctx, processed: true };
};

// Create and execute the chain
async function main() {
  // Create a type-safe chain
  const userChain = chain<UserContext>(
    fetchUser,
    validateUser,
    processUser
  );
  
  // Create context with type safety
  const context = createContext<UserContext>({
    userId: "12345",
    trigger: 'http'
  });
  
  try {
    // Execute the chain
    const result = await userChain(context);
    
    console.log('Chain completed successfully:', {
      userData: result.userData,
      processed: result.processed,
      validated: result.validated
    });
  } catch (error) {
    console.error('Chain execution failed:', error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main as basicChainExample };
