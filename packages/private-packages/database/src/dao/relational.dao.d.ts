/**
 * Relational Database DAO Implementation.
 *
 * @file Comprehensive relational database DAO implementation supporting PostgreSQL,
 * MySQL, SQLite and other SQL-based databases. Provides standardized CRUD operations,
 * advanced query building, transaction management, and database-specific optimizations.
 *
 * Features:
 * - Automatic data type conversion and mapping
 * - SQL injection prevention with parameterized queries
 * - Advanced query operations (JOINs, aggregations, batch operations)
 * - Date range queries and full-text search
 * - Batch insert/update/delete operations.
 * - Schema-aware field type detection.
 * @author Claude-Zen DAL Team
 * @version 2.0.0
 * @since 1.0.0
 * @example Basic Relational DAO Usage
 * ```typescript
 * import { RelationalDao } from './dao/relational.dao';
 *
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 *   profile: { age: number; location: string };
 *   createdAt: Date;
 *   active: boolean;
 * }
 *
 * const userDao = new RelationalDao<User>(
 *   pgAdapter,
 *   logger,
 *   'users',
 *   {
 *     id: { type: 'uuid', primaryKey: true },
 *     name: { type: 'string', required: true },
 *     email: { type: 'string', unique: true },
 *     profile: { type: 'json' },
 *     createdAt: { type: 'datetime', default: 'now' },
 *     active: { type: 'boolean', default: true }
 *   }
 * );
 *
 * // CRUD operations with automatic type conversion
 * const user = await userDao.create({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   profile: { age: 30, location: 'New York' },
 *   active: true
 * });
 *
 * const users = await userDao.findAll({ limit: 10, sort: [{ field: 'createdAt', direction: 'desc' }] });
 * ```
 */
import { BaseDao } from '../base.dao';
import type { Dao } from '../interfaces';
/**
 * Relational Database DAO Implementation Class.
 *
 * Provides comprehensive relational database operations with automatic type conversion,
 * query optimization, and SQL database-specific features. Extends BaseDao with
 * relational-specific operations like JOINs, aggregations, and batch operations.
 *
 * @template T The entity type this DAO manages.
 * @class RelationalDao
 * @augments BaseDao<T>
 * @implements Dao<T>
 * @since 1.0.0
 * @example PostgreSQL User DAO
 * ```typescript
 * interface User {
 *   id: string;
 *   username: string;
 *   email: string;
 *   profile: UserProfile;
 *   createdAt: Date;
 *   updatedAt: Date;
 *   isActive: boolean;
 * }
 *
 * const userDao = new RelationalDao<User>(
 *   postgresAdapter,
 *   logger,
 *   'app_users',
 *   {
 *     id: { type: 'uuid', primaryKey: true },
 *     username: { type: 'string', unique: true },
 *     email: { type: 'string', unique: true },
 *     profile: { type: 'json' },
 *     createdAt: { type: 'datetime', default: 'now' },
 *     updatedAt: { type: 'datetime', default: 'now', onUpdate: 'now' },
 *     isActive: { type: 'boolean', default: true }
 *   }
 * );
 *
 * // Advanced relational operations
 * const activeUsers = await userDao.findByDateRange(
 *   'createdAt',
 *   new Date('2024-01-01'),
 *   new Date('2024-12-31'),
 *   { sort: [{ field: 'username', direction: 'asc' }] }
 * );
 *
 * const userCount = await userDao.aggregate('COUNT', '*', { isActive: true });
 * ```
 */
export declare class RelationalDao<T> extends BaseDao<T> implements Dao<T> {
    /**
     * Map Database Row to Entity Object.
     *
     * Converts a raw database row to a properly typed entity object, handling.
     * SQL-specific data type conversions including JSON columns, boolean values,
     * date/time fields, and numeric types. Uses schema information for intelligent
     * type detection and conversion.
     *
     * @protected
     * @param {any} row - Raw database row object.
     * @returns {T} Mapped entity object with proper types.
     * @throws {Error} When row is null or undefined.
     * @throws {Error} When JSON parsing fails for JSON columns.
     * @throws {Error} When date conversion fails for date columns.
     * @example Row to Entity Mapping
     * ```typescript
     * // Database row (raw data)
     * const dbRow = {
     *   id: 'user-123',
     *   name: 'John Doe',
     *   email: 'john@example.com',
     *   profile: '{"age": 30, "location": "NYC"}', // JSON string
     *   created_at: '2024-01-15T10:30:00Z',       // SO string
     *   is_active: 1,                             // SQLite boolean as integer
     *   login_count: '42'                         // String number
     * };
     *
     * // Mapped entity (typed object)
     * const user = mapRowToEntity(dbRow);
     * // Result:
     * // {
     * //   id: 'user-123',
     * //   name: 'John Doe',
     * //   email: 'john@example.com',
     * //   profile: { age: 30, location: 'NYC' },  // Parsed JSON object
     * //   createdAt: Date('2024-01-15T10:30:00Z'), // Date object
     * //   isActive: true,                          // Boolean
     * //   loginCount: 42                           // Number
     * // }
     * ```
     */
    protected mapRowToEntity(row: unknown): T;
    /**
     * Map Entity Object to Database Row.
     *
     * Converts a typed entity object to a database row format suitable for SQL storage,
     * handling type conversions including object serialization to JSON, date formatting,
     * and boolean conversion for different SQL databases.
     *
     * @protected
     * @param {Partial<T>} entity - Entity object to convert.
     * @returns {Record<string, unknown>} Database row object ready for SQL operations.
     * @example Entity to Row Mapping
     * ```typescript
     * // Entity object (typed)
     * const user: User = {
     *   id: 'user-123',
     *   name: 'John Doe',
     *   profile: { age: 30, location: 'NYC' },    // Object
     *   createdAt: new Date('2024-01-15'),        // Date object
     *   isActive: true,                           // Boolean
     *   tags: ['developer', 'manager']            // Array
     * };
     *
     * // Mapped row (database format)
     * const dbRow = mapEntityToRow(user);
     * // Result:
     * // {
     * //   id: 'user-123',
     * //   name: 'John Doe',
     * //   profile: '{"age":30,"location":"NYC"}', // JSON string
     * //   created_at: '2024-01-15T00:00:00.000Z',  // SO string
     * //   is_active: true,                          // Boolean (or 1 for SQLite)
     * //   tags: '["developer","manager"]'          // JSON array string
     * // }
     * ```
     */
    protected mapEntityToRow(entity: Partial<T>): Record<string, unknown>;
    /**
     * Enhanced Query Methods for SQL-Specific Operations.
     *
     * The following methods provide advanced SQL operations beyond basic CRUD,
     * including JOINs, aggregations, batch operations, and specialized queries.
     */
    /**
     * Find Entities with SQL JOIN Operations.
     *
     * Performs SQL JOIN queries to retrieve entities with related data from other tables.
     * Supports NNER JOINs with custom join conditions and optional filtering criteria.
     *
     * @param {string} joinTable - Name of the table to join with.
     * @param {string} joinCondition - SQL join condition (e.g., 'users.id = profiles.user_id').
     * @param {Partial<T>} [criteria] - Optional filtering criteria for the main table.
     * @param {any} [options] - Optional query options (sort, limit, offset).
     * @returns {Promise<T[]>} Array of entities with joined data.
     * @throws {Error} When JOIN query construction fails.
     * @throws {Error} When SQL execution fails.
     * @throws {Error} When join condition is invalid.
     * @example User Profile JOIN Query
     * ```typescript
     * // Find users with their profile information
     * const usersWithProfiles = await userDao.findWithJoin(
     *   'user_profiles',
     *   'users.id = user_profiles.user_id',
     *   { isActive: true }, // Only active users
     *   {
     *     sort: [{ field: 'users.created_at', direction: 'desc' }],
     *     limit: 50
     *   }
     * );
     *
     * // Generated SQL:
     * // SELECT users.*
     * // FROM users
     * // JOIN user_profiles ON users.id = user_profiles.user_id
     * // WHERE users.is_active = $1
     * // ORDER BY users.created_at DESC
     * // LIMIT 50
     * ```
     * @example Order Items JOIN Query
     * ```typescript
     * interface OrderItem {
     *   id: string;
     *   productId: string;
     *   quantity: number;
     *   price: number;
     * }
     *
     * // Find order items with product details
     * const itemsWithProducts = await orderItemDao.findWithJoin(
     *   'products',
     *   'order_items.product_id = products.id',
     *   { quantity: { $gte: 2 } }, // Quantity >= 2
     *   {
     *     sort: [{ field: 'products.name', direction: 'asc' }]
     *   }
     * );
     * ```
     */
    findWithJoin(joinTable: string, joinCondition: string, criteria?: Partial<T>, options?: unknown): Promise<T[]>;
    /**
     * Execute SQL Aggregate Queries.
     *
     * Performs SQL aggregate functions including COUNT, SUM, AVG, MIN, and MAX operations.
     * On specified columns with optional filtering criteria. Returns numeric results for
     * statistical analysis and reporting..
     *
     * @param {('COUNT'|'SUM'|'AVG'|'MIN'|'MAX')} aggregateFunction - SQL aggregate function to execute.
     * @param {string} [column='*'] - Column name to aggregate (default: '*' for COUNT).
     * @param {Partial<T>} [criteria] - Optional filtering criteria.
     * @returns {Promise<number>} Numeric result of the aggregate function.
     * @throws {Error} When aggregate function is invalid.
     * @throws {Error} When column does not exist.
     * @throws {Error} When SQL execution fails.
     * @example User Statistics
     * ```typescript
     * // Count total active users
     * const activeUserCount = await userDao.aggregate(
     *   'COUNT',
     *   '*',
     *   { isActive: true }
     * );
     *
     * // Average user age
     * const averageAge = await userDao.aggregate(
     *   'AVG',
     *   'age',
     *   { isActive: true }
     * );
     *
     * // Find oldest user
     * const maxAge = await userDao.aggregate(
     *   'MAX',
     *   'age'
     * );
     *
     * console.log(`${activeUserCount} active users, average age: ${averageAge}, oldest: ${maxAge}`);
     * ```
     * @example Sales Analytics
     * ```typescript
     * interface Order {
     *   id: string;
     *   total: number;
     *   status: 'pending' | 'completed' | 'cancelled';
     *   createdAt: Date;
     * }
     *
     * // Total revenue from completed orders
     * const totalRevenue = await orderDao.aggregate(
     *   'SUM',
     *   'total',
     *   { status: 'completed' }
     * );
     *
     * // Number of pending orders
     * const pendingCount = await orderDao.aggregate(
     *   'COUNT',
     *   '*',
     *   { status: 'pending' }
     * );
     *
     * // Minimum and maximum order values
     * const minOrder = await orderDao.aggregate('MIN', 'total', { status: 'completed' });
     * const maxOrder = await orderDao.aggregate('MAX', 'total', { status: 'completed' });
     * ```
     */
    aggregate(aggregateFunction: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX', column?: string, criteria?: Partial<T>): Promise<number>;
    /**
     * Batch Insert Multiple Entities.
     *
     * Performs efficient batch insertion of multiple entities in a single SQL statement.
     * Uses parameterized queries to prevent SQL injection and optimize database performance.
     * By reducing round-trips to the database server..
     *
     * @param {Omit<T, 'id'>[]} entities - Array of entities to insert (without ID field).
     * @returns {Promise<T[]>} Array of created entities with generated Ds.
     * @throws {Error} When entities array is empty.
     * @throws {Error} When batch insert SQL execution fails.
     * @throws {Error} When entity validation fails.
     * @example Batch User Creation
     * ```typescript
     * const newUsers = [
     *   {
     *     name: 'Alice Johnson',
     *     email: 'alice@example.com',
     *     profile: { age: 28, department: 'Engineering' },
     *     isActive: true
     *   },
     *   {
     *     name: 'Bob Smith',
     *     email: 'bob@example.com',
     *     profile: { age: 35, department: 'Marketing' },
     *     isActive: true
     *   },
     *   {
     *     name: 'Carol Davis',
     *     email: 'carol@example.com',
     *     profile: { age: 42, department: 'Sales' },
     *     isActive: false
     *   }
     * ];
     *
     * // Insert all users in a single database operation
     * const createdUsers = await userDao.batchInsert(newUsers);
     *
     * console.log(`Successfully created ${createdUsers.length} users`);
     * createdUsers.forEach(user => {
     *   console.log(`Created user: ${user.name} (D: ${user.id})`);
     * });
     * ```
     * @example Batch Product Import
     * ```typescript
     * interface Product {
     *   id: string;
     *   sku: string;
     *   name: string;
     *   price: number;
     *   categoryId: string;
     *   metadata: { weight: number; dimensions: string };
     * }
     *
     * const importProducts = [
     *   {
     *     sku: 'LAPTOP-001',
     *     name: 'Gaming Laptop',
     *     price: 1299.99,
     *     categoryId: 'cat-electronics',
     *     metadata: { weight: 2.5, dimensions: '15.6x10.2x0.8 inches' }
     *   }
     *   // ... more products
     * ];
     *
     * // Efficient batch insertion
     * const insertedProducts = await productDao.batchInsert(importProducts);
     * ```
     */
    batchInsert(entities: Omit<T, 'id'>[]): Promise<T[]>;
    /**
     * Update Multiple Entities Matching Criteria.
     *
     * Performs bulk update operations on all entities matching the specified criteria.
     * Uses parameterized queries for security and returns the count of affected rows.
     * Efficient for updating large numbers of records in a single operation.
     *
     * @param {Partial<T>} criteria - Filter criteria to select entities for update.
     * @param {Partial<T>} updates - Field updates to apply to matching entities.
     * @returns {Promise<number>} Number of entities updated.
     * @throws {Error} When update criteria is empty (safety check).
     * @throws {Error} When update SQL execution fails.
     * @throws {Error} When field validation fails.
     * @example Bulk User Status Update
     * ```typescript
     * // Deactivate all users from a specific department
     * const updatedCount = await userDao.updateMany(
     *   { 'profile.department': 'Sales' }, // Criteria: users in Sales dept
     *   {
     *     isActive: false,                  // Update: set inactive
     *     updatedAt: new Date()            // Update timestamp
     *   }
     * );
     *
     * console.log(`Deactivated ${updatedCount} users from Sales department`);
     * ```
     * @example Price Adjustment
     * ```typescript
     * interface Product {
     *   id: string;
     *   categoryId: string;
     *   price: number;
     *   discountPercent: number;
     *   updatedAt: Date;
     * }
     *
     * // Apply 10% discount to all electronics products
     * const affectedProducts = await productDao.updateMany(
     *   { categoryId: 'electronics' },
     *   {
     *     discountPercent: 10,
     *     updatedAt: new Date()
     *   }
     * );
     *
     * console.log(`Applied discount to ${affectedProducts} electronics products`);
     * ```
     * @example User Notification Settings
     * ```typescript
     * // Enable email notifications for all active premium users
     * const notificationUpdates = await userDao.updateMany(
     *   {
     *     isActive: true,
     *     subscriptionTier: 'premium'
     *   },
     *   {
     *     'settings.emailNotifications': true,
     *     'settings.updatedAt': new Date()
     *   }
     * );
     * ```
     */
    updateMany(criteria: Partial<T>, updates: Partial<T>): Promise<number>;
    /**
     * Delete Multiple Entities Matching Criteria.
     *
     * Performs bulk deletion of entities matching the specified criteria. Includes safety
     * checks to prevent accidental deletion of all records. Returns the count of deleted rows.
     *
     * @param {Partial<T>} criteria - Filter criteria to select entities for deletion.
     * @returns {Promise<number>} Number of entities deleted.
     * @throws {Error} When criteria is empty (prevents accidental full table deletion).
     * @throws {Error} When delete SQL execution fails.
     * @throws {Error} When foreign key constraints are violated.
     * @example Delete Inactive Users
     * ```typescript
     * // Remove all inactive users older than 1 year
     * const oneYearAgo = new Date();
     * oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
     *
     * const deletedCount = await userDao.deleteMany({
     *   isActive: false,
     *   lastLoginAt: { $lt: oneYearAgo } // Custom query operator
     * });
     *
     * console.log(`Deleted ${deletedCount} inactive users`);
     * ```
     * @example Clean Up Test Data
     * ```typescript
     * // Remove all test orders created during development
     * const testOrdersDeleted = await orderDao.deleteMany({
     *   status: 'test',
     *   createdBy: 'test-user'
     * });
     *
     * console.log(`Cleaned up ${testOrdersDeleted} test orders`);
     * ```
     * @example Archive Old Sessions
     * ```typescript
     * interface UserSession {
     *   id: string;
     *   userId: string;
     *   expiresAt: Date;
     *   isActive: boolean;
     * }
     *
     * // Delete expired and inactive sessions
     * const expiredSessionsDeleted = await sessionDao.deleteMany({
     *   isActive: false,
     *   expiresAt: { $lt: new Date() } // Sessions that have expired
     * });
     *
     * console.log(`Deleted ${expiredSessionsDeleted} expired sessions`);
     * ```
     */
    deleteMany(criteria: Partial<T>): Promise<number>;
    /**
     * Search Using SQL LIKE Operator.
     *
     * Performs text-based search using SQL LIKE operator with wildcard matching.
     * Supports partial string matching and is useful for implementing search functionality.
     * Across text fields..
     *
     * @param {string} field - Database field name to search in.
     * @param {string} searchTerm - Search term to match (automatically wrapped with %).
     * @param {any} [options] - Optional query options (limit, sort, etc.).
     * @returns {Promise<T[]>} Array of entities matching the search term.
     * @throws {Error} When field name is invalid.
     * @throws {Error} When search SQL execution fails.
     * @example User Name Search
     * ```typescript
     * // Find all users with names containing 'john'
     * const johnUsers = await userDao.search('name', 'john');
     *
     * // Case-insensitive search for emails containing 'gmail'
     * const gmailUsers = await userDao.search('email', 'gmail', {
     *   limit: 20,
     *   sort: [{ field: 'name', direction: 'asc' }]
     * });
     *
     * console.log(`Found ${johnUsers.length} users named John`);
     * console.log(`Found ${gmailUsers.length} Gmail users`);
     * ```
     * @example Product Search
     * ```typescript
     * interface Product {
     *   id: string;
     *   name: string;
     *   description: string;
     *   sku: string;
     *   category: string;
     * }
     *
     * // Search products by name
     * const laptopProducts = await productDao.search('name', 'laptop', {
     *   limit: 10
     * });
     *
     * // Search by description
     * const gamingProducts = await productDao.search('description', 'gaming');
     *
     * // Search by SKU partial match
     * const electronicsSkus = await productDao.search('sku', 'ELEC-');
     * ```
     * @example Content Search with Ranking
     * ```typescript
     * // Search articles by title and description
     * const searchResults = await articleDao.search('title', searchQuery, {
     *   sort: [
     *     { field: 'publishedAt', direction: 'desc' },
     *     { field: 'viewCount', direction: 'desc' }
     *   ],
     *   limit: 50
     * });
     *
     * // Multiple field search (would require custom implementation)
     * const contentResults = await Promise.all([
     *   articleDao.search('title', searchQuery),
     *   articleDao.search('content', searchQuery)
     * ]).then(results => {
     *   // Combine and deduplicate results
     *   return [...new Set([...results[0], ...results[1]])];
     * });
     * ```
     */
    search(field: string, searchTerm: string, _options?: unknown): Promise<T[]>;
    /**
     * Find Entities by Date Range.
     *
     * Retrieves entities where a specified date field falls within the given date range.
     * Useful for time-based queries, reporting, and data analysis. Supports sorting
     * and pagination options.
     *
     * @param {string} dateField - Name of the date field to filter on.
     * @param {Date} startDate - Start of the date range (inclusive).
     * @param {Date} endDate - End of the date range (inclusive).
     * @param {any} [options] - Optional query options (sort, limit, offset).
     * @returns {Promise<T[]>} Array of entities within the date range.
     * @throws {Error} When date field is invalid.
     * @throws {Error} When start date is after end date.
     * @throws {Error} When date range query execution fails.
     * @example Monthly User Registrations
     * ```typescript
     * // Get all users registered in January 2024
     * const januaryUsers = await userDao.findByDateRange(
     *   'createdAt',
     *   new Date('2024-01-01T00:00:00Z'),
     *   new Date('2024-01-31T23:59:59Z'),
     *   {
     *     sort: [{ field: 'createdAt', direction: 'asc' }],
     *     limit: 1000
     *   }
     * );
     *
     * console.log(`${januaryUsers.length} users registered in January 2024`);
     * ```
     * @example Sales Report Date Range
     * ```typescript
     * interface Order {
     *   id: string;
     *   customerId: string;
     *   total: number;
     *   status: string;
     *   createdAt: Date;
     *   completedAt?: Date;
     * }
     *
     * // Get completed orders from last quarter
     * const lastQuarterStart = new Date('2024-10-01');
     * const lastQuarterEnd = new Date('2024-12-31');
     *
     * const quarterlyOrders = await orderDao.findByDateRange(
     *   'completedAt',
     *   lastQuarterStart,
     *   lastQuarterEnd,
     *   {
     *     sort: [{ field: 'total', direction: 'desc' }]
     *   }
     * );
     *
     * const totalRevenue = quarterlyOrders.reduce((sum, order) => sum + order.total, 0);
     * console.log(`Q4 2024 Revenue: $${totalRevenue.toFixed(2)} from ${quarterlyOrders.length} orders`);
     * ```
     * @example Activity Log Analysis
     * ```typescript
     * // Get user activity logs from the past 7 days
     * const sevenDaysAgo = new Date();
     * sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
     *
     * const recentActivity = await activityLogDao.findByDateRange(
     *   'timestamp',
     *   sevenDaysAgo,
     *   new Date(),
     *   {
     *     sort: [{ field: 'timestamp', direction: 'desc' }],
     *     limit: 500
     *   }
     * );
     *
     * // Group by day for trending analysis
     * const activityByDay = recentActivity.reduce((acc, log) => {
     *   const day = log.timestamp.toISOString().split('T')[0];
     *   acc[day] = (acc[day] || 0) + 1;
     *   return acc;
     * }, {} as Record<string, number>);
     * ```
     */
    findByDateRange(dateField: string, startDate: Date, endDate: Date, options?: unknown): Promise<T[]>;
    /**
     * Helper methods for type checking based on schema.
     */
    private isJsonColumn;
    private isBooleanColumn;
    private isDateColumn;
    private isNumberColumn;
}
//# sourceMappingURL=relational.dao.d.ts.map