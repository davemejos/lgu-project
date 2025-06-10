# 📚 Database Usage Guide - Enterprise Supabase Integration

## 🚀 Quick Start

Your application now uses **real Supabase database** instead of mock data. All existing functionality works the same, but now with persistent data storage!

## 🔧 How to Use the New Database Service

### **Import the Database Service**
```typescript
import { db } from '@/lib/db'
// or
import DatabaseService from '@/lib/database'
```

### **User Operations**

#### **Find User by Email**
```typescript
const user = await db.findUserByEmail('demo@admin.com')
if (user) {
  console.log('User found:', user.name)
}
```

#### **Create New User**
```typescript
const newUser = await db.createUser({
  email: 'newuser@example.com',
  name: 'New User',
  password: 'hashedPassword',
  phone: '+63 912 345 6789',
  address: 'Ipil, Zamboanga Sibugay',
  role: 'user',
  status: 'ACTIVE'
})
```

#### **Get All Users with Filtering**
```typescript
const users = await db.getAllUsers({
  page: 1,
  limit: 10,
  search: 'john',
  status: 'ACTIVE'
})
```

#### **Update User**
```typescript
const updatedUser = await db.updateUser(userId, {
  name: 'Updated Name',
  phone: '+63 912 345 6790'
})
```

### **Personnel Operations**

#### **Find Personnel by ID**
```typescript
const personnel = await db.findPersonnelById(1)
if (personnel) {
  console.log('Personnel:', personnel.name)
}
```

#### **Create New Personnel**
```typescript
const newPersonnel = await db.createPersonnel({
  name: 'John Doe',
  email: 'john.doe@fisheries.gov',
  phone: '+63 912 345 6789',
  address: 'Ipil, Zamboanga Sibugay',
  department: 'Fisheries Management',
  position: 'Senior Officer',
  status: 'Active',
  biography: 'Experienced fisheries officer...'
})
```

#### **Get All Personnel with Pagination**
```typescript
const result = await db.getAllPersonnel(1, 10, {
  search: 'john',
  department: 'Fisheries Management',
  status: 'Active'
})

console.log('Personnel:', result.data)
console.log('Pagination:', result.pagination)
```

### **Document Operations**

#### **Get Personnel Documents**
```typescript
const documents = await db.getPersonnelDocuments(personnelId)
console.log('Documents:', documents)
```

#### **Create Personnel Document**
```typescript
const newDocument = await db.createPersonnelDocument({
  filename: 'certificate.pdf',
  original_name: 'Certificate - John Doe.pdf',
  mime_type: 'application/pdf',
  size: 1024000,
  path: '/documents/certificate.pdf',
  personnel_id: personnelId
})
```

## 🔍 Advanced Usage

### **Error Handling**
```typescript
try {
  const user = await db.findUserByEmail('test@example.com')
  // Handle success
} catch (error) {
  console.error('Database error:', error)
  // Handle error appropriately
}
```

### **Health Check**
```typescript
const health = await db.healthCheck()
if (health.success) {
  console.log('Database is healthy!')
} else {
  console.error('Database issue:', health.message)
}
```

## 🎯 API Route Examples

### **In Your API Routes**
```typescript
// pages/api/users/route.ts
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const users = await db.getAllUsers()
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    )
  }
}
```

### **With Authentication**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Your database operations here
  const result = await db.createUser(userData)
  return NextResponse.json(result)
}
```

## 🔒 Security Best Practices

### **Always Validate Input**
```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  // ... other validations
})

const validatedData = userSchema.parse(requestBody)
const user = await db.createUser(validatedData)
```

### **Use Proper Error Handling**
```typescript
try {
  const result = await db.someOperation()
  return NextResponse.json(result)
} catch (error) {
  console.error('[API] Database error:', error)
  return NextResponse.json(
    { 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 
    { status: 500 }
  )
}
```

## 📊 Performance Tips

### **Use Pagination for Large Datasets**
```typescript
// Good: Paginated results
const result = await db.getAllPersonnel(1, 20)

// Avoid: Loading all records at once
// const allPersonnel = await db.getAllPersonnel() // Don't do this for large datasets
```

### **Use Specific Filters**
```typescript
// Good: Specific search
const users = await db.getAllUsers({
  status: 'ACTIVE',
  search: 'john'
})

// Better: More specific queries reduce database load
```

## 🧪 Testing Your Database Operations

### **Test Database Connection**
Visit: `http://localhost:3001/test-supabase`

### **Manual Testing**
```typescript
// In your component or API route
const testDatabaseOperations = async () => {
  try {
    // Test user operations
    const users = await db.getAllUsers()
    console.log('Users loaded:', users.length)

    // Test personnel operations
    const personnel = await db.getAllPersonnel(1, 5)
    console.log('Personnel loaded:', personnel.data.length)

    // Test health check
    const health = await db.healthCheck()
    console.log('Database health:', health.success)
  } catch (error) {
    console.error('Test failed:', error)
  }
}
```

## 🎉 Migration Complete!

Your application now uses **enterprise-grade Supabase database** with:
- ✅ **Real data persistence**
- ✅ **Production-ready performance**
- ✅ **Type-safe operations**
- ✅ **Comprehensive error handling**
- ✅ **Scalable architecture**

**All your existing code works the same way, but now with real database power!** 🚀
