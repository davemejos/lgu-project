# 🔌 LGU Project API Documentation

This directory contains comprehensive API documentation for all endpoints and services.

## 📁 **API Documentation Structure**

### **Core APIs**
- `MEDIA_API.md` - Media management endpoints
- `WEBHOOK_API.md` - Cloudinary webhook endpoints
- `SYNC_API.md` - Synchronization endpoints
- `STATUS_API.md` - Sync status and monitoring endpoints

### **Service APIs**
- `CLOUDINARY_API.md` - Cloudinary integration endpoints
- `SUPABASE_API.md` - Database service endpoints
- `UPLOAD_API.md` - File upload endpoints
- `AUTH_API.md` - Authentication endpoints

## 🚀 **API Overview**

### **Base URL**
```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

### **Authentication**
Most endpoints use Supabase authentication with JWT tokens:
```typescript
headers: {
  'Authorization': `Bearer ${supabaseToken}`,
  'Content-Type': 'application/json'
}
```

## 📊 **Core Endpoints**

### **Media Management**
```typescript
GET    /api/cloudinary/media          // List media items
POST   /api/cloudinary/upload         // Upload new media
DELETE /api/cloudinary/media          // Delete media items
GET    /api/cloudinary/media/stats    // Get media statistics
```

### **Webhook System**
```typescript
POST   /api/cloudinary/webhook        // Cloudinary webhook handler
GET    /api/cloudinary/webhook        // Webhook configuration
PUT    /api/cloudinary/webhook        // Simulate webhook (Phase 2)
```

### **Synchronization**
```typescript
POST   /api/cloudinary/sync           // Trigger full sync
GET    /api/cloudinary/sync           // Get sync status
GET    /api/cloudinary/sync/history   // Sync operation history
```

### **Status Monitoring (Phase 3)**
```typescript
GET    /api/sync/status               // Current sync status
GET    /api/sync/operations           // Active operations
POST   /api/sync/operations           // Create operation
PUT    /api/sync/operations/:id       // Update operation
GET    /api/sync/health               // System health
```

## 🔄 **Real-time Features**

### **WebSocket Connections**
```typescript
// Supabase real-time subscriptions
const subscription = supabase
  .channel('media_changes')
  .on('postgres_changes', { table: 'media_assets' }, handleUpdate)
  .subscribe()
```

### **Status Broadcasting**
```typescript
// Real-time sync status updates
const statusSubscription = supabase
  .channel('sync_status_broadcast')
  .on('broadcast', { event: 'sync_update' }, handleStatusUpdate)
  .subscribe()
```

## 📝 **Request/Response Formats**

### **Standard Response Format**
```typescript
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}
```

### **Pagination Format**
```typescript
interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
  }
}
```

### **Error Response Format**
```typescript
interface ErrorResponse {
  success: false
  error: string
  message: string
  code?: string
  details?: Record<string, any>
  timestamp: string
}
```

## 🛡️ **Security**

### **Webhook Security**
- Signature verification using Cloudinary API secret
- Request validation and sanitization
- Rate limiting and abuse protection

### **API Security**
- JWT token authentication
- Row-level security (RLS) in database
- Input validation and sanitization
- CORS configuration

### **File Upload Security**
- File type validation
- Size limits enforcement
- Malware scanning (Cloudinary)
- Secure URL generation

## 📊 **Rate Limits**

### **General API Limits**
- **Authenticated requests**: 1000 requests/hour
- **Upload endpoints**: 100 uploads/hour
- **Webhook endpoints**: No limit (Cloudinary controlled)
- **Sync operations**: 10 full syncs/hour

### **Real-time Limits**
- **WebSocket connections**: 100 concurrent per user
- **Subscription channels**: 50 per connection
- **Broadcast messages**: 1000/minute per channel

## 🔧 **Development Tools**

### **API Testing**
```bash
# Test media endpoint
curl -X GET "http://localhost:3000/api/cloudinary/media?page=1&limit=10"

# Test webhook endpoint
curl -X GET "http://localhost:3000/api/cloudinary/webhook"

# Test sync status
curl -X GET "http://localhost:3000/api/sync/status"
```

### **Postman Collection**
A Postman collection is available with all endpoints pre-configured:
- Import from `docs/api/postman/LGU-Project-API.json`
- Set environment variables for base URL and tokens

## 📈 **Performance**

### **Response Times**
- **Media listing**: 50-200ms
- **File upload**: 1-5 seconds (depends on file size)
- **Webhook processing**: 100-300ms
- **Sync operations**: 1-30 seconds (depends on data volume)

### **Caching**
- **Media metadata**: Cached for 5 minutes
- **Statistics**: Cached for 1 minute
- **Status data**: Real-time (no caching)

## 🚨 **Error Handling**

### **HTTP Status Codes**
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Rate Limited
- **500**: Internal Server Error

### **Error Categories**
- **Validation Errors**: Invalid input data
- **Authentication Errors**: Missing or invalid tokens
- **Permission Errors**: Insufficient access rights
- **Service Errors**: External service failures
- **System Errors**: Internal application errors

## 📚 **SDK and Libraries**

### **JavaScript/TypeScript**
```typescript
// Official Supabase client
import { createClient } from '@supabase/supabase-js'

// Cloudinary SDK
import { v2 as cloudinary } from 'cloudinary'

// Custom API client
import { LGUProjectAPI } from '@/lib/api-client'
```

### **Usage Examples**
```typescript
// Upload file
const result = await fetch('/api/cloudinary/upload', {
  method: 'POST',
  body: formData
})

// Get media items
const media = await fetch('/api/cloudinary/media?page=1&limit=10')
const data = await media.json()

// Trigger sync
const sync = await fetch('/api/cloudinary/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ force: true })
})
```

## 📋 **API Versioning**

### **Current Version**
- **Version**: v1
- **Base Path**: `/api/`
- **Stability**: Stable

### **Backward Compatibility**
- All v1 endpoints are stable and backward compatible
- Deprecation notices provided 6 months before removal
- Migration guides provided for breaking changes

## ✅ **API Documentation Checklist**

- [x] All endpoints documented
- [x] Request/response formats specified
- [x] Authentication methods described
- [x] Error handling documented
- [x] Rate limits defined
- [x] Security measures outlined
- [x] Performance characteristics noted
- [x] Usage examples provided
- [x] Testing instructions included
- [x] SDK information available

**Complete API documentation available for all LGU Project endpoints!** 🎯
