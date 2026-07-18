from pathlib import Path
import re,sys
root=Path(__file__).parents[1]
config=(root/'config.js').read_text();env=(root/'.env.example').read_text()
checks={
 'Demo mode disabled': 'DEMO_MODE: false' in config,
 'Supabase project configured': 'YOUR_PROJECT' not in config and 'YOUR_SUPABASE_ANON_KEY' not in config,
 'HTTPS site URL configured': bool(re.search(r"SITE_URL:\s*'https://",config)),
 'Legal approval evidence recorded': (root/'LEGAL_APPROVAL.txt').exists(),
 'Accessibility report present': (root/'ACCESSIBILITY_AUDIT.md').exists(),
 'Restore evidence present': (root/'RESTORE_TEST.md').exists(),
}
print('\n'.join(f"{'PASS' if v else 'BLOCK'}  {k}" for k,v in checks.items()))
if not all(checks.values()):sys.exit('PRODUCTION LAUNCH BLOCKED: complete every required external gate.')
