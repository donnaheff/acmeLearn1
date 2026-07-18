from pathlib import Path
root=Path(__file__).parents[1]
limits={'.html':180_000,'.css':120_000,'.js':100_000,'.webp':130_000,'.svg':20_000}
errors=[]
for p in root.rglob('*'):
 if not p.is_file() or any(x in p.parts for x in ('supabase','tests')):continue
 lim=limits.get(p.suffix)
 if lim and p.stat().st_size>lim:errors.append(f'{p.relative_to(root)}: {p.stat().st_size} > {lim} bytes')
hero=root/'index.html';s=hero.read_text()
for marker in ('fetchpriority="high"','hero-student-640.webp','width="1312"','height="816"','rel="manifest"'):
 if marker not in s:errors.append(f'Homepage missing performance marker: {marker}')
if errors:raise SystemExit('PERFORMANCE BUDGET FAILED\n'+'\n'.join(errors))
print('PERFORMANCE BUDGET OK: responsive hero, dimensions, PWA and asset limits verified')
