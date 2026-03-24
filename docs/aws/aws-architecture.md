# AWS Target Architecture (2026-03-16)

## Overview

Single-region deployment (us-east-1 recommended). Single ECS Fargate task for initial launch — scale out when needed.

```
Internet
  │
  ├─ api.fiveeyesltd.com  ──► Route 53 ──► ALB (HTTPS:443) ──► ECS Fargate (port 3001)
  │                                         ↑ ACM TLS cert           │
  │                                         HTTP:80 → redirect 443   ├─► RDS PostgreSQL (private subnet)
  │                                                                   ├─► SES (OTP + assessment email)
  └─ app.fiveeyesltd.com  ──► Route 53 ──► CloudFront ──► S3 (static) └─► CloudWatch Logs
                                                                           │
                                                                     Secrets Manager
                                                                     (DATABASE_URL, API_KEY,
                                                                      ADMIN_PASSWORD, etc.)
```

## Services

| Service | Purpose | Notes |
|---------|---------|-------|
| **ECS Fargate** | Backend runtime | 0.5 vCPU / 1GB RAM to start; scale task count not instance size |
| **ECR** | Container registry | Backend Docker image |
| **RDS PostgreSQL 16** | Primary database | `db.t3.micro` to start; Multi-AZ for production |
| **ALB** | Load balancer + TLS termination | HTTP→HTTPS redirect; health check on `GET /health` |
| **ACM** | TLS certificate | Free managed cert; attach to ALB listener |
| **Route 53** | DNS | A records for api.* and app.* subdomains |
| **S3** | Frontend static hosting | Vite build output (`dist/`) |
| **CloudFront** | CDN for frontend | OAC on S3 bucket; HTTPS for app.* |
| **SES** | Email delivery | OTP codes + assessment links; verify sender domain |
| **Secrets Manager** | Runtime secrets | DATABASE_URL, API_KEY, ADMIN_PASSWORD, ANTHROPIC_API_KEY, SES_FROM_ADDRESS |
| **Parameter Store** | Non-secret config | CORS_ORIGIN, APP_BASE_URL, TRUST_PROXY, PORT, AWS_REGION |
| **CloudWatch Logs** | Log aggregation | ECS `awslogs` driver → `/five-eyes/backend` log group |
| **IAM** | Permissions | Task execution role (Secrets Manager read) + task role (SES send) |

## Networking

- **VPC**: 2 AZs minimum; public subnets for ALB; private subnets for ECS + RDS
- **Security groups**:
  - ALB: inbound 443 + 80 from 0.0.0.0/0; outbound to ECS SG on 3001
  - ECS: inbound 3001 from ALB SG only; outbound 443 (Secrets Manager, SES), 5432 (RDS)
  - RDS: inbound 5432 from ECS SG only; no public access

## IAM Roles

### ECS Task Execution Role
Standard `AmazonECSTaskExecutionRolePolicy` plus:
```json
{
  "Effect": "Allow",
  "Action": ["secretsmanager:GetSecretValue"],
  "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:five-eyes/*"
}
```

### ECS Task Role (runtime)
```json
{
  "Effect": "Allow",
  "Action": ["ses:SendEmail", "ses:SendRawEmail"],
  "Resource": "*",
  "Condition": { "StringEquals": { "ses:FromAddress": "noreply@fiveeyesltd.com" } }
}
```

## Container Image

- Built from `backend/Dockerfile` (multi-stage, non-root user)
- Published to ECR: `<account>.dkr.ecr.us-east-1.amazonaws.com/five-eyes-backend:<tag>`
- Tag strategy: git SHA (`git rev-parse --short HEAD`) + `latest`

## Frontend Deployment

- `npm run build` from project root with `VITE_API_BASE` + `VITE_API_KEY` set
- `dist/` uploaded to S3 bucket with CloudFront invalidation on deploy
- S3 bucket: public access blocked; CloudFront OAC only
- CloudFront: default root object `index.html`; custom error for 404 → `index.html` (SPA routing)

## Database

- Engine: PostgreSQL 16 (matches dev pgvector/pg16 image)
- Extension: `pgvector` — must be enabled on RDS: `CREATE EXTENSION IF NOT EXISTS vector;`
- Schema: applied via `bash backend/scripts/db-push.sh` on first deploy
- Credentials: stored in Secrets Manager, injected into ECS task as `DATABASE_URL`

## Logging

- ECS log driver: `awslogs` → CloudWatch log group `/five-eyes/backend`
- Log retention: 30 days (adjust per compliance requirements)
- Current format: plain text (`METHOD /path STATUS Nms`); structured JSON (pino) is a future upgrade

## Not Included (out of scope for initial launch)

- ElastiCache/Redis — rate limiters are in-memory; add before horizontal scaling
- WAF — add after launch if abuse patterns emerge
- X-Ray tracing — add after launch for performance visibility
- RDS read replicas — add when read load warrants it
