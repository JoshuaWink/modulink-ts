/**
 * Type declarations for modulink-js
 * This allows TypeScript to import modulink-js without type errors
 */

declare module 'modulink-js' {
  // Re-export everything as any for now - the actual types come from our wrapper
  export const chain: any;
  export const createModuLink: any;
  export const createContext: any;
  export const createHttpContext: any;
  export const createCronContext: any;
  export const createCliContext: any;
  export const createMessageContext: any;
  export const createErrorContext: any;
  export const getCurrentTimestamp: any;
  export const utils: any;
  export const when: any;
  export const errorHandler: any;
  export const validate: any;
  export const retry: any;
  export const transform: any;
  export const addData: any;
  export const pick: any;
  export const omit: any;
  export const parallel: any;
  export const race: any;
  export const debounce: any;
  export const throttle: any;
  export const cache: any;
  export const timing: any;
  export const performanceTracker: any;
  export const transformMiddleware: any;
  export const logging: any;
  export const parallelMiddleware: any;
}
