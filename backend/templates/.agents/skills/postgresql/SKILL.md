---
name: postgresql
description: PostgreSQL best practices for schema design, indexing, query optimization, and performance tuning. Use when working with PostgreSQL databases.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# PostgreSQL Development Guide

Best practices for PostgreSQL schema design, queries, indexing, and performance optimization.

## Schema Design

### Data Types

```sql
-- ✅ Use appropriate data types
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,
  balance NUMERIC(10, 2) DEFAULT 0.00
);

-- ❌ Avoid
CREATE TABLE users (
  id INTEGER,  -- Too small for large tables
  email TEXT,  -- No length constraint
  created_at TIMESTAMP  -- No timezone
);
```

### Constraints

```sql
-- ✅ Primary keys
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

-- ✅ Foreign keys with actions
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ✅ Composite unique constraints
CREATE TABLE user_products (
  user_id BIGINT REFERENCES users(id),
  product_id BIGINT REFERENCES products(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);
```

### Indexes

```sql
-- ✅ Index foreign keys
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);

-- ✅ Composite indexes (order matters!)
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);

-- ✅ Partial indexes
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;

-- ✅ Expression indexes
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- ✅ GIN indexes for JSONB
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

-- ✅ Full-text search
CREATE INDEX idx_products_search ON products 
  USING GIN (to_tsvector('english', name || ' ' || description));
```

---

## Queries

### Basic Queries

```sql
-- ✅ Use parameterized queries (prevents SQL injection)
-- In application code:
-- SELECT * FROM users WHERE email = $1 AND is_active = $2

-- ✅ Select only needed columns
SELECT id, email, username FROM users WHERE is_active = true;

-- ❌ Avoid SELECT *
SELECT * FROM users;  -- Fetches unnecessary data

-- ✅ Use LIMIT for pagination
SELECT id, name FROM products 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;

-- ✅ Better: Use cursor-based pagination
SELECT id, name FROM products 
WHERE id > $1 
ORDER BY id 
LIMIT 20;
```

### Joins

```sql
-- ✅ Explicit JOIN syntax
SELECT 
  u.username,
  o.id AS order_id,
  p.name AS product_name
FROM users u
INNER JOIN orders o ON o.user_id = u.id
INNER JOIN products p ON p.id = o.product_id
WHERE u.is_active = true;

-- ✅ LEFT JOIN for optional relationships
SELECT 
  u.username,
  COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.username;

-- ❌ Avoid implicit joins
SELECT * FROM users, orders WHERE users.id = orders.user_id;
```

### Aggregations

```sql
-- ✅ GROUP BY with aggregates
SELECT 
  user_id,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_spent,
  AVG(total_amount) AS avg_order_value
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
HAVING COUNT(*) > 5;

-- ✅ Window functions
SELECT 
  user_id,
  order_id,
  total_amount,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS order_rank,
  SUM(total_amount) OVER (PARTITION BY user_id) AS user_total
FROM orders;
```

### CTEs (Common Table Expressions)

```sql
-- ✅ Use CTEs for readability
WITH active_users AS (
  SELECT id, username FROM users WHERE is_active = true
),
recent_orders AS (
  SELECT user_id, COUNT(*) AS order_count
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT 
  au.username,
  COALESCE(ro.order_count, 0) AS recent_orders
FROM active_users au
LEFT JOIN recent_orders ro ON ro.user_id = au.id;

-- ✅ Recursive CTEs
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 1 AS level
  FROM categories
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY level, name;
```

---

## JSONB Operations

```sql
-- ✅ Query JSONB data
SELECT * FROM users 
WHERE metadata->>'role' = 'admin';

SELECT * FROM users 
WHERE metadata @> '{"premium": true}';

-- ✅ Update JSONB fields
UPDATE users 
SET metadata = metadata || '{"last_login": "2024-01-15"}'::jsonb
WHERE id = 1;

-- ✅ Remove JSONB keys
UPDATE users 
SET metadata = metadata - 'temp_field'
WHERE id = 1;

-- ✅ Index JSONB paths
CREATE INDEX idx_users_role ON users ((metadata->>'role'));
```

---

## Transactions

```sql
-- ✅ Use transactions for data consistency
BEGIN;

INSERT INTO orders (user_id, total_amount) 
VALUES (1, 100.00) 
RETURNING id;

UPDATE users 
SET balance = balance - 100.00 
WHERE id = 1;

COMMIT;

-- ✅ Savepoints for partial rollback
BEGIN;

INSERT INTO logs (message) VALUES ('Step 1');

SAVEPOINT step1;

INSERT INTO logs (message) VALUES ('Step 2');

-- Rollback to savepoint if needed
ROLLBACK TO step1;

COMMIT;

-- ✅ Isolation levels
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- Critical operations
COMMIT;
```

---

## Performance Optimization

### EXPLAIN ANALYZE

```sql
-- ✅ Analyze query performance
EXPLAIN ANALYZE
SELECT u.username, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.username;

-- Look for:
-- - Seq Scan (bad for large tables)
-- - Index Scan (good)
-- - High cost values
-- - Actual time vs planned
```

### Vacuum and Analyze

```sql
-- ✅ Regular maintenance
VACUUM ANALYZE users;

-- ✅ Full vacuum (requires lock)
VACUUM FULL users;

-- ✅ Auto-vacuum configuration
ALTER TABLE users SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);
```

### Query Optimization

```sql
-- ❌ Slow: Function on indexed column
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';

-- ✅ Fast: Use expression index
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- ❌ Slow: OR conditions
SELECT * FROM products WHERE category = 'A' OR category = 'B';

-- ✅ Fast: Use IN
SELECT * FROM products WHERE category IN ('A', 'B');

-- ❌ Slow: NOT IN with NULLs
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);

-- ✅ Fast: NOT EXISTS
SELECT * FROM users u 
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

---

## Connection Pooling

```javascript
// ✅ Use connection pooling (Node.js example)
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'user',
  password: 'password',
  max: 20,  // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ✅ Proper query execution
async function getUser(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// ✅ Transaction helper
async function transferBalance(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );
    
    await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );
    
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

---

## Migrations

```sql
-- ✅ Create migration files with timestamps
-- migrations/20240115_create_users.sql

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ✅ Rollback migration
-- migrations/20240115_create_users_down.sql

DROP TABLE IF EXISTS users CASCADE;

-- ✅ Add column safely
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- ✅ Modify column with care
ALTER TABLE users ALTER COLUMN email TYPE TEXT;
-- Or for large tables:
-- 1. Add new column
-- 2. Backfill data
-- 3. Drop old column
```

---

## Security

```sql
-- ✅ Use roles and permissions
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mydb TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ✅ Row-level security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_documents ON documents
  FOR ALL
  TO app_user
  USING (user_id = current_setting('app.user_id')::bigint);

-- ✅ Prevent SQL injection (use parameterized queries)
-- ❌ NEVER do this:
-- query = f"SELECT * FROM users WHERE email = '{email}'"

-- ✅ Always use parameters:
-- query = "SELECT * FROM users WHERE email = $1"
```

---

## Common Patterns

### Soft Deletes

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- Soft delete
UPDATE users SET deleted_at = NOW() WHERE id = 1;

-- Query active records
SELECT * FROM users WHERE deleted_at IS NULL;
```

### Timestamps

```sql
-- ✅ Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### UUID Primary Keys

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT REFERENCES users(id),
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Monitoring

```sql
-- ✅ Check active queries
SELECT pid, usename, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- ✅ Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ✅ Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- ✅ Kill long-running query
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 12345;
```

---

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Use The Index, Luke](https://use-the-index-luke.com/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [pgAdmin](https://www.pgadmin.org/)
