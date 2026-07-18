import { NextResponse, type NextRequest } from 'next/server';

// Routes with no `data-protected` attribute in the original static site —
// visible to signed-out visitors. Everything else requires a session.
const PUBLIC_ROUTES = new Set([
  '/', '/login', '/signup', '/reset-password', '/courses', '/practice',
  '/marketplace', '/meet-your-tutor', '/pilot', '/compare',
  '/service-standards', '/support', '/research', '/terms', '/privacy',
  '/billing', '/learning', '/offline', '/auth/callback',
]);

// Requires a paid order or active subscription (or staff), checked via the
// is_paying_client() RPC — resources are a paid-client perk, not a public
// marketing page.
const PAID_ROUTES = new Set(['/resources', '/assistant']);

// Mirrors each page's original `data-role` attribute.
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/claims-admin': ['admin'],
  '/commerce': ['admin'],
  '/content-admin': ['admin'],
  '/content-admin/articles': ['admin', 'tutor'],
  '/launch-control': ['admin'],
  '/monitoring': ['admin'],
  '/analytics': ['admin', 'tutor'],
  '/moderation': ['admin', 'tutor'],
  '/question-admin': ['admin', 'tutor'],
  '/tutor-operations': ['admin', 'tutor'],
  '/support-admin': ['admin', 'tutor'],
  '/tutor': ['admin', 'tutor'],
};

// --- Cookie/session parsing, ported from @supabase/ssr's own format so we
// never need to import the library (or the supabase-js client it drags in)
// into Edge Middleware — a real dependency in that chain isn't Edge-safe
// when bundled by Vercel's Edge Function packaging step ("__dirname is not
// defined" at invocation, despite building/typechecking cleanly). Auth
// still runs through the real @supabase/ssr client everywhere else
// (Server Components, Route Handlers), which execute on the Node.js
// runtime where it works fine — this file only needs a fast, read-only,
// fail-closed check to decide whether to redirect.

const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const FROM_BASE64URL = (() => {
  const map = new Array(128).fill(-1);
  for (let i = 0; i < BASE64URL_ALPHABET.length; i += 1) map[BASE64URL_ALPHABET.charCodeAt(i)] = i;
  for (const ch of ' \t\n\r=') map[ch.charCodeAt(0)] = -2;
  return map;
})();

// UTF-8-aware base64url decode (mirrors @supabase/ssr's stringFromBase64URL).
function base64UrlDecode(input: string): string {
  const bytes: number[] = [];
  let queue = 0;
  let queuedBits = 0;
  for (let i = 0; i < input.length; i += 1) {
    const bits = FROM_BASE64URL[input.charCodeAt(i)];
    if (bits === -2) continue;
    if (bits === undefined || bits < 0) throw new Error('Invalid base64url input');
    queue = (queue << 6) | bits;
    queuedBits += 6;
    while (queuedBits >= 8) {
      bytes.push((queue >> (queuedBits - 8)) & 0xff);
      queuedBits -= 8;
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

type StoredSession = {
  access_token: string;
  expires_at?: number;
  user?: { id: string };
};

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const match = url.match(/^https?:\/\/([^.]+)\./);
  return match ? match[1] : 'default';
}

function readSession(request: NextRequest): StoredSession | null {
  const cookieBase = `sb-${getProjectRef()}-auth-token`;
  let raw = request.cookies.get(cookieBase)?.value;

  if (!raw) {
    // @supabase/ssr splits large sessions across `${cookieBase}.0`, `.1`, ...
    const parts: string[] = [];
    for (let i = 0; ; i += 1) {
      const chunk = request.cookies.get(`${cookieBase}.${i}`)?.value;
      if (!chunk) break;
      parts.push(chunk);
    }
    if (parts.length) raw = parts.join('');
  }

  if (!raw) return null;

  try {
    const json = raw.startsWith('base64-') ? base64UrlDecode(raw.slice('base64-'.length)) : raw;
    const session = JSON.parse(json) as StoredSession;
    if (!session?.access_token || !session?.user?.id) return null;
    if (session.expires_at && session.expires_at * 1000 < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

async function fetchRole(accessToken: string, userId: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  try {
    const res = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=role`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ role: string }>;
    return rows[0]?.role ?? null;
  } catch {
    return null;
  }
}

async function fetchIsPayingClient(accessToken: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/is_paying_client`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!res.ok) return false;
    return (await res.json()) === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = readSession(request);
  const requiresAuth = !PUBLIC_ROUTES.has(path);

  if (requiresAuth && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('required', '1');
    url.searchParams.set('returnTo', path);
    return NextResponse.redirect(url);
  }

  const roleRouteKey =
    path in ROLE_ROUTES
      ? path
      : Object.keys(ROLE_ROUTES)
          .filter((base) => path.startsWith(`${base}/`))
          .sort((a, b) => b.length - a.length)[0];
  const allowedRoles = roleRouteKey ? ROLE_ROUTES[roleRouteKey] : undefined;
  let role: string | null = null;
  if (allowedRoles && session) {
    role = await fetchRole(session.access_token, session.user!.id);
    if (!role || !allowedRoles.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/restricted';
      return NextResponse.redirect(url);
    }
  }

  const isPaidRoute =
    PAID_ROUTES.has(path) || Array.from(PAID_ROUTES).some((base) => path.startsWith(`${base}/`));
  if (isPaidRoute && session) {
    role = role ?? (await fetchRole(session.access_token, session.user!.id));
    const isStaff = role === 'admin' || role === 'tutor';
    if (!isStaff) {
      const isPaying = await fetchIsPayingClient(session.access_token);
      if (!isPaying) {
        const url = request.nextUrl.clone();
        url.pathname = '/restricted';
        url.searchParams.set('reason', 'paid');
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|assets|sw\\.js|manifest\\.webmanifest|api/.*|.*\\.(?:svg|png|jpg|jpeg|webp|avif|gif|ico)$).*)',
  ],
};
