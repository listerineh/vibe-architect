---
name: typescript
description: TypeScript best practices, type safety, advanced types, and configuration. Use when working with TypeScript projects.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# TypeScript Development Guide

Modern TypeScript development with type safety, advanced types, and best practices.

## Core Principles

1. **Type Safety** - Catch errors at compile time
2. **Inference** - Let TypeScript infer types when possible
3. **Strictness** - Enable strict mode for maximum safety
4. **Readability** - Types should make code more understandable

---

## Basic Types

```typescript
// ✅ Primitive types
const name: string = 'John';
const age: number = 30;
const isActive: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// ✅ Arrays
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ['a', 'b', 'c'];

// ✅ Tuples
const tuple: [string, number] = ['John', 30];

// ✅ Enums
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

const userStatus: Status = Status.Active;

// ✅ Any (avoid when possible)
let anything: any = 'string';
anything = 123;

// ✅ Unknown (safer than any)
let value: unknown = 'string';
if (typeof value === 'string') {
  console.log(value.toUpperCase());
}

// ✅ Never (for functions that never return)
function throwError(message: string): never {
  throw new Error(message);
}

// ✅ Void (for functions with no return value)
function logMessage(message: string): void {
  console.log(message);
}
```

---

## Interfaces & Types

### Interfaces

```typescript
// ✅ Interface for objects
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;  // Optional
  readonly createdAt: Date;  // Read-only
}

const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  createdAt: new Date()
};

// ✅ Extending interfaces
interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// ✅ Interface for functions
interface SearchFunc {
  (query: string, limit: number): Promise<User[]>;
}

const search: SearchFunc = async (query, limit) => {
  // Implementation
  return [];
};
```

### Type Aliases

```typescript
// ✅ Type alias
type ID = string | number;

type Point = {
  x: number;
  y: number;
};

// ✅ Union types
type Status = 'active' | 'inactive' | 'pending';

// ✅ Intersection types
type Employee = User & {
  employeeId: string;
  department: string;
};

// ✅ Function types
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
```

### Interface vs Type

```typescript
// ✅ Use interface for objects that can be extended
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// ✅ Use type for unions, intersections, primitives
type ID = string | number;
type Coordinates = [number, number];
type Callback = () => void;
```

---

## Advanced Types

### Generics

```typescript
// ✅ Generic function
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity('hello');  // Type inferred

// ✅ Generic interface
interface Response<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: Response<User> = {
  data: { id: 1, name: 'John', email: 'john@example.com', createdAt: new Date() },
  status: 200,
  message: 'Success'
};

// ✅ Generic constraints
interface HasId {
  id: number;
}

function getById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// ✅ Multiple type parameters
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}
```

### Utility Types

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// ✅ Partial - Make all properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number; }

// ✅ Required - Make all properties required
type RequiredUser = Required<PartialUser>;

// ✅ Readonly - Make all properties readonly
type ReadonlyUser = Readonly<User>;

// ✅ Pick - Select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

// ✅ Omit - Exclude specific properties
type UserWithoutAge = Omit<User, 'age'>;
// { id: number; name: string; email: string; }

// ✅ Record - Create object type with specific keys
type UserRoles = Record<string, User>;
// { [key: string]: User }

// ✅ Exclude - Exclude types from union
type Status = 'active' | 'inactive' | 'pending';
type ActiveStatus = Exclude<Status, 'inactive' | 'pending'>;
// 'active'

// ✅ Extract - Extract types from union
type InactiveStatus = Extract<Status, 'inactive' | 'pending'>;
// 'inactive' | 'pending'

// ✅ NonNullable - Remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// string

// ✅ ReturnType - Get function return type
function getUser() {
  return { id: 1, name: 'John' };
}
type UserReturn = ReturnType<typeof getUser>;
// { id: number; name: string; }

// ✅ Parameters - Get function parameters
function createUser(name: string, age: number) {}
type CreateUserParams = Parameters<typeof createUser>;
// [string, number]
```

### Conditional Types

```typescript
// ✅ Conditional type
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// ✅ Infer keyword
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Func = () => string;
type Return = GetReturnType<Func>;  // string

// ✅ Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;

type StrOrNum = string | number;
type Arrays = ToArray<StrOrNum>;  // string[] | number[]
```

### Mapped Types

```typescript
// ✅ Mapped type
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null; ... }

// ✅ With modifiers
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};
```

### Template Literal Types

```typescript
// ✅ Template literal types
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

// ✅ String manipulation
type Uppercase<S extends string> = Uppercase<S>;
type Lowercase<S extends string> = Lowercase<S>;
type Capitalize<S extends string> = Capitalize<S>;
type Uncapitalize<S extends string> = Uncapitalize<S>;
```

---

## Type Guards

```typescript
// ✅ typeof guard
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

// ✅ instanceof guard
class Dog {
  bark() {}
}

class Cat {
  meow() {}
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// ✅ in operator
interface Bird {
  fly(): void;
}

interface Fish {
  swim(): void;
}

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly();
  } else {
    animal.swim();
  }
}

// ✅ Custom type guard
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}

function processData(data: unknown) {
  if (isUser(data)) {
    console.log(data.name);  // TypeScript knows it's User
  }
}
```

---

## Classes

```typescript
// ✅ Class with types
class Person {
  private id: number;
  protected name: string;
  public age: number;
  readonly createdAt: Date;

  constructor(id: number, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.createdAt = new Date();
  }

  getName(): string {
    return this.name;
  }

  private getId(): number {
    return this.id;
  }
}

// ✅ Shorthand constructor
class User {
  constructor(
    public id: number,
    public name: string,
    private password: string
  ) {}
}

// ✅ Abstract class
abstract class Animal {
  abstract makeSound(): void;

  move(): void {
    console.log('Moving...');
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log('Woof!');
  }
}

// ✅ Implementing interfaces
interface Serializable {
  serialize(): string;
}

class Product implements Serializable {
  constructor(public name: string, public price: number) {}

  serialize(): string {
    return JSON.stringify(this);
  }
}
```

---

## Async/Promises

```typescript
// ✅ Promise types
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ✅ Promise with error handling
async function safelyFetchUser(id: number): Promise<User | null> {
  try {
    return await fetchUser(id);
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ✅ Multiple promises
async function fetchMultiple(): Promise<[User[], Post[]]> {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ]);
  return [users, posts];
}
```

---

## Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    // ✅ Strict mode (enable all)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // ✅ Module resolution
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],

    // ✅ Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // ✅ Type checking
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    // ✅ Output
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // ✅ Path mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Best Practices

```typescript
// ✅ Use const assertions
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} as const;
// Type: { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000 }

// ✅ Use type inference
const numbers = [1, 2, 3];  // number[]
const user = { name: 'John', age: 30 };  // { name: string; age: number }

// ✅ Avoid any
// ❌ Bad
function process(data: any) {}

// ✅ Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // Use data as string
  }
}

// ✅ Use discriminated unions
type Success = { status: 'success'; data: User };
type Error = { status: 'error'; message: string };
type Result = Success | Error;

function handleResult(result: Result) {
  if (result.status === 'success') {
    console.log(result.data);  // TypeScript knows it's Success
  } else {
    console.log(result.message);  // TypeScript knows it's Error
  }
}

// ✅ Use readonly for immutability
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// ✅ Use satisfies operator (TS 4.9+)
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255]
} satisfies Record<string, string | number[]>;

// palette.red is [number, number, number], not string | number[]
```

---

## Common Patterns

### Factory Pattern

```typescript
interface Product {
  name: string;
  price: number;
}

function createProduct(name: string, price: number): Product {
  return { name, price };
}
```

### Builder Pattern

```typescript
class UserBuilder {
  private user: Partial<User> = {};

  setName(name: string): this {
    this.user.name = name;
    return this;
  }

  setEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  build(): User {
    if (!this.user.name || !this.user.email) {
      throw new Error('Missing required fields');
    }
    return this.user as User;
  }
}

const user = new UserBuilder()
  .setName('John')
  .setEmail('john@example.com')
  .build();
```

### Repository Pattern

```typescript
interface Repository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: number, item: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

class UserRepository implements Repository<User> {
  async findById(id: number): Promise<User | null> {
    // Implementation
    return null;
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  async create(item: Omit<User, 'id'>): Promise<User> {
    // Implementation
    return { ...item, id: 1, createdAt: new Date() };
  }

  async update(id: number, item: Partial<User>): Promise<User> {
    // Implementation
    return {} as User;
  }

  async delete(id: number): Promise<void> {
    // Implementation
  }
}
```

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TS Playground](https://www.typescriptlang.org/play)
