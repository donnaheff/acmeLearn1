import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Supabase's confirmation/recovery/magic-link emails and the OAuth flow all
// point here with a PKCE `code`. The browser client never sees this code —
// it has to be exchanged for a session server-side (using the code_verifier
// cookie set when the flow started) before the user actually has a session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
