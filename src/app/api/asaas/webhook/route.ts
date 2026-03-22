import { NextRequest, NextResponse } from 'next/server';

// Asaas plan → tier mapping
const PLAN_TIER_MAP: Record<string, number> = {
  starter: 2,
  pro: 3,
  business: 4,
  enterprise: 5,
};

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('asaas-webhook-secret');
    if (webhookSecret !== process.env.ASAAS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, payment } = body;

    console.log('Asaas webhook received:', event);

    // Handle payment confirmed event
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      const customerId = payment?.customer;
      const planName = (payment?.description || '').toLowerCase();

      // Determine tier from plan name
      let tier = 1;
      for (const [plan, planTier] of Object.entries(PLAN_TIER_MAP)) {
        if (planName.includes(plan)) {
          tier = planTier;
          break;
        }
      }

      console.log(`Customer ${customerId} confirmed payment. Tier: ${tier}`);

      // In production: update firm in Supabase
      // const supabase = getServiceSupabase();
      // await supabase
      //   .from('firms')
      //   .update({ verified: true, tier })
      //   .eq('asaas_customer_id', customerId);

      return NextResponse.json({ success: true, tier });
    }

    // Handle subscription cancelled
    if (event === 'PAYMENT_OVERDUE' || event === 'SUBSCRIPTION_DELETED') {
      const customerId = payment?.customer;

      console.log(`Customer ${customerId} subscription ended.`);

      // In production: downgrade firm
      // const supabase = getServiceSupabase();
      // await supabase
      //   .from('firms')
      //   .update({ verified: false, tier: 1 })
      //   .eq('asaas_customer_id', customerId);

      return NextResponse.json({ success: true, action: 'downgraded' });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
