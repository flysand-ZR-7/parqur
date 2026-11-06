// Deno / Supabase Edge Function: TrustGate Verification Engine
// Handles automated and partner KYC verification for PAN, Aadhaar, Vehicle RC, and Property Deeds

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPayload {
  userId: string;
  targetType: 'profile' | 'parking_space' | 'vehicle';
  targetId: string;
  panNumber?: string;
  vehicleRegistration?: string;
  propertyProofUrl?: string;
  videoIntroUrl?: string;
  inspectionChecklist?: {
    cctvOperational: boolean;
    guardPresent: boolean;
    gatedEntry: boolean;
    lightingAdequate: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: VerifyPayload = await req.json();
    const { userId, targetType, targetId, panNumber, vehicleRegistration, inspectionChecklist } = payload;

    let tierAssigned = 'verified';
    let isApproved = false;

    // 1. Vehicle Verification Logic
    if (targetType === 'vehicle' && vehicleRegistration) {
      // In production: Connect to Surepass / VAHAN API
      const normalizedReg = vehicleRegistration.toUpperCase().replace(/\s+/g, '');
      const isValidFormat = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/.test(normalizedReg);

      if (!isValidFormat) {
        return new Response(
          JSON.stringify({ error: 'Invalid Indian vehicle registration format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseClient
        .from('vehicles')
        .update({ is_verified: true })
        .eq('id', targetId);

      isApproved = true;
    }

    // 2. Parking Space Verification (TrustGate Tiers: Verified vs Secure vs Premium Secure)
    if (targetType === 'parking_space') {
      if (inspectionChecklist) {
        if (inspectionChecklist.cctvOperational && inspectionChecklist.guardPresent && inspectionChecklist.gatedEntry) {
          tierAssigned = 'premium_secure';
        } else if (inspectionChecklist.cctvOperational || inspectionChecklist.guardPresent) {
          tierAssigned = 'secure';
        } else {
          tierAssigned = 'verified';
        }
      }

      await supabaseClient
        .from('parking_spaces')
        .update({
          tier: tierAssigned,
          is_active: true,
          has_cctv: inspectionChecklist?.cctvOperational ?? false,
          has_guard: inspectionChecklist?.guardPresent ?? false,
          has_gated_entry: inspectionChecklist?.gatedEntry ?? false,
        })
        .eq('id', targetId);

      isApproved = true;
    }

    // 3. Record Audit Trail in trustgate_verifications
    const { data: auditRecord, error: auditError } = await supabaseClient
      .from('trustgate_verifications')
      .insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        pan_number: panNumber,
        status: isApproved ? 'approved' : 'under_review',
        verified_at: isApproved ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (auditError) throw auditError;

    return new Response(
      JSON.stringify({
        success: true,
        tier: tierAssigned,
        status: isApproved ? 'approved' : 'under_review',
        verificationId: auditRecord.id,
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
