# 🔧 LGU Project Troubleshooting Guide

This directory contains comprehensive troubleshooting documentation for common issues and their solutions.

## 📁 **Troubleshooting Documentation**

### **Common Issues**
- `DATABASE_ISSUES.md` - Database connection and query problems
- `CLOUDINARY_ISSUES.md` - Cloudinary integration problems
- `WEBHOOK_ISSUES.md` - Webhook configuration and processing issues
- `UPLOAD_ISSUES.md` - File upload and processing problems

### **Environment Issues**
- `DEVELOPMENT_ISSUES.md` - Local development problems
- `DEPLOYMENT_ISSUES.md` - Production deployment issues
- `PERFORMANCE_ISSUES.md` - Performance and optimization problems
- `SECURITY_ISSUES.md` - Security and authentication problems

### **Phase-Specific Issues**
- `PHASE_1_TROUBLESHOOTING.md` - Webhook infrastructure issues
- `PHASE_2_TROUBLESHOOTING.md` - Real-time upload flow issues
- `PHASE_3_TROUBLESHOOTING.md` - Sync status management issues

## 🚨 **Quick Issue Resolution**

### **Most Common Issues**

#### **1. Database Connection Failed**
```bash
Error: Failed to connect to Supabase
```
**Solution:**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Verify Supabase project is active
- Check network connectivity

#### **2. Cloudinary Upload Failed**
```bash
Error: Upload failed - Invalid credentials
```
**Solution:**
- Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Check upload preset configuration
- Ensure file size is within limits

#### **3. Sync Not Working**
```bash
Warning: Manual sync failed
```
**Solution:**
- Check Cloudinary API credentials
- Verify database connectivity
- Test sync endpoint manually

#### **4. Real-time Updates Not Working**
```bash
Error: WebSocket connection failed
```
**Solution:**
- Check Supabase real-time is enabled
- Verify WebSocket connections in browser
- Check for network firewalls

## 🔍 **Diagnostic Tools**

### **Health Check Endpoints**
```bash
# Check database connectivity
curl -X GET "http://localhost:3000/api/setup-media-db"

# Check sync functionality
curl -X POST "http://localhost:3000/api/cloudinary/sync"

# Check sync status
curl -X GET "http://localhost:3000/api/sync/status"

# Check system health
curl -X GET "http://localhost:3000/api/sync/health"
```

### **Browser Developer Tools**
```javascript
// Check WebSocket connections
console.log('WebSocket connections:', window.navigator.onLine)

// Check Redux state
console.log('Redux state:', window.__REDUX_DEVTOOLS_EXTENSION__)

// Check Supabase client
console.log('Supabase client:', window.supabase)
```

### **Log Analysis**
```bash
# Check application logs
npm run dev 2>&1 | grep -E "(ERROR|WARN|Failed)"

# Check webhook logs
grep "Cloudinary Webhook" logs/application.log

# Check sync operation logs
grep "BidirectionalSyncService" logs/application.log
```

## 📊 **Performance Diagnostics**

### **Slow Upload Issues**
```typescript
// Check upload performance
const startTime = Date.now()
const result = await uploadFile(file)
const duration = Date.now() - startTime
console.log(`Upload took ${duration}ms`)
```

### **Database Query Performance**
```sql
-- Check slow queries in Supabase
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### **Real-time Connection Issues**
```typescript
// Monitor WebSocket connection
const channel = supabase.channel('test')
channel.subscribe((status) => {
  console.log('Connection status:', status)
})
```

## 🛠️ **Environment-Specific Issues**

### **Development Environment**
- **Port conflicts**: Change port in `package.json`
- **CORS issues**: Check API route configuration
- **Hot reload issues**: Restart development server

### **Production Environment**
- **Build failures**: Check TypeScript errors
- **Environment variables**: Verify all required vars are set
- **Deployment issues**: Check Vercel deployment logs

### **Database Environment**
- **Migration issues**: Re-run database schema
- **RLS policies**: Check row-level security configuration
- **Connection limits**: Monitor Supabase connection usage

## 🔧 **Step-by-Step Debugging**

### **1. Verify Environment Setup**
```bash
# Check all environment variables
node -e "console.log(process.env)" | grep -E "(SUPABASE|CLOUDINARY)"

# Test database connection
npm run test:db

# Test Cloudinary connection
npm run test:cloudinary
```

### **2. Check Service Status**
```bash
# Supabase status
curl -X GET "https://status.supabase.com/api/v2/status.json"

# Cloudinary status
curl -X GET "https://status.cloudinary.com/api/v2/status.json"

# Application health
curl -X GET "http://localhost:3000/api/health"
```

### **3. Test Individual Components**
```typescript
// Test webhook handler
const response = await fetch('/api/cloudinary/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testWebhookPayload)
})

// Test upload endpoint
const formData = new FormData()
formData.append('file', testFile)
const uploadResponse = await fetch('/api/cloudinary/upload', {
  method: 'POST',
  body: formData
})

// Test real-time subscription
const subscription = supabase
  .channel('test')
  .on('postgres_changes', { table: 'media_assets' }, console.log)
  .subscribe()
```

## 📋 **Error Code Reference**

### **Application Error Codes**
- **E001**: Database connection failed
- **E002**: Cloudinary authentication failed
- **E003**: Webhook signature verification failed
- **E004**: File upload failed
- **E005**: Sync operation failed
- **E006**: Real-time connection failed

### **HTTP Status Codes**
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Application error
- **503**: Service Unavailable - External service down

## 🆘 **Getting Help**

### **Self-Service Resources**
1. **Check this troubleshooting guide**
2. **Review phase-specific documentation**
3. **Check application logs**
4. **Test individual components**
5. **Verify environment configuration**

### **Debug Information to Collect**
When reporting issues, include:
- **Error messages** (full stack trace)
- **Environment details** (Node.js version, OS)
- **Configuration** (sanitized environment variables)
- **Steps to reproduce** (detailed instructions)
- **Expected vs actual behavior**
- **Browser/network information** (if applicable)

### **Log Collection**
```bash
# Collect application logs
npm run dev > debug.log 2>&1

# Collect system information
node --version > system-info.txt
npm --version >> system-info.txt
cat package.json >> system-info.txt
```

## ✅ **Troubleshooting Checklist**

### **Before Reporting Issues**
- [ ] Checked this troubleshooting guide
- [ ] Verified environment variables
- [ ] Tested database connectivity
- [ ] Checked service status pages
- [ ] Reviewed application logs
- [ ] Tested individual components
- [ ] Collected debug information
- [ ] Documented steps to reproduce

### **Common Resolution Steps**
- [ ] Restart development server
- [ ] Clear browser cache
- [ ] Check network connectivity
- [ ] Verify service credentials
- [ ] Update dependencies
- [ ] Re-run database migrations
- [ ] Check for service outages
- [ ] Review recent configuration changes

**Most issues can be resolved using this troubleshooting guide!** 🎯
