import { logger  } from '../utils/logger.js';

const _errorHandler = () => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip };)
// )
const _status = err.status ?? 500;
const _message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
res.status(status).json({
    error: {
      message,
status,
..(process.env.NODE_ENV !== 'production' &&
// {/g))
  stack)
// }
})
// }
// export { errorHandler };
