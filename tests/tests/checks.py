from pathlib import Path
root=Path(__file__).parents[1]
html=list(root.glob('*.html'))
assert len(html)>=20, 'Expected complete multi-page product'
for f in html:
 s=f.read_text()
 for marker in ('YOUR_SUPABASE_SERVICE','ZOOM_CLIENT_SECRET','PAYSTACK_SECRET_KEY'):
  assert marker not in s, f'Secret marker leaked into {f}'
for name in ('writing.html','speaking.html','mock.html','assignments.html','lectures.html','recordings.html'):
 assert 'data-protected="true"' in (root/name).read_text(), f'{name} must require authentication'
schema=(root/'supabase/schema.sql').read_text()+(root/'supabase/phase_extensions.sql').read_text()+(root/'supabase/launch_extensions.sql').read_text()+(root/'supabase/operational_extensions.sql').read_text()
for table in ('orders','writing_submissions','speaking_attempts','mock_attempts','consent_events','audit_logs'):
 assert f'alter table {table} enable row level security' in schema
for fn in ('initialize-payment','payment-webhook','generate-recommendations','account-privacy','get-lecture-access'):
 assert (root/'supabase/functions'/fn/'index.ts').exists()
print(f'OK: {len(html)} pages, security markers and phase functions verified')
