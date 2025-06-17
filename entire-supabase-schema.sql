DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE personnel_status AS ENUM ('Active', 'Inactive', 'On Leave', 'Suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_sync_status AS ENUM ('synced', 'pending', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_sync_operation AS ENUM ('upload', 'delete', 'update', 'restore');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    role VARCHAR(50) DEFAULT 'user',
    status user_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personnel (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    profile_photo VARCHAR(500),
    department VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    hire_date DATE,
    status personnel_status DEFAULT 'Active',
    biography TEXT,
    spouse_name VARCHAR(255),
    spouse_occupation VARCHAR(255),
    children_count VARCHAR(10),
    emergency_contact VARCHAR(50),
    children_names TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personnel_documents (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    path VARCHAR(500) NOT NULL,
    personnel_id BIGINT NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cloudinary_public_id VARCHAR(500) NOT NULL UNIQUE,
    cloudinary_version INTEGER NOT NULL DEFAULT 1,
    cloudinary_signature VARCHAR(255) NOT NULL,
    cloudinary_etag VARCHAR(255),
    original_filename VARCHAR(500),
    display_name VARCHAR(500),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    format VARCHAR(50) NOT NULL,
    width INTEGER,
    height INTEGER,
    duration DECIMAL(10,2),
    folder VARCHAR(500),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    alt_text VARCHAR(500),
    secure_url VARCHAR(1000) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    resource_type VARCHAR(50) NOT NULL DEFAULT 'image',
    access_mode VARCHAR(50) DEFAULT 'public',
    uploaded_by UUID,
    used_in_personnel BIGINT REFERENCES personnel(id),
    used_in_documents BIGINT REFERENCES personnel_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cloudinary_created_at TIMESTAMP WITH TIME ZONE,
    sync_status media_sync_status DEFAULT 'synced',
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_error_message TEXT,
    sync_retry_count INTEGER DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    CONSTRAINT valid_resource_type CHECK (resource_type IN ('image', 'video', 'raw')),
    CONSTRAINT valid_access_mode CHECK (access_mode IN ('public', 'authenticated')),
    CONSTRAINT positive_file_size CHECK (file_size > 0),
    CONSTRAINT positive_dimensions CHECK (
        (width IS NULL OR width > 0) AND
        (height IS NULL OR height > 0)
    )
);

CREATE TABLE IF NOT EXISTS media_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation media_sync_operation NOT NULL,
    status media_sync_status NOT NULL,
    media_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    cloudinary_public_id VARCHAR(500) NOT NULL,
    source VARCHAR(50) NOT NULL,
    triggered_by UUID,
    error_message TEXT,
    error_code VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    file_size BIGINT,
    operation_data JSONB,
    webhook_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_source CHECK (source IN ('cloudinary', 'admin', 'api', 'webhook'))
);

CREATE TABLE IF NOT EXISTS media_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    usage_type VARCHAR(100) NOT NULL,
    reference_table VARCHAR(100),
    reference_id VARCHAR(100),
    usage_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_usage_type CHECK (usage_type IN (
        'personnel_profile', 'document', 'content', 'banner', 'gallery', 'attachment'
    ))
);

CREATE TABLE IF NOT EXISTS media_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    parent_collection_id UUID REFERENCES media_collections(id),
    sort_order INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES media_collections(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID,
    UNIQUE(collection_id, media_asset_id)
);

CREATE TABLE IF NOT EXISTS sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('upload', 'delete', 'update', 'full_sync', 'webhook')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    triggered_by VARCHAR(255),
    source VARCHAR(50) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'webhook', 'api', 'scheduled')),
    operation_data JSONB DEFAULT '{}',
    error_details JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connection_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'reconnecting', 'error')),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connection_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reconnect_attempts INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_status_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_type VARCHAR(50) NOT NULL CHECK (snapshot_type IN ('hourly', 'daily', 'manual', 'error')),
    total_assets INTEGER NOT NULL DEFAULT 0,
    synced_assets INTEGER NOT NULL DEFAULT 0,
    pending_assets INTEGER NOT NULL DEFAULT 0,
    error_assets INTEGER NOT NULL DEFAULT 0,
    active_operations INTEGER NOT NULL DEFAULT 0,
    last_sync_time TIMESTAMP WITH TIME ZONE,
    system_health VARCHAR(20) DEFAULT 'healthy' CHECK (system_health IN ('healthy', 'warning', 'critical')),
    performance_score INTEGER DEFAULT 100 CHECK (performance_score >= 0 AND performance_score <= 100),
    error_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_sync_time_ms INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_personnel_email ON personnel(email);
CREATE INDEX IF NOT EXISTS idx_personnel_department ON personnel(department);
CREATE INDEX IF NOT EXISTS idx_personnel_status ON personnel(status);
CREATE INDEX IF NOT EXISTS idx_personnel_documents_personnel_id ON personnel_documents(personnel_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_cloudinary_public_id ON media_assets(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_sync_status ON media_assets(sync_status);
CREATE INDEX IF NOT EXISTS idx_media_assets_resource_type ON media_assets(resource_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(folder);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON media_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_deleted_at ON media_assets(deleted_at);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_mime_type ON media_assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_file_size ON media_assets(file_size);
CREATE INDEX IF NOT EXISTS idx_media_sync_log_media_asset_id ON media_sync_log(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_sync_log_cloudinary_public_id ON media_sync_log(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS idx_media_sync_log_operation ON media_sync_log(operation);
CREATE INDEX IF NOT EXISTS idx_media_sync_log_status ON media_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_media_sync_log_created_at ON media_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_sync_log_source ON media_sync_log(source);
CREATE INDEX IF NOT EXISTS idx_media_usage_media_asset_id ON media_usage(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_type ON media_usage(usage_type);
CREATE INDEX IF NOT EXISTS idx_media_usage_reference ON media_usage(reference_table, reference_id);
CREATE INDEX IF NOT EXISTS idx_media_collections_slug ON media_collections(slug);
CREATE INDEX IF NOT EXISTS idx_media_collections_parent ON media_collections(parent_collection_id);
CREATE INDEX IF NOT EXISTS idx_media_collection_items_collection_id ON media_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_media_collection_items_media_asset_id ON media_collection_items(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
CREATE INDEX IF NOT EXISTS idx_sync_operations_type ON sync_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_sync_operations_created_at ON sync_operations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connection_status_client ON connection_status(client_id);
CREATE INDEX IF NOT EXISTS idx_connection_status_updated ON connection_status(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_snapshots_created ON sync_status_snapshots(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personnel_updated_at ON personnel;
CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personnel_documents_updated_at ON personnel_documents;
CREATE TRIGGER update_personnel_documents_updated_at BEFORE UPDATE ON personnel_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_assets_updated_at ON media_assets;
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_collections_updated_at ON media_collections;
CREATE TRIGGER update_media_collections_updated_at BEFORE UPDATE ON media_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sync_operations_updated_at ON sync_operations;
CREATE TRIGGER update_sync_operations_updated_at BEFORE UPDATE ON sync_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_connection_status_updated_at ON connection_status;
CREATE TRIGGER update_connection_status_updated_at BEFORE UPDATE ON connection_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE personnel_documents ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE media_sync_log ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE media_collections ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE media_collection_items ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
CREATE POLICY "Allow authenticated users to read users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to read personnel" ON personnel;
CREATE POLICY "Allow authenticated users to read personnel" ON personnel
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to read personnel documents" ON personnel_documents;
CREATE POLICY "Allow authenticated users to read personnel documents" ON personnel_documents
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow service role full access to users" ON users;
CREATE POLICY "Allow service role full access to users" ON users
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow service role full access to personnel" ON personnel;
CREATE POLICY "Allow service role full access to personnel" ON personnel
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow service role full access to personnel documents" ON personnel_documents;
CREATE POLICY "Allow service role full access to personnel documents" ON personnel_documents
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated users to read media assets" ON media_assets;
CREATE POLICY "Allow authenticated users to read media assets" ON media_assets
    FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Allow authenticated users to insert media assets" ON media_assets;
CREATE POLICY "Allow authenticated users to insert media assets" ON media_assets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to update their own media assets" ON media_assets;
CREATE POLICY "Allow users to update their own media assets" ON media_assets
    FOR UPDATE USING (auth.role() = 'authenticated' AND uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Allow users to soft delete their own media assets" ON media_assets;
CREATE POLICY "Allow users to soft delete their own media assets" ON media_assets
    FOR UPDATE USING (auth.role() = 'authenticated' AND uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Allow service role full access to media assets" ON media_assets;
CREATE POLICY "Allow service role full access to media assets" ON media_assets
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated users to read sync log" ON media_sync_log;
CREATE POLICY "Allow authenticated users to read sync log" ON media_sync_log
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow service role full access to sync log" ON media_sync_log;
CREATE POLICY "Allow service role full access to sync log" ON media_sync_log
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated users to read media usage" ON media_usage;
CREATE POLICY "Allow authenticated users to read media usage" ON media_usage
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to manage media usage" ON media_usage;
CREATE POLICY "Allow authenticated users to manage media usage" ON media_usage
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow service role full access to media usage" ON media_usage;
CREATE POLICY "Allow service role full access to media usage" ON media_usage
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated users to read public collections" ON media_collections;
CREATE POLICY "Allow authenticated users to read public collections" ON media_collections
    FOR SELECT USING (auth.role() = 'authenticated' AND (is_public = true OR created_by = auth.uid()));

DROP POLICY IF EXISTS "Allow authenticated users to manage their collections" ON media_collections;
CREATE POLICY "Allow authenticated users to manage their collections" ON media_collections
    FOR ALL USING (auth.role() = 'authenticated' AND created_by = auth.uid());

DROP POLICY IF EXISTS "Allow service role full access to collections" ON media_collections;
CREATE POLICY "Allow service role full access to collections" ON media_collections
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated users to read collection items" ON media_collection_items;
CREATE POLICY "Allow authenticated users to read collection items" ON media_collection_items
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to manage collection items" ON media_collection_items;
CREATE POLICY "Allow authenticated users to manage collection items" ON media_collection_items
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow service role full access to collection items" ON media_collection_items;
CREATE POLICY "Allow service role full access to collection items" ON media_collection_items
    FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION soft_delete_media_asset(asset_id TEXT, deleted_by_user TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    asset_uuid UUID;
    deleted_by_uuid UUID;
BEGIN
    IF deleted_by_user IS NOT NULL AND deleted_by_user != '' THEN
        deleted_by_uuid := deleted_by_user::UUID;
    END IF;
    UPDATE media_assets
    SET
        deleted_at = NOW(),
        deleted_by = deleted_by_uuid,
        sync_status = 'pending'
    WHERE cloudinary_public_id = asset_id AND deleted_at IS NULL;
    SELECT id INTO asset_uuid FROM media_assets WHERE cloudinary_public_id = asset_id;
    INSERT INTO media_sync_log (
        operation, status, media_asset_id, cloudinary_public_id,
        source, triggered_by, operation_data
    )
    VALUES (
        'delete', 'pending', asset_uuid, asset_id,
        'admin', deleted_by_uuid,
        jsonb_build_object('soft_delete', true, 'deleted_at', NOW())
    );
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_media_asset(asset_id TEXT, restored_by_user TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    asset_uuid UUID;
    restored_by_uuid UUID;
BEGIN
    IF restored_by_user IS NOT NULL AND restored_by_user != '' THEN
        restored_by_uuid := restored_by_user::UUID;
    END IF;
    UPDATE media_assets
    SET
        deleted_at = NULL,
        deleted_by = NULL,
        sync_status = 'pending'
    WHERE cloudinary_public_id = asset_id AND deleted_at IS NOT NULL;
    SELECT id INTO asset_uuid FROM media_assets WHERE cloudinary_public_id = asset_id;
    INSERT INTO media_sync_log (
        operation, status, media_asset_id, cloudinary_public_id,
        source, triggered_by, operation_data
    )
    VALUES (
        'restore', 'pending', asset_uuid, asset_id,
        'admin', restored_by_uuid,
        jsonb_build_object('restored_at', NOW())
    );
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_media_sync_status(
    asset_id TEXT,
    new_status media_sync_status,
    error_msg TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE media_assets
    SET
        sync_status = new_status,
        last_synced_at = CASE WHEN new_status = 'synced' THEN NOW() ELSE last_synced_at END,
        sync_error_message = error_msg,
        sync_retry_count = CASE WHEN new_status = 'error' THEN sync_retry_count + 1 ELSE 0 END
    WHERE cloudinary_public_id = asset_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_media_statistics()
RETURNS TABLE (
    total_assets BIGINT,
    total_images BIGINT,
    total_videos BIGINT,
    total_raw BIGINT,
    total_size BIGINT,
    synced_assets BIGINT,
    pending_assets BIGINT,
    error_assets BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_assets,
        COUNT(*) FILTER (WHERE resource_type = 'image') as total_images,
        COUNT(*) FILTER (WHERE resource_type = 'video') as total_videos,
        COUNT(*) FILTER (WHERE resource_type = 'raw') as total_raw,
        COALESCE(SUM(file_size), 0)::BIGINT as total_size,
        COUNT(*) FILTER (WHERE sync_status = 'synced') as synced_assets,
        COUNT(*) FILTER (WHERE sync_status = 'pending') as pending_assets,
        COUNT(*) FILTER (WHERE sync_status = 'error') as error_assets
    FROM media_assets
    WHERE deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_old_sync_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM media_sync_log
    WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_sync_operation_progress(
    operation_id UUID,
    new_progress INTEGER,
    processed_count INTEGER DEFAULT NULL,
    failed_count INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE sync_operations
    SET
        progress = new_progress,
        processed_items = COALESCE(processed_count, processed_items),
        failed_items = COALESCE(failed_count, failed_items),
        updated_at = NOW(),
        estimated_completion = CASE
            WHEN new_progress > 0 AND new_progress < 100 THEN
                NOW() + (EXTRACT(EPOCH FROM (NOW() - start_time)) / new_progress * (100 - new_progress)) * INTERVAL '1 second'
            ELSE estimated_completion
        END
    WHERE id = operation_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION complete_sync_operation(
    operation_id UUID,
    final_status VARCHAR(20),
    error_details JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE sync_operations
    SET
        status = final_status,
        progress = CASE WHEN final_status = 'completed' THEN 100 ELSE progress END,
        end_time = NOW(),
        updated_at = NOW(),
        error_details = COALESCE(error_details, error_details)
    WHERE id = operation_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_sync_status_snapshot(
    snapshot_type_param VARCHAR(50) DEFAULT 'manual'
) RETURNS UUID AS $$
DECLARE
    snapshot_id UUID;
    asset_stats RECORD;
    active_ops INTEGER;
BEGIN
    BEGIN
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE sync_status = 'synced') as synced,
            COUNT(*) FILTER (WHERE sync_status = 'pending') as pending,
            COUNT(*) FILTER (WHERE sync_status = 'error') as errors
        INTO asset_stats
        FROM media_assets
        WHERE deleted_at IS NULL;
    EXCEPTION WHEN undefined_table THEN
        asset_stats.total := 0;
        asset_stats.synced := 0;
        asset_stats.pending := 0;
        asset_stats.errors := 0;
    END;
    SELECT COUNT(*) INTO active_ops
    FROM sync_operations
    WHERE status IN ('pending', 'in_progress');
    INSERT INTO sync_status_snapshots (
        snapshot_type,
        total_assets,
        synced_assets,
        pending_assets,
        error_assets,
        active_operations,
        last_sync_time
    ) VALUES (
        snapshot_type_param,
        asset_stats.total,
        asset_stats.synced,
        asset_stats.pending,
        asset_stats.errors,
        active_ops,
        NOW()
    ) RETURNING id INTO snapshot_id;
    RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_sync_status_change() RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('sync_status_change', json_build_object(
        'operation_id', NEW.id,
        'operation_type', NEW.operation_type,
        'status', NEW.status,
        'progress', NEW.progress,
        'timestamp', NEW.updated_at
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_operations_notify_trigger ON sync_operations;
CREATE TRIGGER sync_operations_notify_trigger
    AFTER INSERT OR UPDATE ON sync_operations
    FOR EACH ROW EXECUTE FUNCTION notify_sync_status_change();

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_media_asset(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_media_asset(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_media_sync_status(TEXT, media_sync_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_media_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_sync_logs() TO authenticated;
GRANT EXECUTE ON FUNCTION update_sync_operation_progress(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_sync_operation(UUID, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_sync_status_snapshot(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_sync_status_change() TO authenticated;

-- =====================================================
-- SUPABASE REAL-TIME CONFIGURATION FOR DELETE EVENTS
-- =====================================================

-- Step 1: Create or recreate the supabase_realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- Step 2: Add media_assets table to realtime publication for DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE media_assets;

-- Step 3: Enable full replica identity for DELETE events (includes all column data)
ALTER TABLE media_assets REPLICA IDENTITY FULL;

-- Step 4: Grant necessary permissions for realtime subscriptions
GRANT SELECT, INSERT, UPDATE, DELETE ON media_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON media_assets TO anon;

-- Step 5: Add other important tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE media_sync_log;
ALTER PUBLICATION supabase_realtime ADD TABLE sync_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE connection_status;

-- Step 6: Verify the publication includes all necessary tables
-- This will show which tables are included in realtime
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';