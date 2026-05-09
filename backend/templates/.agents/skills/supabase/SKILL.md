# Supabase Best Practices

## Overview
Supabase is an open-source Firebase alternative providing PostgreSQL database, authentication, storage, and real-time subscriptions.

## Core Concepts

### 1. Database & Schema Design
- Use Row Level Security (RLS) for all tables
- Define clear foreign key relationships
- Use PostgreSQL native types (JSONB, arrays, etc.)
- Create indexes for frequently queried columns
- Use database functions for complex operations

### 2. Authentication
- Use Supabase Auth for user management
- Implement RLS policies based on `auth.uid()`
- Store user metadata in `auth.users` or custom profiles table
- Use JWT tokens for API authentication
- Implement proper session management

### 3. Real-time Subscriptions
- Subscribe only to necessary data changes
- Use filters to reduce payload size
- Unsubscribe when components unmount
- Handle reconnection logic
- Implement optimistic updates

### 4. Storage
- Use Supabase Storage for files and media
- Implement RLS policies for buckets
- Generate signed URLs for private files
- Optimize images before upload
- Use CDN for public assets

## Code Patterns

### Client Initialization
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Type-Safe Queries
```typescript
// Define database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
  }
}

// Use typed client
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

### Row Level Security
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### Real-time Subscriptions
```typescript
const subscription = supabase
  .channel('public:posts')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Cleanup
return () => {
  subscription.unsubscribe()
}
```

### Authentication Flow
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### File Upload
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`public/${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`public/${userId}/avatar.png`)
```

## Performance Optimization

### 1. Query Optimization
- Use `.select()` to fetch only needed columns
- Use `.limit()` for pagination
- Implement cursor-based pagination for large datasets
- Use `.explain()` to analyze query performance
- Create composite indexes for complex queries

### 2. Caching Strategies
- Cache static data in React Query or SWR
- Use `staleTime` and `cacheTime` appropriately
- Implement optimistic updates
- Use Supabase Edge Functions for server-side caching

### 3. Connection Pooling
- Use connection pooling in production
- Configure `pooler` mode for serverless environments
- Monitor connection usage
- Implement connection retry logic

## Security Best Practices

### 1. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Server-side only
```

### 2. RLS Policies
- Always enable RLS on tables with user data
- Test policies thoroughly
- Use helper functions for complex policies
- Document policy logic

### 3. API Keys
- Never expose service role key on client
- Use anon key for client-side operations
- Rotate keys regularly
- Monitor API usage

## Common Patterns

### Custom Hooks
```typescript
export function useUser() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  return user
}
```

### Server-Side Data Fetching (Next.js)
```typescript
export async function getServerSideProps() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  
  return {
    props: {
      posts: data ?? [],
    },
  }
}
```

## Cost Optimization

### Free Tier Limits
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users

### Optimization Tips
- Use database functions to reduce client-server roundtrips
- Implement pagination to reduce data transfer
- Compress images before upload
- Use CDN for static assets
- Monitor usage in Supabase dashboard
- Clean up unused data regularly

## Testing

### Unit Tests
```typescript
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@supabase/supabase-js')

test('fetches user data', async () => {
  const mockData = { id: '1', email: 'test@example.com' }
  
  createClient.mockReturnValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null })
      })
    })
  })
  
  // Test your function
})
```

## Migration Strategy

### Database Migrations
```sql
-- migrations/001_create_users_table.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Version Control
- Store migrations in version control
- Use Supabase CLI for migration management
- Test migrations in staging environment
- Document breaking changes

## Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Guide](https://supabase.com/docs/guides/realtime)
