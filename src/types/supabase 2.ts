export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          project_id: string
          timestamp: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          project_id: string
          timestamp?: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          project_id?: string
          timestamp?: string
          user_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cap_table_investors: {
        Row: {
          cap_table_id: string | null
          created_at: string | null
          id: string
          investor_id: string
        }
        Insert: {
          cap_table_id?: string | null
          created_at?: string | null
          id?: string
          investor_id: string
        }
        Update: {
          cap_table_id?: string | null
          created_at?: string | null
          id?: string
          investor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cap_table_investors_cap_table_id_fkey"
            columns: ["cap_table_id"]
            isOneToOne: false
            referencedRelation: "cap_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cap_table_investors_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
        ]
      }
      cap_tables: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cap_tables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string
          risk_reason: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level: string
          risk_reason: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          risk_reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "compliance_checks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_groups: {
        Row: {
          created_at: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_groups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_groups_investors: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          investor_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          investor_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          investor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_groups_investors_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "investor_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_groups_investors_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
        ]
      }
      investors: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          investor_id: string
          kyc_expiry_date: string | null
          kyc_status: string
          lastUpdated: string | null
          name: string
          notes: string | null
          type: string
          updated_at: string | null
          verification_details: Json | null
          wallet_address: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          investor_id?: string
          kyc_expiry_date?: string | null
          kyc_status: string
          lastUpdated?: string | null
          name: string
          notes?: string | null
          type: string
          updated_at?: string | null
          verification_details?: Json | null
          wallet_address?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          investor_id?: string
          kyc_expiry_date?: string | null
          kyc_status?: string
          lastUpdated?: string | null
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string | null
          verification_details?: Json | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          allocated: boolean
          confirmed: boolean
          created_at: string | null
          currency: string
          distributed: boolean
          fiat_amount: number
          id: string
          investor_id: string
          notes: string | null
          project_id: string | null
          subscription_date: string | null
          subscription_id: string
          updated_at: string | null
        }
        Insert: {
          allocated?: boolean
          confirmed?: boolean
          created_at?: string | null
          currency: string
          distributed?: boolean
          fiat_amount: number
          id?: string
          investor_id: string
          notes?: string | null
          project_id?: string | null
          subscription_date?: string | null
          subscription_id: string
          updated_at?: string | null
        }
        Update: {
          allocated?: boolean
          confirmed?: boolean
          created_at?: string | null
          currency?: string
          distributed?: boolean
          fiat_amount?: number
          id?: string
          investor_id?: string
          notes?: string | null
          project_id?: string | null
          subscription_date?: string | null
          subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "subscriptions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      token_allocations: {
        Row: {
          allocation_date: string | null
          created_at: string
          distributed: boolean
          distribution_date: string | null
          distribution_tx_hash: string | null
          id: string
          investor_id: string
          notes: string | null
          project_id: string | null
          subscription_id: string
          token_amount: number
          token_type: string
          updated_at: string | null
        }
        Insert: {
          allocation_date?: string | null
          created_at?: string
          distributed?: boolean
          distribution_date?: string | null
          distribution_tx_hash?: string | null
          id?: string
          investor_id: string
          notes?: string | null
          project_id?: string | null
          subscription_id: string
          token_amount: number
          token_type: string
          updated_at?: string | null
        }
        Update: {
          allocation_date?: string | null
          created_at?: string
          distributed?: boolean
          distribution_date?: string | null
          distribution_tx_hash?: string | null
          id?: string
          investor_id?: string
          notes?: string | null
          project_id?: string | null
          subscription_id?: string
          token_amount?: number
          token_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_allocations_investor_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "token_allocations_project_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_allocations_subscription_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      token_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          token_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          token_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          token_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_comments_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_deployments: {
        Row: {
          contract_address: string
          deployed_at: string | null
          deployed_by: string
          deployment_data: Json | null
          id: string
          network: string
          status: string
          token_id: string
          transaction_hash: string
        }
        Insert: {
          contract_address: string
          deployed_at?: string | null
          deployed_by: string
          deployment_data?: Json | null
          id?: string
          network: string
          status?: string
          token_id: string
          transaction_hash: string
        }
        Update: {
          contract_address?: string
          deployed_at?: string | null
          deployed_by?: string
          deployment_data?: Json | null
          id?: string
          network?: string
          status?: string
          token_id?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_deployments_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_designs: {
        Row: {
          contract_address: string | null
          created_at: string | null
          deployment_date: string | null
          id: string
          name: string
          status: string
          total_supply: number
          type: string
        }
        Insert: {
          contract_address?: string | null
          created_at?: string | null
          deployment_date?: string | null
          id?: string
          name: string
          status?: string
          total_supply: number
          type: string
        }
        Update: {
          contract_address?: string | null
          created_at?: string | null
          deployment_date?: string | null
          id?: string
          name?: string
          status?: string
          total_supply?: number
          type?: string
        }
        Relationships: []
      }
      token_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          data: Json
          id: string
          token_id: string
          version: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data: Json
          id?: string
          token_id: string
          version: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data?: Json
          id?: string
          token_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "token_versions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          approvals: string[] | null
          blocks: Json
          contract_preview: string | null
          created_at: string | null
          decimals: number
          id: string
          metadata: Json | null
          name: string
          project_id: string
          reviewers: string[] | null
          standard: string
          status: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          approvals?: string[] | null
          blocks: Json
          contract_preview?: string | null
          created_at?: string | null
          decimals?: number
          id?: string
          metadata?: Json | null
          name: string
          project_id: string
          reviewers?: string[] | null
          standard: string
          status?: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          approvals?: string[] | null
          blocks?: Json
          contract_preview?: string | null
          created_at?: string | null
          decimals?: number
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string
          reviewers?: string[] | null
          standard?: string
          status?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      kyc_status: "approved" | "pending" | "failed" | "not_started" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
      admin_users: {
      business_owners: {
          address_proof_url: string | null
          date_of_birth: string
          full_name: string
          nationality: string
          organization_id: string | null
          ownership_percentage: number
          passport_url: string | null
          risk_score: number | null
          verification_status: string | null
          address_proof_url?: string | null
          date_of_birth: string
          full_name: string
          nationality: string
          organization_id?: string | null
          ownership_percentage: number
          passport_url?: string | null
          risk_score?: number | null
          verification_status?: string | null
          address_proof_url?: string | null
          date_of_birth?: string
          full_name?: string
          nationality?: string
          organization_id?: string | null
          ownership_percentage?: number
          passport_url?: string | null
          risk_score?: number | null
          verification_status?: string | null
            foreignKeyName: "business_owners_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organization_details"
      company_details: {
          company_name: string
          company_type: string
          is_regulated: boolean | null
          registration_number: string | null
          regulatory_status: string | null
          company_name: string
          company_type: string
          is_regulated?: boolean | null
          registration_number?: string | null
          regulatory_status?: string | null
          company_name?: string
          company_type?: string
          is_regulated?: boolean | null
          registration_number?: string | null
          regulatory_status?: string | null
      company_directors: {
          address_document_id: string | null
          company_id: string
          full_name: string
          passport_document_id: string | null
          position: string
          address_document_id?: string | null
          company_id: string
          full_name: string
          passport_document_id?: string | null
          position: string
          address_document_id?: string | null
          company_id?: string
          full_name?: string
          passport_document_id?: string | null
          position?: string
            foreignKeyName: "company_directors_address_document_id_fkey"
            columns: ["address_document_id"]
            referencedRelation: "kyc_documents"
            foreignKeyName: "company_directors_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "company_details"
            foreignKeyName: "company_directors_passport_document_id_fkey"
            columns: ["passport_document_id"]
            referencedRelation: "kyc_documents"
      company_shareholders: {
          address_document_id: string | null
          company_id: string
          full_name: string
          ownership_percentage: number
          passport_document_id: string | null
          address_document_id?: string | null
          company_id: string
          full_name: string
          ownership_percentage: number
          passport_document_id?: string | null
          address_document_id?: string | null
          company_id?: string
          full_name?: string
          ownership_percentage?: number
          passport_document_id?: string | null
            foreignKeyName: "company_shareholders_address_document_id_fkey"
            columns: ["address_document_id"]
            referencedRelation: "kyc_documents"
            foreignKeyName: "company_shareholders_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "company_details"
            foreignKeyName: "company_shareholders_passport_document_id_fkey"
            columns: ["passport_document_id"]
            referencedRelation: "kyc_documents"
      compliance_documents: {
          document_type: string
          document_url: string
          guardian_verification: Json | null
          organization_id: string | null
          risk_classification: string | null
          verification_status: string | null
          document_type: string
          document_url: string
          guardian_verification?: Json | null
          organization_id?: string | null
          risk_classification?: string | null
          verification_status?: string | null
          document_type?: string
          document_url?: string
          guardian_verification?: Json | null
          organization_id?: string | null
          risk_classification?: string | null
          verification_status?: string | null
            foreignKeyName: "compliance_documents_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organization_details"
      compliance_rules: {
          eligible_jurisdictions: string[]
          issuer_id: string
          max_investors: number | null
          title: string
          transfer_restrictions: Json | null
          eligible_jurisdictions?: string[]
          issuer_id: string
          max_investors?: number | null
          title: string
          transfer_restrictions?: Json | null
          eligible_jurisdictions?: string[]
          issuer_id?: string
          max_investors?: number | null
          title?: string
          transfer_restrictions?: Json | null
      email_templates: {
          html_content: string
          subject: string
          html_content: string
          subject: string
          html_content?: string
          subject?: string
      investor_documents: {
          document_type: string
          document_url: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          document_type: string
          document_url: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          document_type?: string
          document_url?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
      investor_profiles: {
          chain_id: string | null
          country: string
          date_of_birth: string | null
          financial_profile: Json | null
          investment_profile: Json | null
          investor_type: string
          is_qualified: boolean | null
          nationality: string | null
          residency_address: Json | null
          chain_id?: string | null
          country: string
          date_of_birth?: string | null
          financial_profile?: Json | null
          investment_profile?: Json | null
          investor_type: string
          is_qualified?: boolean | null
          nationality?: string | null
          residency_address?: Json | null
          chain_id?: string | null
          country?: string
          date_of_birth?: string | null
          financial_profile?: Json | null
          investment_profile?: Json | null
          investor_type?: string
          is_qualified?: boolean | null
          nationality?: string | null
          residency_address?: Json | null
      investor_wallets: {
          is_verified: boolean | null
          wallet_address: string
          wallet_type: string
          is_verified?: boolean | null
          wallet_address: string
          wallet_type: string
          is_verified?: boolean | null
          wallet_address?: string
          wallet_type?: string
          accreditation_status:
            | Database["public"]["Enums"]["accreditation_status"]
            | null
          country: string | null
          kyc_date: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          status: Database["public"]["Enums"]["investor_status"] | null
          type: Database["public"]["Enums"]["investor_type"]
          accreditation_status?:
            | Database["public"]["Enums"]["accreditation_status"]
            | null
          country?: string | null
          kyc_date?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          status?: Database["public"]["Enums"]["investor_status"] | null
          type: Database["public"]["Enums"]["investor_type"]
          accreditation_status?:
            | Database["public"]["Enums"]["accreditation_status"]
            | null
          country?: string | null
          kyc_date?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          status?: Database["public"]["Enums"]["investor_status"] | null
          type?: Database["public"]["Enums"]["investor_type"]
      issuer_documents: {
          document_type: string
          document_url: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          document_type: string
          document_url: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          document_type?: string
          document_url?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
      issuer_profiles: {
          business_description: string | null
          company_name: string
          company_type: string
          is_regulated: boolean | null
          jurisdiction: string
          registration_number: string | null
          regulatory_status: string | null
          business_description?: string | null
          company_name: string
          company_type: string
          is_regulated?: boolean | null
          jurisdiction: string
          registration_number?: string | null
          regulatory_status?: string | null
          business_description?: string | null
          company_name?: string
          company_type?: string
          is_regulated?: boolean | null
          jurisdiction?: string
          registration_number?: string | null
          regulatory_status?: string | null
      issuer_registrations: {
          business_email: string
          country: string
          email_verified: boolean | null
          organization_name: string
          registration_status: string | null
          terms_accepted: boolean | null
          business_email: string
          country: string
          email_verified?: boolean | null
          organization_name: string
          registration_status?: string | null
          terms_accepted?: boolean | null
          business_email?: string
          country?: string
          email_verified?: boolean | null
          organization_name?: string
          registration_status?: string | null
          terms_accepted?: boolean | null
      issuer_submissions: {
          compliance_status: Json | null
          guardian_validation: Json | null
          rejection_reason: string | null
          review_stages: Json | null
          reviewer_id: string | null
          submission_date: string
          compliance_status?: Json | null
          guardian_validation?: Json | null
          rejection_reason?: string | null
          review_stages?: Json | null
          reviewer_id?: string | null
          submission_date?: string
          compliance_status?: Json | null
          guardian_validation?: Json | null
          rejection_reason?: string | null
          review_stages?: Json | null
          reviewer_id?: string | null
          submission_date?: string
      issuer_verification_codes: {
          code: string
          expires_at: string
          used: boolean | null
          code: string
          expires_at: string
          used?: boolean | null
          code?: string
          expires_at?: string
          used?: boolean | null
      issuer_wallets: {
          compliance_status: Json | null
          is_verified: boolean | null
          is_whitelisted: boolean | null
          risk_score: number | null
          wallet_address: string
          wallet_type: Database["public"]["Enums"]["wallet_type"]
          compliance_status?: Json | null
          is_verified?: boolean | null
          is_whitelisted?: boolean | null
          risk_score?: number | null
          wallet_address: string
          wallet_type: Database["public"]["Enums"]["wallet_type"]
          compliance_status?: Json | null
          is_verified?: boolean | null
          is_whitelisted?: boolean | null
          risk_score?: number | null
          wallet_address?: string
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
      kyc_documents: {
          document_type: string
          document_url: string
          verification_status: string
          document_type: string
          document_url: string
          verification_status?: string
          document_type?: string
          document_url?: string
          verification_status?: string
      legal_agreements: {
          agreement_type: string
          content: string
          title: string
          version: string
          agreement_type: string
          content: string
          title: string
          version: string
          agreement_type?: string
          content?: string
          title?: string
          version?: string
      notifications: {
          is_read: boolean
          message: string
          title: string
          is_read?: boolean
          message: string
          title: string
          is_read?: boolean
          message?: string
          title?: string
      onboarding_status: {
          current_step: number
          is_completed: boolean
          current_step?: number
          is_completed?: boolean
          current_step?: number
          is_completed?: boolean
      organization_details: {
          business_type: string
          entity_structure: string
          external_representatives: string | null
          governance_model: string
          is_regulated: boolean | null
          issuer_type: string[]
          jurisdiction: string
          legal_name: string
          registration_number: string | null
          regulatory_details: Json | null
          risk_classification: string
          business_type: string
          entity_structure: string
          external_representatives?: string | null
          governance_model: string
          is_regulated?: boolean | null
          issuer_type: string[]
          jurisdiction: string
          legal_name: string
          registration_number?: string | null
          regulatory_details?: Json | null
          risk_classification: string
          business_type?: string
          entity_structure?: string
          external_representatives?: string | null
          governance_model?: string
          is_regulated?: boolean | null
          issuer_type?: string[]
          jurisdiction?: string
          legal_name?: string
          registration_number?: string | null
          regulatory_details?: Json | null
          risk_classification?: string
      organization_directors: {
          address_proof_url: string | null
          full_name: string
          organization_id: string | null
          passport_url: string | null
          position: string
          verification_status: string | null
          address_proof_url?: string | null
          full_name: string
          organization_id?: string | null
          passport_url?: string | null
          position: string
          verification_status?: string | null
          address_proof_url?: string | null
          full_name?: string
          organization_id?: string | null
          passport_url?: string | null
          position?: string
          verification_status?: string | null
            foreignKeyName: "organization_directors_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "issuer_profiles"
      organization_documents: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size: number
          file_url: string
          mime_type: string
          organization_id: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size: number
          file_url: string
          mime_type: string
          organization_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_size?: number
          file_url?: string
          mime_type?: string
          organization_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
            foreignKeyName: "organization_documents_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "issuer_profiles"
      organization_shareholders: {
          address_proof_url: string | null
          full_name: string
          organization_id: string | null
          ownership_percentage: number
          passport_url: string | null
          verification_status: string | null
          address_proof_url?: string | null
          full_name: string
          organization_id?: string | null
          ownership_percentage: number
          passport_url?: string | null
          verification_status?: string | null
          address_proof_url?: string | null
          full_name?: string
          organization_id?: string | null
          ownership_percentage?: number
          passport_url?: string | null
          verification_status?: string | null
            foreignKeyName: "organization_shareholders_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "issuer_profiles"
      risk_assessments: {
          assessment_date: string
          next_review_date: string | null
          organization_id: string | null
          required_approvals: Json | null
          risk_factors: Json | null
          risk_type: string
          assessment_date?: string
          next_review_date?: string | null
          organization_id?: string | null
          required_approvals?: Json | null
          risk_factors?: Json | null
          risk_type: string
          assessment_date?: string
          next_review_date?: string | null
          organization_id?: string | null
          required_approvals?: Json | null
          risk_factors?: Json | null
          risk_type?: string
            foreignKeyName: "risk_assessments_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organization_details"
      rules: {
          created_by: string
          rule_details: Json
          rule_id: string
          rule_name: string
          rule_type: string
          status: Database["public"]["Enums"]["rule_status"] | null
          created_by: string
          rule_details?: Json
          rule_id?: string
          rule_name: string
          rule_type: string
          status?: Database["public"]["Enums"]["rule_status"] | null
          created_by?: string
          rule_details?: Json
          rule_id?: string
          rule_name?: string
          rule_type?: string
          status?: Database["public"]["Enums"]["rule_status"] | null
      spv_directors: {
          address_proof_url: string | null
          full_name: string
          passport_url: string | null
          position: string
          spv_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          address_proof_url?: string | null
          full_name: string
          passport_url?: string | null
          position: string
          spv_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          address_proof_url?: string | null
          full_name?: string
          passport_url?: string | null
          position?: string
          spv_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
            foreignKeyName: "spv_directors_spv_id_fkey"
            columns: ["spv_id"]
            referencedRelation: "spv_entities"
      spv_documents: {
          document_type: string
          document_url: string
          spv_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          document_type: string
          document_url: string
          spv_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          document_type?: string
          document_url?: string
          spv_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
            foreignKeyName: "spv_documents_spv_id_fkey"
            columns: ["spv_id"]
            referencedRelation: "spv_entities"
      spv_entities: {
          issuer_id: string
          jurisdiction: string
          registration_number: string | null
          structure_type: string
          issuer_id: string
          jurisdiction: string
          registration_number?: string | null
          structure_type: string
          issuer_id?: string
          jurisdiction?: string
          registration_number?: string | null
          structure_type?: string
            foreignKeyName: "spv_entities_issuer_id_fkey"
            columns: ["issuer_id"]
            referencedRelation: "issuer_profiles"
      spv_shareholders: {
          address_proof_url: string | null
          full_name: string
          ownership_percentage: number
          passport_url: string | null
          spv_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          address_proof_url?: string | null
          full_name: string
          ownership_percentage: number
          passport_url?: string | null
          spv_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          address_proof_url?: string | null
          full_name?: string
          ownership_percentage?: number
          passport_url?: string | null
          spv_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
            foreignKeyName: "spv_shareholders_spv_id_fkey"
            columns: ["spv_id"]
            referencedRelation: "spv_entities"
      submission_notifications: {
          message: string
          notification_type: string
          submission_id: string | null
          message: string
          notification_type: string
          submission_id?: string | null
          message?: string
          notification_type?: string
          submission_id?: string | null
            foreignKeyName: "submission_notifications_submission_id_fkey"
            columns: ["submission_id"]
            referencedRelation: "issuer_submissions"
          amount: number
          confirmed_at: string | null
          investor_id: string | null
          status: string | null
          amount: number
          confirmed_at?: string | null
          investor_id?: string | null
          status?: string | null
          amount?: number
          confirmed_at?: string | null
          investor_id?: string | null
          status?: string | null
          allocation_id: string
          amount: number
          confirmed_at: string | null
          distributed_at: string | null
          status: string | null
          subscription_id: string | null
          allocation_id?: string
          amount: number
          confirmed_at?: string | null
          distributed_at?: string | null
          status?: string | null
          subscription_id?: string | null
          allocation_id?: string
          amount?: number
          confirmed_at?: string | null
          distributed_at?: string | null
          status?: string | null
          subscription_id?: string | null
            foreignKeyName: "token_allocations_subscription_id_fkey"
            referencedColumns: ["subscription_id"]
      user_2fa: {
          backup_codes: string[]
          is_enabled: boolean | null
          secret: string
          backup_codes: string[]
          is_enabled?: boolean | null
          secret: string
          backup_codes?: string[]
          is_enabled?: boolean | null
          secret?: string
      user_agreements: {
          agreement_id: string
          signature: string
          signed_at: string
          agreement_id: string
          signature: string
          signed_at?: string
          agreement_id?: string
          signature?: string
          signed_at?: string
            foreignKeyName: "user_agreements_agreement_id_fkey"
            columns: ["agreement_id"]
            referencedRelation: "legal_agreements"
      user_invites: {
          expires_at: string
          token: string
          used_at: string | null
          expires_at: string
          token: string
          used_at?: string | null
          expires_at?: string
          token?: string
          used_at?: string | null
      user_verifications: {
          expires_at: string
          verification_code: string
          verification_type: string
          verified: boolean | null
          expires_at: string
          verification_code: string
          verification_type: string
          verified?: boolean | null
          expires_at?: string
          verification_code?: string
          verification_type?: string
          verified?: boolean | null
      users: {
          invite_sent_at: string | null
          public_key: string | null
          invite_sent_at?: string | null
          public_key?: string | null
          invite_sent_at?: string | null
          public_key?: string | null
      wallet_policies: {
          is_active: boolean | null
          rules: Json
          is_active?: boolean | null
          rules: Json
          is_active?: boolean | null
          rules?: Json
      wallet_signatories: {
          email: string | null
          required_confirmations: number | null
          signatory_address: string
          wallet_id: string | null
          email?: string | null
          required_confirmations?: number | null
          signatory_address: string
          wallet_id?: string | null
          email?: string | null
          required_confirmations?: number | null
          signatory_address?: string
          wallet_id?: string | null
            foreignKeyName: "wallet_signatories_wallet_id_fkey"
            columns: ["wallet_id"]
            referencedRelation: "issuer_wallets"
      wallet_transactions: {
          amount: number | null
          compliance_checks: Json | null
          token_id: string | null
          transaction_type: string
          wallet_id: string
          amount?: number | null
          compliance_checks?: Json | null
          token_id?: string | null
          transaction_type: string
          wallet_id: string
          amount?: number | null
          compliance_checks?: Json | null
          token_id?: string | null
          transaction_type?: string
          wallet_id?: string
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            referencedRelation: "investor_wallets"
      whitelisted_wallets: {
          added_by: string
          compliance_rule_id: string
          wallet_address: string
          added_by: string
          compliance_rule_id: string
          wallet_address: string
          added_by?: string
          compliance_rule_id?: string
          wallet_address?: string
            foreignKeyName: "whitelisted_wallets_compliance_rule_id_fkey"
            columns: ["compliance_rule_id"]
            referencedRelation: "compliance_rules"
      accreditation_status: "pending" | "verified" | "failed"
      document_type:
        | "incorporation_cert"
        | "memorandum"
        | "regulatory_license"
        | "director_list"
        | "director_passport"
        | "director_address"
        | "shareholder_register"
        | "shareholder_passport"
        | "shareholder_address"
        | "financial_statements"
        | "qualification_summary"
        | "business_description"
        | "org_chart"
        | "key_people_cv"
        | "aml_kyc_description"
      investor_status: "pending" | "active" | "suspended"
      investor_type: "individual" | "institutional"
      kyc_status: "pending" | "verified" | "failed"
      rule_status: "active" | "inactive"
      verification_status: "pending" | "verified" | "rejected"
      wallet_type: "integrated" | "external"
