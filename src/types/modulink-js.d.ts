/**
 * Type declarations for modulink-js module
 */
declare module 'modulink-js' {
  export function createModuLink(): any;
  export function createModulink(): any;
  export function chain(...links: any[]): any;
  export function createContext(context?: any): any;
  export function createHttpContext(context?: any): any;
  export function createCronContext(context?: any): any;
  export function createCliContext(context?: any): any;
  export function createMessageContext(context?: any): any;
  export function createErrorContext(context?: any): any;
  export function getCurrentTimestamp(): any;
  export const utils: any;
  export function parallel(...links: any[]): any;
  export function race(...links: any[]): any;
  export function retry(link: any, retries?: number, delay?: number): any;
  export function when(condition: any, link: any): any;
  export function transform(fn: any): any;
  export function validate(validator: any, link: any): any;
  export function errorHandler(handler: any): any;
  export function addData(data: any): any;
  export function pick(...keys: string[]): any;
  export function omit(...keys: string[]): any;
  export function debounce(fn: any, delay: number): any;
  export function throttle(fn: any, delay: number): any;
  export function cache(fn: any): any;
  export function timing(label?: string): any;
  export function performanceTracker(): any;
  export function transformMiddleware(fn: any): any;
  export function logging(options?: any): any;
  export function parallelMiddleware(): any;
  
  // Export any other functions/types as needed
  export const ModuLink: any;
  export const Context: any;
}
