# Local-Proof Access Guide
_Last updated: 2026-03-23_

---

## Running the Bootstrap

From the repo root:
```bash
npm run --prefix backend bootstrap
```

Or from `backend/`:
```bash
npx tsx --env-file=.env scripts/bootstrap-local-proof.ts
```

Safe to re-run at any time. Does not wipe existing data.

If t1 practice questions are missing (fresh DB), run this separately afterward:
```bash
cd backend && npx tsx --env-file=.env seed-t1-questions.ts
```

---

## Admin Login

URL: `http://localhost:5173/admin/login`

| Username | Password |
|----------|----------|
| `arnettmcmurray@gmail.com` | `changeme` (value of `ADMIN_PASSWORD` in `backend/.env`) |

Other valid admin usernames (same password):
- `michaelm@fiveyesltd.com`
- `dmott@fiveyesltd.com`
- `support@fiveyesltd.com`

After login, lands at `/kb`. Navigate to `/admin` for the control center.

---

## Learner OTP Login

URL: `http://localhost:5173/login`

OTP flow:
1. Enter learner email address in the login form
2. OTP is sent to Mailpit: `http://localhost:8025`
3. Copy the 6-digit code from Mailpit
4. Enter it in the verification step
5. Lands at `/learn/dashboard`

---

## Local-Proof Accounts

### Eva Restricted — `eva.restricted@fiveeyes.dev`
- **Access state:** Registered, no package
- **What to expect:** Logs in successfully, lands at the Access Required screen ("Choose a Package"). Cannot access any training content.
- **Module progress:** None
- **Group:** Transport Operations

### Alex Morgan — `alex.individual@fiveeyes.dev`
- **Access state:** Individual tier — training + KB/chat, no TTX
- **What to expect:** Full training access. Dashboard shows 1 module (t1). Status: In Progress. TTX blocked at join.
- **Module progress:** t1 started, not completed — represents early learner
- **Group:** Transport Operations

### Sam Reeves — `sam.professional@fiveeyes.dev`
- **Access state:** Professional tier — full training + TTX
- **What to expect:** Full platform access. Dashboard shows 3 modules. t1 completed (80%), t2+t3 assigned.
- **Module progress:** t1 completed 12/15 (80%, passed), t2 + t3 assigned and not started
- **Group:** Freight Security Team

---

## Pages to Inspect

### Admin side (login as `arnettmcmurray@gmail.com`)

| Page | URL | What you should see |
|------|-----|---------------------|
| Control center | `/admin` | 3 learners, 3 modules, KPI cards |
| Learner progress — by learner | `/admin/progress` (Learners tab) | Eva, Alex, Sam — different completion states |
| Learner progress — by module | `/admin/progress` (Modules tab) | t1, t2-bec, t3-mfa — different participation rates |
| Group progress | `GET /admin/progress/groups` (API) | transport-ops (2 members), freight-security (1 member) |
| Module manager | `/kb/modules` | 3 published modules |

### Learner side

| Account | Dashboard state | Module state |
|---------|----------------|--------------|
| Eva | Access gate | N/A |
| Alex | 1 module visible (Individual — no TTX) | t1: Task flow, started |
| Sam | 3 modules visible (Professional — TTX enabled) | t1: Completed 80% · t2+t3: Assigned |

---

## OTP Dev Notes

- OTP emails go to Mailpit (SMTP port 1025) when `SES_FROM_ADDRESS` is empty in `backend/.env`
- Mailpit web UI: `http://localhost:8025`
- OTP expires in 10 minutes
- If you lose an OTP, request a new one — old codes are invalidated after use

---

## Resetting a Learner's Progress (if needed)

Connect to the DB directly and delete from `learner_progress` and `practice_attempts` for the relevant learnerId.

Bootstrap learner IDs:
```
eva:  11111111-1111-4111-a111-111111111111
alex: 22222222-2222-4222-a222-222222222222
sam:  33333333-3333-4333-a333-333333333333
```
