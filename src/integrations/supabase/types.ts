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
      customerMaster: {
        Row: {
          custAddress: string | null
          custBusinessname: string
          custCity: string | null
          custCreditperiod: number[]
          custEmail: string
          custGST: number
          custOwneremail: string | null
          custOwnername: string
          custOwnerphone: number
          custOwnerwhatsapp: number
          custPhone: number
          custPincode: number | null
          custProvince: string | null
          custRemarks: string | null
          custStatus: string[]
          custType: string[]
          custWhatsapp: number
          id: number
        }
        Insert: {
          custAddress?: string | null
          custBusinessname?: string
          custCity?: string | null
          custCreditperiod: number[]
          custEmail?: string
          custGST: number
          custOwneremail?: string | null
          custOwnername?: string
          custOwnerphone: number
          custOwnerwhatsapp: number
          custPhone: number
          custPincode?: number | null
          custProvince?: string | null
          custRemarks?: string | null
          custStatus: string[]
          custType: string[]
          custWhatsapp: number
          id?: number
        }
        Update: {
          custAddress?: string | null
          custBusinessname?: string
          custCity?: string | null
          custCreditperiod?: number[]
          custEmail?: string
          custGST?: number
          custOwneremail?: string | null
          custOwnername?: string
          custOwnerphone?: number
          custOwnerwhatsapp?: number
          custPhone?: number
          custPincode?: number | null
          custProvince?: string | null
          custRemarks?: string | null
          custStatus?: string[]
          custType?: string[]
          custWhatsapp?: number
          id?: number
        }
        Relationships: []
      }
      invoiceTable: {
        Row: {
          invAddamount: number | null
          invAlert: string[] | null
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
          invAlert?: string[] | null
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
          invAlert?: string[] | null
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
      user_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
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
      app_role:
        | "business_owner"
        | "business_manager"
        | "order_manager"
        | "it_admin"
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
