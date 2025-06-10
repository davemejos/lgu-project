import { supabaseAdmin } from './supabase'
import { User, Personnel, PersonnelDocument, UserInsert, PersonnelInsert, PersonnelDocumentInsert } from './database.types'

/**
 * Enterprise-grade Supabase Service Layer
 * Provides robust database operations with proper error handling,
 * logging, and performance optimization for production use.
 */
export class SupabaseService {

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
      console.log(`[SupabaseService] Finding user by email: ${email}`)

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('[SupabaseService] Users table does not exist yet')
          return null
        }
        console.error('[SupabaseService] Error finding user by email:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] User found: ${data?.name || 'Unknown'}`)
      return data
    } catch (error) {
      console.error('[SupabaseService] Error in findUserByEmail:', error)
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
      console.log(`[SupabaseService] Finding user by ID: ${id}`)

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('[SupabaseService] No user found with ID:', id)
          return null
        }
        console.error('[SupabaseService] Error finding user by ID:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('[SupabaseService] Error in findUserById:', error)
      throw error
    }
  }

  /**
   * Create a new user
   * @param userData - User data to insert
   * @returns Created user object
   */
  static async createUser(userData: Omit<UserInsert, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      console.log(`[SupabaseService] Creating user: ${userData.email}`)

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('[SupabaseService] Error creating user:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] User created successfully: ${data.name}`)
      return data
    } catch (error) {
      console.error('[SupabaseService] Error in createUser:', error)
      throw error
    }
  }

  /**
   * Update user data
   * @param id - User ID to update
   * @param userData - Partial user data to update
   * @returns Updated user object or null if not found
   */
  static async updateUser(id: number, userData: Partial<UserInsert>): Promise<User | null> {
    try {
      console.log(`[SupabaseService] Updating user ID: ${id}`)

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('[SupabaseService] Error updating user:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] User updated successfully: ${data?.name || 'Unknown'}`)
      return data
    } catch (error) {
      console.error('[SupabaseService] Error in updateUser:', error)
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
      console.log(`[SupabaseService] Deleting user ID: ${id}`)

      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[SupabaseService] Error deleting user:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] User deleted successfully: ${id}`)
      return true
    } catch (error) {
      console.error('[SupabaseService] Error in deleteUser:', error)
      throw error
    }
  }

  /**
   * Get all users with optional filtering and pagination
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
      console.log('[SupabaseService] Getting all users with options:', options)

      let query = supabaseAdmin
        .from('users')
        .select('*')

      // Apply search filter
      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
      }

      // Apply status filter
      if (options?.status) {
        query = query.eq('status', options.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')
      }

      // Apply pagination
      if (options?.page && options?.limit) {
        const from = (options.page - 1) * options.limit
        const to = from + options.limit - 1
        query = query.range(from, to)
      }

      // Order by name alphabetically (A-Z)
      query = query.order('name', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('[SupabaseService] Error getting all users:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] Retrieved ${data?.length || 0} users`)
      return data || []
    } catch (error) {
      console.error('[SupabaseService] Error in getAllUsers:', error)
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
      console.log(`[SupabaseService] Finding personnel by email: ${email}`)

      const { data, error } = await supabaseAdmin
        .from('personnel')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('[SupabaseService] Personnel table does not exist yet')
          return null
        }
        console.error('[SupabaseService] Error finding personnel by email:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] Personnel found: ${data?.name || 'Unknown'}`)
      return data
    } catch (error) {
      console.error('[SupabaseService] Error in findPersonnelByEmail:', error)
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
      console.log(`[SupabaseService] Finding personnel by ID: ${id}`)

      const { data, error } = await supabaseAdmin
        .from('personnel')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('[SupabaseService] No personnel found with ID:', id)
          return null
        }
        console.error('[SupabaseService] Error finding personnel by ID:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('[SupabaseService] Error in findPersonnelById:', error)
      throw error
    }
  }

  /**
   * Create new personnel record
   * @param personnelData - Personnel data to insert
   * @returns Created personnel object
   */
  static async createPersonnel(personnelData: Omit<PersonnelInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Personnel> {
    try {
      console.log(`[SupabaseService] Creating personnel: ${personnelData.email}`)

      const { data, error } = await supabaseAdmin
        .from('personnel')
        .insert({
          ...personnelData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('[SupabaseService] Error creating personnel:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] Personnel created successfully: ${data.name}`)
      return data
    } catch (error) {
      console.error('[SupabaseService] Error in createPersonnel:', error)
      throw error
    }
  }

  /**
   * Update personnel data
   * @param id - Personnel ID to update
   * @param personnelData - Partial personnel data to update
   * @returns Updated personnel object or null if not found
   */
  static async updatePersonnel(id: number, personnelData: Partial<PersonnelInsert>): Promise<Personnel | null> {
    try {
      console.log(`[SupabaseService] Updating personnel ID: ${id}`)

      const { data, error } = await supabaseAdmin
        .from('personnel')
        .update({
          ...personnelData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('[SupabaseService] Error updating personnel:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] Personnel updated successfully: ${data?.name || 'Unknown'}`)
      return data
    } catch (error) {
      console.error('[SupabaseService] Error in updatePersonnel:', error)
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
      console.log(`[SupabaseService] Deleting personnel ID: ${id}`)

      const { error } = await supabaseAdmin
        .from('personnel')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[SupabaseService] Error deleting personnel:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] Personnel deleted successfully: ${id}`)
      return true
    } catch (error) {
      console.error('[SupabaseService] Error in deletePersonnel:', error)
      throw error
    }
  }

  /**
   * Get all personnel with pagination and filtering
   * @param options - Query options
   * @returns Paginated personnel data
   */
  static async getAllPersonnel(options?: {
    page?: number
    limit?: number
    search?: string
    department?: string
    status?: string
    sort?: 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'
  }): Promise<{
    data: Personnel[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10

      console.log(`[SupabaseService] Getting all personnel - Page: ${page}, Limit: ${limit}`)

      // Build query for count
      let countQuery = supabaseAdmin
        .from('personnel')
        .select('*', { count: 'exact', head: true })

      // Build query for data
      let dataQuery = supabaseAdmin
        .from('personnel')
        .select('*')

      // Apply filters to both queries
      if (options?.search) {
        const searchFilter = `name.ilike.%${options.search}%,email.ilike.%${options.search}%`
        countQuery = countQuery.or(searchFilter)
        dataQuery = dataQuery.or(searchFilter)
      }

      if (options?.department) {
        countQuery = countQuery.eq('department', options.department)
        dataQuery = dataQuery.eq('department', options.department)
      }

      if (options?.status) {
        countQuery = countQuery.eq('status', options.status as 'Active' | 'Inactive' | 'On Leave' | 'Suspended')
        dataQuery = dataQuery.eq('status', options.status as 'Active' | 'Inactive' | 'On Leave' | 'Suspended')
      }

      // Get total count
      const { count, error: countError } = await countQuery

      if (countError) {
        console.error('[SupabaseService] Error getting personnel count:', countError)
        throw new Error(`Database error: ${countError.message}`)
      }

      // Apply pagination and ordering to data query
      const from = (page - 1) * limit
      const to = from + limit - 1

      // Apply sorting based on sort parameter
      const sortBy = options?.sort || 'name_asc'
      let sortedQuery = dataQuery.range(from, to)

      switch (sortBy) {
        case 'id_asc':
          sortedQuery = sortedQuery.order('id', { ascending: true })
          break
        case 'id_desc':
          sortedQuery = sortedQuery.order('id', { ascending: false })
          break
        case 'name_desc':
          sortedQuery = sortedQuery.order('name', { ascending: false })
          break
        case 'name_asc':
        default:
          sortedQuery = sortedQuery.order('name', { ascending: true })
          break
      }

      const { data, error } = await sortedQuery

      if (error) {
        console.error('[SupabaseService] Error getting personnel data:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      const result = {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }

      console.log(`[SupabaseService] Retrieved ${result.data.length} personnel records`)
      return result
    } catch (error) {
      console.error('[SupabaseService] Error in getAllPersonnel:', error)
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
      console.log(`[SupabaseService] Getting documents for personnel ID: ${personnelId}`)

      const { data, error } = await supabaseAdmin
        .from('personnel_documents')
        .select('*')
        .eq('personnel_id', personnelId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[SupabaseService] Error getting personnel documents:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] Retrieved ${data?.length || 0} documents`)
      return data || []
    } catch (error) {
      console.error('[SupabaseService] Error in getPersonnelDocuments:', error)
      throw error
    }
  }

  /**
   * Create a new personnel document
   * @param documentData - Document data to insert
   * @returns Created document object
   */
  static async createPersonnelDocument(documentData: Omit<PersonnelDocumentInsert, 'id' | 'created_at' | 'updated_at'>): Promise<PersonnelDocument> {
    try {
      console.log(`[SupabaseService] Creating document: ${documentData.filename}`)

      const { data, error } = await supabaseAdmin
        .from('personnel_documents')
        .insert({
          ...documentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('[SupabaseService] Error creating personnel document:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log(`[SupabaseService] Document created successfully: ${data.filename}`)
      return data
    } catch (error) {
      console.error('[SupabaseService] Error in createPersonnelDocument:', error)
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
      console.log('[SupabaseService] Performing health check')

      // Test basic connection
      const { error } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1)

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      const result = {
        success: true,
        message: 'Supabase connection successful!',
        details: {
          connected: true,
          tablesExist: error?.code !== 'PGRST116',
          timestamp: new Date().toISOString()
        }
      }

      console.log('[SupabaseService] Health check passed')
      return result
    } catch (error) {
      const result = {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      }

      console.error('[SupabaseService] Health check failed:', result)
      return result
    }
  }
}
