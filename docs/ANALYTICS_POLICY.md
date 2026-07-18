# AcmeLearn minimal analytics policy

AcmeLearn collects only metrics tied to an identified product, learning or operational decision. Launch metrics are registration completion, diagnostic completion, verified payment conversion, first-lesson completion, assignment submission, feedback turnaround, valid lecture attendance, refund rate, support volume and course completion.

Raw passwords, payment-card data, private Zoom URLs, essay text, speaking audio and support-ticket bodies are never sent to analytics. Learner-level educational records remain in operational tables protected by RLS. Public claims are produced only from approved `marketing_claims` records with definition, sample, period, exclusions, calculation, approval and expiry.

Optional marketing analytics remain disabled until consent and a documented decision need exist. Every enabled metric has a retention period and owner. Quarterly review removes unused events. Staff dashboards aggregate wherever individual detail is unnecessary.
