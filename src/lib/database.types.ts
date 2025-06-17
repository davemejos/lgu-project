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
      media_assets: {
        Row: {
          id: string
          cloudinary_public_id: string
          cloudinary_version: number
          cloudinary_signature: string
          cloudinary_etag: string | null
          original_filename: string | null
          display_name: string | null
          file_size: number
          mime_type: string
          format: string
          width: number | null
          height: number | null
          duration: number | null
          folder: string | null
          tags: string[]
          description: string | null
          alt_text: string | null
          secure_url: string
          url: string
          thumbnail_url: string | null
          resource_type: string
          access_mode: string
          uploaded_by: string | null
          used_in_personnel: number | null
          used_in_documents: number | null
          created_at: string
          updated_at: string
          cloudinary_created_at: string | null
          sync_status: 'synced' | 'pending' | 'error'
          last_synced_at: string
          sync_error_message: string | null
          sync_retry_count: number
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          cloudinary_public_id: string
          cloudinary_version?: number
          cloudinary_signature: string
          cloudinary_etag?: string | null
          original_filename?: string | null
          display_name?: string | null
          file_size: number
          mime_type: string
          format: string
          width?: number | null
          height?: number | null
          duration?: number | null
          folder?: string | null
          tags?: string[]
          description?: string | null
          alt_text?: string | null
          secure_url: string
          url: string
          thumbnail_url?: string | null
          resource_type?: string
          access_mode?: string
          uploaded_by?: string | null
          used_in_personnel?: number | null
          used_in_documents?: number | null
          created_at?: string
          updated_at?: string
          cloudinary_created_at?: string | null
          sync_status?: 'synced' | 'pending' | 'error'
          last_synced_at?: string
          sync_error_message?: string | null
          sync_retry_count?: number
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          cloudinary_public_id?: string
          cloudinary_version?: number
          cloudinary_signature?: string
          cloudinary_etag?: string | null
          original_filename?: string | null
          display_name?: string | null
          file_size?: number
          mime_type?: string
          format?: string
          width?: number | null
          height?: number | null
          duration?: number | null
          folder?: string | null
          tags?: string[]
          description?: string | null
          alt_text?: string | null
          secure_url?: string
          url?: string
          thumbnail_url?: string | null
          resource_type?: string
          access_mode?: string
          uploaded_by?: string | null
          used_in_personnel?: number | null
          used_in_documents?: number | null
          created_at?: string
          updated_at?: string
          cloudinary_created_at?: string | null
          sync_status?: 'synced' | 'pending' | 'error'
          last_synced_at?: string
          sync_error_message?: string | null
          sync_retry_count?: number
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_used_in_personnel_fkey"
            columns: ["used_in_personnel"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_used_in_documents_fkey"
            columns: ["used_in_documents"]
            isOneToOne: false
            referencedRelation: "personnel_documents"
            referencedColumns: ["id"]
          }
        ]
      }
      media_sync_log: {
        Row: {
          id: string
          operation: 'upload' | 'delete' | 'update' | 'restore'
          status: 'synced' | 'pending' | 'error'
          media_asset_id: string | null
          cloudinary_public_id: string
          source: string
          triggered_by: string | null
          error_message: string | null
          error_code: string | null
          retry_count: number
          processing_time_ms: number | null
          file_size: number | null
          operation_data: Json | null
          webhook_data: Json | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          operation: 'upload' | 'delete' | 'update' | 'restore'
          status: 'synced' | 'pending' | 'error'
          media_asset_id?: string | null
          cloudinary_public_id: string
          source: string
          triggered_by?: string | null
          error_message?: string | null
          error_code?: string | null
          retry_count?: number
          processing_time_ms?: number | null
          file_size?: number | null
          operation_data?: Json | null
          webhook_data?: Json | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          operation?: 'upload' | 'delete' | 'update' | 'restore'
          status?: 'synced' | 'pending' | 'error'
          media_asset_id?: string | null
          cloudinary_public_id?: string
          source?: string
          triggered_by?: string | null
          error_message?: string | null
          error_code?: string | null
          retry_count?: number
          processing_time_ms?: number | null
          file_size?: number | null
          operation_data?: Json | null
          webhook_data?: Json | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_sync_log_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          }
        ]
      }
      media_usage: {
        Row: {
          id: string
          media_asset_id: string
          usage_type: string
          reference_table: string | null
          reference_id: string | null
          usage_context: Json | null
          created_at: string
          removed_at: string | null
        }
        Insert: {
          id?: string
          media_asset_id: string
          usage_type: string
          reference_table?: string | null
          reference_id?: string | null
          usage_context?: Json | null
          created_at?: string
          removed_at?: string | null
        }
        Update: {
          id?: string
          media_asset_id?: string
          usage_type?: string
          reference_table?: string | null
          reference_id?: string | null
          usage_context?: Json | null
          created_at?: string
          removed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          }
        ]
      }
      media_collections: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string | null
          parent_collection_id: string | null
          sort_order: number
          is_public: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug?: string | null
          parent_collection_id?: string | null
          sort_order?: number
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string | null
          parent_collection_id?: string | null
          sort_order?: number
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_collections_parent_collection_id_fkey"
            columns: ["parent_collection_id"]
            isOneToOne: false
            referencedRelation: "media_collections"
            referencedColumns: ["id"]
          }
        ]
      }
      media_collection_items: {
        Row: {
          id: string
          collection_id: string
          media_asset_id: string
          sort_order: number
          added_at: string
          added_by: string | null
        }
        Insert: {
          id?: string
          collection_id: string
          media_asset_id: string
          sort_order?: number
          added_at?: string
          added_by?: string | null
        }
        Update: {
          id?: string
          collection_id?: string
          media_asset_id?: string
          sort_order?: number
          added_at?: string
          added_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "media_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_collection_items_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          }
        ]
      }
      sync_operations: {
        Row: {
          id: string
          operation_type: 'upload' | 'delete' | 'update' | 'full_sync' | 'webhook'
          status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress: number
          total_items: number
          processed_items: number
          failed_items: number
          start_time: string
          end_time: string | null
          estimated_completion: string | null
          triggered_by: string | null
          source: 'manual' | 'webhook' | 'api' | 'scheduled'
          operation_data: Json
          error_details: Json
          performance_metrics: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          operation_type: 'upload' | 'delete' | 'update' | 'full_sync' | 'webhook'
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          total_items?: number
          processed_items?: number
          failed_items?: number
          start_time?: string
          end_time?: string | null
          estimated_completion?: string | null
          triggered_by?: string | null
          source?: 'manual' | 'webhook' | 'api' | 'scheduled'
          operation_data?: Json
          error_details?: Json
          performance_metrics?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          operation_type?: 'upload' | 'delete' | 'update' | 'full_sync' | 'webhook'
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          total_items?: number
          processed_items?: number
          failed_items?: number
          start_time?: string
          end_time?: string | null
          estimated_completion?: string | null
          triggered_by?: string | null
          source?: 'manual' | 'webhook' | 'api' | 'scheduled'
          operation_data?: Json
          error_details?: Json
          performance_metrics?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_status: {
        Row: {
          id: string
          client_id: string
          status: string
          last_ping: string
          connection_start: string
          reconnect_attempts: number
          latency_ms: number
          user_agent: string | null
          ip_address: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          status?: string
          last_ping?: string
          connection_start?: string
          reconnect_attempts?: number
          latency_ms?: number
          user_agent?: string | null
          ip_address?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          status?: string
          last_ping?: string
          connection_start?: string
          reconnect_attempts?: number
          latency_ms?: number
          user_agent?: string | null
          ip_address?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sync_status_snapshots: {
        Row: {
          id: string
          snapshot_type: 'hourly' | 'daily' | 'manual' | 'error'
          total_assets: number
          synced_assets: number
          pending_assets: number
          error_assets: number
          active_operations: number
          last_sync_time: string | null
          system_health: 'healthy' | 'warning' | 'critical'
          performance_score: number
          error_rate: number
          avg_sync_time_ms: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          snapshot_type: 'hourly' | 'daily' | 'manual' | 'error'
          total_assets?: number
          synced_assets?: number
          pending_assets?: number
          error_assets?: number
          active_operations?: number
          last_sync_time?: string | null
          system_health?: 'healthy' | 'warning' | 'critical'
          performance_score?: number
          error_rate?: number
          avg_sync_time_ms?: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          snapshot_type?: 'hourly' | 'daily' | 'manual' | 'error'
          total_assets?: number
          synced_assets?: number
          pending_assets?: number
          error_assets?: number
          active_operations?: number
          last_sync_time?: string | null
          system_health?: 'healthy' | 'warning' | 'critical'
          performance_score?: number
          error_rate?: number
          avg_sync_time_ms?: number
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      soft_delete_media_asset: {
        Args: {
          asset_id: string
          deleted_by_user?: string
        }
        Returns: boolean
      }
      restore_media_asset: {
        Args: {
          asset_id: string
          restored_by_user?: string
        }
        Returns: boolean
      }
      update_media_sync_status: {
        Args: {
          asset_id: string
          new_status: 'synced' | 'pending' | 'error'
          error_msg?: string
        }
        Returns: boolean
      }
      get_media_statistics: {
        Args: Record<string, never>
        Returns: {
          total_assets: number
          total_images: number
          total_videos: number
          total_raw: number
          total_size: number
          synced_assets: number
          pending_assets: number
          error_assets: number
        }[]
      }
      cleanup_old_sync_logs: {
        Args: Record<string, never>
        Returns: number
      }
      update_sync_operation_progress: {
        Args: {
          operation_id: string
          new_progress: number
          processed_count?: number
          failed_count?: number
        }
        Returns: boolean
      }
      complete_sync_operation: {
        Args: {
          operation_id: string
          final_status: string
          error_details?: Json
        }
        Returns: boolean
      }
      create_sync_status_snapshot: {
        Args: {
          snapshot_type_param?: string
        }
        Returns: string
      }
      notify_sync_status_change: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {
      user_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      personnel_status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended'
      media_sync_status: 'synced' | 'pending' | 'error'
      media_sync_operation: 'upload' | 'delete' | 'update' | 'restore'
    }
    CompositeTypes: Record<string, never>
  }
}

// Type helpers for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Personnel = Database['public']['Tables']['personnel']['Row']
export type PersonnelDocument = Database['public']['Tables']['personnel_documents']['Row']
export type MediaAsset = Database['public']['Tables']['media_assets']['Row']
export type MediaSyncLog = Database['public']['Tables']['media_sync_log']['Row']
export type MediaUsage = Database['public']['Tables']['media_usage']['Row']
export type MediaCollection = Database['public']['Tables']['media_collections']['Row']
export type MediaCollectionItem = Database['public']['Tables']['media_collection_items']['Row']
export type SyncOperation = Database['public']['Tables']['sync_operations']['Row']
export type ConnectionStatus = Database['public']['Tables']['connection_status']['Row']
export type SyncStatusSnapshot = Database['public']['Tables']['sync_status_snapshots']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PersonnelInsert = Database['public']['Tables']['personnel']['Insert']
export type PersonnelDocumentInsert = Database['public']['Tables']['personnel_documents']['Insert']
export type MediaAssetInsert = Database['public']['Tables']['media_assets']['Insert']
export type MediaSyncLogInsert = Database['public']['Tables']['media_sync_log']['Insert']
export type MediaUsageInsert = Database['public']['Tables']['media_usage']['Insert']
export type MediaCollectionInsert = Database['public']['Tables']['media_collections']['Insert']
export type MediaCollectionItemInsert = Database['public']['Tables']['media_collection_items']['Insert']
export type SyncOperationInsert = Database['public']['Tables']['sync_operations']['Insert']
export type ConnectionStatusInsert = Database['public']['Tables']['connection_status']['Insert']
export type SyncStatusSnapshotInsert = Database['public']['Tables']['sync_status_snapshots']['Insert']

export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PersonnelUpdate = Database['public']['Tables']['personnel']['Update']
export type PersonnelDocumentUpdate = Database['public']['Tables']['personnel_documents']['Update']
export type MediaAssetUpdate = Database['public']['Tables']['media_assets']['Update']
export type MediaSyncLogUpdate = Database['public']['Tables']['media_sync_log']['Update']
export type MediaUsageUpdate = Database['public']['Tables']['media_usage']['Update']
export type MediaCollectionUpdate = Database['public']['Tables']['media_collections']['Update']
export type MediaCollectionItemUpdate = Database['public']['Tables']['media_collection_items']['Update']
export type SyncOperationUpdate = Database['public']['Tables']['sync_operations']['Update']
export type ConnectionStatusUpdate = Database['public']['Tables']['connection_status']['Update']
export type SyncStatusSnapshotUpdate = Database['public']['Tables']['sync_status_snapshots']['Update']
