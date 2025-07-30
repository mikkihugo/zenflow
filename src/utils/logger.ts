/**
 * @fileoverview Logger utility for Neural and Queen components;
 * Simple wrapper around the core logger for component-specific logging;
 * @module Logger
 */
export class Logger {}

info(message: string, meta?: object);
: void
{
  this.coreLogger.info(message, meta);
}
warn(message: string, meta?: object);
: void
{
  this.coreLogger.warn(message, meta);
}
error(message: string, error?: Error | null);
: void
{
  this.coreLogger.error(message, {}, error ?? null);
}
debug(message: string, meta?: object);
: void
{
  this.coreLogger.debug(message, meta);
}
success(message: string, meta?: object);
: void
{
  this.coreLogger.success(message, meta);
}
progress(message: string, meta?: object);
: void
{
  this.coreLogger.progress(message, meta);
}
}
