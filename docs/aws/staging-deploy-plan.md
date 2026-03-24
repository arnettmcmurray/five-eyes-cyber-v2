# Staging Deploy Plan — Five Eyes v2
_Last updated: 2026-03-22_

This plan is split into four independent deployment paths. Each path has its own infrastructure, tooling, and rollout sequence. They are not interchangeable.

---

## Path 1 — Frontend (Static Hosting)

**What:** Vite SPA build → served as static files.

**Stack:** S3 + CloudFront

**Build command:**
```bash
cd /path/to/five-eyes-dashboard-v2
npm run build
# Output: dist/
```

**Deploy steps:**
1. `aws s3 sync dist/ s3://five-eyes-v2-staging/ --delete`
2. CloudFront distribution points to the S3 origin (OAC, not public bucket)
3. Set CloudFront default root object → `index.html`
4. Add CloudFront error page: 404 → `/index.html` (status 200) — required for React Router client-side routing
5. Set cache headers:
   - `index.html` → `Cache-Control: no-cache` (always fresh)
   - `assets/*` → `Cache-Control: public, max-age=31536000, immutable` (content-hashed filenames)
6. Set env vars at **build time** (baked into bundle via Vite):
   - `VITE_API_URL=https://api-staging.fiveeyesltd.com`
   - `VITE_API_KEY=<staging-api-key>`

**Not covered by this path:** The backend API, database, or SES. S3/CloudFront only delivers HTML/JS/CSS.

---

## Path 2 — Backend / API Runtime

**What:** Express.js Node server — requires a running process, not static files.

**Stack:** AWS App Runner (recommended for simplicity) or ECS Fargate

### Option A — App Runner (recommended for staging)

1. Containerize: write `backend/Dockerfile`
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY . .
   RUN npm run build
   CMD ["node", "dist/server.js"]
   ```
2. Push image to ECR:
   ```bash
   aws ecr create-repository --repository-name five-eyes-backend-staging
   docker build -t five-eyes-backend ./backend
   docker tag five-eyes-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/five-eyes-backend-staging:latest
   docker push ...
   ```
3. Create App Runner service pointing at ECR image
4. Set health check path: `GET /health` (or any 200 route)
5. Configure custom domain: `api-staging.fiveeyesltd.com`

### Option B — ECS Fargate

1. Same Docker image as above pushed to ECR
2. Create ECS cluster + task definition + service (Fargate launch type)
3. ALB (Application Load Balancer) in front → HTTPS on port 443
4. Target group health check: `GET /health`
5. Route53 alias record: `api-staging.fiveeyesltd.com` → ALB DNS

**Required environment variables (set in App Runner/ECS task env, NOT baked into image):**
```
NODE_ENV=staging
PORT=3001
DATABASE_URL=postgresql://...  # see Path 3
API_KEY=<staging-api-key>
ADMIN_PASSWORD=<staging-admin-password>
EMAIL_FROM=noreply@fiveeyesltd.com
SMTP_HOST=email-smtp.<region>.amazonaws.com
SMTP_PORT=587
SMTP_USER=<SES SMTP username>  # see Path 4
SMTP_PASS=<SES SMTP password>
```

**CORS:** Set `ALLOWED_ORIGINS=https://staging.fiveeyesltd.com` in backend config.

---

## Path 3 — Database

**What:** PostgreSQL — requires a persistent, managed database instance.

**Stack:** Amazon RDS (PostgreSQL 16, db.t3.micro for staging)

**Steps:**
1. Create RDS instance in a private subnet (no public access)
2. Security group: allow inbound 5432 from the backend's security group only
3. Note the endpoint: `five-eyes-staging.xxxx.<region>.rds.amazonaws.com`
4. Set `DATABASE_URL` in backend env (Path 2) using the RDS endpoint

**Schema migration:**
```bash
# From backend directory, with DATABASE_URL pointed at staging RDS
npm run db:push
```
This runs Drizzle migrations. Confirm `[✓] Changes applied` before deploying the backend image.

**Important:** Do not run `db:push` against production. Use it only for staging. Production should use explicit versioned migrations.

---

## Path 4 — SES (Email Delivery)

**What:** Transactional email — OTP codes and contact form notifications.

**Stack:** AWS SES (Simple Email Service)

**Steps:**

### 4a — Verify sending domain
1. In SES console → Verified Identities → Add domain: `fiveeyesltd.com`
2. Add the provided DKIM and CNAME records to the domain's DNS
3. Wait for verification (usually <30 min)
4. Also verify `noreply@fiveeyesltd.com` as a sending address

### 4b — Request production access (if needed)
- By default SES is in **sandbox mode** — can only send to verified addresses
- For staging, sandbox is acceptable if testers use verified emails
- For production, submit a "Request production access" case in the SES console

### 4c — Create SMTP credentials
1. SES console → SMTP Settings → Create SMTP credentials (creates an IAM user)
2. Copy the SMTP username and password (shown once)
3. Set these as `SMTP_USER` and `SMTP_PASS` in the backend env (Path 2)

### 4d — Verify delivery
- Register a test account → check that the OTP email arrives
- Submit the enterprise contact form → check that `info@fiveeyesltd.com` receives the notification

---

## Deployment Order

Run paths in this sequence:

```
1. Path 3 (RDS) — database must exist before backend can start
2. Path 4 (SES) — email must be verified before OTP flows work
3. Path 2 (Backend) — API must be live before frontend can call it
4. Path 1 (Frontend) — deploy last; bakes in the API URL at build time
```

---

## Staging Checklist

- [ ] RDS instance created, migration applied (`db:push` clean)
- [ ] SES domain verified, SMTP credentials set in backend env
- [ ] Backend container built, pushed to ECR, App Runner service healthy
- [ ] `GET https://api-staging.fiveeyesltd.com/health` returns 200
- [ ] Frontend built with `VITE_API_URL=https://api-staging.fiveeyesltd.com`
- [ ] S3 sync complete, CloudFront invalidation run (`/*`)
- [ ] `https://staging.fiveeyesltd.com` loads the landing page
- [ ] Registration flow: OTP email arrives via SES
- [ ] Contact form: notification email arrives at `info@fiveeyesltd.com`
- [ ] Admin login works at `https://staging.fiveeyesltd.com/admin`
- [ ] Free-tier gate shown to new learner before tier upgrade
