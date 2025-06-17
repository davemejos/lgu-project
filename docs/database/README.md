# 🗄️ LGU Project Database Documentation

This directory contains all database-related documentation and schema files for the LGU Project.

## 📁 **Database Files**

### **Schema Files**
- `supabase-schema.sql` - Complete database schema with all phases
- `SCHEMA_EVOLUTION.md` - Schema changes across phases
- `DATABASE_DESIGN.md` - Database design principles and relationships

### **Migration Files**
- `phase-1-schema.sql` - Phase 1 webhook infrastructure tables
- `phase-2-enhancements.sql` - Phase 2 real-time features
- `phase-3-monitoring.sql` - Phase 3 sync status management

## 🏗️ **Database Architecture**

### **Core Tables**
```sql
-- Media Assets (Phase 1)
media_assets              -- Core media file metadata
media_sync_log           -- Sync operation audit trail
media_usage              -- Usage tracking
media_collections        -- Organization collections

-- Sync Status Management (Phase 3)
sync_operations          -- Real-time operation tracking
connection_status        -- Client connection monitoring
sync_status_snapshots    -- System health snapshots
```

### **Key Features**
- **Row-Level Security (RLS)** - User-based access control
- **Real-time Subscriptions** - WebSocket-enabled tables
- **Performance Optimization** - Comprehensive indexing strategy
- **Audit Trail** - Complete operation history
- **Data Integrity** - Foreign key constraints and validation

## 📊 **Schema Evolution**

### **Phase 1: Foundation**
- Core media assets table with Cloudinary integration
- Sync operation logging for audit trail
- Basic usage tracking and collections
- RLS policies for security

### **Phase 2: Real-time Enhancement**
- Enhanced media assets table for real-time subscriptions
- Optimized indexes for performance
- WebSocket-compatible triggers
- Improved sync status tracking

### **Phase 3: Monitoring & Observability**
- Sync operations table for real-time tracking
- Connection status monitoring
- System health snapshots
- Performance metrics collection
- Advanced triggers and functions

## 🔧 **Database Setup**

### **1. Initial Setup**
```sql
-- Run the complete schema
-- Copy content from supabase-schema.sql
-- Paste into Supabase SQL Editor and execute
```

### **2. Verification**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **3. Test Data**
```sql
-- Insert test media asset
INSERT INTO media_assets (
  cloudinary_public_id, 
  original_filename, 
  file_size, 
  mime_type, 
  format, 
  secure_url, 
  resource_type
) VALUES (
  'test_image_123',
  'test-image.jpg',
  1024000,
  'image/jpeg',
  'jpg',
  'https://res.cloudinary.com/test/image/upload/test_image_123.jpg',
  'image'
);
```

## 📈 **Performance Optimization**

### **Indexes**
```sql
-- Core performance indexes
CREATE INDEX idx_media_assets_public_id ON media_assets(cloudinary_public_id);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at DESC);
CREATE INDEX idx_media_assets_sync_status ON media_assets(sync_status);
CREATE INDEX idx_media_assets_resource_type ON media_assets(resource_type);

-- GIN indexes for arrays
CREATE INDEX idx_media_assets_tags ON media_assets USING GIN(tags);

-- Composite indexes for complex queries
CREATE INDEX idx_media_assets_folder_created ON media_assets(folder, created_at DESC);
CREATE INDEX idx_media_assets_type_status ON media_assets(resource_type, sync_status);
```

### **Query Optimization**
- Cursor-based pagination for large datasets
- Efficient search using GIN indexes
- Optimized joins with proper foreign keys
- Materialized views for complex aggregations

## 🛡️ **Security Configuration**

### **Row-Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_operations ENABLE ROW LEVEL SECURITY;

-- Basic read policy
CREATE POLICY "Allow authenticated read" ON media_assets
  FOR SELECT TO authenticated USING (true);

-- Admin write policy
CREATE POLICY "Allow admin write" ON media_assets
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');
```

### **Data Protection**
- Encrypted connections (SSL/TLS)
- Input validation and sanitization
- Audit trail for all operations
- Soft deletes for data recovery
- Backup and recovery procedures

## 🔄 **Real-time Features**

### **WebSocket Subscriptions**
```sql
-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE media_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE sync_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE connection_status;
```

### **Triggers and Functions**
```sql
-- Real-time notification trigger
CREATE OR REPLACE FUNCTION notify_sync_status_change() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('sync_status_change', 
    json_build_object(
      'operation_id', NEW.id,
      'status', NEW.status,
      'progress', NEW.progress
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_operations_notify_trigger
  AFTER INSERT OR UPDATE ON sync_operations
  FOR EACH ROW EXECUTE FUNCTION notify_sync_status_change();
```

## 📊 **Monitoring & Analytics**

### **System Health Queries**
```sql
-- Get sync status overview
SELECT 
  COUNT(*) as total_assets,
  COUNT(*) FILTER (WHERE sync_status = 'synced') as synced_assets,
  COUNT(*) FILTER (WHERE sync_status = 'pending') as pending_assets,
  COUNT(*) FILTER (WHERE sync_status = 'error') as error_assets
FROM media_assets 
WHERE deleted_at IS NULL;

-- Get active operations
SELECT 
  operation_type,
  status,
  progress,
  created_at,
  updated_at
FROM sync_operations 
WHERE status IN ('pending', 'in_progress')
ORDER BY created_at DESC;
```

### **Performance Metrics**
```sql
-- Get operation performance
SELECT 
  operation_type,
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration_seconds,
  COUNT(*) as total_operations,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_operations
FROM sync_operations 
WHERE end_time IS NOT NULL
GROUP BY operation_type;
```

## 🔧 **Maintenance**

### **Regular Maintenance Tasks**
```sql
-- Clean up old sync logs (keep last 30 days)
DELETE FROM media_sync_log 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Clean up old sync operations (keep last 7 days for completed)
DELETE FROM sync_operations 
WHERE status IN ('completed', 'failed', 'cancelled')
  AND created_at < NOW() - INTERVAL '7 days';

-- Update table statistics
ANALYZE media_assets;
ANALYZE sync_operations;
```

### **Backup Procedures**
```bash
# Export schema
pg_dump --schema-only --no-owner --no-privileges $DATABASE_URL > schema-backup.sql

# Export data
pg_dump --data-only --no-owner --no-privileges $DATABASE_URL > data-backup.sql

# Full backup
pg_dump --no-owner --no-privileges $DATABASE_URL > full-backup.sql
```

## ✅ **Database Checklist**

### **Setup Verification**
- [ ] All tables created successfully
- [ ] Indexes created and optimized
- [ ] RLS policies configured
- [ ] Real-time subscriptions enabled
- [ ] Triggers and functions working
- [ ] Test data inserted and verified

### **Performance Verification**
- [ ] Query performance optimized
- [ ] Indexes being used effectively
- [ ] No slow queries identified
- [ ] Connection pooling configured
- [ ] Monitoring queries working

### **Security Verification**
- [ ] RLS enabled on all tables
- [ ] Policies tested and working
- [ ] SSL/TLS connections enforced
- [ ] Audit trail functional
- [ ] Backup procedures tested

**Database setup complete and ready for production!** 🎯
