# AcmeLearn release process

1. Deploy database migrations to staging and verify backward compatibility.
2. Run structural, performance, Playwright and authorization suites.
3. Complete keyboard, screen-reader and WCAG 2.2 AA scans.
4. Exercise sandbox payment, refund, Zoom, reminder and recording journeys.
5. Verify a fresh backup and complete the scheduled restore drill.
6. Record release notes, migration list, feature flags and rollback commands in `release_records`.
7. Obtain administrator approval only when all required `launch_checks` pass.
8. Deploy with advanced flags disabled, monitor errors/webhooks for 30 minutes, then expand rollout gradually.
9. Roll back on authorization bypass, payment mismatch, data loss, inaccessible core control or severe privacy defect.
10. Review pilot evidence before enabling subscriptions, referrals, readiness forecasts or multi-organization support.
