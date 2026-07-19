"""Structural and security checks for the Next.js + Supabase build of AcmeLearn.

Run from the tests/ directory: `python3 tests/checks.py`
"""
import subprocess
from pathlib import Path

root = Path(__file__).parents[2]
frontend = root / 'frontend'
functions = root / 'supabase' / 'functions'
database = root / 'database'

errors = []


def check(condition, message):
    if not condition:
        errors.append(message)


# --- No leaked secrets in anything that ships to the client or the repo ----
SECRET_MARKERS = ('YOUR_SUPABASE_SERVICE', 'ZOOM_CLIENT_SECRET', 'PAYSTACK_SECRET_KEY', 'OPENAI_API_KEY=sk-', 'sk-ant-')
for f in frontend.rglob('*'):
    if not f.is_file() or f.suffix not in ('.ts', '.tsx', '.js', '.json', '.md'):
        continue
    if 'node_modules' in f.parts or '.next' in f.parts:
        continue
    s = f.read_text(errors='ignore')
    for marker in SECRET_MARKERS:
        check(marker not in s, f'Secret marker leaked into {f.relative_to(root)}')

# .env.local (real secrets) must be gitignored and never actually tracked.
gitignores = (root / '.gitignore').read_text() + (frontend / '.gitignore').read_text()
check(
    '.env.local' in gitignores or '.env*.local' in gitignores,
    '.env.local must be gitignored',
)
tracked = subprocess.run(
    ['git', '-C', str(root), 'ls-files', 'frontend/.env.local'],
    capture_output=True, text=True,
).stdout.strip()
check(not tracked, '.env.local must not be tracked by git')

# --- Route coverage: every nav destination used by middleware must exist --
APP_DIR = frontend / 'app'
PUBLIC_ROUTES = [
    '', 'login', 'signup', 'reset-password', 'courses', 'practice',
    'marketplace', 'meet-your-tutor', 'pilot', 'compare',
    'service-standards', 'support', 'research', 'terms', 'privacy',
    'billing', 'learning', 'offline',
]
PAID_ROUTES = ['resources', 'assistant']
ROLE_ROUTES = [
    'admin', 'claims-admin', 'commerce', 'content-admin', 'content-admin/articles',
    'launch-control', 'monitoring', 'analytics', 'moderation', 'question-admin',
    'tutor-operations', 'support-admin', 'team-admin', 'tutor',
]
STUDENT_ROUTES = [
    'account', 'assignments', 'certificate', 'lectures', 'mock', 'notifications',
    'readiness', 'receipts', 'recordings', 'referrals', 'security', 'speaking', 'writing',
]


def route_exists(route: str) -> bool:
    segments = [s for s in route.split('/') if s]
    for group in ('(main)', '(auth)'):
        candidate = APP_DIR / group
        ok = True
        for seg in segments:
            candidate = candidate / seg
            if not candidate.exists():
                ok = False
                break
        if ok and (candidate / 'page.tsx').exists():
            return True
    if not segments and (APP_DIR / '(main)' / 'page.tsx').exists():
        return True
    return False


for route in PUBLIC_ROUTES + PAID_ROUTES + ROLE_ROUTES + STUDENT_ROUTES:
    check(route_exists(route), f'Route referenced by middleware has no page.tsx: /{route}')

check((frontend / 'middleware.ts').exists(), 'middleware.ts must exist to gate protected routes')

# --- RLS coverage across every schema file that ships to the repo ---------
schema_files = ['schema.sql', 'phase_extensions.sql', 'launch_extensions.sql',
                 'operational_extensions.sql', 'app_extensions.sql', 'pilot_audience_fix.sql']
schema = ''
for name in schema_files:
    path = database / name
    check(path.exists(), f'Expected migration file missing: database/{name}')
    if path.exists():
        schema += path.read_text()

for table in ('orders', 'writing_submissions', 'speaking_attempts', 'mock_attempts',
              'consent_events', 'audit_logs', 'articles', 'support_tickets'):
    check(
        f'alter table public.{table} enable row level security' in schema
        or f'alter table {table} enable row level security' in schema,
        f'{table} must have row level security enabled',
    )

# Defense-in-depth: staff/system-only columns on self-editable tables must be
# protected by a trigger, not just an RLS policy (RLS is row-level only).
for trigger in ('writing_submissions_protect_fields', 'speaking_attempts_protect_fields',
                 'support_tickets_protect_fields'):
    check(trigger in schema, f'Missing column-protection trigger: {trigger}')

# Rate-limited RPC must not be directly callable by clients.
check(
    'revoke execute on function public.check_rate_limit' in schema,
    'check_rate_limit must be revoked from anon/authenticated (service-role only)',
)

# --- Edge Functions referenced by the frontend must exist -----------------
EXPECTED_FUNCTIONS = (
    'account-privacy', 'analyze-speaking-attempt', 'analyze-writing-submission',
    'book-coaching', 'calculate-readiness', 'create-zoom-meeting',
    'generate-article-draft', 'generate-recommendations', 'get-host-access',
    'get-lecture-access', 'get-recording-url', 'initialize-payment',
    'invite-staff-member', 'launch-health', 'manage-enrollment',
    'payment-webhook', 'publish-scheduled-articles', 'request-refund',
    'send-reminders', 'study-assistant-chat', 'suggest-ticket-reply',
    'transcribe-speaking-attempt', 'zoom-webhook',
)
for fn in EXPECTED_FUNCTIONS:
    check((functions / fn / 'index.ts').exists(), f'Missing Edge Function: supabase/functions/{fn}/index.ts')

# --- PWA basics still present after the install-prompt removal ------------
check((frontend / 'public' / 'manifest.webmanifest').exists(), 'manifest.webmanifest must exist')
check((frontend / 'public' / 'sw.js').exists(), 'sw.js must exist')
check(
    (frontend / 'components' / 'ServiceWorkerRegistration.tsx').exists(),
    'ServiceWorkerRegistration.tsx must exist to register the service worker',
)
check(
    not (frontend / 'components' / 'InstallBanner.tsx').exists(),
    'InstallBanner.tsx should have been removed',
)

if errors:
    raise SystemExit('CHECKS FAILED\n' + '\n'.join(errors))

print(
    f'OK: {len(PUBLIC_ROUTES) + len(PAID_ROUTES) + len(ROLE_ROUTES) + len(STUDENT_ROUTES)} routes, '
    f'{len(EXPECTED_FUNCTIONS)} edge functions, RLS/trigger coverage and PWA assets verified'
)
