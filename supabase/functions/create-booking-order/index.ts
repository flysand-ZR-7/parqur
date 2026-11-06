// Deno / Supabase Edge Function: Razorpay Order Creation
// Calculates transparent splits: Platform (15%), Mediator (5%), Owner (80%)

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

    const { bookingId } = await req.json();

    // Fetch booking details
    const { data: booking, error: bError } = await supabaseClient
      .from('bookings')
      .select('*, parking_spaces(*)')
      .eq('id', bookingId)
      .single();

    if (bError || !booking) throw new Error('Booking not found');

    const totalAmountInr = Number(booking.total_amount_inr);
    const amountInPaise = Math.round(totalAmountInr * 100);

    // Calculate Financial Split
    const hasMediator = !!booking.parking_spaces.mediator_id;
    const mediatorCut = hasMediator ? +(totalAmountInr * 0.05).toFixed(2) : 0;
    const platformCut = +(totalAmountInr * 0.15).toFixed(2);
    const ownerPayout = +(totalAmountInr - platformCut - mediatorCut).toFixed(2);

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'secret_placeholder';

    // Mock/Real Razorpay Order Request
    const orderPayload = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${booking.booking_code}`,
      notes: {
        booking_id: booking.id,
        parking_space_id: booking.parking_space_id,
        mediator_id: booking.parking_spaces.mediator_id || 'none',
      },
    };

    const authHeader = 'Basic ' + btoa(`${razorpayKeyId}:${razorpaySecret}`);
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const rzpOrder = await rzpResponse.json();

    // Record initial transaction record in Supabase
    await supabaseClient.from('transactions').insert({
      booking_id: booking.id,
      gateway_order_id: rzpOrder.id || `order_mock_${Date.now()}`,
      total_paid_inr: totalAmountInr,
      owner_payout_inr: ownerPayout,
      mediator_commission_inr: mediatorCut,
      platform_net_revenue_inr: platformCut,
      mediator_id: booking.parking_spaces.mediator_id,
      status: 'pending',
    });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: rzpOrder.id || `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        breakdown: {
          total: totalAmountInr,
          owner: ownerPayout,
          mediator: mediatorCut,
          platform: platformCut,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
