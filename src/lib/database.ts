/**
 * Enterprise Database Service Layer
 * This replaces the mock database with real Supabase integration
 * Provides a unified interface for all database operations
 */

import { SupabaseService } from './supabaseService'
import { User, Personnel, PersonnelDocument } from './database.types'

/**
 * Main Database Service Class
 * This class provides the same interface as MockDatabase but uses Supabase
 */
export class DatabaseService {
  
  // =====================================================
  // USER OPERATIONS
  // =====================================================

  /**
   * Find user by email address
   * @param email - User's email address
   * @returns User object or null if not found
   */
  static async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await SupabaseService.findUserByEmail(email)
    } catch (error) {
      console.error('[DatabaseService] Error in findUserByEmail:', error)
      throw error
    }
  }

  /**
   * Find user by ID
   * @param id - User's ID
   * @returns User object or null if not found
   */
  static async findUserById(id: number): Promise<User | null> {
    try {
      return await SupabaseService.findUserById(id)
    } catch (error) {
      console.error('[DatabaseService] Error in findUserById:', error)
      throw error
    }
  }

  /**
   * Create a new user
   * @param userData - User data to insert (without id, created_at, updated_at)
   * @returns Created user object
   */
  static async createUser(userData: {
    email: string
    name: string
    password: string
    phone?: string | null
    address?: string | null
    role?: string
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  }): Promise<User> {
    try {
      return await SupabaseService.createUser(userData)
    } catch (error) {
      console.error('[DatabaseService] Error in createUser:', error)
      throw error
    }
  }

  /**
   * Update user data
   * @param id - User ID to update
   * @param userData - Partial user data to update
   * @returns Updated user object or null if not found
   */
  static async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      return await SupabaseService.updateUser(id, userData)
    } catch (error) {
      console.error('[DatabaseService] Error in updateUser:', error)
      throw error
    }
  }

  /**
   * Delete user by ID
   * @param id - User ID to delete
   * @returns True if deleted successfully
   */
  static async deleteUser(id: number): Promise<boolean> {
    try {
      return await SupabaseService.deleteUser(id)
    } catch (error) {
      console.error('[DatabaseService] Error in deleteUser:', error)
      throw error
    }
  }

  /**
   * Get all users with optional filtering
   * @param options - Query options
   * @returns Array of users
   */
  static async getAllUsers(options?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }): Promise<User[]> {
    try {
      return await SupabaseService.getAllUsers(options)
    } catch (error) {
      console.error('[DatabaseService] Error in getAllUsers:', error)
      throw error
    }
  }

  // =====================================================
  // PERSONNEL OPERATIONS
  // =====================================================

  /**
   * Find personnel by email address
   * @param email - Personnel's email address
   * @returns Personnel object or null if not found
   */
  static async findPersonnelByEmail(email: string): Promise<Personnel | null> {
    try {
      return await SupabaseService.findPersonnelByEmail(email)
    } catch (error) {
      console.error('[DatabaseService] Error in findPersonnelByEmail:', error)
      throw error
    }
  }

  /**
   * Find personnel by ID
   * @param id - Personnel's ID
   * @returns Personnel object or null if not found
   */
  static async findPersonnelById(id: number): Promise<Personnel | null> {
    try {
      return await SupabaseService.findPersonnelById(id)
    } catch (error) {
      console.error('[DatabaseService] Error in findPersonnelById:', error)
      throw error
    }
  }

  /**
   * Create new personnel record
   * @param personnelData - Personnel data to insert (without id, created_at, updated_at)
   * @returns Created personnel object
   */
  static async createPersonnel(personnelData: {
    name: string
    email: string
    phone?: string | null
    address?: string | null
    profile_photo?: string | null
    department: string
    position?: string | null
    hire_date?: string | null
    status?: 'Active' | 'Inactive' | 'On Leave' | 'Suspended'
    biography?: string | null
    spouse_name?: string | null
    spouse_occupation?: string | null
    children_count?: string | null
    emergency_contact?: string | null
    children_names?: string | null
  }): Promise<Personnel> {
    try {
      return await SupabaseService.createPersonnel(personnelData)
    } catch (error) {
      console.error('[DatabaseService] Error in createPersonnel:', error)
      throw error
    }
  }

  /**
   * Update personnel data
   * @param id - Personnel ID to update
   * @param personnelData - Partial personnel data to update
   * @returns Updated personnel object or null if not found
   */
  static async updatePersonnel(id: number, personnelData: Partial<Personnel>): Promise<Personnel | null> {
    try {
      return await SupabaseService.updatePersonnel(id, personnelData)
    } catch (error) {
      console.error('[DatabaseService] Error in updatePersonnel:', error)
      throw error
    }
  }

  /**
   * Delete personnel by ID
   * @param id - Personnel ID to delete
   * @returns True if deleted successfully
   */
  static async deletePersonnel(id: number): Promise<boolean> {
    try {
      return await SupabaseService.deletePersonnel(id)
    } catch (error) {
      console.error('[DatabaseService] Error in deletePersonnel:', error)
      throw error
    }
  }

  /**
   * Get all personnel with pagination and filtering
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param options - Additional query options
   * @returns Paginated personnel data
   */
  static async getAllPersonnel(
    page: number = 1,
    limit: number = 10,
    options?: {
      search?: string
      department?: string
      status?: string
      sort?: 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'
    }
  ): Promise<{
    data: Personnel[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    try {
      return await SupabaseService.getAllPersonnel({
        page,
        limit,
        ...options
      })
    } catch (error) {
      console.error('[DatabaseService] Error in getAllPersonnel:', error)
      throw error
    }
  }

  // =====================================================
  // PERSONNEL DOCUMENTS OPERATIONS
  // =====================================================

  /**
   * Get all documents for a personnel
   * @param personnelId - Personnel ID
   * @returns Array of personnel documents
   */
  static async getPersonnelDocuments(personnelId: number): Promise<PersonnelDocument[]> {
    try {
      return await SupabaseService.getPersonnelDocuments(personnelId)
    } catch (error) {
      console.error('[DatabaseService] Error in getPersonnelDocuments:', error)
      throw error
    }
  }

  /**
   * Create a new personnel document
   * @param documentData - Document data to insert (without id, created_at, updated_at)
   * @returns Created document object
   */
  static async createPersonnelDocument(documentData: Omit<PersonnelDocument, 'id' | 'created_at' | 'updated_at'>): Promise<PersonnelDocument> {
    try {
      return await SupabaseService.createPersonnelDocument(documentData)
    } catch (error) {
      console.error('[DatabaseService] Error in createPersonnelDocument:', error)
      throw error
    }
  }

  // =====================================================
  // UTILITY OPERATIONS
  // =====================================================

  /**
   * Database health check
   * @returns Health check result
   */
  static async healthCheck(): Promise<{ success: boolean; message: string; details?: unknown }> {
    try {
      return await SupabaseService.healthCheck()
    } catch (error) {
      console.error('[DatabaseService] Error in healthCheck:', error)
      return {
        success: false,
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      }
    }
  }
}

// Export as default for easy importing
export default DatabaseService
