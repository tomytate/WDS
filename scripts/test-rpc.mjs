import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  const p_order_data = {
    order_code: "TEST-" + Math.floor(Math.random() * 100000),
    customer_name: "Test User",
    customer_email: "test@example.com",
    tip_amount: 0,
    total_price: 10,
    discount_amount: 0,
    payment_method: "binance",
    status: "pending"
  };

  const p_items_data = [{
    product_id: "00000000-0000-0000-0000-000000000025",
    access_plan: "one_year",
    quantity: 1,
    unit_price: 10,
    fulfillment_provider: "manual"
  }];

  const { data, error } = await supabase.rpc("create_order_atomic", {
    p_order_data,
    p_items_data
  });

  console.log("Response:", data);
  console.log("Error:", JSON.stringify(error, null, 2));
}

testRpc();
