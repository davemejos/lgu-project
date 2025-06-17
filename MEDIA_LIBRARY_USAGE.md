# Media Center - Usage Guide

## Overview
Your Media Center (located at `/admin/media`) provides a professional interface to manage all media files. When you upload, view, or delete files through this interface, it automatically manages both Cloudinary storage and your Supabase database.

## Key Features

### ✅ Upload Files
- Click "Upload Media" button to select files
- Automatically uploads to Cloudinary
- Saves metadata to your Supabase database
- Supports images and videos
- Real-time sync status indicators

### ✅ View Media Library
- Grid and list view modes
- Search functionality with real-time filtering
- File details (size, format, dimensions)
- Preview images and videos
- Bulk selection capabilities

### ✅ Delete Files (FIXED)
- Select files using checkboxes
- Click "Delete Selected" button
- **Now properly deletes from BOTH Cloudinary AND database**
- Removes files completely from your system
- No orphaned records left behind

### ✅ Sync Status Monitoring
- Real-time sync status indicators
- Webhook configuration status
- Manual sync from Cloudinary button
- Comprehensive error handling

## How to Use

### 1. Access Media Center
Navigate to `/admin/media` in your admin panel to access the Media Center.

### 2. Upload Files
1. Click the "Upload Media" button in the top toolbar
2. Select one or more image/video files
3. Files are automatically uploaded to Cloudinary and saved to database
4. Watch the sync status indicators for real-time feedback

### 3. Browse and Search
1. Use the search bar to find specific files
2. Toggle between grid and list view modes
3. Click on files to preview them
4. Use checkboxes to select multiple files

### 4. Delete Files
1. Select files using the checkboxes
2. Click "Delete Selected" button
3. Confirm the deletion
4. Files are removed from both Cloudinary and database

### 5. API Endpoints

#### Get Media Items
```bash
GET /api/cloudinary/media?page=1&limit=50
GET /api/cloudinary/media?search=query&resource_type=image
```

#### Delete Media Items
```bash
DELETE /api/cloudinary/media?public_ids=id1,id2,id3
```

#### Upload Files
```bash
POST /api/cloudinary/upload
Content-Type: multipart/form-data
Body: { file: File, folder?: string, description?: string }
```

## Webhook Configuration

Set your Cloudinary webhook URL to:
```
https://your-domain.com/api/webhooks/cloudinary
```

This ensures automatic sync when files are deleted from Cloudinary console.

## Troubleshooting

### Problem: Files still show in library after deleting from Cloudinary
**Solution**: Click "Cleanup Orphaned" button to remove database records for deleted files.

### Problem: Delete button doesn't work
**Check**: 
1. Console logs for error messages
2. Network tab for API response
3. Cloudinary credentials are correct

### Problem: Upload works but delete doesn't
**Check**: 
1. Cloudinary API credentials have delete permissions
2. Database connection is working
3. Check server logs for detailed error messages

## Technical Details

### Delete Process
1. **Step 1**: Delete file from Cloudinary using `cloudinary.uploader.destroy()`
2. **Step 2**: Soft delete record in database (sets `deleted_at` timestamp)
3. **Step 3**: Remove from UI immediately
4. **Result**: File completely removed from your system

### Error Handling
- If Cloudinary delete fails but database succeeds: File removed from UI
- If database delete fails but Cloudinary succeeds: Error logged for manual cleanup
- All operations are logged for debugging

### Performance
- Database queries are optimized with indexes
- UI updates immediately without waiting for server confirmation
- Batch operations for cleanup tasks

## Support

If you encounter issues:
1. Check browser console for error messages
2. Check server logs for detailed error information
3. Verify Cloudinary credentials and permissions
4. Test with a simple file upload/delete cycle
