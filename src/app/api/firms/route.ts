import { NextRequest, NextResponse } from 'next/server';

// MVP: In production, this would use Supabase
// import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, city, state, oab_number, email } = body;

    if (!name || !city || !state || !oab_number || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // MVP: Log to console, in production insert to Supabase
    const firm = {
      id: crypto.randomUUID(),
      name,
      slug,
      city,
      state,
      tier: 1, // starts at tier 1 (unverified)
      verified: false,
      chat_juridico_client: false,
      logo_url: null,
      oab_number,
      email,
      created_at: new Date().toISOString(),
    };

    console.log('New firm registered:', firm);

    // In production:
    // const supabase = getServiceSupabase();
    // const { data, error } = await supabase.from('firms').insert(firm);

    return NextResponse.json({ success: true, firm }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // MVP: return mock data
  const { mockFirms } = await import('@/data/mock-firms');
  return NextResponse.json(mockFirms);
}
