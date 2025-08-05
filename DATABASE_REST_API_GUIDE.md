# Database REST API Controller - Usage Guide

## Overview

The Database REST API Controller provides comprehensive database management through 7 RESTful endpoints. All endpoints follow Google API Design Guide standards with consistent request/response patterns.

## Base URL

```
http://localhost:3000/api/v1/database
```

## Authentication

Currently no authentication required. The API is ready for authentication middleware integration.

## API Endpoints

### 1. Database Status

**Endpoint**: `GET /api/v1/database/status`

**Description**: Get comprehensive database health and connection information.

**Request**: No body required

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "adapter": "sqlite",
    "connected": true,
    "responseTime": 2,
    "connectionStats": {
      "active": 1,
      "idle": 0,
      "max": 5
    },
    "lastSuccess": 1673875200000,
    "version": "3.0.0"
  },
  "metadata": {
    "rowCount": 0,
    "executionTime": 2,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

**Example**:
```bash
curl http://localhost:3000/api/v1/database/status
```

---

### 2. Query Execution

**Endpoint**: `POST /api/v1/database/query`

**Description**: Execute SELECT queries with parameter support and field metadata.

**Request Body**:
```json
{
  "sql": "SELECT * FROM users WHERE age > ? LIMIT ?",
  "params": [18, 10],
  "options": {
    "timeout": 5000,
    "maxRows": 100,
    "includeExecutionPlan": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "SELECT * FROM users WHERE age > ? LIMIT ?",
    "parameters": [18, 10],
    "results": [
      {
        "id": 1,
        "name": "John Doe",
        "age": 25,
        "email": "john@example.com"
      }
    ],
    "fields": [
      {"name": "id", "type": "integer"},
      {"name": "name", "type": "text"},
      {"name": "age", "type": "integer"},
      {"name": "email", "type": "text"}
    ]
  },
  "metadata": {
    "rowCount": 1,
    "executionTime": 5,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/database/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT * FROM users LIMIT 5",
    "params": []
  }'
```

**Validation**: Only SELECT, WITH, SHOW, EXPLAIN, and DESCRIBE statements allowed.

---

### 3. Command Execution

**Endpoint**: `POST /api/v1/database/execute`

**Description**: Execute DML/DDL commands (INSERT, UPDATE, DELETE, CREATE, etc.).

**Request Body**:
```json
{
  "sql": "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
  "params": ["Jane Smith", "jane@example.com", 30],
  "options": {
    "timeout": 5000,
    "detailed": true,
    "prepared": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "command": "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
    "parameters": ["Jane Smith", "jane@example.com", 30],
    "affectedRows": 1,
    "insertId": 123,
    "details": {
      "statementType": "INSERT",
      "executionTime": 3,
      "optimizationHints": "prepared_statement"
    }
  },
  "metadata": {
    "rowCount": 1,
    "executionTime": 3,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/database/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE users SET age = ? WHERE id = ?",
    "params": [31, 1]
  }'
```

---

### 4. Transaction Management

**Endpoint**: `POST /api/v1/database/transaction`

**Description**: Execute multiple operations within a transaction with ACID compliance.

**Request Body**:
```json
{
  "operations": [
    {
      "type": "execute",
      "sql": "INSERT INTO users (name, email) VALUES (?, ?)",
      "params": ["User 1", "user1@example.com"]
    },
    {
      "type": "execute", 
      "sql": "INSERT INTO profiles (user_id, bio) VALUES (?, ?)",
      "params": [1, "Software developer"]
    },
    {
      "type": "query",
      "sql": "SELECT COUNT(*) as total FROM users",
      "params": []
    }
  ],
  "useTransaction": true,
  "continueOnError": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "execute",
        "sql": "INSERT INTO users...",
        "success": true,
        "affectedRows": 1,
        "insertId": 124
      },
      {
        "type": "execute",
        "sql": "INSERT INTO profiles...",
        "success": true,
        "affectedRows": 1,
        "insertId": 45
      },
      {
        "type": "query",
        "sql": "SELECT COUNT(*)...",
        "success": true,
        "rowCount": 1,
        "data": [{"total": 10}]
      }
    ],
    "summary": {
      "totalOperations": 3,
      "successfulOperations": 3,
      "failedOperations": 0,
      "totalRowsAffected": 3
    }
  },
  "metadata": {
    "rowCount": 3,
    "executionTime": 8,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/database/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {"type": "execute", "sql": "INSERT INTO users (name) VALUES (?)", "params": ["Test User"]},
      {"type": "query", "sql": "SELECT COUNT(*) FROM users", "params": []}
    ],
    "useTransaction": true
  }'
```

---

### 5. Schema Introspection

**Endpoint**: `GET /api/v1/database/schema`

**Description**: Get comprehensive database schema information including tables, columns, indexes, and constraints.

**Request**: No body required

**Response**:
```json
{
  "success": true,
  "data": {
    "schema": {
      "tables": [
        {
          "name": "users",
          "columns": [
            {
              "name": "id",
              "type": "integer",
              "primaryKey": true,
              "nullable": false,
              "autoIncrement": true
            },
            {
              "name": "name",
              "type": "text",
              "nullable": false,
              "maxLength": 255
            },
            {
              "name": "email",
              "type": "text",
              "nullable": true,
              "unique": true
            }
          ],
          "indexes": [
            {
              "name": "users_pkey",
              "columns": ["id"],
              "unique": true,
              "primary": true
            },
            {
              "name": "users_email_idx",
              "columns": ["email"],
              "unique": true
            }
          ]
        }
      ],
      "views": [],
      "version": "3.0.0"
    },
    "statistics": {
      "totalTables": 1,
      "totalViews": 0,
      "totalColumns": 3,
      "totalIndexes": 2
    },
    "version": "3.0.0",
    "adapter": "sqlite"
  },
  "metadata": {
    "rowCount": 1,
    "executionTime": 4,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

**Example**:
```bash
curl http://localhost:3000/api/v1/database/schema
```

---

### 6. Migration Execution

**Endpoint**: `POST /api/v1/database/migrate`

**Description**: Execute database migrations with version management and rollback support.

**Request Body**:
```json
{
  "version": "2.1.0",
  "description": "Add user profiles table",
  "statements": [
    "CREATE TABLE profiles (id INTEGER PRIMARY KEY, user_id INTEGER, bio TEXT)",
    "CREATE INDEX profiles_user_id_idx ON profiles(user_id)",
    "ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
  ],
  "dryRun": false
}
```

**Response (Dry Run)**:
```json
{
  "success": true,
  "data": {
    "dryRun": true,
    "version": "2.1.0",
    "description": "Add user profiles table",
    "validationResults": [
      {
        "statement": "CREATE TABLE profiles...",
        "valid": true,
        "issues": []
      },
      {
        "statement": "CREATE INDEX profiles_user_id_idx...",
        "valid": true,
        "issues": []
      }
    ],
    "totalStatements": 3,
    "validStatements": 3
  },
  "metadata": {
    "rowCount": 0,
    "executionTime": 2,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

**Response (Actual Migration)**:
```json
{
  "success": true,
  "data": {
    "version": "2.1.0",
    "description": "Add user profiles table",
    "results": [
      {
        "statement": "CREATE TABLE profiles...",
        "success": true,
        "affectedRows": 0,
        "executionTime": 5
      }
    ],
    "totalStatements": 3,
    "successfulStatements": 3
  },
  "metadata": {
    "rowCount": 3,
    "executionTime": 15,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

**Example (Dry Run)**:
```bash
curl -X POST http://localhost:3000/api/v1/database/migrate \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.0.1",
    "description": "Add indexes",
    "statements": ["CREATE INDEX users_name_idx ON users(name)"],
    "dryRun": true
  }'
```

---

### 7. Analytics Dashboard

**Endpoint**: `GET /api/v1/database/analytics`

**Description**: Get comprehensive database performance metrics and monitoring data.

**Request**: No body required

**Response**:
```json
{
  "success": true,
  "data": {
    "adapter": "sqlite",
    "health": {
      "status": "healthy",
      "uptime": 3600,
      "lastOperation": 1673875200000
    },
    "performance": {
      "totalOperations": 1543,
      "averageResponseTime": 2.8,
      "successRate": 99.2,
      "errorRate": 0.8,
      "operationsPerSecond": 45.2
    },
    "connections": {
      "active": 3,
      "idle": 7,
      "max": 20,
      "failed": 2
    },
    "configuration": {
      "type": "sqlite",
      "host": "localhost",
      "database": "production.db",
      "poolConfig": {
        "min": 2,
        "max": 20
      },
      "sslEnabled": false
    }
  },
  "metadata": {
    "rowCount": 0,
    "executionTime": 3,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

**Example**:
```bash
curl http://localhost:3000/api/v1/database/analytics
```

---

## Error Handling

All endpoints return standardized error responses following Google API Design Guide:

```json
{
  "success": false,
  "error": "Validation failed for field 'sql'",
  "metadata": {
    "rowCount": 0,
    "executionTime": 1,
    "timestamp": 1673875200000,
    "adapter": "sqlite"
  }
}
```

### Common Error Scenarios

1. **Invalid SQL**: Non-SELECT statements in query endpoint
2. **Missing Parameters**: Required fields not provided
3. **Database Connection**: Connection failures or timeouts
4. **Transaction Failures**: Rollback due to operation errors

## Multi-Database Adapter Support

The API supports multiple database adapters:

- **SQLite**: File-based SQL database (default)
- **PostgreSQL**: Full-featured SQL database
- **MySQL**: Popular SQL database
- **Kuzu**: Graph database with Cypher queries
- **LanceDB**: Vector database for AI/ML applications

## Performance Monitoring

All endpoints include performance metrics:

- **executionTime**: Time taken for database operation (ms)
- **rowCount**: Number of rows affected/returned
- **timestamp**: Operation timestamp
- **adapter**: Database adapter used

## Rate Limiting

The API supports rate limiting (when enabled):
- **Window**: 15 minutes
- **Limit**: 100 requests per window
- **Headers**: Standard rate limit headers included

## Next Steps

1. **Authentication**: Add authentication middleware
2. **Real Adapters**: Replace mock with actual database adapters
3. **Caching**: Implement query result caching
4. **Monitoring**: Add comprehensive monitoring and alerting
5. **Documentation**: Generate OpenAPI/Swagger documentation

## Testing

Test all endpoints:

```bash
# Start the API server
npm run dev

# Test all endpoints
curl http://localhost:3000/api/v1/database/status
curl -X POST http://localhost:3000/api/v1/database/query -H "Content-Type: application/json" -d '{"sql":"SELECT 1"}'
```