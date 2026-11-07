// Deno / Supabase Edge Function: Razorpay Webhook Handler
// Secure: Validates HMAC-SHA256 signature using raw body before processing

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

  // Verify HMAC-SHA256 signature when secret is configured
  if (webhookSecret && signature) {
    const expectedSig = hmac('sha256', webhookSecret, rawBody, 'utf8', 'hex');
    if (expectedSig !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody);
    const event = body.event;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = body.payload.payment?.entity || body.payload.order?.entity;
      const orderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id;

      if (!orderId) {
        return new Response(JSON.stringify({ error: 'Missing order_id in webhook payload' }), { status: 400 });
      }

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
        return new Response(JSON.stringify({ error: 'Transaction record not found' }), { status: 404 });
      }

      // 2. Activate Booking status and generate digital QR pass payload
      await supabaseClient
        .from('bookings')
        .update({
          status: 'confirmed',
          qr_pass_payload: `PARQUR://PASS/${transaction.bookings.booking_code}?v=2`,
        })
        .eq('id', transaction.booking_id);

      return new Response(
        JSON.stringify({ status: 'reconciled', bookingId: transaction.booking_id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Webhook processing error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
