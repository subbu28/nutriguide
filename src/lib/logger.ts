/**
 * Frontend Logger - Structured Logging for Browser Environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const defaultConfig: LoggerConfig = {
  minLevel: import.meta.env.DEV ? 'debug' : 'info',
  enableConsole: true,
  enableRemote: import.meta.env.PROD,
  remoteEndpoint: '/api/logs',
};

class Logger {
  private config: LoggerConfig;
  private context: Record<string, unknown> = {};
  private buffer: LogEntry[] = [];
  private flushInterval: number | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    
    if (this.config.enableRemote) {
      this.flushInterval = window.setInterval(() => this.flush(), 5000);
    }
  }

  child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.config);
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      error,
    };

    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(entry);
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, entry.context);
          break;
        case 'info':
          console.info(formattedMessage, entry.context);
          break;
        case 'warn':
          console.warn(formattedMessage, entry.context);
          break;
        case 'error':
          console.error(formattedMessage, entry.error || entry.context);
          break;
      }
    }

    if (this.config.enableRemote && level !== 'debug') {
      this.buffer.push(entry);
      if (level === 'error') {
        this.flush();
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | Record<string, unknown>, context?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.log('error', message, context, error);
    } else {
      this.log('error', message, { ...error, ...context });
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: entries }),
      });
    } catch {
      // Re-add to buffer if failed
      this.buffer.unshift(...entries);
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const logger = new Logger();

export const createLogger = (context: Record<string, unknown>) => logger.child(context);

// Global error handler
if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error('Uncaught error', error, { source, lineno, colno });
  };

  window.onunhandledrejection = (event) => {
    logger.error('Unhandled promise rejection', event.reason);
  };
}
