import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Try to find existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | null = null;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });
    } else {
      logStep("No Stripe customer found, checking for unlinked payments");
    }

    let hasPurchased = false;

    if (customerId) {
      // Check for completed one-time payments via checkout sessions
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 100,
      });
      hasPurchased = sessions.data.some(
        (s) => s.mode === "payment" && s.payment_status === "paid"
      );
      logStep("Customer purchase check", { hasPurchased });
    }

    // Fallback: check recent checkout sessions for matching email (handles payments without a customer)
    if (!hasPurchased) {
      const recentSessions = await stripe.checkout.sessions.list({ limit: 100 });
      hasPurchased = recentSessions.data.some(
        (s) =>
          s.mode === "payment" &&
          s.payment_status === "paid" &&
          s.customer_details?.email?.toLowerCase() === user.email.toLowerCase()
      );
      logStep("Email fallback purchase check", { hasPurchased });

      // If we found a payment but no customer, create one for future lookups
      if (hasPurchased && !customerId) {
        try {
          const newCustomer = await stripe.customers.create({ email: user.email });
          customerId = newCustomer.id;
          logStep("Created Stripe customer for future lookups", { customerId });
        } catch (e) {
          logStep("Failed to create customer", { error: String(e) });
        }
      }
    }

    // Also check for active subscriptions (legacy support)
    let hasActiveSub = false;
    let subscriptionEnd = null;
    if (customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      hasActiveSub = subscriptions.data.length > 0;
      if (hasActiveSub) {
        subscriptionEnd = new Date(subscriptions.data[0].current_period_end * 1000).toISOString();
      }
    }

    const subscribed = hasPurchased || hasActiveSub;
    logStep("Final result", { subscribed, hasPurchased, hasActiveSub });

    return new Response(JSON.stringify({
      subscribed,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
