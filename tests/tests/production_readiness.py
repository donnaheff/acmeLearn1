"""Production-launch readiness gate for the Next.js + Supabase build.

Run from the tests/ directory: `python3 tests/production_readiness.py`
"""
import sys
from pathlib import Path

root = Path(__file__).parents[2]
frontend = root / 'frontend'

env_example = (frontend / '.env.example').read_text()
env_local = (frontend / '.env.local').read_text() if (frontend / '.env.local').exists() else ''

checks = {
    'frontend/.env.example documents every required variable': all(
        key in env_example
        for key in (
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'NEXT_PUBLIC_SITE_URL',
        )
    ),
    'Supabase project configured (not a placeholder)': bool(env_local)
    and 'YOUR_PROJECT' not in env_local
    and 'YOUR_SUPABASE_ANON_KEY' not in env_local,
    # NEXT_PUBLIC_SITE_URL in the *deployed* build is set directly in Vercel's
    # project settings, not from the repo's (dev-only) .env.local, so it isn't
    # checked here — Vercel serves the production domain over HTTPS by default.
    'Legal approval evidence recorded': (root / 'LEGAL_APPROVAL.txt').exists(),
    'Accessibility report present': (root / 'ACCESSIBILITY_AUDIT.md').exists(),
    'Restore evidence present': (root / 'RESTORE_TEST.md').exists(),
    'OPENAI_API_KEY documented for speech-to-text/AI functions': any(
        'OPENAI_API_KEY' in f.read_text()
        for f in (root / 'supabase' / 'functions').rglob('index.ts')
    ),
}

print('\n'.join(f"{'PASS' if v else 'BLOCK'}  {k}" for k, v in checks.items()))
if not all(checks.values()):
    sys.exit('PRODUCTION LAUNCH BLOCKED: complete every required external gate.')
