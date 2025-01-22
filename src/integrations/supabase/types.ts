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
      custom_permissions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          permission_name: string
          permission_value: boolean | null
          resource: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          permission_name: string
          permission_value?: boolean | null
          resource: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          permission_name?: string
          permission_value?: boolean | null
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_management"
            referencedColumns: ["id"]
          },
        ]
      }
      customerMaster: {
        Row: {
          custAddress: string | null
          custBusinessname: string
          custCity: string | null
          custCreditperiod: number | null
          custEmail: string
          custGST: string
          custOwneremail: string | null
          custOwnername: string
          custOwnerphone: number
          custOwnerwhatsapp: number
          custPhone: number
          custPincode: number | null
          custProvince: string | null
          custRemarks: string | null
          custStatus: string
          custType: string
          custWhatsapp: number
          id: number
        }
        Insert: {
          custAddress?: string | null
          custBusinessname?: string
          custCity?: string | null
          custCreditperiod?: number | null
          custEmail?: string
          custGST: string
          custOwneremail?: string | null
          custOwnername?: string
          custOwnerphone: number
          custOwnerwhatsapp: number
          custPhone: number
          custPincode?: number | null
          custProvince?: string | null
          custRemarks?: string | null
          custStatus: string
          custType: string
          custWhatsapp: number
          id?: number
        }
        Update: {
          custAddress?: string | null
          custBusinessname?: string
          custCity?: string | null
          custCreditperiod?: number | null
          custEmail?: string
          custGST?: string
          custOwneremail?: string | null
          custOwnername?: string
          custOwnerphone?: number
          custOwnerwhatsapp?: number
          custPhone?: number
          custPincode?: number | null
          custProvince?: string | null
          custRemarks?: string | null
          custStatus?: string
          custType?: string
          custWhatsapp?: number
          id?: number
        }
        Relationships: []
      }
      invoiceTable: {
        Row: {
          invAddamount: number | null
          invAlert: string | null
          invBalanceAmount: number | null
          invCustid: number
          invDate: string | null
          invDuedate: string | null
          invGst: number
          invId: number
          invMarkcleared: boolean | null
          invMessage1: string
          invMessage2: string | null
          invMessage3: string | null
          invNumber: number[]
          invRemainder2: boolean | null
          invRemainder3: boolean | null
          invReminder1: boolean | null
          invSubamount: number | null
          invTotal: number
          invValue: number
        }
        Insert: {
          invAddamount?: number | null
          invAlert?: string | null
          invBalanceAmount?: number | null
          invCustid: number
          invDate?: string | null
          invDuedate?: string | null
          invGst: number
          invId?: number
          invMarkcleared?: boolean | null
          invMessage1?: string
          invMessage2?: string | null
          invMessage3?: string | null
          invNumber: number[]
          invRemainder2?: boolean | null
          invRemainder3?: boolean | null
          invReminder1?: boolean | null
          invSubamount?: number | null
          invTotal: number
          invValue: number
        }
        Update: {
          invAddamount?: number | null
          invAlert?: string | null
          invBalanceAmount?: number | null
          invCustid?: number
          invDate?: string | null
          invDuedate?: string | null
          invGst?: number
          invId?: number
          invMarkcleared?: boolean | null
          invMessage1?: string
          invMessage2?: string | null
          invMessage3?: string | null
          invNumber?: number[]
          invRemainder2?: boolean | null
          invRemainder3?: boolean | null
          invReminder1?: boolean | null
          invSubamount?: number | null
          invTotal?: number
          invValue?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoiceTable_invCustid_fkey"
            columns: ["invCustid"]
            isOneToOne: false
            referencedRelation: "customerMaster"
            referencedColumns: ["id"]
          },
        ]
      }
      paymentLedger: {
        Row: {
          amount: number
          createdAt: string | null
          custId: number | null
          description: string | null
          invId: number | null
          ledgerId: number
          runningBalance: number
          transactionType: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          createdAt?: string | null
          custId?: number | null
          description?: string | null
          invId?: number | null
          ledgerId?: number
          runningBalance: number
          transactionType: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          createdAt?: string | null
          custId?: number | null
          description?: string | null
          invId?: number | null
          ledgerId?: number
          runningBalance?: number
          transactionType?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paymentLedger_custId_fkey"
            columns: ["custId"]
            isOneToOne: false
            referencedRelation: "customerMaster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paymentLedger_invId_fkey"
            columns: ["invId"]
            isOneToOne: false
            referencedRelation: "invoice_reminder_status"
            referencedColumns: ["invId"]
          },
          {
            foreignKeyName: "paymentLedger_invId_fkey"
            columns: ["invId"]
            isOneToOne: false
            referencedRelation: "invoiceTable"
            referencedColumns: ["invId"]
          },
        ]
      }
      paymentTransactions: {
        Row: {
          amount: number
          bankName: string | null
          chequeNumber: string | null
          createdAt: string | null
          createdBy: string | null
          invId: number
          paymentDate: string
          paymentId: number
          paymentMode: string
          remarks: string | null
          transactionId: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          bankName?: string | null
          chequeNumber?: string | null
          createdAt?: string | null
          createdBy?: string | null
          invId: number
          paymentDate: string
          paymentId?: number
          paymentMode: string
          remarks?: string | null
          transactionId: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          bankName?: string | null
          chequeNumber?: string | null
          createdAt?: string | null
          createdBy?: string | null
          invId?: number
          paymentDate?: string
          paymentId?: number
          paymentMode?: string
          remarks?: string | null
          transactionId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paymentTransactions_createdBy_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user_management"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paymentTransactions_invId_fkey"
            columns: ["invId"]
            isOneToOne: false
            referencedRelation: "invoice_reminder_status"
            referencedColumns: ["invId"]
          },
          {
            foreignKeyName: "paymentTransactions_invId_fkey"
            columns: ["invId"]
            isOneToOne: false
            referencedRelation: "invoiceTable"
            referencedColumns: ["invId"]
          },
        ]
      }
      productManagement: {
        Row: {
          prodBasePrice: number | null
          prodBoxstock: number | null
          prodBrand: string | null
          prodCategory: string | null
          prodCbm: number | null
          prodColor1: string | null
          prodColor2: string | null
          prodColor3: string | null
          prodColor4: string | null
          prodColor5: string | null
          prodGrossweight: number | null
          prodId: string
          prodLandingcost: number | null
          prodMaterial: string | null
          prodMoq: number | null
          prodName: string
          prodNettweight: number | null
          prodPackaging: string | null
          prodPackcount: number | null
          prodPiecestock: number | null
          prodPromo1: string | null
          prodPromo2: string | null
          prodSlaborice1: number | null
          prodSlabprice2: number | null
          prodSlabprice3: number | null
          prodSlabprice4: number | null
          prodSlabprice5: number | null
          prodStatus: boolean | null
          prodType: string | null
          prodUnitweight: number | null
          prodVariableprice: number | null
          prodVariant: string | null
        }
        Insert: {
          prodBasePrice?: number | null
          prodBoxstock?: number | null
          prodBrand?: string | null
          prodCategory?: string | null
          prodCbm?: number | null
          prodColor1?: string | null
          prodColor2?: string | null
          prodColor3?: string | null
          prodColor4?: string | null
          prodColor5?: string | null
          prodGrossweight?: number | null
          prodId: string
          prodLandingcost?: number | null
          prodMaterial?: string | null
          prodMoq?: number | null
          prodName: string
          prodNettweight?: number | null
          prodPackaging?: string | null
          prodPackcount?: number | null
          prodPiecestock?: number | null
          prodPromo1?: string | null
          prodPromo2?: string | null
          prodSlaborice1?: number | null
          prodSlabprice2?: number | null
          prodSlabprice3?: number | null
          prodSlabprice4?: number | null
          prodSlabprice5?: number | null
          prodStatus?: boolean | null
          prodType?: string | null
          prodUnitweight?: number | null
          prodVariableprice?: number | null
          prodVariant?: string | null
        }
        Update: {
          prodBasePrice?: number | null
          prodBoxstock?: number | null
          prodBrand?: string | null
          prodCategory?: string | null
          prodCbm?: number | null
          prodColor1?: string | null
          prodColor2?: string | null
          prodColor3?: string | null
          prodColor4?: string | null
          prodColor5?: string | null
          prodGrossweight?: number | null
          prodId?: string
          prodLandingcost?: number | null
          prodMaterial?: string | null
          prodMoq?: number | null
          prodName?: string
          prodNettweight?: number | null
          prodPackaging?: string | null
          prodPackcount?: number | null
          prodPiecestock?: number | null
          prodPromo1?: string | null
          prodPromo2?: string | null
          prodSlaborice1?: number | null
          prodSlabprice2?: number | null
          prodSlabprice3?: number | null
          prodSlabprice4?: number | null
          prodSlabprice5?: number | null
          prodStatus?: boolean | null
          prodType?: string | null
          prodUnitweight?: number | null
          prodVariableprice?: number | null
          prodVariant?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          contact_preferences: Json | null
          created_at: string
          department: string | null
          designation: string | null
          emergency_contact: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          joining_date: string | null
          last_active: string | null
          last_login: string | null
          location: string | null
          phone_number: string | null
          preferences: Json | null
          profile_image_url: string | null
          reports_to: string | null
          role: Database["public"]["Enums"]["app_role"]
          skills: string[] | null
          social_links: Json | null
          status: string | null
          team: string | null
          timezone: string | null
          updated_at: string
          work_schedule: Json | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          contact_preferences?: Json | null
          created_at?: string
          department?: string | null
          designation?: string | null
          emergency_contact?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          joining_date?: string | null
          last_active?: string | null
          last_login?: string | null
          location?: string | null
          phone_number?: string | null
          preferences?: Json | null
          profile_image_url?: string | null
          reports_to?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          skills?: string[] | null
          social_links?: Json | null
          status?: string | null
          team?: string | null
          timezone?: string | null
          updated_at?: string
          work_schedule?: Json | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          contact_preferences?: Json | null
          created_at?: string
          department?: string | null
          designation?: string | null
          emergency_contact?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          joining_date?: string | null
          last_active?: string | null
          last_login?: string | null
          location?: string | null
          phone_number?: string | null
          preferences?: Json | null
          profile_image_url?: string | null
          reports_to?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          skills?: string[] | null
          social_links?: Json | null
          status?: string | null
          team?: string | null
          timezone?: string | null
          updated_at?: string
          work_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_management"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_reports_to_fkey"
            columns: ["reports_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_config: {
        Row: {
          api_key: string
          created_at: string | null
          from_phone_number_id: string
          id: number
          template_name: string
          template_namespace: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          from_phone_number_id: string
          id?: number
          template_name: string
          template_namespace: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          from_phone_number_id?: string
          id?: number
          template_name?: string
          template_namespace?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      invoice_reminder_status: {
        Row: {
          custBusinessname: string | null
          custWhatsapp: number | null
          invDuedate: string | null
          invId: number | null
          invMessage1: string | null
          invMessage2: string | null
          invMessage3: string | null
          invNumber: number[] | null
          invRemainder2: boolean | null
          invRemainder3: boolean | null
          invReminder1: boolean | null
          reminder_status: string | null
        }
        Relationships: []
      }
      user_management: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_new_user_with_profile: {
        Args: {
          user_email: string
          user_password: string
          user_full_name: string
          user_role: Database["public"]["Enums"]["app_role"]
          user_phone: string
          user_designation: string
          user_department: string
          user_emergency_contact: string
          user_address: string
        }
        Returns: string
      }
      create_user_with_profile: {
        Args: {
          email: string
          password: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          phone: string
          designation: string
          department: string
          employee_id: string
          team: string
          location: string
          bio: string
          emergency_contact: string
          address: string
        }
        Returns: string
      }
      generate_unique_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: number[]
      }
      get_user_permissions: {
        Args: {
          user_id: string
        }
        Returns: {
          resource: string
          can_view: boolean
          can_create: boolean
          can_edit: boolean
          can_delete: boolean
          custom_permissions: Json
        }[]
      }
      update_user_role: {
        Args: {
          user_id: string
          new_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "business_owner"
        | "business_manager"
        | "order_manager"
        | "it_admin"
        | "team_member"
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
