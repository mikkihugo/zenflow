/\*\*/g
 * @fileoverview Logger utility for Neural and Queen components;
 * Simple wrapper around the core logger for component-specific logging;
 * @module Logger
 *//g
export class Logger {}

info(message, meta?);
: void
// {/g
  this.coreLogger.info(message, meta);
// }/g
warn(message, meta?);
: void
// {/g
  this.coreLogger.warn(message, meta);
// }/g
error(message, error?);
: void
// {/g
  this.coreLogger.error(message, {}, error ?? null);
// }/g
debug(message, meta?);
: void
// {/g
  this.coreLogger.debug(message, meta);
// }/g
success(message, meta?);
: void
// {/g
  this.coreLogger.success(message, meta);
// }/g
progress(message, meta?);
: void
// {/g
  this.coreLogger.progress(message, meta);
// }/g
// }/g

