import { supabase, supabaseAdmin } from './supabase'
import { User, Personnel, PersonnelDocument, UserInsert, PersonnelInsert, PersonnelDocumentInsert } from './database.types'

export class SupabaseService {
  // User operations
  static async findUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Users table does not exist yet')
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error finding user by email:', error)
      return null
    }
  }

  static async findUserById(id: number): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Users table does not exist yet')
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error finding user by id:', error)
      return null
    }
  }

  static async createUser(userData: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Users table does not exist yet')
          return []
        }
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting all users:', error)
      return []
    }
  }

  // Personnel operations
  static async getAllPersonnel(): Promise<Personnel[]> {
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Personnel table does not exist yet')
          return []
        }
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting all personnel:', error)
      return []
    }
  }

  static async findPersonnelById(id: number): Promise<Personnel | null> {
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Personnel table does not exist yet')
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error finding personnel by id:', error)
      return null
    }
  }

  static async createPersonnel(personnelData: PersonnelInsert): Promise<Personnel | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('personnel')
        .insert(personnelData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating personnel:', error)
      return null
    }
  }

  // Personnel Documents operations
  static async getPersonnelDocuments(personnelId: number): Promise<PersonnelDocument[]> {
    try {
      const { data, error } = await supabase
        .from('personnel_documents')
        .select('*')
        .eq('personnel_id', personnelId)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Personnel documents table does not exist yet')
          return []
        }
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting personnel documents:', error)
      return []
    }
  }

  static async createPersonnelDocument(documentData: PersonnelDocumentInsert): Promise<PersonnelDocument | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('personnel_documents')
        .insert(documentData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating personnel document:', error)
      return null
    }
  }

  // Database health check
  static async healthCheck(): Promise<{ success: boolean; message: string; details?: unknown }> {
    try {
      // Test basic connection
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Get database info
      await supabase.rpc('version')

      return {
        success: true,
        message: 'Supabase connection successful!',
        details: {
          connected: true,
          tablesExist: error?.code !== 'PGRST116',
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      }
    }
  }
}
