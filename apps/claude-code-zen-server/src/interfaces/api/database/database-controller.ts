const controller = new DatabaseController(logger, factory, healthMonitor);
await controller.initialize();
const result = await controller.executeQuery({ sql: 'SELECT * FROM users' });