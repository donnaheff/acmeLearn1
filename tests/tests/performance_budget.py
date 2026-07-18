"""Performance budget check for the Next.js build.

Requires `npm run build` to have been run in frontend/ first (produces .next/).
Run from the tests/ directory: `python3 tests/performance_budget.py`
"""
import json
from pathlib import Path

root = Path(__file__).parents[2]
frontend = root / 'frontend'
next_dir = frontend / '.next'

if not next_dir.exists():
    raise SystemExit('PERFORMANCE BUDGET FAILED\nRun `npm run build` in frontend/ before this check (.next/ not found).')

errors = []

# --- Public asset size budget (served directly, no Next.js optimization) --
ASSET_LIMITS = {'.jpg': 300_000, '.jpeg': 300_000, '.png': 150_000, '.webp': 160_000, '.avif': 140_000, '.svg': 20_000}
public_dir = frontend / 'public'
for p in public_dir.rglob('*'):
    if not p.is_file():
        continue
    limit = ASSET_LIMITS.get(p.suffix.lower())
    if limit and p.stat().st_size > limit:
        errors.append(f'{p.relative_to(frontend)}: {p.stat().st_size} > {limit} bytes')

# --- Shared JS bundle budget (First Load JS shared by all routes) ---------
# Next.js writes the resolved shared-chunk list per app-router build; we
# total the actual file sizes on disk rather than trust the printed report.
SHARED_JS_BUDGET = 350_000
build_manifest_path = next_dir / 'build-manifest.json'
if build_manifest_path.exists():
    manifest = json.loads(build_manifest_path.read_text())
    shared_files = set(manifest.get('rootMainFiles', []))
    total = 0
    for rel in shared_files:
        f = next_dir / rel
        if f.exists():
            total += f.stat().st_size
    if total and total > SHARED_JS_BUDGET:
        errors.append(f'Shared JS bundle: {total} > {SHARED_JS_BUDGET} bytes')
else:
    errors.append('build-manifest.json missing from .next/ — build output looks incomplete')

# --- PWA basics: manifest + service worker must still ship ----------------
for required in ('manifest.webmanifest', 'sw.js'):
    if not (public_dir / required).exists():
        errors.append(f'public/{required} missing')

if errors:
    raise SystemExit('PERFORMANCE BUDGET FAILED\n' + '\n'.join(errors))

print('PERFORMANCE BUDGET OK: public asset sizes, shared JS bundle and PWA assets within budget')
