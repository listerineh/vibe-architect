---
name: javascript
description: Modern JavaScript (ES6+) best practices, patterns, and core concepts. Use when working with JavaScript projects.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# JavaScript Development Guide

Modern JavaScript (ES6+) best practices, patterns, and core concepts.

## Core Concepts

1. **ES6+ Features** - Use modern JavaScript syntax
2. **Immutability** - Prefer const and avoid mutations
3. **Functional Programming** - Use pure functions when possible
4. **Async/Await** - Handle asynchronous code cleanly

---

## Variables & Constants

```javascript
// ✅ Use const by default
const name = 'John';
const age = 30;

// ✅ Use let when reassignment is needed
let count = 0;
count++;

// ❌ Avoid var
var oldStyle = 'avoid this';

// ✅ Destructuring
const user = { name: 'John', age: 30, email: 'john@example.com' };
const { name, age } = user;

const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;

// ✅ Default values
const { role = 'user' } = user;
```

---

## Functions

```javascript
// ✅ Arrow functions
const add = (a, b) => a + b;

const square = x => x * x;  // Single parameter, no parentheses

const greet = name => {
  const message = `Hello, ${name}!`;
  return message;
};

// ✅ Default parameters
const multiply = (a, b = 1) => a * b;

// ✅ Rest parameters
const sum = (...numbers) => numbers.reduce((acc, n) => acc + n, 0);

// ✅ Spread operator
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };

// ✅ Higher-order functions
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// ✅ Function composition
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const addOne = x => x + 1;
const double = x => x * 2;
const addOneThenDouble = compose(double, addOne);
```

---

## Objects & Arrays

```javascript
// ✅ Object shorthand
const name = 'John';
const age = 30;
const user = { name, age };  // Same as { name: name, age: age }

// ✅ Computed property names
const key = 'email';
const user = {
  name: 'John',
  [key]: 'john@example.com'
};

// ✅ Object methods shorthand
const calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  }
};

// ✅ Array methods
const numbers = [1, 2, 3, 4, 5];

// Map
const doubled = numbers.map(n => n * 2);

// Filter
const evens = numbers.filter(n => n % 2 === 0);

// Reduce
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Find
const firstEven = numbers.find(n => n % 2 === 0);

// Some/Every
const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);

// ✅ Array destructuring with rest
const [first, ...rest] = numbers;

// ✅ Immutable array operations
const original = [1, 2, 3];

// Add to end
const withFour = [...original, 4];

// Add to beginning
const withZero = [0, ...original];

// Remove item
const withoutTwo = original.filter(n => n !== 2);

// Update item
const updated = original.map(n => n === 2 ? 20 : n);
```

---

## Async/Promises

```javascript
// ✅ Promises
const fetchUser = (id) => {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error(error));
};

// ✅ Async/Await (preferred)
const fetchUser = async (id) => {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ✅ Promise.all (parallel execution)
const fetchMultiple = async () => {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ]);
  return { users, posts };
};

// ✅ Promise.race
const timeout = (ms) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), ms)
);

const fetchWithTimeout = async (url, ms = 5000) => {
  return Promise.race([
    fetch(url),
    timeout(ms)
  ]);
};

// ✅ Promise.allSettled (handle all results)
const results = await Promise.allSettled([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log(result.value);
  } else {
    console.error(result.reason);
  }
});
```

---

## Classes

```javascript
// ✅ ES6 Classes
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hello, I'm ${this.name}`;
  }

  // Static method
  static create(name, age) {
    return new Person(name, age);
  }

  // Getter
  get info() {
    return `${this.name}, ${this.age} years old`;
  }

  // Setter
  set age(value) {
    if (value < 0) throw new Error('Age must be positive');
    this._age = value;
  }
}

// ✅ Inheritance
class Employee extends Person {
  constructor(name, age, role) {
    super(name, age);
    this.role = role;
  }

  greet() {
    return `${super.greet()}, I'm a ${this.role}`;
  }
}

// ✅ Private fields (ES2022)
class BankAccount {
  #balance = 0;

  deposit(amount) {
    this.#balance += amount;
  }

  getBalance() {
    return this.#balance;
  }
}
```

---

## Modules

```javascript
// ✅ Named exports
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// Import named exports
import { add, subtract } from './math.js';

// Import with alias
import { add as sum } from './math.js';

// Import all
import * as math from './math.js';

// ✅ Default export
// user.js
export default class User {
  constructor(name) {
    this.name = name;
  }
}

// Import default
import User from './user.js';

// ✅ Mixed exports
// utils.js
export const helper = () => {};
export default class Main {}

// Import both
import Main, { helper } from './utils.js';
```

---

## Error Handling

```javascript
// ✅ Try/Catch
try {
  const data = JSON.parse(jsonString);
  processData(data);
} catch (error) {
  console.error('Error parsing JSON:', error.message);
} finally {
  cleanup();
}

// ✅ Custom errors
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateUser(user) {
  if (!user.email) {
    throw new ValidationError('Email is required');
  }
}

// ✅ Async error handling
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
```

---

## Modern Features

### Optional Chaining

```javascript
// ✅ Optional chaining
const user = {
  name: 'John',
  address: {
    city: 'New York'
  }
};

const city = user?.address?.city;  // 'New York'
const zip = user?.address?.zip;    // undefined (no error)

// With arrays
const firstUser = users?.[0];

// With functions
const result = obj.method?.();
```

### Nullish Coalescing

```javascript
// ✅ Nullish coalescing (??)
const value = null ?? 'default';  // 'default'
const value = undefined ?? 'default';  // 'default'
const value = 0 ?? 'default';  // 0 (not 'default')
const value = '' ?? 'default';  // '' (not 'default')

// vs OR operator
const value = 0 || 'default';  // 'default'
const value = '' || 'default';  // 'default'
```

### Template Literals

```javascript
// ✅ Template literals
const name = 'John';
const age = 30;
const message = `Hello, ${name}! You are ${age} years old.`;

// ✅ Multi-line strings
const html = `
  <div>
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
`;

// ✅ Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return `${result}${str}<mark>${values[i] || ''}</mark>`;
  }, '');
}

const name = 'John';
const message = highlight`Hello, ${name}!`;
```

---

## Common Patterns

### Debounce

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);
```

### Throttle

```javascript
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage
const handleScroll = throttle(() => {
  console.log('Scrolling...');
}, 100);
```

### Memoization

```javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
```

### Curry

```javascript
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
};

// Usage
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

curriedAdd(1)(2)(3);  // 6
curriedAdd(1, 2)(3);  // 6
curriedAdd(1)(2, 3);  // 6
```

---

## Best Practices

```javascript
// ✅ Use strict equality
if (value === 10) {}  // Good
if (value == 10) {}   // Avoid

// ✅ Avoid global variables
// ❌ Bad
var globalVar = 'global';

// ✅ Good
const config = {
  apiUrl: 'https://api.example.com'
};

// ✅ Use meaningful names
// ❌ Bad
const d = new Date();
const x = users.filter(u => u.a);

// ✅ Good
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);

// ✅ Keep functions small and focused
// ❌ Bad
function processUser(user) {
  // 100 lines of code doing multiple things
}

// ✅ Good
function validateUser(user) { /* ... */ }
function saveUser(user) { /* ... */ }
function notifyUser(user) { /* ... */ }

// ✅ Use early returns
// ❌ Bad
function processData(data) {
  if (data) {
    if (data.isValid) {
      // Process data
      return result;
    }
  }
  return null;
}

// ✅ Good
function processData(data) {
  if (!data) return null;
  if (!data.isValid) return null;
  
  // Process data
  return result;
}

// ✅ Avoid nested callbacks (callback hell)
// ❌ Bad
getData((data) => {
  processData(data, (result) => {
    saveResult(result, (saved) => {
      notify(saved, () => {
        // ...
      });
    });
  });
});

// ✅ Good
async function workflow() {
  const data = await getData();
  const result = await processData(data);
  const saved = await saveResult(result);
  await notify(saved);
}
```

---

## Performance Tips

```javascript
// ✅ Use const for better performance
const value = 10;  // Faster than let

// ✅ Cache array length in loops
const items = [1, 2, 3, 4, 5];
for (let i = 0, len = items.length; i < len; i++) {
  // Process items[i]
}

// ✅ Use object/array destructuring
const { name, age } = user;  // Faster than accessing properties multiple times

// ✅ Avoid creating functions in loops
// ❌ Bad
for (let i = 0; i < items.length; i++) {
  items[i].addEventListener('click', function() {
    console.log(i);
  });
}

// ✅ Good
function handleClick(index) {
  console.log(index);
}

for (let i = 0; i < items.length; i++) {
  items[i].addEventListener('click', () => handleClick(i));
}

// ✅ Use Set for unique values
const uniqueValues = [...new Set(array)];

// ✅ Use Map for key-value pairs
const cache = new Map();
cache.set('key', 'value');
cache.get('key');
```

---

## Resources

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [JavaScript.info](https://javascript.info/)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
