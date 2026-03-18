# AWS Deployment Prep (2026-03-16)

## App Changes

### SES email integration (`backend/src/lib/email.ts` — new)
- `sendEmail(msg)` wrapper: sends via SES when `SES_FROM_ADDRESS` env var is set; falls back to stdout otherwise
- Uses AWS SDK default credential chain — no explicit credentials needed on ECS (task role handles it)
- Never throws — SES errors are logged server-side; callers are not affected by delivery failures

### OTP delivery wired (`learner-auth.service.ts`)
- If raw handle contains `@` → send SES email via `sendEmail()`
- If non-email handle → stdout (until SMS/push is wired)
- Code and expiry preserved unchanged

### Assessment token delivery wired (`access/access.ts`)
- `sendAssessmentEmail()` helper constructs link from `APP_BASE_URL` env var
- Called on both new lead creation and re-send
- Removes all `// TODO` comments from these paths

### New env vars
| Var | Purpose | Required for |
|-----|---------|-------------|
| `SES_FROM_ADDRESS` | Verified SES sender | Email delivery in production |
| `AWS_REGION` | SES client region | Email delivery in production |
| `APP_BASE_URL` | Base URL for assessment links | Assessment email links |

All three added to `.env.example` with comments. Startup warns if `SES_FROM_ADDRESS` or `APP_BASE_URL` unset.

### `backend/Dockerfile` (new)
- Multi-stage: `builder` (node:20-alpine + tsc) → `runtime` (node:20-alpine)
- Non-root user (`appuser`) for security
- `HEALTHCHECK` via `wget -qO- http://localhost:3001/health`
- `EXPOSE 3001`
- CMD: `node dist/server.js` — env vars injected by ECS task definition

### `backend/.dockerignore` (new)
Excludes `node_modules`, `dist`, `.env`, `*.local`, `*.log` from image context.

## AWS Docs Created

### `out/aws-architecture.md`
Full target architecture:
- ECS Fargate (backend) + ECR (image registry)
- RDS PostgreSQL 16 (private subnet, pgvector extension)
- ALB + ACM (TLS termination, HTTP→HTTPS redirect)
- S3 + CloudFront (frontend static hosting)
- SES (OTP + assessment email)
- Secrets Manager (sensitive secrets) + Parameter Store (config)
- CloudWatch Logs (`awslogs` driver, `/five-eyes/backend` group)
- IAM task execution role + task role (SES send permission)
- Networking: VPC with public/private subnets, 3 security groups

### `out/aws-env-secrets.md`
- Full Secrets Manager path → env var mapping
- Parameter Store path → env var mapping
- ECS task definition `environment` + `secrets` blocks (ready to paste)
- Frontend build-time env vars
- Startup behaviour summary (FATAL vs WARN conditions)

### `out/aws-deployment-sequence.md`
5-phase numbered sequence with `aws` CLI commands:
1. Foundations (VPC, RDS, SES, ACM, ECR)
2. Build and push Docker image
3. ECS + ALB (cluster, IAM, task definition, CloudWatch, ALB, service)
4. DNS + Frontend (Route 53, S3, CloudFront)
5. Post-deploy verification (curl-based smoke test)

## TypeScript
`npx tsc --noEmit` — clean.
