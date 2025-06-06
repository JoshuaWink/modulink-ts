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

// Re-export all types
export type {
  IContext,
  IHttpContext,
  ICronContext,
  ICliContext,
  IMessageContext,
  IErrorContext,
  ILink,
  IMiddleware,
  IChain,
  ITrigger,
  IModuLink
} from './types.ts';

// Re-export everything from modulink-js with proper typing
export {
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
  race,
  debounce,
  throttle,
  cache,
  timing,
  performanceTracker,
  transformMiddleware,
  logging,
  parallelMiddleware
} from 'modulink-js';

// Default export - main ModuLink interface
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
  race,
  debounce,
  throttle,
  cache,
  timing,
  performanceTracker,
  transformMiddleware,
  logging,
  parallelMiddleware
} from 'modulink-js';

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
