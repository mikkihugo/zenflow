import { BaseDao } from '../base.dao.ts';
export class RelationalDao extends BaseDao {
    mapRowToEntity(row) {
        if (!row) {
            throw new Error('Cannot map null/undefined row to entity');
        }
        const entity = {};
        for (const [key, value] of Object.entries(row)) {
            if (value === null || value === undefined) {
                entity[key] = value;
                continue;
            }
            if (typeof value === 'string' && this.isJsonColumn(key)) {
                try {
                    entity[key] = JSON.parse(value);
                }
                catch {
                    entity[key] = value;
                }
                continue;
            }
            if (this.isBooleanColumn(key)) {
                entity[key] = Boolean(value);
                continue;
            }
            if (this.isDateColumn(key)) {
                if (value instanceof Date) {
                    entity[key] = value;
                }
                else if (typeof value === 'string' || typeof value === 'number') {
                    entity[key] = new Date(value);
                }
                else {
                    entity[key] = value;
                }
                continue;
            }
            if (this.isNumberColumn(key) && typeof value === 'string') {
                const numValue = Number(value);
                entity[key] = Number.isNaN(numValue) ? value : numValue;
                continue;
            }
            entity[key] = value;
        }
        return entity;
    }
    mapEntityToRow(entity) {
        if (!entity) {
            return {};
        }
        const row = {};
        for (const [key, value] of Object.entries(entity)) {
            if (value === null || value === undefined) {
                row[key] = value;
                continue;
            }
            if (this.isJsonColumn(key) &&
                (typeof value === 'object' || Array.isArray(value))) {
                row[key] = JSON.stringify(value);
                continue;
            }
            if (this.isDateColumn(key)) {
                if (value instanceof Date) {
                    row[key] = value.toISOString();
                }
                else if (typeof value === 'string' || typeof value === 'number') {
                    row[key] = new Date(value).toISOString();
                }
                else {
                    row[key] = value;
                }
                continue;
            }
            if (this.isBooleanColumn(key)) {
                row[key] = Boolean(value);
                continue;
            }
            row[key] = value;
        }
        return row;
    }
    async findWithJoin(joinTable, joinCondition, criteria, options) {
        this.logger.debug(`Finding entities with JOIN: ${this.tableName} JOIN ${joinTable}`);
        try {
            const whereClause = criteria
                ? this.buildWhereClause(this.mapEntityToRow(criteria))
                : '';
            const orderClause = this.buildOrderClause(options?.['sort']);
            const limitClause = this.buildLimitClause(options?.['limit'], options?.['offset']);
            const sql = `
        SELECT ${this.tableName}.* 
        FROM ${this.tableName} 
        JOIN ${joinTable} ON ${joinCondition} 
        ${whereClause} 
        ${orderClause} 
        ${limitClause}
      `.trim();
            const params = criteria
                ? Object.values(this.mapEntityToRow(criteria))
                : [];
            const result = await this.adapter.query(sql, params);
            return result?.rows?.map((row) => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error(`JOIN query failed: ${error}`);
            throw new Error(`JOIN query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async aggregate(aggregateFunction, column = '*', criteria) {
        this.logger.debug(`Executing aggregate ${aggregateFunction}(${column}) on ${this.tableName}`);
        try {
            const whereClause = criteria
                ? this.buildWhereClause(this.mapEntityToRow(criteria))
                : '';
            const sql = `SELECT ${aggregateFunction}(${column}) as result FROM ${this.tableName} ${whereClause}`;
            const params = criteria
                ? Object.values(this.mapEntityToRow(criteria))
                : [];
            const result = await this.adapter.query(sql, params);
            return Number(result?.rows?.[0]?.result || 0);
        }
        catch (error) {
            this.logger.error(`Aggregate query failed: ${error}`);
            throw new Error(`Aggregate query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async batchInsert(entities) {
        if (entities.length === 0)
            return [];
        this.logger.debug(`Batch inserting ${entities.length} entities into ${this.tableName}`);
        try {
            const mappedEntities = entities.map((entity) => this.mapEntityToRow(entity));
            if (mappedEntities.length === 0 || !mappedEntities[0]) {
                throw new Error('No valid entities to insert');
            }
            const columns = Object.keys(mappedEntities[0]);
            const columnsList = columns.join(', ');
            const valuesPlaceholders = mappedEntities
                .map(() => `(${columns.map(() => '?').join(', ')})`)
                .join(', ');
            const sql = `INSERT INTO ${this.tableName} (${columnsList}) VALUES ${valuesPlaceholders}`;
            const params = mappedEntities.flatMap((entity) => Object.values(entity));
            await this.adapter.query(sql, params);
            return entities.map((entity, index) => ({
                ...entity,
                id: `batch_${Date.now()}_${index}`,
            }));
        }
        catch (error) {
            this.logger.error(`Batch insert failed: ${error}`);
            throw new Error(`Batch insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateMany(criteria, updates) {
        this.logger.debug(`Updating multiple entities in ${this.tableName}`, {
            criteria,
            updates,
        });
        try {
            const mappedCriteria = this.mapEntityToRow(criteria);
            const mappedUpdates = this.mapEntityToRow(updates);
            const setClause = Object.keys(mappedUpdates)
                .map((column) => `${column} = ?`)
                .join(', ');
            const whereClause = this.buildWhereClause(mappedCriteria);
            const sql = `UPDATE ${this.tableName} SET ${setClause} ${whereClause}`;
            const params = [
                ...Object.values(mappedUpdates),
                ...Object.values(mappedCriteria),
            ];
            const result = await this.adapter.query(sql, params);
            return result?.rowCount || 0;
        }
        catch (error) {
            this.logger.error(`Update many failed: ${error}`);
            throw new Error(`Update many failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteMany(criteria) {
        this.logger.debug(`Deleting multiple entities from ${this.tableName}`, {
            criteria,
        });
        try {
            const mappedCriteria = this.mapEntityToRow(criteria);
            const whereClause = this.buildWhereClause(mappedCriteria);
            if (!whereClause) {
                throw new Error('DELETE without WHERE clause is not allowed for safety');
            }
            const sql = `DELETE FROM ${this.tableName} ${whereClause}`;
            const params = Object.values(mappedCriteria);
            const result = await this.adapter.query(sql, params);
            return result?.rowCount || 0;
        }
        catch (error) {
            this.logger.error(`Delete many failed: ${error}`);
            throw new Error(`Delete many failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async search(field, searchTerm, _options) {
        this.logger.debug(`Searching in ${this.tableName}.${field} for: ${searchTerm}`);
        try {
            const sql = `SELECT * FROM ${this.tableName} WHERE ${field} LIKE ?`;
            const params = [`%${searchTerm}%`];
            const result = await this.adapter.query(sql, params);
            return result?.rows?.map((row) => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error(`Search failed: ${error}`);
            throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findByDateRange(dateField, startDate, endDate, options) {
        this.logger.debug(`Finding entities by date range: ${dateField} between ${startDate} and ${endDate}`);
        try {
            const orderClause = this.buildOrderClause(options?.['sort']);
            const limitClause = this.buildLimitClause(options?.['limit'], options?.['offset']);
            const sql = `
        SELECT * FROM ${this.tableName} 
        WHERE ${dateField} >= ? AND ${dateField} <= ? 
        ${orderClause} 
        ${limitClause}
      `.trim();
            const params = [startDate.toISOString(), endDate.toISOString()];
            const result = await this.adapter.query(sql, params);
            return result?.rows?.map((row) => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error(`Date range query failed: ${error}`);
            throw new Error(`Date range query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    isJsonColumn(columnName) {
        return (this.entitySchema?.[columnName]?.type === 'json' ||
            columnName.endsWith('_json') ||
            columnName === 'metadata' ||
            columnName === 'properties' ||
            columnName === 'data');
    }
    isBooleanColumn(columnName) {
        return (this.entitySchema?.[columnName]?.type === 'boolean' ||
            columnName.startsWith('is_') ||
            columnName.startsWith('has_') ||
            columnName.endsWith('_flag') ||
            ['active', 'enabled', 'visible', 'deleted'].includes(columnName));
    }
    isDateColumn(columnName) {
        return (this.entitySchema?.[columnName]?.type === 'date' ||
            this.entitySchema?.[columnName]?.type === 'datetime' ||
            columnName.endsWith('_at') ||
            columnName.endsWith('_date') ||
            columnName.endsWith('_time') ||
            ['created', 'updated', 'deleted', 'timestamp'].includes(columnName));
    }
    isNumberColumn(columnName) {
        return (this.entitySchema?.[columnName]?.type === 'number' ||
            this.entitySchema?.[columnName]?.type === 'integer' ||
            this.entitySchema?.[columnName]?.type === 'float' ||
            columnName.endsWith('_id') ||
            columnName.endsWith('_count') ||
            columnName.endsWith('_size') ||
            ['id', 'count', 'size', 'length', 'duration'].includes(columnName));
    }
}
//# sourceMappingURL=relational.dao.js.map