# AcmeLearn controlled-launch compliance pack

Operational draft — obtain review from qualified Nigerian counsel and a data-protection professional before launch.

## Data retention schedule

| Record | Default retention | Disposal |
|---|---:|---|
| Account/profile | Account life + 30 days | Cascading deletion; legal holds excepted |
| Speaking attempts | 180 days or learner deletion | Private-object deletion and DB tombstone |
| Lecture recordings | 60 days | Automatic private-bucket deletion |
| Writing submissions/feedback | Account life | Included in export; deleted with account |
| Zoom attendance | Course end + 12 months | Aggregation then identifier deletion |
| Payment invoices/events | 7 years, subject to Nigerian requirements | Restricted archive |
| Support tickets | Closure + 24 months | Secure deletion |
| Authentication/security logs | 12 months | Rolling deletion |
| Marketing consent | Consent life + 6 years evidence | Restricted archive |
| Usability research | 12 months | De-identification |

Run a monthly retention job and log every deletion batch. A legal hold must identify scope, owner, reason and expiry.

## Recording consent

Tutors announce recording before it begins. The lecture page shows recording status. Learners can keep camera off and request a reasonable alternative where participation would expose sensitive information. Recordings are restricted to the enrolled cohort, cannot be redistributed and expire according to the schedule.

## Single-tutor agreement checklist

The founding tutor agreement must cover identity and qualification verification, confidentiality, intellectual-property ownership/licensing, safeguarding, recording conduct, feedback turnaround, working-hour limits, absence notification, conflict of interest, off-platform payment prohibition, security/MFA, data handling, termination and continuity obligations.

## Continuity policy

If the tutor is unavailable, AcmeLearn will choose one of: reschedule with learner notice; provide an equivalent recorded/self-study clinic; issue service credit; or refund the affected private service. No substitute is presented as verified until identity, qualifications, observation and data-processing terms are complete.

## Incident response

1. Contain access and preserve logs.
2. Classify severity and affected data.
3. Notify the incident owner and data-protection contact.
4. Assess regulatory/user notification obligations.
5. Communicate facts without exposing credentials or private links.
6. Restore from verified backups and monitor.
7. Complete a post-incident review with dated actions.

## Launch gates

- Staff MFA enforced and tested.
- Production keys stored only in Supabase secrets.
- RLS and end-to-end suites pass in staging.
- Paystack/Stripe sandbox and refund tests pass.
- Zoom registration, waiting room and webhook retries pass.
- Backup restoration succeeds.
- WCAG 2.2 AA audit has no critical issues.
- Legal text and outcome claims approved.
- Genuine learner-story consent retained.
