---
name: mysql
description: MySQL best practices for schema design, query optimization, indexing, and performance tuning. Use when working with MySQL databases.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# MySQL Development Guide

Best practices for MySQL schema design, queries, indexing, and performance optimization.

## Schema Design

### Data Types

```sql
-- ✅ Use appropriate data types
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash CHAR(60) NOT NULL,  -- bcrypt hash
  is_active BOOLEAN DEFAULT TRUE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ❌ Avoid
CREATE TABLE users (
  id INT,  -- Too small
  email TEXT,  -- No length limit
  created_at DATETIME  -- Use TIMESTAMP for auto-update
);
```

### Foreign Keys

```sql
-- ✅ Foreign keys with constraints
CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
```

### Indexes

```sql
-- ✅ Single column index
CREATE INDEX idx_users_email ON users(email);

-- ✅ Composite index (order matters!)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- ✅ Unique index
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- ✅ Full-text index
CREATE FULLTEXT INDEX idx_articles_content ON articles(title, content);

-- ✅ Prefix index (for long strings)
CREATE INDEX idx_users_bio ON users(bio(100));
```

---

## Queries

### SELECT

```sql
-- ✅ Select specific columns
SELECT id, username, email FROM users WHERE is_active = TRUE;

-- ❌ Avoid SELECT *
SELECT * FROM users;

-- ✅ Use LIMIT for pagination
SELECT id, username FROM users 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;

-- ✅ Use prepared statements (prevents SQL injection)
PREPARE stmt FROM 'SELECT * FROM users WHERE email = ?';
SET @email = 'test@example.com';
EXECUTE stmt USING @email;
DEALLOCATE PREPARE stmt;
```

### JOIN

```sql
-- ✅ INNER JOIN
SELECT 
  u.username,
  o.id AS order_id,
  o.total_amount
FROM users u
INNER JOIN orders o ON o.user_id = u.id
WHERE u.is_active = TRUE;

-- ✅ LEFT JOIN
SELECT 
  u.username,
  COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.username;

-- ✅ Multiple joins
SELECT 
  u.username,
  o.id AS order_id,
  p.name AS product_name
FROM users u
INNER JOIN orders o ON o.user_id = u.id
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN products p ON p.id = oi.product_id;
```

### Aggregation

```sql
-- ✅ GROUP BY with aggregates
SELECT 
  user_id,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_spent,
  AVG(total_amount) AS avg_order_value
FROM orders
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY user_id
HAVING COUNT(*) > 5;

-- ✅ Window functions (MySQL 8.0+)
SELECT 
  user_id,
  order_id,
  total_amount,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS order_rank,
  SUM(total_amount) OVER (PARTITION BY user_id) AS user_total
FROM orders;
```

### Subqueries

```sql
-- ✅ Subquery in WHERE
SELECT username FROM users 
WHERE id IN (
  SELECT DISTINCT user_id FROM orders 
  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
);

-- ✅ Correlated subquery
SELECT u.username,
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;

-- ✅ EXISTS (often faster than IN)
SELECT username FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o 
  WHERE o.user_id = u.id 
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
);
```

---

## INSERT, UPDATE, DELETE

### INSERT

```sql
-- ✅ Insert single row
INSERT INTO users (username, email, password_hash)
VALUES ('john_doe', 'john@example.com', '$2b$10$...');

-- ✅ Insert multiple rows
INSERT INTO users (username, email, password_hash) VALUES
  ('user1', 'user1@example.com', '$2b$10$...'),
  ('user2', 'user2@example.com', '$2b$10$...'),
  ('user3', 'user3@example.com', '$2b$10$...');

-- ✅ Insert or update (upsert)
INSERT INTO users (username, email, password_hash)
VALUES ('john_doe', 'john@example.com', '$2b$10$...')
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  updated_at = CURRENT_TIMESTAMP;

-- ✅ Insert and get ID
INSERT INTO users (username, email) VALUES ('test', 'test@example.com');
SELECT LAST_INSERT_ID();
```

### UPDATE

```sql
-- ✅ Update with WHERE
UPDATE users 
SET email = 'newemail@example.com', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- ✅ Update multiple rows
UPDATE users 
SET is_active = FALSE 
WHERE last_login < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- ✅ Update with JOIN
UPDATE users u
INNER JOIN orders o ON o.user_id = u.id
SET u.last_order_date = o.created_at
WHERE o.id = (
  SELECT MAX(id) FROM orders WHERE user_id = u.id
);
```

### DELETE

```sql
-- ✅ Delete with WHERE
DELETE FROM users WHERE id = 1;

-- ✅ Delete with JOIN
DELETE u FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL AND u.created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- ✅ Soft delete (preferred)
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 1;
```

---

## Transactions

```sql
-- ✅ Basic transaction
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;

-- ✅ Rollback on error
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- Check if balance is negative
SELECT balance INTO @balance FROM accounts WHERE id = 1;

IF @balance < 0 THEN
  ROLLBACK;
ELSE
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  COMMIT;
END IF;

-- ✅ Savepoints
START TRANSACTION;

INSERT INTO logs (message) VALUES ('Step 1');

SAVEPOINT step1;

INSERT INTO logs (message) VALUES ('Step 2');

-- Rollback to savepoint if needed
ROLLBACK TO step1;

COMMIT;
```

---

## Performance Optimization

### EXPLAIN

```sql
-- ✅ Analyze query performance
EXPLAIN SELECT u.username, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.username;

-- ✅ Extended explain
EXPLAIN FORMAT=JSON
SELECT * FROM users WHERE email = 'test@example.com';

-- Look for:
-- - type: ALL (bad - full table scan)
-- - type: index, ref, eq_ref (good)
-- - rows: number of rows examined
-- - Extra: Using index, Using where
```

### Query Optimization

```sql
-- ❌ Slow: Function on indexed column
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';

-- ✅ Fast: Direct comparison
SELECT * FROM users WHERE email = 'test@example.com';

-- ❌ Slow: OR conditions
SELECT * FROM products WHERE category = 'A' OR category = 'B';

-- ✅ Fast: Use IN
SELECT * FROM products WHERE category IN ('A', 'B');

-- ❌ Slow: NOT IN with large set
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);

-- ✅ Fast: NOT EXISTS
SELECT * FROM users u 
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- ❌ Slow: Leading wildcard
SELECT * FROM users WHERE email LIKE '%@example.com';

-- ✅ Fast: Trailing wildcard (can use index)
SELECT * FROM users WHERE email LIKE 'test%';
```

### Indexing Strategy

```sql
-- ✅ Covering index (all columns in SELECT are in index)
CREATE INDEX idx_users_email_username ON users(email, username);
SELECT username FROM users WHERE email = 'test@example.com';

-- ✅ Index for ORDER BY
CREATE INDEX idx_orders_created ON orders(created_at DESC);
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- ✅ Composite index for WHERE + ORDER BY
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;
```

---

## Full-Text Search

```sql
-- ✅ Create full-text index
CREATE FULLTEXT INDEX idx_articles_search ON articles(title, content);

-- ✅ Natural language search
SELECT * FROM articles 
WHERE MATCH(title, content) AGAINST('mysql tutorial' IN NATURAL LANGUAGE MODE);

-- ✅ Boolean search
SELECT * FROM articles 
WHERE MATCH(title, content) AGAINST('+mysql -oracle' IN BOOLEAN MODE);

-- ✅ With relevance score
SELECT *, MATCH(title, content) AGAINST('mysql tutorial') AS relevance
FROM articles 
WHERE MATCH(title, content) AGAINST('mysql tutorial')
ORDER BY relevance DESC;
```

---

## JSON Support (MySQL 5.7+)

```sql
-- ✅ JSON column
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  metadata JSON
);

-- ✅ Insert JSON
INSERT INTO users (username, metadata) VALUES
  ('john', '{"role": "admin", "premium": true}');

-- ✅ Query JSON
SELECT * FROM users WHERE metadata->'$.role' = 'admin';
SELECT * FROM users WHERE JSON_EXTRACT(metadata, '$.premium') = true;

-- ✅ Update JSON
UPDATE users 
SET metadata = JSON_SET(metadata, '$.last_login', NOW())
WHERE id = 1;

-- ✅ Index JSON path
ALTER TABLE users ADD COLUMN role VARCHAR(20) 
  AS (metadata->>'$.role') STORED;
CREATE INDEX idx_users_role ON users(role);
```

---

## Connection Pooling

```javascript
// ✅ MySQL connection pool (Node.js)
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// ✅ Execute query
async function getUser(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

// ✅ Transaction
async function transferBalance(fromId, toId, amount) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    await connection.execute(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, fromId]
    );
    
    await connection.execute(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toId]
    );
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

---

## Common Patterns

### Soft Deletes

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;

CREATE INDEX idx_users_deleted ON users(deleted_at);

-- Soft delete
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 1;

-- Query active records
SELECT * FROM users WHERE deleted_at IS NULL;
```

### Timestamps

```sql
-- ✅ Auto-update timestamps
CREATE TABLE posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### UUID Primary Keys

```sql
CREATE TABLE sessions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id BIGINT UNSIGNED,
  token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Monitoring

```sql
-- ✅ Show running queries
SHOW PROCESSLIST;

-- ✅ Kill query
KILL QUERY process_id;

-- ✅ Show table status
SHOW TABLE STATUS LIKE 'users';

-- ✅ Show index usage
SHOW INDEX FROM users;

-- ✅ Show variables
SHOW VARIABLES LIKE 'max_connections';

-- ✅ Show status
SHOW STATUS LIKE 'Threads_connected';

-- ✅ Slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

---

## Backup & Restore

```bash
# ✅ Backup database
mysqldump -u root -p mydb > backup.sql

# ✅ Backup with compression
mysqldump -u root -p mydb | gzip > backup.sql.gz

# ✅ Restore database
mysql -u root -p mydb < backup.sql

# ✅ Backup specific tables
mysqldump -u root -p mydb users orders > tables_backup.sql
```

---

## Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MySQL Performance Blog](https://www.percona.com/blog/)
- [Use The Index, Luke](https://use-the-index-luke.com/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)
