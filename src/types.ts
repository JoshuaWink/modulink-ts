/**
 * ModuLink TypeScript Type Definitions
 * 
 * Complete type definitions for building modular applications with TypeScript:
 * - Context: Enhanced context object with metadata, performance, and observability features
 * - Link: Single function that performs an action with/on context
 * - Chain: Series of links with advanced middleware positioning and observability
 * - EnhancedChain: Chain with middleware API (.use(), .onInput(), .onOutput())
 * - Trigger: Function that starts the chain reaction
 * - Middleware: Observer/transformer function with positioning options
 * 
 * Each component has single responsibility and provides consistency across HTTP, cron, CLI, and message processing.
 */

/**
 * The foundational Context interface that serves as the data container for all ModuLink operations.
 * 
 * A Context is a flexible, extensible object that flows through chains and links, carrying:
 * - Application data (user-defined properties)
 * - System metadata (performance tracking, middleware information)
 * - Execution state (current link info, timing data)
 * - Error handling information
 * - Caching and retry status
 * 
 * The Context follows an immutable-by-convention pattern where each link should return
 * a new or modified context rather than mutating the original. This enables:
 * - Predictable data flow
 * - Easy debugging and logging
 * - Performance tracking across the chain
 * - Middleware composition and observation
 * 
 * @example
 * ```typescript
 * // Basic context usage
 * const ctx = createContext({ userId: 123, data: 'example' });
 * 
 * // Context flows through chain
 * const result = await chain(
 *   (ctx) => ({ ...ctx, processed: true }),
 *   (ctx) => ({ ...ctx, timestamp: new Date().toISOString() })
 * )(ctx);
 * ```
 * 
 * @example
 * ```typescript
 * // Accessing metadata in middleware
 * const loggingMiddleware = (ctx) => {
 *   console.log(`Processing link ${ctx._currentLink?.index} of ${ctx._currentLink?.length}`);
 *   console.log(`Chain duration: ${ctx._metadata?.totalDuration}ms`);
 *   return ctx;
 * };
 * ```
 */
export interface IContext {
  /**
   * Index signature allowing any user-defined properties on the context.
   * This enables flexible data storage while maintaining type safety for system properties.
   * 
   * @example
   * ```typescript
   * const ctx = createContext({
   *   userId: 123,
   *   userData: { name: 'John', email: 'john@example.com' },
   *   customFlag: true
   * });
   * ```
   */
  [key: string]: any;
  
  /**
   * Identifies the type of trigger that initiated this chain execution.
   * Used for routing logic and context-specific processing.
   * 
   * Common values:
   * - 'http': Web request (REST API, webhook)
   * - 'cron': Scheduled task execution
   * - 'cli': Command-line interface invocation
   * - 'message': Message queue or event processing
   * 
   * @example
   * ```typescript
   * const httpCtx = createHttpContext({ method: 'POST', url: '/api/users' });
   * console.log(httpCtx.trigger); // 'http'
   * 
   * // Conditional processing based on trigger
   * const processData = (ctx) => {
   *   if (ctx.trigger === 'http') {
   *     return handleHttpRequest(ctx);
   *   } else if (ctx.trigger === 'cron') {
   *     return handleScheduledTask(ctx);
   *   }
   *   return ctx;
   * };
   * ```
   */
  trigger?: string;
  
  /**
   * ISO 8601 timestamp indicating when the context was created.
   * Automatically set by context creation functions.
   * 
   * Used for:
   * - Request tracking and correlation
   * - Performance analysis
   * - Audit logging
   * - Time-based conditional logic
   * 
   * @example
   * ```typescript
   * const ctx = createContext();
   * console.log(ctx.timestamp); // "2025-06-06T10:30:00.000Z"
   * 
   * // Time-based logic
   * const timeAwareLink = (ctx) => {
   *   const age = Date.now() - new Date(ctx.timestamp).getTime();
   *   return { ...ctx, processedAfter: `${age}ms` };
   * };
   * ```
   */
  timestamp?: string;
  
  /**
   * Internal metadata container for middleware communication and chain coordination.
   * This is a low-level property used by the ModuLink system for internal state management.
   * 
   * Typical uses:
   * - Middleware state sharing
   * - Inter-link communication
   * - System flags and markers
   * 
   * @internal
   * @example
   * ```typescript
   * // Middleware using _meta for coordination
   * const authMiddleware = (ctx) => ({
   *   ...ctx,
   *   _meta: { ...ctx._meta, authenticated: true, userId: 123 }
   * });
   * 
   * const authorizationLink = (ctx) => {
   *   if (!ctx._meta?.authenticated) {
   *     throw new Error('Not authenticated');
   *   }
   *   return { ...ctx, data: 'protected data' };
   * };
   * ```
   */
  _meta?: Record<string, any>;
  
  /**
   * Comprehensive execution metadata including performance metrics and middleware tracking.
   * This object is automatically populated by the ModuLink system during chain execution.
   * 
   * Contains detailed information about:
   * - Performance timings for different middleware types
   * - Middleware execution counts
   * - Chain identification and timing
   * 
   * Used for:
   * - Performance monitoring and optimization
   * - Debugging chain execution
   * - Observability and metrics collection
   * - Automatic performance reporting
   * 
   * @example
   * ```typescript
   * // Accessing performance data after chain execution
   * const result = await myChain(ctx);
   * console.log('Total execution time:', result._metadata?.totalDuration);
   * console.log('Input middleware count:', result._metadata?.middlewareCounts?.input);
   * console.log('Performance timings:', result._metadata?.performance);
   * ```
   */
  _metadata?: {
    /**
     * Detailed timing information for different types of middleware execution.
     * Each array contains timing measurements in milliseconds for middleware of that type.
     */
    performance?: {
      /** Execution times for input middleware (runs before each link) */
      inputMiddlewareTimings?: number[];
      /** Execution times for output middleware (runs after each link) */
      outputMiddlewareTimings?: number[];
      /** Execution times for global middleware (runs after all links) */
      globalMiddlewareTimings?: number[];
    };
    
    /**
     * Count of middleware executed during chain processing.
     * Useful for understanding chain complexity and middleware overhead.
     */
    middlewareCounts?: {
      /** Number of input middleware functions executed */
      input?: number;
      /** Number of output middleware functions executed */
      output?: number;
      /** Number of global middleware functions executed */
      global?: number;
    };
    
    /** Unique identifier for this chain execution instance */
    chainId?: string;
    /** High-resolution timestamp when chain execution started */
    startTime?: number;
    /** High-resolution timestamp when chain execution completed */
    endTime?: number;
    /** Total chain execution duration in milliseconds */
    totalDuration?: number;
  };
  
  /**
   * Information about the currently executing link within the chain.
   * This metadata is automatically updated as the chain progresses through each link.
   * 
   * Valuable for:
   * - Debugging and error reporting
   * - Progress tracking
   * - Conditional middleware behavior
   * - Performance monitoring per link
   * 
   * @example
   * ```typescript
   * // Middleware that logs progress
   * const progressMiddleware = (ctx) => {
   *   const current = ctx._currentLink;
   *   console.log(`Executing link ${current?.index + 1}/${current?.length}: ${current?.name}`);
   *   console.log(`Link is ${current?.isAsync ? 'async' : 'sync'}`);
   *   return ctx;
   * };
   * ```
   */
  _currentLink?: {
    /** Human-readable name of the current link (if provided) */
    name?: string;
    /** Zero-based index of the current link in the chain */
    index?: number;
    /** Total number of links in the chain */
    length?: number;
    /** Whether the current link is asynchronous */
    isAsync?: boolean;
  };
  
  /**
   * Array of middleware functions that apply to this specific context instance.
   * These middleware are executed in addition to chain-level middleware.
   * 
   * Used for:
   * - Context-specific processing logic
   * - Dynamic middleware injection
   * - Conditional middleware application
   * 
   * @example
   * ```typescript
   * // Adding instance-specific middleware
   * const ctxWithMiddleware = {
   *   ...ctx,
   *   _instanceMiddleware: [
   *     (ctx) => ({ ...ctx, processed: true }),
   *     (ctx) => ({ ...ctx, timestamp: Date.now() })
   *   ]
   * };
   * ```
   */
  _instanceMiddleware?: IMiddleware[];
  
  /**
   * Tracking object that records which middleware have observed/processed this context.
   * Used for middleware coordination and avoiding duplicate processing.
   * 
   * @internal
   * @example
   * ```typescript
   * // Middleware that runs only once per context
   * const onceMiddleware = (ctx) => {
   *   if (ctx._observedBy?.onceMiddleware) {
   *     return ctx; // Already processed
   *   }
   *   return {
   *     ...ctx,
   *     processed: true,
   *     _observedBy: { ...ctx._observedBy, onceMiddleware: true }
   *   };
   * };
   * ```
   */
  _observedBy?: Record<string, any>;
  
  /**
   * Metrics and data collected by logging middleware during execution.
   * Contains structured logging information for observability.
   * 
   * @example
   * ```typescript
   * // Accessing logging metrics
   * const result = await chain.use(logging({ level: 'debug' }))(ctx);
   * console.log('Log entries:', result._loggingMetrics?.entries);
   * console.log('Error count:', result._loggingMetrics?.errorCount);
   * ```
   */
  _loggingMetrics?: Record<string, any>;
  /**
   * Performance tracking metrics and data collected during chain execution.
   * Used by performance monitoring middleware to store detailed execution analytics.
   * 
   * @example
   * ```typescript
   * // Performance tracking middleware
   * const performanceMiddleware = (ctx) => ({
   *   ...ctx,
   *   _performanceMetrics: {
   *     ...ctx._performanceMetrics,
   *     memoryUsage: process.memoryUsage(),
   *     cpuTime: process.cpuUsage()
   *   }
   * });
   * ```
   */
  _performanceMetrics?: Record<string, any>;
  
  /**
   * Custom timing measurements for specific operations within the chain.
   * Used to track performance of individual operations or business logic components.
   * 
   * Each key represents a timing label, and the value contains timing information.
   * Commonly used with the `timing()` utility middleware.
   * 
   * @example
   * ```typescript
   * // Using timing middleware
   * const result = await chain(
   *   timing('database-query'),
   *   (ctx) => ({ ...ctx, users: await db.getUsers() }),
   *   timing('data-processing'),
   *   (ctx) => ({ ...ctx, processedUsers: processUsers(ctx.users) })
   * )(ctx);
   * 
   * console.log(result.timings);
   * // {
   * //   'database-query': { duration: 45, timestamp: 1654321000 },
   * //   'data-processing': { duration: 12, timestamp: 1654321045 }
   * // }
   * ```
   */
  timings?: Record<string, any>;
  
  /**
   * Error information captured during chain execution failure.
   * Automatically populated when a link throws an error or when using error handling middleware.
   * 
   * Contains structured error information for debugging and error reporting.
   * Used by error handling middleware and monitoring systems.
   * 
   * @example
   * ```typescript
   * // Error handling in a chain
   * const safeChain = chain(
   *   errorHandler((error, ctx) => ({
   *     ...ctx,
   *     error: {
   *       message: error.message,
   *       name: error.name,
   *       stack: error.stack
   *     },
   *     handled: true
   *   })),
   *   (ctx) => {
   *     if (ctx.shouldFail) throw new Error('Intentional failure');
   *     return ctx;
   *   }
   * );
   * ```
   */
  error?: {
    /** Error message describing what went wrong */
    message?: string;
    /** Error type/class name */
    name?: string;
    /** Stack trace for debugging (when available) */
    stack?: string;
  };
  
  /**
   * Indicates whether the current result was retrieved from cache rather than computed.
   * Set by caching middleware to track cache hit/miss statistics.
   * 
   * Used for:
   * - Performance monitoring
   * - Cache effectiveness analysis
   * - Conditional processing based on cache status
   * 
   * @example
   * ```typescript
   * // Using cache middleware
   * const cachedChain = chain(
   *   cache((ctx) => `user-${ctx.userId}`, 300), // 5 minutes TTL
   *   (ctx) => ({ ...ctx, userData: fetchUserData(ctx.userId) })
   * );
   * 
   * const result = await cachedChain({ userId: 123 });
   * if (result.cached) {
   *   console.log('Data served from cache');
   * } else {
   *   console.log('Data freshly computed');
   * }
   * ```
   */
  cached?: boolean;
  
  /**
   * Information about retry attempts when using retry logic.
   * Populated by retry middleware to track retry attempts and outcomes.
   * 
   * Useful for:
   * - Monitoring retry patterns
   * - Debugging intermittent failures
   * - Adjusting retry strategies
   * 
   * @example
   * ```typescript
   * // Using retry middleware
   * const reliableChain = chain(
   *   retry(
   *     (ctx) => {
   *       if (Math.random() < 0.7) throw new Error('Simulated failure');
   *       return { ...ctx, data: 'success' };
   *     },
   *     3, // max retries
   *     1000 // 1 second delay
   *   )
   * );
   * 
   * const result = await reliableChain(ctx);
   * console.log(`Success after ${result.retryInfo?.attempts} attempts`);
   * ```
   */
  retryInfo?: {
    /** Number of retry attempts made */
    attempts?: number;
    /** Whether the operation ultimately succeeded */
    successful?: boolean;
    /** Maximum number of retries configured */
    maxRetries?: number;
  };
}

/**
 * HTTP-specific context for web request processing.
 * 
 * Extends the base Context with HTTP-specific properties for handling web requests,
 * API calls, webhooks, and other HTTP-based interactions. This context type is
 * automatically created when using `createHttpContext()` and is optimized for
 * web application development patterns.
 * 
 * Key features:
 * - Request/response object access
 * - HTTP method and URL parsing
 * - Header and body handling
 * - Query parameter and route parameter access
 * - Integration with web frameworks (Express, Fastify, etc.)
 * 
 * @example
 * ```typescript
 * // Creating an HTTP context
 * const httpCtx = createHttpContext({
 *   method: 'POST',
 *   url: '/api/users',
 *   headers: { 'content-type': 'application/json' },
 *   body: { name: 'John', email: 'john@example.com' },
 *   params: { version: 'v1' },
 *   query: { include: 'profile' }
 * });
 * 
 * // HTTP processing chain
 * const apiChain = chain(
 *   validateHttpRequest,
 *   authenticateUser,
 *   processBusinessLogic,
 *   formatHttpResponse
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Middleware for HTTP logging
 * const httpLogger = (ctx: HttpContext) => {
 *   console.log(`${ctx.method} ${ctx.url} - ${ctx.response?.status || 'pending'}`);
 *   return ctx;
 * };
 * ```
 */
export interface IHttpContext extends IContext {
  /** Always 'http' for HTTP contexts */
  trigger: 'http';
  
  /**
   * The original HTTP request object from the web framework.
   * Contains the raw request data as provided by Express, Fastify, or other frameworks.
   * 
   * @example
   * ```typescript
   * const processRequest = (ctx: HttpContext) => {
   *   const userAgent = ctx.request?.headers['user-agent'];
   *   const contentLength = ctx.request?.headers['content-length'];
   *   return { ...ctx, clientInfo: { userAgent, contentLength } };
   * };
   * ```
   */
  request?: any;
  
  /**
   * The HTTP response object for sending data back to the client.
   * Used to set response headers, status codes, and body content.
   * 
   * @example
   * ```typescript
   * const sendResponse = (ctx: HttpContext) => ({
   *   ...ctx,
   *   response: {
   *     status: 200,
   *     headers: { 'Content-Type': 'application/json' },
   *     body: { message: 'Success', data: ctx.result }
   *   }
   * });
   * ```
   */
  response?: any;
  
  /**
   * HTTP method (GET, POST, PUT, DELETE, etc.).
   * Used for routing logic and method-specific processing.
   * 
   * @example
   * ```typescript
   * const methodRouter = (ctx: HttpContext) => {
   *   switch (ctx.method) {
   *     case 'GET': return handleGet(ctx);
   *     case 'POST': return handlePost(ctx);
   *     case 'PUT': return handlePut(ctx);
   *     default: return { ...ctx, error: { message: 'Method not allowed' } };
   *   }
   * };
   * ```
   */
  method?: string;
  
  /**
   * Request URL path and query string.
   * Contains the full URL path including query parameters.
   * 
   * @example
   * ```typescript
   * const routeHandler = (ctx: HttpContext) => {
   *   if (ctx.url?.startsWith('/api/')) {
   *     return handleApiRequest(ctx);
   *   } else if (ctx.url?.startsWith('/admin/')) {
   *     return handleAdminRequest(ctx);
   *   }
   *   return { ...ctx, route: 'unknown' };
   * };
   * ```
   */
  url?: string;
  
  /**
   * HTTP headers as key-value pairs.
   * Includes both request headers and any custom headers set during processing.
   * 
   * @example
   * ```typescript
   * const authMiddleware = (ctx: HttpContext) => {
   *   const authHeader = ctx.headers?.['authorization'];
   *   if (!authHeader?.startsWith('Bearer ')) {
   *     throw new Error('Missing or invalid authorization header');
   *   }
   *   const token = authHeader.substring(7);
   *   return { ...ctx, authToken: token };
   * };
   * ```
   */
  headers?: Record<string, string>;
  
  /**
   * Request body content (JSON, form data, raw text, etc.).
   * Automatically parsed based on Content-Type header.
   * 
   * @example
   * ```typescript
   * const validateBody = (ctx: HttpContext) => {
   *   if (!ctx.body || typeof ctx.body !== 'object') {
   *     throw new Error('Invalid request body');
   *   }
   *   if (!ctx.body.email || !ctx.body.name) {
   *     throw new Error('Missing required fields: email, name');
   *   }
   *   return { ...ctx, validatedData: ctx.body };
   * };
   * ```
   */
  body?: any;
  
  /**
   * URL route parameters (e.g., /users/:id -> { id: "123" }).
   * Extracted from parameterized routes in web frameworks.
   * 
   * @example
   * ```typescript
   * // For route: /api/users/:userId/posts/:postId
   * const handleUserPost = (ctx: HttpContext) => {
   *   const { userId, postId } = ctx.params || {};
   *   if (!userId || !postId) {
   *     throw new Error('Missing required parameters');
   *   }
   *   return { ...ctx, targetUser: userId, targetPost: postId };
   * };
   * ```
   */
  params?: Record<string, string>;
  
  /**
   * Query string parameters (e.g., ?page=1&limit=10 -> { page: "1", limit: "10" }).
   * Parsed from the URL query string.
   * 
   * @example
   * ```typescript
   * const paginationHandler = (ctx: HttpContext) => {
   *   const page = parseInt(ctx.query?.page || '1');
   *   const limit = parseInt(ctx.query?.limit || '20');
   *   const offset = (page - 1) * limit;
   *   
   *   return { ...ctx, pagination: { page, limit, offset } };
   * };
   * ```
   */
  query?: Record<string, string>;
}

/**
 * Cron/scheduled task context for time-based automation.
 * 
 * Designed for handling scheduled tasks, background jobs, and time-triggered operations.
 * This context type provides scheduling metadata and timing information essential
 * for cron job processing, batch operations, and automated workflows.
 * 
 * Key features:
 * - Cron expression tracking
 * - Scheduled vs actual execution time comparison
 * - Integration with job schedulers
 * - Support for recurring and one-time tasks
 * 
 * @example
 * ```typescript
 * // Creating a cron context
 * const cronCtx = createCronContext({
 *   cronExpression: '0 0 * * *', // Daily at midnight
 *   scheduledTime: '2025-06-06T00:00:00.000Z',
 *   actualTime: '2025-06-06T00:00:02.123Z'
 * });
 * 
 * // Scheduled task chain
 * const dailyReportChain = chain(
 *   validateScheduledTime,
 *   generateDailyReport,
 *   sendNotifications,
 *   cleanupOldData
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Handling execution delays
 * const timeAwareTask = (ctx: CronContext) => {
 *   const delay = new Date(ctx.actualTime!) - new Date(ctx.scheduledTime!);
 *   if (delay > 60000) { // More than 1 minute late
 *     console.warn(`Task executed ${delay}ms late`);
 *   }
 *   return { ...ctx, executionDelay: delay };
 * };
 * ```
 */
export interface ICronContext extends IContext {
  /** Always 'cron' for scheduled task contexts */
  trigger: 'cron';
  
  /**
   * The cron expression that triggered this execution.
   * Standard cron format: "minute hour day month dayOfWeek"
   * 
   * @example
   * ```typescript
   * const scheduleAnalyzer = (ctx: CronContext) => {
   *   const frequency = analyzeCronFrequency(ctx.cronExpression);
   *   return { 
   *     ...ctx, 
   *     taskFrequency: frequency,
   *     isHighFrequency: frequency < 3600 // Less than hourly
   *   };
   * };
   * ```
   */
  cronExpression?: string;
  
  /**
   * ISO timestamp when the task was originally scheduled to run.
   * Used for comparing against actual execution time to detect delays.
   * 
   * @example
   * ```typescript
   * const delayTracker = (ctx: CronContext) => {
   *   const scheduled = new Date(ctx.scheduledTime!);
   *   const actual = new Date(ctx.actualTime!);
   *   const delay = actual.getTime() - scheduled.getTime();
   *   
   *   return { 
   *     ...ctx, 
   *     performance: { 
   *       schedulingAccuracy: delay,
   *       wasOnTime: delay < 1000 // Within 1 second
   *     }
   *   };
   * };
   * ```
   */
  scheduledTime?: string;
  
  /**
   * ISO timestamp when the task actually started executing.
   * Automatically set by the scheduler when the task begins.
   * 
   * @example
   * ```typescript
   * // Logging actual execution time
   * const executionLogger = (ctx: CronContext) => {
   *   console.log(`Task started at ${ctx.actualTime} (scheduled: ${ctx.scheduledTime})`);
   *   return { ...ctx, logged: true };
   * };
   * ```
   */
  actualTime?: string;
}

/**
 * Command-line interface context for CLI applications and scripts.
 * 
 * Specialized for handling command-line tool interactions, script execution,
 * and terminal-based applications. Provides structured access to command-line
 * arguments, options, and command metadata.
 * 
 * Key features:
 * - Command-line argument parsing
 * - Option and flag handling
 * - Command identification and routing
 * - Integration with CLI frameworks
 * 
 * @example
 * ```typescript
 * // Creating a CLI context
 * const cliCtx = createCliContext({
 *   command: 'deploy',
 *   args: ['production', '--force', '--verbose'],
 *   options: { 
 *     force: true, 
 *     verbose: true, 
 *     environment: 'production' 
 *   }
 * });
 * 
 * // CLI command processing chain
 * const deployChain = chain(
 *   validateCliArgs,
 *   parseDeploymentOptions,
 *   executeDeployment,
 *   reportResults
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Command routing
 * const commandRouter = (ctx: CliContext) => {
 *   switch (ctx.command) {
 *     case 'deploy': return handleDeploy(ctx);
 *     case 'rollback': return handleRollback(ctx);
 *     case 'status': return handleStatus(ctx);
 *     default: return { ...ctx, error: { message: `Unknown command: ${ctx.command}` } };
 *   }
 * };
 * ```
 */
export interface ICliContext extends IContext {
  /** Always 'cli' for command-line interface contexts */
  trigger: 'cli';
  
  /**
   * Raw command-line arguments as an array of strings.
   * Typically corresponds to process.argv or similar argument arrays.
   * 
   * @example
   * ```typescript
   * // For command: myapp deploy production --force --verbose
   * // ctx.args might be: ['deploy', 'production', '--force', '--verbose']
   * 
   * const argProcessor = (ctx: CliContext) => {
   *   const positionalArgs = ctx.args?.filter(arg => !arg.startsWith('--')) || [];
   *   const flags = ctx.args?.filter(arg => arg.startsWith('--')) || [];
   *   
   *   return { 
   *     ...ctx, 
   *     positional: positionalArgs,
   *     flags: flags
   *   };
   * };
   * ```
   */
  args?: string[];
  
  /**
   * Parsed command-line options and flags as key-value pairs.
   * Typically processed from raw arguments into a structured format.
   * 
   * @example
   * ```typescript
   * // Handling CLI options
   * const optionValidator = (ctx: CliContext) => {
   *   const requiredOptions = ['environment', 'version'];
   *   const missing = requiredOptions.filter(opt => !ctx.options?.[opt]);
   *   
   *   if (missing.length > 0) {
   *     throw new Error(`Missing required options: ${missing.join(', ')}`);
   *   }
   *   
   *   return { ...ctx, validated: true };
   * };
   * ```
   */
  options?: Record<string, any>;
  
  /**
   * The primary command or action being executed.
   * Used for command routing and processing logic selection.
   * 
   * @example
   * ```typescript
   * // Command-specific processing
   * const commandHandler = (ctx: CliContext) => {
   *   const handlers = {
   *     'build': buildProject,
   *     'test': runTests,
   *     'deploy': deployApplication,
   *     'clean': cleanupProject
   *   };
   *   
   *   const handler = handlers[ctx.command as keyof typeof handlers];
   *   if (!handler) {
   *     throw new Error(`Unsupported command: ${ctx.command}`);
   *   }
   *   
   *   return handler(ctx);
   * };
   * ```
   */
  command?: string;
}

/**
 * Message/event processing context for message queues and event-driven systems.
 * 
 * Designed for handling asynchronous message processing, event streams, message queues,
 * and pub/sub systems. This context type provides message metadata and routing information
 * essential for event-driven architectures and message-based communication.
 * 
 * Key features:
 * - Message payload and metadata access
 * - Topic and routing information
 * - Message source tracking
 * - Integration with message brokers (RabbitMQ, Kafka, etc.)
 * 
 * @example
 * ```typescript
 * // Creating a message context
 * const msgCtx = createMessageContext({
 *   message: { userId: 123, action: 'user_created', data: {...} },
 *   topic: 'user.events',
 *   source: 'user-service',
 *   messageId: 'msg_1234567890'
 * });
 * 
 * // Event processing chain
 * const eventProcessingChain = chain(
 *   validateMessage,
 *   routeByTopic,
 *   processBusinessLogic,
 *   acknowledgeMessage
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Topic-based routing
 * const topicRouter = (ctx: MessageContext) => {
 *   const handlers = {
 *     'user.events': handleUserEvents,
 *     'order.events': handleOrderEvents,
 *     'system.events': handleSystemEvents
 *   };
 *   
 *   const handler = handlers[ctx.topic as keyof typeof handlers];
 *   if (!handler) {
 *     throw new Error(`No handler for topic: ${ctx.topic}`);
 *   }
 *   
 *   return handler(ctx);
 * };
 * ```
 */
export interface IMessageContext extends IContext {
  /** Always 'message' for message/event processing contexts */
  trigger: 'message';
  
  /**
   * The message payload/content being processed.
   * Can be any data structure depending on the message format (JSON, XML, binary, etc.).
   * 
   * @example
   * ```typescript
   * const messageProcessor = (ctx: MessageContext) => {
   *   const { userId, action, data } = ctx.message;
   *   
   *   // Process based on message content
   *   switch (action) {
   *     case 'user_created':
   *       return handleUserCreation(ctx, userId, data);
   *     case 'user_updated':
   *       return handleUserUpdate(ctx, userId, data);
   *     default:
   *       return { ...ctx, error: { message: `Unknown action: ${action}` } };
   *   }
   * };
   * ```
   */
  message?: any;
  
  /**
   * The topic or channel the message was received from.
   * Used for routing and organizing messages by subject area.
   * 
   * @example
   * ```typescript
   * const topicLogger = (ctx: MessageContext) => {
   *   console.log(`Processing message from topic: ${ctx.topic}`);
   *   return { 
   *     ...ctx, 
   *     routing: { 
   *       topic: ctx.topic,
   *       priority: ctx.topic?.includes('urgent') ? 'high' : 'normal'
   *     }
   *   };
   * };
   * ```
   */
  topic?: string;
  
  /**
   * The source system or service that sent the message.
   * Used for tracking message origin and implementing source-specific logic.
   * 
   * @example
   * ```typescript
   * const sourceValidator = (ctx: MessageContext) => {
   *   const trustedSources = ['user-service', 'order-service', 'payment-service'];
   *   
   *   if (!trustedSources.includes(ctx.source || '')) {
   *     throw new Error(`Untrusted message source: ${ctx.source}`);
   *   }
   *   
   *   return { ...ctx, validated: true, sourceType: ctx.source };
   * };
   * ```
   */
  source?: string;
  
  /**
   * Unique identifier for the message.
   * Used for deduplication, tracking, and correlation across systems.
   * 
   * @example
   * ```typescript
   * const deduplicationMiddleware = (ctx: MessageContext) => {
   *   const processedMessages = new Set(); // In real app, use persistent storage
   *   
   *   if (processedMessages.has(ctx.messageId)) {
   *     console.log(`Skipping duplicate message: ${ctx.messageId}`);
   *     return { ...ctx, skipped: true, reason: 'duplicate' };
   *   }
   *   
   *   processedMessages.add(ctx.messageId);
   *   return { ...ctx, processed: true };
   * };
   * ```
   */
  messageId?: string;
}

/**
 * Error context for handling and processing error conditions.
 * 
 * Specialized context for error handling scenarios, exception processing,
 * and failure recovery workflows. This context type is automatically created
 * when errors occur or can be manually created for error processing chains.
 * 
 * Key features:
 * - Structured error information
 * - Stack trace preservation
 * - Error classification and handling
 * - Integration with error monitoring systems
 * 
 * @example
 * ```typescript
 * // Creating an error context
 * const errorCtx = createErrorContext(new Error('Database connection failed'));
 * 
 * // Error handling chain
 * const errorHandlingChain = chain(
 *   logError,
 *   notifyMonitoring,
 *   attemptRecovery,
 *   generateErrorResponse
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Error classification and handling
 * const errorClassifier = (ctx: ErrorContext) => {
 *   const errorType = classifyError(ctx.error);
 *   
 *   return {
 *     ...ctx,
 *     classification: errorType,
 *     severity: getSeverity(errorType),
 *     retryable: isRetryable(errorType),
 *     recovery: getRecoveryStrategy(errorType)
 *   };
 * };
 * ```
 */
export interface IErrorContext extends IContext {
  /**
   * The error information that triggered this context creation.
   * Contains structured error data including message, type, and stack trace.
   * 
   * This is a required field that must always be present in error contexts.
   * Used for error analysis, logging, monitoring, and recovery decisions.
   * 
   * @example
   * ```typescript
   * const errorAnalyzer = (ctx: ErrorContext) => {
   *   const { message, name, stack } = ctx.error;
   *   
   *   // Analyze error characteristics
   *   const analysis = {
   *     isNetworkError: message.includes('network') || message.includes('timeout'),
   *     isValidationError: name === 'ValidationError',
   *     isSystemError: name === 'SystemError',
   *     hasStackTrace: !!stack
   *   };
   *   
   *   return { ...ctx, analysis };
   * };
   * ```
   */
  error: {
    /** The error message describing what went wrong */
    message: string;
    /** The error type/class name (e.g., 'TypeError', 'ValidationError') */
    name: string;
    /** Optional stack trace for debugging (may be undefined in production) */
    stack?: string;
  };
}

/**
 * A Link represents a single step or operation in a ModuLink chain.
 * 
 * Links are the fundamental building blocks of ModuLink chains. Each link is a function
 * that takes a context object as input and returns either a modified context (sync) or
 * a Promise that resolves to a modified context (async). Links should follow functional
 * programming principles and avoid side effects when possible.
 * 
 * Key characteristics:
 * - **Pure functions**: Should be predictable and avoid external side effects
 * - **Immutable by convention**: Should return new/modified context rather than mutating input
 * - **Type-safe**: Fully typed with generic support for custom context types
 * - **Composable**: Can be easily combined with other links in chains
 * - **Sync or Async**: Can return context directly or wrapped in a Promise
 * 
 * @template TContext - The context type this link operates on (extends Context)
 * 
 * @example
 * ```typescript
 * // Synchronous link
 * const addTimestamp: Link<Context> = (ctx) => ({
 *   ...ctx,
 *   timestamp: new Date().toISOString(),
 *   processed: true
 * });
 * 
 * // Asynchronous link
 * const fetchUserData: Link<Context> = async (ctx) => {
 *   const userData = await database.getUser(ctx.userId);
 *   return { ...ctx, userData };
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // HTTP-specific link
 * const authenticateRequest: Link<HttpContext> = (ctx) => {
 *   const token = ctx.headers?.authorization?.replace('Bearer ', '');
 *   if (!token || !isValidToken(token)) {
 *     throw new Error('Invalid authentication token');
 *   }
 *   
 *   return {
 *     ...ctx,
 *     user: decodeToken(token),
 *     authenticated: true
 *   };
 * };
 * 
 * // Business logic link
 * const processBusinessLogic: Link<Context> = async (ctx) => {
 *   const result = await businessService.process(ctx.inputData);
 *   return {
 *     ...ctx,
 *     result,
 *     processedAt: Date.now(),
 *     status: 'completed'
 *   };
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Conditional processing link
 * const conditionalProcessor: Link<Context> = (ctx) => {
 *   if (ctx.skipProcessing) {
 *     return { ...ctx, skipped: true };
 *   }
 *   
 *   return {
 *     ...ctx,
 *     processed: true,
 *     data: transformData(ctx.data)
 *   };
 * };
 * 
 * // Error handling link
 * const safeProcessor: Link<Context> = async (ctx) => {
 *   try {
 *     const result = await riskyOperation(ctx.data);
 *     return { ...ctx, result, success: true };
 *   } catch (error) {
 *     return {
 *       ...ctx,
 *       error: { message: error.message, name: error.name },
 *       success: false
 *     };
 *   }
 * };
 * ```
 */
export type ILink<TContext extends IContext = IContext> = (
  ctx: TContext
) => TContext | Promise<TContext>;

/**
 * Middleware function for observing, transforming, or enhancing chain execution.
 * 
 * Middleware functions are similar to Links but serve a different purpose in the ModuLink
 * architecture. While Links represent the core business logic steps, Middleware functions
 * provide cross-cutting concerns like logging, authentication, validation, performance
 * tracking, and error handling.
 * 
 * Key characteristics:
 * - **Observer pattern**: Can observe context at different points in execution
 * - **Cross-cutting concerns**: Handle logging, auth, validation, etc.
 * - **Positioning control**: Can be positioned before/after links or globally
 * - **Non-intrusive**: Should not alter core business logic flow
 * - **Composable**: Multiple middleware can be combined and reused
 * 
 * Middleware types:
 * - **Input middleware**: Runs before each link execution
 * - **Output middleware**: Runs after each link execution  
 * - **Global middleware**: Runs around the entire chain execution
 * 
 * @template TContext - The context type this middleware operates on (extends Context)
 * 
 * @example
 * ```typescript
 * // Logging middleware
 * const loggingMiddleware: Middleware<Context> = (ctx) => {
 *   console.log(`[${new Date().toISOString()}] Processing:`, ctx._currentLink?.name);
 *   return ctx;
 * };
 * 
 * // Authentication middleware
 * const authMiddleware: Middleware<HttpContext> = (ctx) => {
 *   if (!ctx.headers?.authorization) {
 *     throw new Error('Authentication required');
 *   }
 *   return { ...ctx, authenticated: true };
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Performance tracking middleware
 * const performanceMiddleware: Middleware<Context> = (ctx) => {
 *   const startTime = performance.now();
 *   
 *   return {
 *     ...ctx,
 *     _performanceMetrics: {
 *       ...ctx._performanceMetrics,
 *       [`link_${ctx._currentLink?.index}`]: {
 *         startTime,
 *         linkName: ctx._currentLink?.name
 *       }
 *     }
 *   };
 * };
 * 
 * // Error handling middleware
 * const errorHandlingMiddleware: Middleware<Context> = (ctx) => {
 *   if (ctx.error) {
 *     console.error('Chain error detected:', ctx.error);
 *     // Send to monitoring system
 *     sendToMonitoring(ctx.error);
 *   }
 *   return ctx;
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Validation middleware
 * const validationMiddleware: Middleware<Context> = (ctx) => {
 *   const requiredFields = ['userId', 'data'];
 *   const missing = requiredFields.filter(field => !(field in ctx));
 *   
 *   if (missing.length > 0) {
 *     throw new Error(`Missing required fields: ${missing.join(', ')}`);
 *   }
 *   
 *   return { ...ctx, validated: true };
 * };
 * ```
 */
export type IMiddleware<TContext extends IContext = IContext> = (
  ctx: TContext
) => TContext | Promise<TContext>;

/**
 * Chain interface representing an executable sequence of links with middleware support.
 * 
 * A Chain is the compiled, executable version of a series of links combined together.
 * It represents the complete processing pipeline that takes a context as input and
 * produces a transformed context as output. The interface combines both the core
 * function call signature and middleware API methods for enhanced flexibility.
 * 
 * Key characteristics:
 * - **Always async**: Returns Promise<TContext> for consistent behavior
 * - **Immutable**: Each execution creates a new result without side effects
 * - **Type-safe**: Maintains type safety throughout the chain with generic support
 * - **Composable**: Chains can be used as links in other chains
 * - **Observable**: Supports middleware for monitoring and enhancement
 * - **Fluent API**: Chainable methods for middleware composition
 * 
 * Middleware positioning:
 * - **use()**: General middleware that runs after each link
 * - **onInput()**: Middleware that runs before each link
 * - **onOutput()**: Middleware that runs after each link
 * - **Global**: Middleware that wraps the entire chain execution
 * 
 * @template TContext - The context type this chain operates on (extends IContext)
 * 
 * @example
 * ```typescript
 * // Creating and using a basic chain
 * const processUserChain: IChain<Context> = chain(
 *   validateUser,
 *   fetchUserData,
 *   processUserData,
 *   saveResults
 * );
 * 
 * // Execute the chain
 * const result = await processUserChain({ userId: 123 });
 * ```
 * 
 * @example
 * ```typescript
 * // Creating an enhanced chain with middleware
 * const apiChain = chain(
 *   validateRequest,
 *   authenticateUser,
 *   processBusinessLogic,
 *   formatResponse
 * )
 * .use(logging(), performanceTracker()) // General middleware
 * .onInput(requestValidator(), rateLimiter()) // Before each link
 * .onOutput(responseLogger(), metrics()); // After each link
 * 
 * // Execute with full middleware stack
 * const result = await apiChain(httpContext);
 * ```
 * 
 * @example
 * ```typescript
 * // Chains can be composed into larger workflows
 * const ecommerceWorkflow: IChain<HttpContext> = chain(
 *   userRegistrationChain,  // Chain used as a link
 *   orderProcessingChain,   // Another chain used as a link
 *   updateAnalytics
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Debugging and introspection
 * const debugChain = chain(link1, link2, link3)
 *   .use(timing('execution-time'))
 *   .onInput((ctx) => {
 *     console.log('About to execute:', ctx._currentLink?.name);
 *     return ctx;
 *   });
 * 
 * // Get debugging information
 * const debugInfo = debugChain._debugInfo();
 * console.log('Chain configuration:', debugInfo);
 * 
 * // Use core execution in larger workflow
 * const compositeWorkflow = chain(
 *   setupWorkflow,
 *   debugChain.coreExecution, // No middleware from businessChain
 *   cleanupWorkflow
 * ).use(workflowLevelMiddleware());
 * ```
 */
export interface IChain<TContext extends IContext = IContext> {
  /**
   * Execute the chain with full middleware stack.
   * 
   * This is the primary execution method that runs the entire chain including
   * all configured middleware in their proper positions. The execution follows
   * this flow:
   * 1. Global middleware (before)
   * 2. For each link: input middleware → link → output middleware
   * 3. Global middleware (after)
   * 
   * @param ctx - The context to process through the chain
   * @returns Promise resolving to the transformed context
   * 
   * @example
   * ```typescript
   * const result = await myChain({
   *   userId: 123,
   *   action: 'create_order',
   *   data: orderData
   * });
   * ```
   */
  (ctx: TContext): Promise<TContext>;
  
  /**
   * Add general middleware that runs after each link execution.
   * 
   * General middleware is the most common type and runs after each link in the chain.
   * It's useful for cross-cutting concerns like logging, performance tracking,
   * and error handling that need to observe the result of each link.
   * 
   * Returns the chain instance for method chaining.
   * 
   * @param middleware - One or more middleware functions to add
   * @returns Chainable object with onInput and onOutput methods
   * 
   * @example
   * ```typescript
   * const chain = baseChain
   *   .use(
   *     logging({ level: 'info' }),
   *     performanceTracker(),
   *     errorHandler()
   *   )
   *   .onInput(validator())
   *   .onOutput(sanitizer());
   * ```
   */
  use(...middleware: IMiddleware<TContext>[]): IChain<TContext> & {
    onInput(...middleware: IMiddleware<TContext>[]): IChain<TContext>;
    onOutput(...middleware: IMiddleware<TContext>[]): IChain<TContext>;
  };
  
  /**
   * Add input middleware that runs before each link execution.
   * 
   * Input middleware is executed before each link in the chain, making it ideal
   * for validation, authentication, preprocessing, and setup tasks that need to
   * happen before the main business logic of each link.
   * 
   * @param middleware - One or more middleware functions to add
   * @returns The chain for further method chaining
   * 
   * @example
   * ```typescript
   * const secureChain = baseChain
   *   .onInput(
   *     validateRequest(),
   *     authenticate(),
   *     authorize(),
   *     rateLimiter()
   *   );
   * ```
   */
  onInput(...middleware: IMiddleware<TContext>[]): IChain<TContext>;
  
  /**
   * Add output middleware that runs after each link execution.
   * 
   * Output middleware is executed after each link in the chain, making it perfect
   * for post-processing, response formatting, cleanup tasks, and any operations
   * that need to happen after the main business logic of each link.
   * 
   * @param middleware - One or more middleware functions to add
   * @returns The chain for further method chaining
   * 
   * @example
   * ```typescript
   * const polishedChain = baseChain
   *   .onOutput(
   *     sanitizeOutput(),
   *     addMetadata(),
   *     compressData(),
   *     addSecurityHeaders()
   *   );
   * ```
   */
  onOutput(...middleware: IMiddleware<TContext>[]): IChain<TContext>;
  
  /**
   * Get debugging information about the chain configuration.
   * 
   * Returns detailed information about the chain's structure including:
   * - Number and names of links
   * - Middleware configuration and counts
   * - Performance metrics
   * - Chain metadata
   * 
   * Useful for development, debugging, and monitoring chain behavior.
   * 
   * @returns Debug information object with chain details
   * 
   * @example
   * ```typescript
   * const debugInfo = myChain._debugInfo();
   * console.log('Links:', debugInfo.links);
   * console.log('Middleware counts:', debugInfo.middlewareCounts);
   * console.log('Performance:', debugInfo.performance);
   * ```
   */
  _debugInfo(): any;
  
  /**
   * Access to the core chain execution without middleware.
   * 
   * Provides direct access to the underlying chain execution that bypasses
   * all middleware. This is useful when you want to use the chain as a
   * component in a larger workflow without its middleware stack.
   * 
   * This allows for clean composition where the outer chain controls
   * middleware behavior.
   * 
   * @example
   * ```typescript
   * // Use core execution in larger workflow
   * const compositeWorkflow = chain(
   *   setupWorkflow,
   *   businessChain.coreExecution, // No middleware from businessChain
   *   cleanupWorkflow
   * ).use(workflowLevelMiddleware());
   * ```
   */
  coreExecution: IChain<TContext>;
}

/**
 * Trigger function type for initiating chain execution.
 * 
 * Triggers are specialized functions that start chain execution in response to
 * external events or conditions. They act as the entry point between external
 * systems (HTTP servers, cron schedulers, CLI parsers, message queues) and
 * ModuLink chains.
 * 
 * Key characteristics:
 * - **Event-driven**: Respond to external events or conditions
 * - **Context creation**: Often responsible for creating appropriate contexts
 * - **Chain initiation**: Start the execution of ModuLink chains
 * - **Integration point**: Bridge between external systems and ModuLink
 * 
 * @template TContext - The context type this trigger works with (extends Context)
 * 
 * @example
 * ```typescript
 * // HTTP trigger for web requests
 * const httpTrigger: Trigger<HttpContext> = async (chain, ctx) => {
 *   const httpCtx = ctx || createHttpContext({
 *     method: 'GET',
 *     url: '/api/users',
 *     headers: { 'authorization': 'Bearer token123' }
 *   });
 *   
 *   return await chain(httpCtx);
 * };
 * 
 * // Usage with Express.js
 * app.get('/api/users', async (req, res) => {
 *   const result = await httpTrigger(userProcessingChain);
 *   res.json(result.response);
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Cron trigger for scheduled tasks
 * const cronTrigger: Trigger<CronContext> = async (chain, ctx) => {
 *   const cronCtx = ctx || createCronContext({
 *     cronExpression: '0 0 * * *',
 *     scheduledTime: new Date().toISOString()
 *   });
 *   
 *   return await chain(cronCtx);
 * };
 * 
 * // Schedule daily reports
 * cron.schedule('0 0 * * *', () => {
 *   cronTrigger(dailyReportChain);
 * });
 * ```
 */
export type ITrigger = (
  chain: IChain,
  ctx?: IContext
) => Promise<IContext>;

/**
 * ModuLink instance interface for application-wide chain and middleware management.
 * 
 * The ModuLink instance serves as the central coordination point for an application's
 * chain-based architecture. It provides instance-level middleware, link registration,
 * chain creation utilities, and context factories. This interface enables building
 * scalable, maintainable applications with consistent chain behavior across different
 * contexts and triggers.
 * 
 * Key features:
 * - **Instance-level middleware**: Middleware that applies to all chains
 * - **Link registry**: Central registry for reusable link functions
 * - **Chain factory**: Utilities for creating and configuring chains
 * - **Context factories**: Type-safe context creation methods
 * - **Framework integration**: Integration with web frameworks and external systems
 * 
 * @example
 * ```typescript
 * // Create and configure ModuLink instance
 * const app = express();
 * const modulink = createModuLink(app);
 * 
 * // Add instance-level middleware (applies to all chains)
 * modulink
 *   .use(logging({ level: 'info' }))
 *   .use(performanceTracker())
 *   .use(errorHandler());
 * 
 * // Register reusable links
 * modulink
 *   .registerLink('validateUser', validateUserLink)
 *   .registerLink('fetchData', fetchDataLink)
 *   .registerLink('processData', processDataLink);
 * 
 * // Create chains from registered links
 * const userChain = modulink.createChainFromLinks(
 *   'validateUser',
 *   'fetchData', 
 *   'processData'
 * );
 * 
 * // Execute the chain
 * const result = await userChain({ userId: 123 });
 * ```
 */
export interface IModuLink {
  /**
   * The underlying application instance (Express, Fastify, CLI app, etc.).
   * 
   * This optional property holds a reference to the external application or framework
   * that ModuLink is integrated with. It enables direct access to framework-specific
   * features while maintaining the ModuLink abstraction layer.
   * 
   * @example
   * ```typescript
   * const app = express();
   * const modulink = createModuLink(app);
   * 
   * // Access Express app directly when needed
   * modulink.app.listen(3000, () => {
   *   console.log('Server running on port 3000');
   * });
   * ```
   */
  app?: any;
  
  /**
   * Add instance-level middleware that applies to all chains created by this ModuLink instance.
   * 
   * Instance-level middleware provides a way to apply consistent behavior across all chains
   * in an application. This includes cross-cutting concerns like logging, authentication,
   * performance monitoring, and error handling that should be present in every chain.
   * 
   * @param middleware - One or more middleware functions to add
   * @returns The ModuLink instance for method chaining
   * 
   * @example
   * ```typescript
   * modulink
   *   .use(
   *     logging({ level: 'info', format: 'json' }),
   *     performanceTracker({ threshold: 1000 }),
   *     errorHandler({ notify: true })
   *   )
   *   .use(
   *     authenticate(),
   *     authorize(['read', 'write'])
   *   );
   * ```
   */
  use(...middleware: IMiddleware[]): IModuLink;
  
  /**
   * Auto-detect function characteristics and connect it to the ModuLink system.
   * 
   * This method analyzes a function's signature and behavior to automatically integrate
   * it with ModuLink's chain system. It can detect whether a function is a link,
   * middleware, trigger, or other ModuLink component and wrap it appropriately.
   * 
   * @param fn - The function to analyze and connect
   * @returns A ModuLink-compatible version of the function
   * 
   * @example
   * ```typescript
   * // Auto-connect various function types
   * const connectedValidator = modulink.connect(validateInput);
   * const connectedProcessor = modulink.connect(processData);
   * const connectedLogger = modulink.connect(logResult);
   * 
   * // Use connected functions in chains
   * const autoChain = modulink.createChain(
   *   connectedValidator,
   *   connectedProcessor,
   *   connectedLogger
   * );
   * ```
   */
  connect(fn: Function): Function;
  
  /**
   * Create a new enhanced chain from a series of link functions.
   * 
   * This is the primary method for creating chains in ModuLink. It takes a series
   * of link functions and combines them into an executable enhanced chain with
   * full middleware support and debugging capabilities.
   * 
   * @param links - The link functions to combine into a chain
   * @returns An enhanced chain with middleware API
   * 
   * @example
   * ```typescript
   * // Create a user processing chain
   * const userChain = modulink.createChain(
   *   validateUser,
   *   fetchUserData,
   *   processUserData,
   *   saveResults
   * );
   * 
   * // Add middleware to the chain
   * const enhancedUserChain = userChain
   *   .use(timing('user-processing'))
   *   .onInput(validateHeaders())
   *   .onOutput(addCacheHeaders());
   * ```
   */
  createChain(
    ...links: ILink[]
  ): IChain;
  
  /**
   * Create a new chain from registered link names.
   * 
   * This method allows creating chains using the names of previously registered
   * links. This promotes reusability and enables dynamic chain composition based
   * on configuration or runtime conditions.
   * 
   * @param linkNames - Names of registered links to combine
   * @returns A chain built from the registered links
   * 
   * @example
   * ```typescript
   * // Register common links
   * modulink
   *   .registerLink('validate', validateInput)
   *   .registerLink('authenticate', authenticateUser)
   *   .registerLink('process', processData)
   *   .registerLink('respond', formatResponse);
   * 
   * // Create chains from registered links
   * const publicChain = modulink.createChainFromLinks('validate', 'process', 'respond');
   * const secureChain = modulink.createChainFromLinks('validate', 'authenticate', 'process', 'respond');
   * ```
   */
  createChainFromLinks(...linkNames: string[]): IChain;
  
  /**
   * Register a reusable link function with a name for later reference.
   * 
   * Link registration enables building a library of reusable components that can
   * be referenced by name in chain creation. This promotes code reuse, enables
   * dynamic chain composition, and helps organize complex applications.
   * 
   * @param name - Unique name for the link
   * @param link - The link function to register
   * @returns The ModuLink instance for method chaining
   * 
   * @example
   * ```typescript
   * // Register domain-specific links
   * modulink
   *   .registerLink('validateOrder', validateOrderData)
   *   .registerLink('checkInventory', checkInventoryAvailability)
   *   .registerLink('processPayment', processPaymentTransaction)
   *   .registerLink('createShipment', createShipmentRecord)
   *   .registerLink('sendConfirmation', sendOrderConfirmation);
   * 
   * // Use registered links in multiple chains
   * const orderChain = modulink.createChainFromLinks(
   *   'validateOrder', 'checkInventory', 'processPayment', 'createShipment', 'sendConfirmation'
   * );
   * const quickOrderChain = modulink.createChainFromLinks(
   *   'validateOrder', 'processPayment', 'sendConfirmation'
   * );
   * ```
   */
  registerLink(name: string, link: ILink): IModuLink;
  
  /**
   * Create a generic context object with optional initial data.
   * 
   * Factory function for creating base Context objects with proper initialization
   * and metadata setup. Supports generic typing for custom context extensions.
   * 
   * @param data - Optional initial data to include in the context
   * @returns A properly initialized context object
   * 
   * @example
   * ```typescript
   * // Basic context creation
   * const ctx = createContext({ userId: 123, data: 'example' });
   * console.log(ctx.timestamp); // Automatically set
   * 
   * // Custom typed context
   * interface UserContext extends Context {
   *   userId: number;
   *   username: string;
   *   preferences: UserPreferences;
   * }
   * 
   * const userCtx = createContext<UserContext>({
   *   userId: 123,
   *   username: 'john_doe',
   *   preferences: { theme: 'dark', language: 'en' }
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Context with metadata
   * const enrichedCtx = createContext({
   *   requestId: generateId(),
   *   operation: 'data_processing',
   *   metadata: {
   *     version: '1.0',
   *     environment: process.env.NODE_ENV
   *   }
   * });
   * ```
   */
  createContext(data?: any): IContext;
  
  /**
   * Create an HTTP-specific context for web request processing.
   * 
   * Factory function for creating HttpContext objects with HTTP-specific properties
   * like method, URL, headers, and body. Automatically sets trigger type to 'http'.
   * 
   * @param data - Optional HTTP-specific data (method, url, headers, body, etc.)
   * @returns A properly initialized HTTP context
   * 
   * @example
   * ```typescript
   * // REST API request context
   * const apiCtx = createHttpContext({
   *   method: 'POST',
   *   url: '/api/v1/users',
   *   headers: {
   *     'content-type': 'application/json',
   *     'authorization': 'Bearer token123'
   *   },
   *   body: {
   *     name: 'John Doe',
   *     email: 'john@example.com',
   *     role: 'user'
   *   },
   *   query: { include: 'profile' },
   *   params: { version: 'v1' }
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Webhook context
   * const webhookCtx = createHttpContext({
   *   method: 'POST',
   *   url: '/webhooks/payment',
   *   headers: { 'x-signature': 'sha256=abc123' },
   *   body: {
   *     event: 'payment.completed',
   *     paymentId: 'pay_123456',
   *     amount: 1000
   *   }
   * });
   * 
   * // File upload context
   * const uploadCtx = createHttpContext({
   *   method: 'PUT',
   *   url: '/api/files/upload',
   *   headers: { 'content-type': 'multipart/form-data' },
   *   body: formData,
   *   params: { fileId: 'file_789' }
   * });
   * ```
   */
  createHttpContext(data?: any): IHttpContext;
  
  /**
   * Create a cron/scheduled task context for time-based operations.
   * 
   * Factory function for creating CronContext objects with scheduling metadata
   * and time-based properties. Automatically sets trigger type to 'cron' and
   * handles cron expressions, scheduled times, and execution timing information.
   * 
   * @param data - Optional cron-specific data (cronExpression, scheduledTime, etc.)
   * @returns A properly initialized cron context
   * 
   * @example
   * ```typescript
   * // Daily report generation
   * const dailyReportCtx = createCronContext({
   *   cronExpression: '0 0 * * *',  // Daily at midnight
   *   scheduledTime: '2025-06-06T00:00:00.000Z',
   *   actualTime: '2025-06-06T00:00:02.123Z',
   *   reportType: 'daily',
   *   recipients: ['admin@company.com']
   * });
   * 
   * // Hourly data sync
   * const syncCtx = createCronContext({
   *   cronExpression: '0 * * * *',   // Every hour
   *   scheduledTime: '2025-06-06T14:00:00.000Z',
   *   syncTarget: 'external-api',
   *   batchSize: 1000
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Cleanup task with execution tracking
   * const cleanupCtx = createCronContext({
   *   cronExpression: '0 2 * * 0',   // Weekly at 2 AM on Sunday
   *   scheduledTime: scheduledTime,
   *   actualTime: new Date().toISOString(),
   *   taskType: 'cleanup',
   *   targets: ['logs', 'temp_files', 'old_backups'],
   *   dryRun: false
   * });
   * ```
   */
  createCronContext(data?: any): ICronContext;
  
  /**
   * Create a CLI context for command-line application processing.
   * 
   * Factory function for creating CliContext objects with command-line specific
   * properties and initialization. Automatically sets the trigger type to 'cli' and
   * handles command parsing, argument processing, and option management.
   * 
   * @param data - Optional CLI-specific data (command, args, options, etc.)
   * @returns A properly initialized CLI context
   * 
   * @example
   * ```typescript
   * // Deployment command
   * const deployCtx = createCliContext({
   *   command: 'deploy',
   *   args: ['production', '--force'],
   *   options: {
   *     force: true,
   *     environment: 'production',
   *     verbose: false,
   *     dryRun: false
   *   },
   *   workingDirectory: '/app',
   *   user: 'deploy-user'
   * });
   * 
   * // Database migration command
   * const migrateCtx = createCliContext({
   *   command: 'migrate',
   *   args: ['up', '--steps=5'],
   *   options: {
   *     steps: 5,
   *     direction: 'up',
   *     confirm: true
   *   }
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Development tool command
   * const buildCtx = createCliContext({
   *   command: 'build',
   *   args: ['--watch', '--minify'],
   *   options: {
   *     watch: true,
   *     minify: true,
   *     sourceMaps: true,
   *     outputDir: './dist'
   *   },
   *   environment: 'development'
   * });
   * ```
   */
  createCliContext(data?: any): ICliContext;
  
  /**
   * Create a message/event context for message queue and event processing.
   * 
   * Factory function for creating MessageContext objects with message-specific
   * properties and event handling metadata. Automatically sets the trigger type
   * to 'message' and handles message payloads, routing, and source tracking.
   * 
   * @param data - Optional message-specific data (message, topic, source, etc.)
   * @returns A properly initialized message context
   * 
   * @example
   * ```typescript
   * // User event message
   * const userEventCtx = createMessageContext({
   *   message: {
   *     type: 'user_created',
   *     userId: 123,
   *     userData: {
   *       name: 'John Doe',
   *       email: 'john@example.com',
   *       role: 'user'
   *     },
   *     timestamp: '2025-06-06T10:30:00.000Z'
   *   },
   *   topic: 'user.events',
   *   source: 'user-service',
   *   messageId: 'msg_1234567890',
   *   correlationId: 'corr_abc123'
   * });
   * 
   * // Order processing message
   * const orderCtx = createMessageContext({
   *   message: {
   *     orderId: 'order_789',
   *     status: 'payment_completed',
   *     amount: 99.99,
   *     currency: 'USD'
   *   },
   *   topic: 'orders.payments',
   *   source: 'payment-service'
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // System notification message
   * const notificationCtx = createMessageContext({
   *   message: {
   *     type: 'system_alert',
   *     severity: 'high',
   *     title: 'Database Connection Lost',
   *     description: 'Primary database connection has been lost',
   *     affectedServices: ['api', 'auth', 'orders']
   *   },
   *   topic: 'system.alerts',
   *   source: 'monitoring-service',
   *   priority: 'urgent'
   * });
   * ```
   */
  createMessageContext(data?: any): IMessageContext;
  
  /**
   * Create an error context from an Error object for error processing workflows.
   * 
   * Factory function for creating ErrorContext objects from JavaScript Error objects.
   * Automatically extracts error information (message, name, stack trace) and creates
   * a structured context for error handling chains. Sets trigger type to 'error'.
   * 
   * @param error - The Error object to create a context from
   * @returns A properly initialized error context with extracted error information
   * 
   * @example
   * ```typescript
   * // Handle caught exception
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   const errorCtx = createErrorContext(error);
   *   
   *   // Error context automatically includes:
   *   console.log(errorCtx.error.message); // Error message
   *   console.log(errorCtx.error.name);    // Error type
   *   console.log(errorCtx.error.stack);   // Stack trace
   *   console.log(errorCtx.trigger);       // 'error'
   *   
   *   await errorHandlingChain(errorCtx);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Custom error handling with classification
   * const handleDatabaseError = async (dbError: Error) => {
   *   const errorCtx = createErrorContext(dbError);
   *   
   *   // Add additional error context
   *   const enrichedCtx = {
   *     ...errorCtx,
   *     errorCategory: 'database',
   *     retryable: dbError.message.includes('timeout'),
   *     affectedOperation: 'user_lookup',
   *     timestamp: new Date().toISOString()
   *   };
   *   
   *   return await databaseErrorChain(enrichedCtx);
   * };
   * 
   * // Validation error processing
   * const handleValidationError = (validationError: Error) => {
   *   const errorCtx = createErrorContext(validationError);
   *   return {
   *     ...errorCtx,
   *     errorType: 'validation',
   *     userFacing: true,
   *     httpStatus: 400
   *   };
   * };
   * ```
   */
  createErrorContext(error: Error): IErrorContext;
  
  /**
   * Get the current timestamp in ISO 8601 format.
   * 
   * Utility function that returns the current date and time as an ISO 8601
   * formatted string. This is the same timestamp format used automatically
   * by context creation functions and provides consistency across the application.
   * 
   * @returns Current timestamp in ISO 8601 format (e.g., "2025-06-06T10:30:00.000Z")
   * 
   * @example
   * ```typescript
   * // Manual timestamp creation
   * const timestamp = getCurrentTimestamp();
   * console.log(timestamp); // "2025-06-06T10:30:00.000Z"
   * 
   * // Use in custom context creation
   * const customCtx = {
   *   userId: 123,
   *   action: 'custom_operation',
   *   createdAt: getCurrentTimestamp(),
   *   processedAt: null
   * };
   * ```
   * 
   * @example
   * ```typescript

   * // Time-based operations
   * const timeAwareOperation = (ctx: Context) => {
   *   const operationStart = getCurrentTimestamp();
   *   
   *   // Perform operation...
   *   
   *   return {
   *     ...ctx,
   *     operationTiming: {
   *       started: operationStart,
   *       completed: getCurrentTimestamp()
   *     }
   *   };
   * };
   * 
   * // Audit logging
   * const auditLog = {
   *   action: 'user_login',
   *   userId: 123,
   *   timestamp: getCurrentTimestamp(),
   *   success: true
   * };
   * ```
   */
  getCurrentTimestamp(): string;
}