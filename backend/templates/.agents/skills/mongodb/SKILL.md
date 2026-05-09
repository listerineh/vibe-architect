---
name: mongodb
description: MongoDB best practices for document modeling, aggregations, indexing, and performance optimization. Use when working with MongoDB databases.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# MongoDB Development Guide

Best practices for MongoDB document modeling, queries, aggregations, and performance optimization.

## Document Modeling

### Schema Design Patterns

```javascript
// ✅ Embedded documents (one-to-few)
{
  _id: ObjectId("..."),
  username: "john_doe",
  email: "john@example.com",
  addresses: [
    {
      type: "home",
      street: "123 Main St",
      city: "New York",
      zip: "10001"
    },
    {
      type: "work",
      street: "456 Office Blvd",
      city: "New York",
      zip: "10002"
    }
  ]
}

// ✅ References (one-to-many, many-to-many)
// User document
{
  _id: ObjectId("user123"),
  username: "john_doe",
  email: "john@example.com"
}

// Order documents (reference user)
{
  _id: ObjectId("order456"),
  userId: ObjectId("user123"),
  items: [...],
  total: 99.99
}

// ✅ Hybrid approach (frequently accessed data embedded)
{
  _id: ObjectId("order456"),
  user: {
    _id: ObjectId("user123"),
    username: "john_doe",  // Denormalized for quick access
    email: "john@example.com"
  },
  items: [...],
  total: 99.99
}
```

### Data Types

```javascript
// ✅ Use appropriate types
{
  _id: ObjectId("..."),
  name: String,
  age: NumberInt(25),
  balance: NumberDecimal("1234.56"),
  isActive: Boolean,
  createdAt: ISODate("2024-01-15T10:00:00Z"),
  tags: Array,
  metadata: Object,
  binary: BinData(0, "...")
}

// ✅ Validation schema
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "createdAt"],
      properties: {
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 50
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 150
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
});
```

---

## CRUD Operations

### Create

```javascript
// ✅ Insert one
await db.collection('users').insertOne({
  username: 'john_doe',
  email: 'john@example.com',
  createdAt: new Date()
});

// ✅ Insert many
await db.collection('users').insertMany([
  { username: 'user1', email: 'user1@example.com' },
  { username: 'user2', email: 'user2@example.com' }
], { ordered: false });  // Continue on error
```

### Read

```javascript
// ✅ Find one
const user = await db.collection('users').findOne(
  { email: 'john@example.com' },
  { projection: { password: 0 } }  // Exclude password
);

// ✅ Find many with cursor
const cursor = db.collection('users')
  .find({ isActive: true })
  .project({ username: 1, email: 1 })
  .sort({ createdAt: -1 })
  .limit(20)
  .skip(0);

const users = await cursor.toArray();

// ✅ Count documents
const count = await db.collection('users').countDocuments({ isActive: true });

// ✅ Distinct values
const cities = await db.collection('users').distinct('address.city');
```

### Update

```javascript
// ✅ Update one
await db.collection('users').updateOne(
  { _id: ObjectId('...') },
  {
    $set: { email: 'newemail@example.com' },
    $inc: { loginCount: 1 },
    $currentDate: { lastLogin: true }
  }
);

// ✅ Update many
await db.collection('users').updateMany(
  { isActive: false },
  { $set: { status: 'inactive' } }
);

// ✅ Upsert (update or insert)
await db.collection('users').updateOne(
  { email: 'john@example.com' },
  { $set: { username: 'john_doe', lastSeen: new Date() } },
  { upsert: true }
);

// ✅ Replace document
await db.collection('users').replaceOne(
  { _id: ObjectId('...') },
  { username: 'new_user', email: 'new@example.com', createdAt: new Date() }
);
```

### Delete

```javascript
// ✅ Delete one
await db.collection('users').deleteOne({ _id: ObjectId('...') });

// ✅ Delete many
await db.collection('users').deleteMany({ isActive: false });

// ✅ Soft delete (preferred)
await db.collection('users').updateOne(
  { _id: ObjectId('...') },
  { $set: { deletedAt: new Date() } }
);
```

---

## Query Operators

### Comparison

```javascript
// ✅ Comparison operators
db.collection('products').find({
  price: { $gt: 10, $lte: 100 },  // 10 < price <= 100
  stock: { $ne: 0 },  // stock != 0
  category: { $in: ['electronics', 'books'] },
  status: { $nin: ['deleted', 'archived'] }
});
```

### Logical

```javascript
// ✅ AND (implicit)
db.collection('users').find({
  isActive: true,
  age: { $gte: 18 }
});

// ✅ OR
db.collection('users').find({
  $or: [
    { role: 'admin' },
    { permissions: { $in: ['write', 'delete'] } }
  ]
});

// ✅ NOT
db.collection('users').find({
  age: { $not: { $lt: 18 } }
});

// ✅ NOR
db.collection('users').find({
  $nor: [
    { status: 'banned' },
    { isActive: false }
  ]
});
```

### Array

```javascript
// ✅ Array operators
db.collection('users').find({
  tags: { $all: ['premium', 'verified'] },  // Has all tags
  roles: { $elemMatch: { name: 'admin', active: true } },  // Array element matches
  'addresses.city': 'New York',  // Nested array field
  hobbies: { $size: 3 }  // Array has exactly 3 elements
});
```

### Text Search

```javascript
// ✅ Create text index
db.collection('articles').createIndex({ title: 'text', content: 'text' });

// ✅ Text search
db.collection('articles').find({
  $text: { $search: 'mongodb tutorial' }
}, {
  score: { $meta: 'textScore' }
}).sort({ score: { $meta: 'textScore' } });
```

---

## Aggregation Pipeline

### Basic Aggregation

```javascript
// ✅ Group and count
const result = await db.collection('orders').aggregate([
  { $match: { status: 'completed' } },
  { $group: {
    _id: '$userId',
    totalOrders: { $sum: 1 },
    totalAmount: { $sum: '$amount' },
    avgAmount: { $avg: '$amount' }
  }},
  { $sort: { totalAmount: -1 } },
  { $limit: 10 }
]).toArray();
```

### Advanced Aggregation

```javascript
// ✅ Complex pipeline
const pipeline = [
  // Stage 1: Filter
  { $match: {
    createdAt: { $gte: new Date('2024-01-01') }
  }},
  
  // Stage 2: Lookup (join)
  { $lookup: {
    from: 'users',
    localField: 'userId',
    foreignField: '_id',
    as: 'user'
  }},
  
  // Stage 3: Unwind array
  { $unwind: '$user' },
  
  // Stage 4: Add computed fields
  { $addFields: {
    totalWithTax: { $multiply: ['$amount', 1.1] },
    month: { $month: '$createdAt' }
  }},
  
  // Stage 5: Group
  { $group: {
    _id: {
      userId: '$userId',
      month: '$month'
    },
    username: { $first: '$user.username' },
    orderCount: { $sum: 1 },
    totalRevenue: { $sum: '$totalWithTax' }
  }},
  
  // Stage 6: Project (reshape)
  { $project: {
    _id: 0,
    userId: '$_id.userId',
    month: '$_id.month',
    username: 1,
    orderCount: 1,
    totalRevenue: { $round: ['$totalRevenue', 2] }
  }},
  
  // Stage 7: Sort
  { $sort: { totalRevenue: -1 } }
];

const results = await db.collection('orders').aggregate(pipeline).toArray();
```

### Useful Aggregation Operators

```javascript
// ✅ Array operations
{ $unwind: '$items' },  // Flatten array
{ $push: '$item' },  // Collect into array
{ $addToSet: '$category' },  // Unique values

// ✅ Conditional
{ $cond: {
  if: { $gte: ['$age', 18] },
  then: 'adult',
  else: 'minor'
}},

// ✅ Date operations
{ $dateToString: {
  format: '%Y-%m-%d',
  date: '$createdAt'
}},

// ✅ String operations
{ $concat: ['$firstName', ' ', '$lastName'] },
{ $toLower: '$email' },
{ $substr: ['$phone', 0, 3] }
```

---

## Indexing

### Create Indexes

```javascript
// ✅ Single field index
db.collection('users').createIndex({ email: 1 });

// ✅ Compound index (order matters!)
db.collection('orders').createIndex({ userId: 1, createdAt: -1 });

// ✅ Unique index
db.collection('users').createIndex({ username: 1 }, { unique: true });

// ✅ Partial index
db.collection('users').createIndex(
  { email: 1 },
  { partialFilterExpression: { isActive: true } }
);

// ✅ TTL index (auto-delete after time)
db.collection('sessions').createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }  // Delete after 1 hour
);

// ✅ Text index
db.collection('articles').createIndex({ title: 'text', content: 'text' });

// ✅ Geospatial index
db.collection('places').createIndex({ location: '2dsphere' });
```

### Index Management

```javascript
// ✅ List indexes
db.collection('users').getIndexes();

// ✅ Drop index
db.collection('users').dropIndex('email_1');

// ✅ Explain query
db.collection('users').find({ email: 'test@example.com' }).explain('executionStats');
```

---

## Transactions

```javascript
// ✅ Multi-document transactions
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    await db.collection('accounts').updateOne(
      { _id: fromAccountId },
      { $inc: { balance: -amount } },
      { session }
    );
    
    await db.collection('accounts').updateOne(
      { _id: toAccountId },
      { $inc: { balance: amount } },
      { session }
    );
    
    await db.collection('transactions').insertOne({
      from: fromAccountId,
      to: toAccountId,
      amount,
      timestamp: new Date()
    }, { session });
  });
} finally {
  await session.endSession();
}
```

---

## Performance Optimization

### Query Optimization

```javascript
// ❌ Slow: No index
db.collection('users').find({ email: 'test@example.com' });

// ✅ Fast: With index
db.collection('users').createIndex({ email: 1 });
db.collection('users').find({ email: 'test@example.com' });

// ❌ Slow: Regex without index
db.collection('users').find({ email: /test/ });

// ✅ Fast: Anchored regex with index
db.collection('users').find({ email: /^test/ });

// ✅ Use projection to limit fields
db.collection('users').find(
  { isActive: true },
  { projection: { username: 1, email: 1, _id: 0 } }
);
```

### Bulk Operations

```javascript
// ✅ Bulk write
const bulkOps = [
  {
    insertOne: {
      document: { username: 'user1', email: 'user1@example.com' }
    }
  },
  {
    updateOne: {
      filter: { username: 'user2' },
      update: { $set: { email: 'newemail@example.com' } }
    }
  },
  {
    deleteOne: {
      filter: { username: 'user3' }
    }
  }
];

await db.collection('users').bulkWrite(bulkOps, { ordered: false });
```

---

## Connection & Client

```javascript
// ✅ MongoDB connection (Node.js)
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

await client.connect();
const db = client.db('mydb');

// ✅ Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});

// ✅ Error handling
client.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
```

---

## Common Patterns

### Pagination

```javascript
// ✅ Offset-based pagination
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;

const users = await db.collection('users')
  .find({})
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .toArray();

// ✅ Cursor-based pagination (better for large datasets)
const lastId = req.query.lastId;

const users = await db.collection('users')
  .find(lastId ? { _id: { $gt: ObjectId(lastId) } } : {})
  .sort({ _id: 1 })
  .limit(20)
  .toArray();
```

### Timestamps

```javascript
// ✅ Auto timestamps with middleware (Mongoose)
const userSchema = new Schema({
  username: String,
  email: String
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// ✅ Manual timestamps
await db.collection('users').insertOne({
  username: 'john',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Soft Deletes

```javascript
// ✅ Soft delete
await db.collection('users').updateOne(
  { _id: ObjectId('...') },
  { $set: { deletedAt: new Date() } }
);

// ✅ Query non-deleted
db.collection('users').find({ deletedAt: { $exists: false } });
```

---

## Monitoring

```javascript
// ✅ Database stats
db.stats();

// ✅ Collection stats
db.collection('users').stats();

// ✅ Current operations
db.currentOp();

// ✅ Kill operation
db.killOp(opId);

// ✅ Profiler
db.setProfilingLevel(1, { slowms: 100 });  // Log slow queries
db.system.profile.find().limit(10).sort({ ts: -1 });
```

---

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/)
- [Mongoose ODM](https://mongoosejs.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
