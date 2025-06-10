/**
 * Enterprise Database Connection
 * This file provides the main database interface for the application.
 * It now uses Supabase instead of mock data for production-ready functionality.
 */

import { DatabaseService } from './database'

// Export the enterprise database service as the main database interface
export const db = DatabaseService

// For backward compatibility and easy migration, we also export it as default
export default DatabaseService
