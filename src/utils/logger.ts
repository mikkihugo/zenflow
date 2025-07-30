
 * @fileoverview Logger utility for Neural and Queen components;
/** Simple wrapper around the core logger for component-specific logging;
 * @module Logger

export class Logger {}

info(message, meta?);
: void
// {
  this.coreLogger.info(message, meta);
// }
warn(message, meta?);
: void
// {
  this.coreLogger.warn(message, meta);
// }
error(message, error?);
: void
// {
  this.coreLogger.error(message, {}, error ?? null);
// }
debug(message, meta?);
: void
// {
  this.coreLogger.debug(message, meta);
// }
success(message, meta?);
: void
// {
  this.coreLogger.success(message, meta);
// }
progress(message, meta?);
: void
// {
  this.coreLogger.progress(message, meta);
// }
// }
