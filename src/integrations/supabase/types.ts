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
      activity_logs: {
        Row: {
          action: string
          controller_id: string | null
          created_at: string | null
          details: string | null
          id: string
          station_id: string | null
        }
        Insert: {
          action: string
          controller_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          station_id?: string | null
        }
        Update: {
          action?: string
          controller_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_controller_id_fkey"
            columns: ["controller_id"]
            isOneToOne: false
            referencedRelation: "controllers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "fire_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      anotacoes_servico: {
        Row: {
          anotacoes: string
          atualizado_em: string | null
          controlador_id: string | null
          criado_em: string | null
          criado_por: string | null
          data: string | null
          grupamento_id: string
          id: string
        }
        Insert: {
          anotacoes: string
          atualizado_em?: string | null
          controlador_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data?: string | null
          grupamento_id: string
          id?: string
        }
        Update: {
          anotacoes?: string
          atualizado_em?: string | null
          controlador_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data?: string | null
          grupamento_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anotacoes_servico_controlador_id_fkey"
            columns: ["controlador_id"]
            isOneToOne: false
            referencedRelation: "controladores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anotacoes_servico_grupamento_id_fkey"
            columns: ["grupamento_id"]
            isOneToOne: false
            referencedRelation: "grupamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      controladores: {
        Row: {
          criado_em: string | null
          grupamento_id: string | null
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string | null
          grupamento_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string | null
          grupamento_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "controladores_grupamento_id_fkey"
            columns: ["grupamento_id"]
            isOneToOne: false
            referencedRelation: "grupamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      controllers: {
        Row: {
          created_at: string | null
          id: string
          name: string
          station_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          station_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "controllers_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "fire_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string | null
          position: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          position?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          position?: string | null
        }
        Relationships: []
      }
      crew_training: {
        Row: {
          completion_date: string | null
          created_at: string | null
          crew_member_id: string | null
          expiry_date: string | null
          id: string
          training_course_id: string | null
        }
        Insert: {
          completion_date?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          expiry_date?: string | null
          id?: string
          training_course_id?: string | null
        }
        Update: {
          completion_date?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          expiry_date?: string | null
          id?: string
          training_course_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_training_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_training_training_course_id_fkey"
            columns: ["training_course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_service_notes: {
        Row: {
          controller_id: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          id: string
          notes: string
          station_id: string | null
          updated_at: string | null
        }
        Insert: {
          controller_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          notes: string
          station_id?: string | null
          updated_at?: string | null
        }
        Update: {
          controller_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          notes?: string
          station_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_service_notes_controller_id_fkey"
            columns: ["controller_id"]
            isOneToOne: false
            referencedRelation: "controllers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_service_notes_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "fire_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      estacoes: {
        Row: {
          criado_em: string | null
          id: string
          nome: string
          subgrupamento_id: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          nome: string
          subgrupamento_id: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          nome?: string
          subgrupamento_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estacoes_subgrupamento_id_fkey"
            columns: ["subgrupamento_id"]
            isOneToOne: false
            referencedRelation: "subgrupamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      fire_stations: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      fire_sub_stations: {
        Row: {
          created_at: string
          id: string
          name: string
          station_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          station_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          station_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fire_sub_stations_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "fire_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      grupamentos: {
        Row: {
          criado_em: string | null
          endereco: string | null
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string | null
          endereco?: string | null
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string | null
          endereco?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      logs_atividade: {
        Row: {
          acao: string
          controlador_id: string | null
          criado_em: string | null
          detalhes: string | null
          grupamento_id: string | null
          id: string
        }
        Insert: {
          acao: string
          controlador_id?: string | null
          criado_em?: string | null
          detalhes?: string | null
          grupamento_id?: string | null
          id?: string
        }
        Update: {
          acao?: string
          controlador_id?: string | null
          criado_em?: string | null
          detalhes?: string | null
          grupamento_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_atividade_controlador_id_fkey"
            columns: ["controlador_id"]
            isOneToOne: false
            referencedRelation: "controladores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_atividade_grupamento_id_fkey"
            columns: ["grupamento_id"]
            isOneToOne: false
            referencedRelation: "grupamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      modalidades_viatura: {
        Row: {
          criado_em: string | null
          icone_url: string
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string | null
          icone_url: string
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string | null
          icone_url?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      observacoes_viatura: {
        Row: {
          criado_em: string | null
          criado_por: string | null
          id: string
          observacao: string
          viatura_id: string
        }
        Insert: {
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          observacao: string
          viatura_id: string
        }
        Update: {
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          observacao?: string
          viatura_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observacoes_viatura_viatura_id_fkey"
            columns: ["viatura_id"]
            isOneToOne: false
            referencedRelation: "viaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      subgrupamentos: {
        Row: {
          criado_em: string | null
          grupamento_id: string
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string | null
          grupamento_id: string
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string | null
          grupamento_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "subgrupamentos_grupamento_id_fkey"
            columns: ["grupamento_id"]
            isOneToOne: false
            referencedRelation: "grupamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      vehicle_crew_assignments: {
        Row: {
          created_at: string | null
          crew_member_id: string | null
          duty_end: string | null
          duty_start: string | null
          id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          crew_member_id?: string | null
          duty_end?: string | null
          duty_start?: string | null
          id?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          crew_member_id?: string | null
          duty_end?: string | null
          duty_start?: string | null
          id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_crew_assignments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_crew_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_observations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          observation: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          observation: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          observation?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_observations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at: string | null
          id: string
          image_url: string | null
          prefix: string
          station_id: string | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          status_changed_at: string | null
          sub_station_id: string | null
          updated_at: string | null
          vehicle_type: string
        }
        Insert: {
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string | null
          id?: string
          image_url?: string | null
          prefix: string
          station_id?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          status_changed_at?: string | null
          sub_station_id?: string | null
          updated_at?: string | null
          vehicle_type: string
        }
        Update: {
          category?: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string | null
          id?: string
          image_url?: string | null
          prefix?: string
          station_id?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          status_changed_at?: string | null
          sub_station_id?: string | null
          updated_at?: string | null
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "fire_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_sub_station_id_fkey"
            columns: ["sub_station_id"]
            isOneToOne: false
            referencedRelation: "fire_sub_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      viaturas: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          estacao_id: string
          id: string
          modalidade_id: string
          prefixo: string
          status: string | null
          status_alterado_em: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          estacao_id: string
          id?: string
          modalidade_id: string
          prefixo: string
          status?: string | null
          status_alterado_em?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          estacao_id?: string
          id?: string
          modalidade_id?: string
          prefixo?: string
          status?: string | null
          status_alterado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viaturas_estacao_id_fkey"
            columns: ["estacao_id"]
            isOneToOne: false
            referencedRelation: "estacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viaturas_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades_viatura"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_old_activity_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      limpar_logs_antigos: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      vehicle_category:
        | "Engine"
        | "Ladder"
        | "Rescue"
        | "Ambulance"
        | "Chief"
        | "Utility"
      vehicle_status:
        | "Available"
        | "En Route"
        | "On Scene"
        | "En Route to Hospital"
        | "Returning to Base"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      vehicle_category: [
        "Engine",
        "Ladder",
        "Rescue",
        "Ambulance",
        "Chief",
        "Utility",
      ],
      vehicle_status: [
        "Available",
        "En Route",
        "On Scene",
        "En Route to Hospital",
        "Returning to Base",
      ],
    },
  },
} as const
