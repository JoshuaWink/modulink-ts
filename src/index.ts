/**
 * ModuLink TypeScript Wrapper
 * 
 * TypeScript wrapper for modulink-js providing full type safety while maintaining
 * identical API compatibility. This wrapper re-exports all functionality from
 * modulink-js with comprehensive TypeScript type definitions.
 * 
 * Features:
 * - Full TypeScript IntelliSense and compile-time safety
 * - Generic type parameters for custom context objects  
 * - Comprehensive type definitions for all ModuLink concepts
 * - Zero runtime overhead - pure type layer over modulink-js
 * - API identical to modulink-js for easy migration
 */

// Import all from modulink-js
import * as modulinkJs from 'modulink-js';

// Import and re-export all types
export type {
  Context,
  Ctx,
  HttpContext,
  CronContext,
  CliContext,
  MessageContext,
  ErrorContext,
  Link,
  Middleware,
  Chain,
  EnhancedChain,
  Trigger,
  ModuLink,
  Utils,
  TypeCreators
} from './types.js';

import type {
  Context,
  Ctx,
  Link,
  Middleware,
  Chain,
  EnhancedChain,
  ModuLink,
  Utils,
  TypeCreators
} from './types.js';

// Type-safe wrapper for chain function
export const chain = <TContext extends Context = Context>(
  ...links: Link<TContext>[]
): EnhancedChain<TContext> => {
  return modulinkJs.chain(...links) as EnhancedChain<TContext>;
};

// Type-safe wrapper for createModuLink function
export const createModuLink = (app?: any): ModuLink => {
  return modulinkJs.createModuLink(app) as ModuLink;
};

// Type-safe wrappers for type creators
export const createContext: TypeCreators['createContext'] = modulinkJs.createContext;
export const createHttpContext: TypeCreators['createHttpContext'] = modulinkJs.createHttpContext;
export const createCronContext: TypeCreators['createCronContext'] = modulinkJs.createCronContext;
export const createCliContext: TypeCreators['createCliContext'] = modulinkJs.createCliContext;
export const createMessageContext: TypeCreators['createMessageContext'] = modulinkJs.createMessageContext;
export const createErrorContext: TypeCreators['createErrorContext'] = modulinkJs.createErrorContext;
export const getCurrentTimestamp: TypeCreators['getCurrentTimestamp'] = modulinkJs.getCurrentTimestamp;

// Type-safe wrapper for utilities
export const utils: Utils = modulinkJs.utils as Utils;

// Individual utility exports for convenience
export const {
  when,
  errorHandler,
  validate,
  retry,
  transform,
  addData,
  pick,
  omit,
  parallel,
  race,
  debounce,
  throttle,
  cache,
  timing,
  performanceTracker,
  transformMiddleware,
  logging,
  parallelMiddleware
} = modulinkJs;

// Default export - main ModuLink interface
const modulink = {
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
  // Individual utilities
  when,
  errorHandler,
  validate,
  retry,
  transform,
  addData,
  pick,
  omit,
  parallel,
  race,
  debounce,
  throttle,
  cache,
  timing,
  performanceTracker,
  transformMiddleware,
  logging,
  parallelMiddleware
};

export default modulink;
