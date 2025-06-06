/**
 * ModuLink TypeScript Type Definitions
 * 
 * Complete type definitions for building modular applications with TypeScript:
 * - Ctx: Enhanced context object with metadata, performance, and observability features
 * - Link: Single function that performs an action with/on context
 * - Chain: Series of links with advanced middleware positioning and observability
 * - EnhancedChain: Chain with middleware API (.use(), .onInput(), .onOutput())
 * - Trigger: Function that starts the chain reaction
 * - Middleware: Observer/transformer function with positioning options
 * 
 * Each component has single responsibility and provides consistency across HTTP, cron, CLI, and message processing.
 */

// Base Context Interface
export interface Context {
  [key: string]: any;
}

// Enhanced Context with all ModuLink metadata
export interface Ctx extends Context {
  /** Type of trigger ('http', 'cron', 'cli', 'message') */
  trigger?: string;
  /** ISO timestamp */
  timestamp?: string;
  /** Internal metadata for middleware communication */
  _meta?: Record<string, any>;
  /** Chain execution metadata including performance and middleware counts */
  _metadata?: {
    performance?: {
      inputMiddlewareTimings?: number[];
      outputMiddlewareTimings?: number[];
      globalMiddlewareTimings?: number[];
    };
    middlewareCounts?: {
      input?: number;
      output?: number;
      global?: number;
    };
    chainId?: string;
    startTime?: number;
    endTime?: number;
    totalDuration?: number;
  };
  /** Information about currently executing link */
  _currentLink?: {
    name?: string;
    index?: number;
    length?: number;
    isAsync?: boolean;
  };
  /** Instance-level middleware */
  _instanceMiddleware?: Middleware[];
  /** Tracking of middleware that have observed this context */
  _observedBy?: Record<string, any>;
  /** Logging middleware metrics */
  _loggingMetrics?: Record<string, any>;
  /** Performance tracking metrics */
  _performanceMetrics?: Record<string, any>;
  /** Function/chain execution timings */
  timings?: Record<string, any>;
  /** Error information if chain execution failed */
  error?: {
    message?: string;
    name?: string;
    stack?: string;
  };
  /** Whether result was retrieved from cache */
  cached?: boolean;
  /** Retry execution information */
  retryInfo?: {
    attempts?: number;
    successful?: boolean;
    maxRetries?: number;
  };
}

// HTTP Context
export interface HttpContext extends Ctx {
  trigger: 'http';
  request?: any;
  response?: any;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

// Cron Context
export interface CronContext extends Ctx {
  trigger: 'cron';
  cronExpression?: string;
  scheduledTime?: string;
  actualTime?: string;
}

// CLI Context
export interface CliContext extends Ctx {
  trigger: 'cli';
  args?: string[];
  options?: Record<string, any>;
  command?: string;
}

// Message Context
export interface MessageContext extends Ctx {
  trigger: 'message';
  message?: any;
  topic?: string;
  source?: string;
  messageId?: string;
}

// Error Context
export interface ErrorContext extends Ctx {
  error: {
    message: string;
    name: string;
    stack?: string;
  };
}

// Link function type - can be sync or async
export type Link<TContext extends Context = Context> = (
  ctx: TContext
) => TContext | Promise<TContext>;

// Middleware function type
export type Middleware<TContext extends Context = Context> = (
  ctx: TContext
) => TContext | Promise<TContext>;

// Core Chain function type - always async
export type Chain<TContext extends Context = Context> = (
  ctx: TContext
) => Promise<TContext>;

// Enhanced Chain with middleware API
export interface EnhancedChain<TContext extends Context = Context> {
  /** Execute the chain */
  (ctx: TContext): Promise<TContext>;
  
  /** Add general middleware (runs after each link) */
  use(...middleware: Middleware<TContext>[]): EnhancedChain<TContext> & {
    onInput(...middleware: Middleware<TContext>[]): EnhancedChain<TContext>;
    onOutput(...middleware: Middleware<TContext>[]): EnhancedChain<TContext>;
  };
  
  /** Direct input middleware method */
  onInput(...middleware: Middleware<TContext>[]): EnhancedChain<TContext>;
  
  /** Direct output middleware method */
  onOutput(...middleware: Middleware<TContext>[]): EnhancedChain<TContext>;
  
  /** Get chain debugging information */
  _debugInfo(): any;
  
  /** Core chain execution without middleware (for chain-as-middleware) */
  coreExecution: Chain<TContext>;
}

// Trigger function type
export type Trigger<TContext extends Context = Context> = (
  chain: Chain<TContext>,
  ctx?: TContext
) => Promise<TContext>;

// ModuLink instance interface
export interface ModuLink {
  /** Application instance (Express, Fastify, etc.) */
  app?: any;
  
  /** Add instance-level middleware */
  use(...middleware: Middleware[]): ModuLink;
  
  /** Auto-detect and connect function to ModuLink */
  connect(fn: Function): Function;
  
  /** Create a new chain from links */
  createChain<TContext extends Context = Context>(
    ...links: Link<TContext>[]
  ): EnhancedChain<TContext>;
  
  /** Create a new chain from registered link names */
  createChainFromLinks(...linkNames: string[]): EnhancedChain;
  
  /** Register a reusable link */
  registerLink(name: string, link: Link): ModuLink;
  
  /** Create context objects */
  createContext(data?: any): Ctx;
  createHttpContext(data?: any): HttpContext;
  createCronContext(data?: any): CronContext;
  createCliContext(data?: any): CliContext;
  createMessageContext(data?: any): MessageContext;
  createErrorContext(error: Error): ErrorContext;
}

// Utility function types based on actual modulink-js implementation
export interface Utils {
  when<TContext extends Context = Context>(
    condition: (ctx: TContext) => boolean,
    thenChain: Link<TContext>
  ): Link<TContext>;
  
  errorHandler<TContext extends Context = Context>(
    customHandler?: (error: any, ctx: TContext) => TContext | Promise<TContext>
  ): Middleware<TContext>;
  
  validate<TContext extends Context = Context>(
    validator: (ctx: TContext) => boolean | string,
    chain: Link<TContext>
  ): Link<TContext>;
  
  retry<TContext extends Context = Context>(
    chain: Link<TContext>,
    maxRetries?: number,
    delayMs?: number
  ): Link<TContext>;
  
  transform<TContext extends Context = Context>(
    transformer: (ctx: TContext) => TContext
  ): Link<TContext>;
  
  addData<TContext extends Context = Context>(
    data: Partial<TContext>
  ): Link<TContext>;
  
  pick<TContext extends Context = Context>(
    keys: string[]
  ): Link<TContext>;
  
  omit<TContext extends Context = Context>(
    keys: string[]
  ): Link<TContext>;
  
  parallel<TContext extends Context = Context>(
    ...links: Link<TContext>[]
  ): Link<TContext>;
  
  race<TContext extends Context = Context>(
    ...links: Link<TContext>[]
  ): Link<TContext>;
  
  debounce<TContext extends Context = Context>(
    delay: number
  ): Middleware<TContext>;
  
  throttle<TContext extends Context = Context>(
    interval: number
  ): Middleware<TContext>;
  
  cache<TContext extends Context = Context>(
    keyFn: (ctx: TContext) => string,
    ttl?: number
  ): Middleware<TContext>;
  
  timing<TContext extends Context = Context>(
    label?: string
  ): Middleware<TContext>;
  
  performanceTracker<TContext extends Context = Context>(): Middleware<TContext>;
  
  transformMiddleware<TContext extends Context = Context>(
    transformer: (ctx: TContext) => Partial<TContext>
  ): Middleware<TContext>;
  
  logging<TContext extends Context = Context>(
    options?: any
  ): Middleware<TContext>;
  
  parallelMiddleware<TContext extends Context = Context>(
    ...middleware: Middleware<TContext>[]
  ): Middleware<TContext>;
  
  compose<TContext extends Context = Context>(
    ...functions: Link<TContext>[]
  ): Link<TContext>;
  
  pipe<TContext extends Context = Context>(
    ...functions: Link<TContext>[]
  ): Link<TContext>;
  
  chain<TContext extends Context = Context>(
    ...links: Link<TContext>[]
  ): EnhancedChain<TContext>;
}

// Type creators
export interface TypeCreators {
  createContext(data?: any): Ctx;
  createHttpContext(data?: any): HttpContext;
  createCronContext(data?: any): CronContext;
  createCliContext(data?: any): CliContext;
  createMessageContext(data?: any): MessageContext;
  createErrorContext(error: Error): ErrorContext;
  getCurrentTimestamp(): string;
}
