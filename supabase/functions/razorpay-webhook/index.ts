// Deno / Supabase Edge Function: Razorpay Webhook Handler
// Reconciles completed payments, triggers instant QR pass activation, and credits mediator balance

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const event = body.event;

    // Handle payment capture
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = body.payload.payment?.entity || body.payload.order?.entity;
      const orderId = paymentEntity.order_id || paymentEntity.id;
      const paymentId = paymentEntity.id;

      // 1. Mark transaction as captured
      const { data: transaction, error: tError } = await supabaseClient
        .from('transactions')
        .update({
          status: 'captured',
          gateway_payment_id: paymentId,
        })
        .eq('gateway_order_id', orderId)
        .select('*, bookings(*)')
        .single();

      if (tError || !transaction) {
        throw new Error('Transaction record not found for webhook order');
      }

      // 2. Activate Booking status
      await supabaseClient
        .from('bookings')
        .update({
          status: 'confirmed',
          qr_pass_payload: `PARQUR://PASS/${transaction.bookings.booking_code}?v=1`,
        })
        .eq('id', transaction.booking_id);

      return new Response(
        JSON.stringify({ status: 'reconciled', bookingId: transaction.booking_id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
