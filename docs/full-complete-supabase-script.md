
-- =====================================================
-- LGU Project App - Complete Supabase Database Schema
-- =====================================================

-- Create custom types/enums
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE personnel_status AS ENUM ('Active', 'Inactive', 'On Leave', 'Suspended');

-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
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

-- Personnel table
CREATE TABLE personnel (
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

-- Personnel Documents table
CREATE TABLE personnel_documents (
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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_personnel_email ON personnel(email);
CREATE INDEX idx_personnel_department ON personnel(department);
CREATE INDEX idx_personnel_status ON personnel(status);
CREATE INDEX idx_personnel_documents_personnel_id ON personnel_documents(personnel_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_documents_updated_at BEFORE UPDATE ON personnel_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Allow authenticated users to read users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read personnel" ON personnel
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read personnel documents" ON personnel_documents
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for service role (admin operations)
CREATE POLICY "Allow service role full access to users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to personnel" ON personnel
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to personnel documents" ON personnel_documents
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- SAMPLE DATA (DEMO USERS AND PERSONNEL)
-- =====================================================

-- Insert demo users (passwords are hashed)
INSERT INTO users (email, name, password, phone, address, role, status) VALUES
('demo@admin.com', 'Demo Admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO9G', '+63 912 345 6789', 'Ipil, Zamboanga Sibugay', 'admin', 'ACTIVE'),
('admin@example.com', 'Administrator', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+63 912 345 6790', 'Ipil, Zamboanga Sibugay', 'admin', 'ACTIVE'),
('user@fisheries.gov', 'Regular User', '$2a$12$TwQsp4j5ikeiUux2BdQoTO.4y/Lfbg4qxQq3fLdHpyD/2s2YGFqtG', '+63 912 345 6791', 'Ipil, Zamboanga Sibugay', 'user', 'ACTIVE');

-- Insert sample personnel
INSERT INTO personnel (name, email, phone, address, profile_photo, department, position, hire_date, status, biography, spouse_name, spouse_occupation, children_count, emergency_contact, children_names) VALUES
('John Doe', 'john.doe@fisheries.gov', '+63 912 345 6789', 'Ipil, Zamboanga Sibugay', '/images/profiles/john-doe.jpg', 'Fisheries Management', 'Senior Fisheries Officer', '2020-01-15', 'Active', 'Experienced fisheries officer with over 10 years in marine resource management.', 'Jane Doe', 'Teacher', '2', '+63 912 345 6790', 'Alice Doe, Bob Doe'),
('Maria Santos', 'maria.santos@fisheries.gov', '+63 912 345 6791', 'Ipil, Zamboanga Sibugay', '/images/profiles/maria-santos.jpg', 'Aquaculture Development', 'Aquaculture Specialist', '2019-03-20', 'Active', 'Specialist in sustainable aquaculture practices and fish farming techniques.', 'Carlos Santos', 'Engineer', '1', '+63 912 345 6792', 'Miguel Santos'),
('Robert Johnson', 'robert.johnson@fisheries.gov', '+63 912 345 6793', 'Ipil, Zamboanga Sibugay', '/images/profiles/robert-johnson.jpg', 'Marine Conservation', 'Marine Biologist', '2021-06-10', 'Active', 'Marine biologist specializing in coral reef conservation and marine ecosystem protection.', 'Sarah Johnson', 'Nurse', '3', '+63 912 345 6794', 'Emma Johnson, Liam Johnson, Noah Johnson'),
('Lisa Chen', 'lisa.chen@fisheries.gov', '+63 912 345 6795', 'Ipil, Zamboanga Sibugay', '/images/profiles/lisa-chen.jpg', 'Research and Development', 'Research Coordinator', '2018-09-05', 'Active', 'Coordinates research projects on sustainable fishing practices and marine biodiversity.', 'David Chen', 'Accountant', '2', '+63 912 345 6796', 'Kevin Chen, Amy Chen'),
('Michael Brown', 'michael.brown@fisheries.gov', '+63 912 345 6797', 'Ipil, Zamboanga Sibugay', '/images/profiles/michael-brown.jpg', 'Fisheries Management', 'Fisheries Inspector', '2022-02-14', 'Active', 'Ensures compliance with fishing regulations and monitors fishing activities in the region.', 'Jennifer Brown', 'Teacher', '1', '+63 912 345 6798', 'Tyler Brown');

-- Insert sample documents
INSERT INTO personnel_documents (filename, original_name, mime_type, size, path, personnel_id) VALUES
('certificate_john_doe.pdf', 'Fisheries Certificate - John Doe.pdf', 'application/pdf', 1024000, '/documents/certificate_john_doe.pdf', 1),
('license_maria_santos.pdf', 'Aquaculture License - Maria Santos.pdf', 'application/pdf', 856000, '/documents/license_maria_santos.pdf', 2),
('training_robert_johnson.pdf', 'Marine Biology Training - Robert Johnson.pdf', 'application/pdf', 1200000, '/documents/training_robert_johnson.pdf', 3);

-- =====================================================
-- DOCUMENTATION COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'System users with authentication credentials';
COMMENT ON TABLE personnel IS 'Personnel/staff information and profiles';
COMMENT ON TABLE personnel_documents IS 'Documents associated with personnel records';

COMMENT ON COLUMN users.role IS 'User role (admin, user, etc.)';
COMMENT ON COLUMN users.status IS 'Account status (ACTIVE, INACTIVE, SUSPENDED)';
COMMENT ON COLUMN personnel.status IS 'Employment status (Active, Inactive, On Leave, Suspended)';
COMMENT ON COLUMN personnel.hire_date IS 'Date when the personnel was hired';
COMMENT ON COLUMN personnel_documents.size IS 'File size in bytes';
COMMENT ON COLUMN personnel_documents.path IS 'Storage path or URL to the document';

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

