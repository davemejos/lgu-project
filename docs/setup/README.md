# ⚙️ LGU Project Setup & Configuration

This directory contains all setup and configuration documentation for the LGU Project.

## 📁 **Setup Documentation**

### **Initial Setup**
- `INSTALLATION_GUIDE.md` - Complete installation instructions
- `ENVIRONMENT_SETUP.md` - Environment variables and configuration
- `DATABASE_SETUP.md` - Supabase database setup and schema

### **Service Integration**
- `CLOUDINARY_SETUP.md` - Cloudinary account and webhook configuration
- `SUPABASE_SETUP.md` - Supabase project setup and configuration
- `VERCEL_DEPLOYMENT.md` - Production deployment guide

### **Development Setup**
- `DEVELOPMENT_ENVIRONMENT.md` - Local development setup
- `TESTING_SETUP.md` - Testing environment configuration
- `DEBUGGING_GUIDE.md` - Development debugging and tools

## 🚀 **Quick Start Guide**

### **Prerequisites**
- Node.js 18+ installed
- Git for version control
- Cloudinary account (free tier available)
- Supabase account (free tier available)

### **1. Clone and Install**
```bash
git clone <repository-url>
cd lgu-project-app
npm install
```

### **2. Environment Configuration**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### **3. Database Setup**
```bash
# Run the complete database schema
# Copy content from docs/database/supabase-schema.sql
# Paste into Supabase SQL Editor and execute
```

### **4. Start Development**
```bash
npm run dev
# Open http://localhost:3000
```

## 🔧 **Environment Variables**

### **Required Variables**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email Integration
RESEND_API_KEY=your_resend_api_key
```

### **Development Variables**
```env
# Development only
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 **Service Setup Status**

### **Supabase Setup** ✅
- [x] Project created
- [x] Database schema deployed
- [x] Row-level security configured
- [x] Real-time subscriptions enabled
- [x] API keys configured

### **Cloudinary Setup** ✅
- [x] Account created
- [x] Upload presets configured
- [x] Webhook endpoints configured
- [x] API credentials obtained
- [x] Signature verification enabled

### **Application Setup** ✅
- [x] Next.js project configured
- [x] Redux store setup
- [x] Real-time providers configured
- [x] UI components implemented
- [x] API routes functional

## 🔍 **Verification Steps**

### **1. Database Connection**
```bash
# Test database connectivity
curl -X GET "http://localhost:3000/api/setup-media-db"
```

### **2. Cloudinary Integration**
```bash
# Test upload functionality
# Use the admin panel upload feature
```

### **3. Real-time Features**
```bash
# Test WebSocket connections
# Check browser developer tools for WebSocket connections
```

### **4. Webhook Configuration**
```bash
# Test webhook endpoint
curl -X GET "http://localhost:3000/api/cloudinary/webhook"
```

## 🛠️ **Development Tools**

### **Recommended Extensions**
- **VS Code**: TypeScript, Tailwind CSS IntelliSense
- **Browser**: React Developer Tools, Redux DevTools
- **Database**: Supabase Dashboard, pgAdmin (optional)

### **Development Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🚨 **Common Setup Issues**

### **Database Connection Issues**
- Verify Supabase URL and keys
- Check network connectivity
- Ensure RLS policies are configured

### **Cloudinary Upload Issues**
- Verify API credentials
- Check upload preset configuration
- Ensure webhook URL is accessible

### **Real-time Connection Issues**
- Check WebSocket connections in browser
- Verify Supabase real-time is enabled
- Check for network firewalls

## 📚 **Additional Resources**

### **Official Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

### **LGU Project Specific**
- **[Architecture Overview](../architecture/)** - System architecture
- **[Implementation Phases](../phases/)** - Development phases
- **[API Reference](../api/)** - API documentation
- **[Troubleshooting](../troubleshooting/)** - Common issues

## ✅ **Setup Completion Checklist**

- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured
- [ ] Supabase project setup and schema deployed
- [ ] Cloudinary account setup and webhooks configured
- [ ] Development server running successfully
- [ ] Database connectivity verified
- [ ] Upload functionality tested
- [ ] Real-time features working
- [ ] Webhook endpoints responding
- [ ] All phases documentation reviewed

**Once all items are checked, your LGU Project setup is complete!** 🎉
