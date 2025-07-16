export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
      estacoes: {
        Row: {
          criado_em: string | null
          endereco: string | null
          id: string
          nome: string
          qsa_radio: number | null
          qsa_zello: number | null
          subgrupamento_id: string
          telefone: string | null
          telegrafista: string | null
        }
        Insert: {
          criado_em?: string | null
          endereco?: string | null
          id?: string
          nome: string
          qsa_radio?: number | null
          qsa_zello?: number | null
          subgrupamento_id: string
          telefone?: string | null
          telegrafista?: string | null
        }
        Update: {
          criado_em?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          qsa_radio?: number | null
          qsa_zello?: number | null
          subgrupamento_id?: string
          telefone?: string | null
          telegrafista?: string | null
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
      viaturas: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          dejem: boolean | null
          estacao_id: string
          id: string
          modalidade_id: string
          prefixo: string
          qsa_radio: number | null
          qsa_zello: number | null
          status: string | null
          status_alterado_em: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          dejem?: boolean | null
          estacao_id: string
          id?: string
          modalidade_id: string
          prefixo: string
          qsa_radio?: number | null
          qsa_zello?: number | null
          status?: string | null
          status_alterado_em?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          dejem?: boolean | null
          estacao_id?: string
          id?: string
          modalidade_id?: string
          prefixo?: string
          qsa_radio?: number | null
          qsa_zello?: number | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
