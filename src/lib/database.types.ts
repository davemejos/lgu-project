export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          email: string
          name: string
          password: string
          phone: string | null
          address: string | null
          role: string
          status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          email: string
          name: string
          password: string
          phone?: string | null
          address?: string | null
          role?: string
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          email?: string
          name?: string
          password?: string
          phone?: string | null
          address?: string | null
          role?: string
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      personnel: {
        Row: {
          id: number
          name: string
          email: string
          phone: string | null
          address: string | null
          profile_photo: string | null
          department: string
          position: string | null
          hire_date: string | null
          status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended'
          biography: string | null
          spouse_name: string | null
          spouse_occupation: string | null
          children_count: string | null
          emergency_contact: string | null
          children_names: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          profile_photo?: string | null
          department?: string
          position?: string | null
          hire_date?: string | null
          status?: 'Active' | 'Inactive' | 'On Leave' | 'Suspended'
          biography?: string | null
          spouse_name?: string | null
          spouse_occupation?: string | null
          children_count?: string | null
          emergency_contact?: string | null
          children_names?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      personnel_documents: {
        Row: {
          id: number
          filename: string
          original_name: string
          mime_type: string
          size: number
          path: string
          personnel_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          filename: string
          original_name: string
          mime_type: string
          size: number
          path: string
          personnel_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          filename?: string
          original_name?: string
          mime_type?: string
          size?: number
          path?: string
          personnel_id?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personnel_documents_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      personnel_status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Personnel = Database['public']['Tables']['personnel']['Row']
export type PersonnelDocument = Database['public']['Tables']['personnel_documents']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PersonnelInsert = Database['public']['Tables']['personnel']['Insert']
export type PersonnelDocumentInsert = Database['public']['Tables']['personnel_documents']['Insert']

export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PersonnelUpdate = Database['public']['Tables']['personnel']['Update']
export type PersonnelDocumentUpdate = Database['public']['Tables']['personnel_documents']['Update']
