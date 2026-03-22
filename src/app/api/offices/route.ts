import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

const stateCapitals: Record<string, string> = {
  AC: 'Rio Branco', AL: 'Maceió', AP: 'Macapá', AM: 'Manaus',
  BA: 'Salvador', CE: 'Fortaleza', DF: 'Brasília', ES: 'Vitória',
  GO: 'Goiânia', MA: 'São Luís', MT: 'Cuiabá', MS: 'Campo Grande',
  MG: 'Belo Horizonte', PA: 'Belém', PB: 'João Pessoa', PR: 'Curitiba',
  PE: 'Recife', PI: 'Teresina', RJ: 'Rio de Janeiro', RN: 'Natal',
  RS: 'Porto Alegre', RO: 'Porto Velho', RR: 'Boa Vista', SC: 'Florianópolis',
  SP: 'São Paulo', SE: 'Aracaju', TO: 'Palmas',
};

function parseOabState(oab: string): string | null {
  const match = oab.trim().match(/\/([A-Za-z]{2})$/);
  if (!match) return null;
  return match[1].toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, oab_number, email } = body;

    if (!name || !oab_number || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const state = parseOabState(oab_number);
    if (!state) {
      return NextResponse.json(
        { error: 'Invalid OAB number format. Expected: 123456/SP' },
        { status: 400 }
      );
    }

    const city = stateCapitals[state] ?? state;

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('offices')
      .insert({ name, slug, city, state, oab_number, email })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, office: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, instagram_url, linkedin_url, logo_url, address, practice_areas } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing required field: slug' },
        { status: 400 }
      );
    }

    const updates: Record<string, string | number | string[]> = {};
    if (instagram_url !== undefined) updates.instagram_url = instagram_url;
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (address !== undefined) updates.address = address;
    if (practice_areas !== undefined) updates.practice_areas = practice_areas;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('offices')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, office: data });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = getServiceSupabase();

  const { data: verified, error: e1 } = await supabase
    .from('offices')
    .select('*')
    .eq('verified', true)
    .order('tier', { ascending: false })
    .order('created_at', { ascending: true });

  const { data: unverified, error: e2 } = await supabase
    .from('offices')
    .select('*')
    .eq('verified', false)
    .order('created_at', { ascending: true });

  if (e1 || e2) {
    console.error('Supabase query error:', e1 || e2);
    return NextResponse.json({ error: (e1 || e2)!.message }, { status: 500 });
  }

  const ranked = (verified ?? []).map((o, i) => ({ ...o, rank: i + 1 }));
  const unranked = (unverified ?? []).map((o) => ({ ...o, rank: null }));

  return NextResponse.json([...ranked, ...unranked]);
}
