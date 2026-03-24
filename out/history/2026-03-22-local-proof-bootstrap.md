# Local-Proof Bootstrap — 2026-03-22

## What was done

Created `backend/scripts/bootstrap-local-proof.ts` and ran it successfully.

Bootstrap is idempotent (ON CONFLICT DO NOTHING on all inserts). Safe to re-run.

## Persistent data created

### Modules
- `t1-phishing-email-security` — 5 tasks (phishing in freight, email red flags, smishing/vishing, safe link handling, how to report). 15 practice questions already seeded. 30 min estimated.
- `t2-supply-chain-threat-awareness` — 2 tasks (kill chain, I clicked). 4 practice questions. 20 min estimated.

### Learners
| Handle (login email) | Access | Assignment | Progress |
|---------------------|--------|------------|----------|
| eva.restricted@fiveeyes.dev | None → access gate | None | None |
| alex.individual@fiveeyes.dev | Paid | t1 only | t1 started |
| sam.professional@fiveeyes.dev | Paid | t1 + t2 | t1 completed 80%, t2 started |

### Groups
- `transport-ops` — Eva + Alex
- `freight-security` — Sam

### Practice data
- Sam has 1 practice attempt on t1: 12/15 correct (80%), passed

## Navigation fix
Added "← Public site" link to NavShell sidebar footer (both admin and learner).

## Admin login path
`/admin/login` → `arnettmcmurray@gmail.com` / `changeme`

## Learner OTP path
`/login` → enter email → OTP sent to Mailpit → `http://localhost:8025`
