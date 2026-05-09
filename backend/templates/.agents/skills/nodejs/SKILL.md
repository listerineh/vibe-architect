---
name: nodejs
description: Node.js and Express best practices for building scalable backend applications. Use when working with Node.js, Express, middleware, or async patterns.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# Node.js & Express Development Guide

Modern Node.js development with Express, async patterns, and production best practices.

## Project Structure

```
project/
├── src/
│   ├── app.js              # Express app setup
│   ├── server.js           # Server entry point
│   ├── config/             # Configuration
│   │   └── index.js
│   ├── routes/             # Route definitions
│   │   ├── index.js
│   │   └── users.js
│   ├── controllers/        # Request handlers
│   │   └── userController.js
│   ├── services/           # Business logic
│   │   └── userService.js
│   ├── models/             # Data models
│   │   └── User.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── utils/              # Utilities
│       └── logger.js
├── tests/
├── package.json
└── .env
```

---

## Express Setup

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

// src/server.js
const app = require('./app');
const config = require('./config');

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Configuration

```javascript
// src/config/index.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
    poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
    poolMax: parseInt(process.env.DB_POOL_MAX) || 10,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  redis: {
    url: process.env.REDIS_URL,
  },
};
```

---

## Routes & Controllers

```javascript
// src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { userSchema } = require('../validators/userSchema');

router.post('/', validate(userSchema), userController.createUser);
router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, userController.getUserById);
router.patch('/:id', authenticate, validate(userSchema), userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;

// src/controllers/userController.js
const userService = require('../services/userService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const users = await userService.getUsers({ page, limit });
  res.json({ success: true, data: users });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(204).send();
});
```

---

## Services Layer

```javascript
// src/services/userService.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

class UserService {
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });
    return this.sanitizeUser(user);
  }

  async getUsers({ page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const users = await User.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });
    return users.map(this.sanitizeUser);
  }

  async getUserById(id) {
    const user = await User.findByPk(id);
    return user ? this.sanitizeUser(user) : null;
  }

  async updateUser(id, userData) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    
    await user.update(userData);
    return this.sanitizeUser(user);
  }

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    
    await user.destroy();
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user.toJSON();
    return sanitized;
  }
}

module.exports = new UserService();
```

---

## Middleware

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// src/middleware/errorHandler.js
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

exports.notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

// src/middleware/validate.js
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    next();
  };
};
```

---

## Async Error Handling

```javascript
// src/utils/asyncHandler.js
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
const { asyncHandler } = require('../utils/asyncHandler');

router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.findAll();
  res.json(users);
}));
```

---

## Database (Sequelize)

```javascript
// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = User;
```

---

## Testing

```javascript
// tests/users.test.js
const request = require('supertest');
const app = require('../src/app');

describe('User API', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
```

---

## Best Practices

```javascript
// ✅ Use async/await
async function fetchData() {
  try {
    const data = await fetch('https://api.example.com/data');
    return data.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// ✅ Environment variables
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
};

// ✅ Proper error handling
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ✅ Input validation
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
});

// ✅ Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Resources

- [Express Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Sequelize Documentation](https://sequelize.org/)
- [Jest Testing](https://jestjs.io/)
