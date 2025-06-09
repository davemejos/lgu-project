# Supabase Integration Guide

## Overview
Your LGU Project App now has full Supabase integration! This document explains how to use the new database functionality while keeping your existing mock data intact.

## What's Been Added

### 1. Environment Variables (`.env.local`)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lkolpgpmdculqqfqyzaf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. New Files Created
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/database.types.ts` - TypeScript types for database tables
- `src/lib/supabaseService.ts` - Service layer for database operations
- `src/app/test-supabase/page.tsx` - Testing page to verify connection
- `supabase-schema.sql` - Database schema for easy setup
- `SUPABASE_INTEGRATION.md` - This guide

### 3. Dependencies Added
- `@supabase/supabase-js` - Official Supabase JavaScript client

## Testing Your Integration

### Visit the Test Page
Navigate to `/test-supabase` in your browser to run comprehensive tests:
- Basic connection test
- Service health check
- Database operations test
- Environment variables verification

The test page will show you exactly what's working and what needs attention.

## Database Setup

### Option 1: Quick Setup (Recommended)
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to your project: https://lkolpgpmdculqqfqyzaf.supabase.co
3. Navigate to SQL Editor
4. Copy and paste the contents of `supabase-schema.sql`
5. Run the SQL to create all tables, indexes, and sample data

### Option 2: Manual Setup
Create tables manually in your Supabase dashboard:
- `users` - System users and authentication
- `personnel` - Staff/personnel information
- `personnel_documents` - Document attachments

## Using Supabase in Your Code

### Import the Service
```typescript
import { SupabaseService } from '@/lib/supabaseService'
```

### Example Operations
```typescript
// Get all users
const users = await SupabaseService.getAllUsers()

// Find user by email
const user = await SupabaseService.findUserByEmail('demo@admin.com')

// Get all personnel
const personnel = await SupabaseService.getAllPersonnel()

// Create new personnel
const newPersonnel = await SupabaseService.createPersonnel({
  name: 'John Doe',
  email: 'john@example.com',
  department: 'IT'
})
```

### Direct Supabase Client Usage
```typescript
import { supabase } from '@/lib/supabase'

// Query data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'ACTIVE')

// Insert data
const { data, error } = await supabase
  .from('personnel')
  .insert({ name: 'Jane Doe', email: 'jane@example.com' })
```

## Migration Strategy

### Current State
- Your existing mock data (`src/lib/mockData.ts`) is **unchanged**
- All existing functionality continues to work
- You can gradually migrate to Supabase

### Gradual Migration
1. **Test Phase**: Use the test page to verify everything works
2. **Parallel Phase**: Run both mock data and Supabase side by side
3. **Migration Phase**: Gradually replace mock data calls with Supabase calls
4. **Cleanup Phase**: Remove mock data when no longer needed

### Example Migration Pattern
```typescript
// Before (using mock data)
import { db } from '@/lib/db'
const users = await db.getAllUsers()

// After (using Supabase)
import { SupabaseService } from '@/lib/supabaseService'
const users = await SupabaseService.getAllUsers()
```

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Authenticated users can read data
- Service role has full access for admin operations

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous access key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access key (server-side only)

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check environment variables are set correctly
   - Verify Supabase project is active
   - Check network connectivity

2. **Table Does Not Exist**
   - Run the SQL schema in your Supabase dashboard
   - Check table names match exactly

3. **Permission Denied**
   - Verify RLS policies are set up correctly
   - Check if you're using the right client (anon vs service role)

### Getting Help
- Visit the test page at `/test-supabase` for detailed diagnostics
- Check browser console for error messages
- Review Supabase dashboard logs

## Next Steps

1. **Test the Integration**: Visit `/test-supabase` to verify everything works
2. **Set Up Database**: Run the SQL schema in your Supabase dashboard
3. **Start Using**: Begin replacing mock data calls with Supabase calls
4. **Customize**: Modify the schema and services to fit your specific needs

## Benefits of This Integration

- **Scalable**: Real database that grows with your application
- **Real-time**: Built-in real-time subscriptions
- **Secure**: Row-level security and authentication
- **Flexible**: Easy to modify schema and add features
- **Reliable**: Hosted by Supabase with automatic backups
- **Type-safe**: Full TypeScript support with generated types

Your Supabase integration is now complete and ready to use! 🎉
