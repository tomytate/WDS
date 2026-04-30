export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price: number;
          category: string;
          description: string | null;
          icon_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          customer_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          tip_amount: number;
          total_price: number;
          promo_code_id: string | null;
          discount_amount: number;
          payment_method: "gcash";
          payment_reference: string | null;
          receipt_path: string | null;
          notes: string | null;
          status:
            | "pending"
            | "processing"
            | "delivered"
            | "completed"
            | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["orders"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          access_plan: "one_year" | "lifetime";
          quantity: number;
          service_option: string | null;
          target_url: string | null;
          unit_price: number;
          fulfillment_provider: string;
          provider_service_id: string | null;
          provider_order_id: string | null;
          provider_status: string | null;
          provider_charge: string | null;
          provider_currency: string | null;
          provider_start_count: string | null;
          provider_remains: string | null;
          provider_error: string | null;
          provider_last_checked_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      store_settings: {
        Row: {
          id: string;
          store_name: string;
          support_email: string;
          gcash_number: string;
          gcash_qr_instructions: string | null;
        };
        Insert: Database["public"]["Tables"]["store_settings"]["Row"];
        Update: Partial<
          Database["public"]["Tables"]["store_settings"]["Insert"]
        >;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["customers"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          min_order_amount: number;
          max_discount_amount: number | null;
          max_uses: number | null;
          current_uses: number;
          is_active: boolean;
          starts_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["promo_codes"]["Row"],
          "id" | "current_uses" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["promo_codes"]["Insert"]>;
      };
      bundles: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          bundle_price: number;
          original_price: number;
          icon_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["bundles"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["bundles"]["Insert"]>;
      };
      bundle_items: {
        Row: {
          id: string;
          bundle_id: string;
          product_id: string;
          access_plan: "one_year" | "lifetime";
        };
        Insert: Omit<Database["public"]["Tables"]["bundle_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["bundle_items"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          customer_name: string;
          customer_email: string;
          rating: number;
          content: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reviews"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      support_chats: {
        Row: {
          id: string;
          visitor_id: string;
          visitor_name: string;
          visitor_email: string | null;
          discord_thread_id: string | null;
          status: "open" | "resolved";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["support_chats"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["support_chats"]["Insert"]
        >;
      };
      support_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender: "customer" | "support";
          content: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["support_messages"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["support_messages"]["Insert"]
        >;
      };
    };
  };
}
