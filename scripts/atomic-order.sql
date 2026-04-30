create or replace function public.create_order_atomic(
  p_order_data jsonb,
  p_items_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id       uuid;
  v_inserted_order jsonb;
begin
  -- Insert the parent order row
  insert into orders (
    order_code, customer_id, customer_name, customer_email, customer_phone,
    tip_amount, total_price, promo_code_id, discount_amount, payment_method,
    payment_reference, receipt_path, notes, status, payssion_transaction_id
  )
  select
    p_order_data->>'order_code',
    (p_order_data->>'customer_id')::uuid,
    p_order_data->>'customer_name',
    p_order_data->>'customer_email',
    p_order_data->>'customer_phone',
    (p_order_data->>'tip_amount')::numeric,
    (p_order_data->>'total_price')::numeric,
    (p_order_data->>'promo_code_id')::uuid,
    (p_order_data->>'discount_amount')::numeric,
    p_order_data->>'payment_method',
    p_order_data->>'payment_reference',
    p_order_data->>'receipt_path',
    p_order_data->>'notes',
    p_order_data->>'status',
    p_order_data->>'payssion_transaction_id'
  returning id, row_to_json(orders.*) into v_order_id, v_inserted_order;

  -- Insert all line items linked to the new order
  insert into order_items (
    order_id, product_id, access_plan, quantity, service_option,
    target_url, unit_price, fulfillment_provider, provider_service_id,
    provider_order_id, provider_status, provider_charge, provider_currency,
    provider_start_count, provider_remains, provider_error, provider_last_checked_at
  )
  select
    v_order_id,
    (item->>'product_id')::uuid,
    item->>'access_plan',
    (item->>'quantity')::integer,
    item->>'service_option',
    item->>'target_url',
    (item->>'unit_price')::numeric,
    item->>'fulfillment_provider',
    item->>'provider_service_id',
    item->>'provider_order_id',
    item->>'provider_status',
    (item->>'provider_charge')::numeric,
    item->>'provider_currency',
    (item->>'provider_start_count')::integer,
    (item->>'provider_remains')::integer,
    item->>'provider_error',
    (item->>'provider_last_checked_at')::timestamptz
  from jsonb_array_elements(p_items_data) as item;

  -- Atomically increment promo usage (if a promo was applied)
  if p_order_data->>'promo_code_id' is not null then
    update promo_codes
       set current_uses = current_uses + 1
     where id = (p_order_data->>'promo_code_id')::uuid;
  end if;

  return v_inserted_order;
end;
$$;
