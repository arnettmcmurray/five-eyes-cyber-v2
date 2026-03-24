# AWS Deployment Sequence (2026-03-16)

Execute in order. Each step has a verification check before proceeding.

---

## Phase 1 — Foundations (one-time)

### 1. VPC + Networking
- Create VPC with 2 AZs: 2 public subnets (ALB), 2 private subnets (ECS + RDS)
- Internet Gateway on public subnets; NAT Gateway for private subnet egress
- Security groups:
  - `five-eyes-alb-sg`: inbound 80+443 from 0.0.0.0/0; outbound 3001 to ECS SG
  - `five-eyes-ecs-sg`: inbound 3001 from ALB SG; outbound 443+5432 unrestricted
  - `five-eyes-rds-sg`: inbound 5432 from ECS SG only

### 2. RDS PostgreSQL
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier five-eyes-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username five_eyes_user \
  --master-user-password <generate-strong-password> \
  --allocated-storage 20 \
  --no-publicly-accessible \
  --vpc-security-group-ids <five-eyes-rds-sg-id> \
  --db-subnet-group-name <private-subnet-group>
```
✓ Check: endpoint resolvable from ECS subnet

### 3. Enable pgvector extension
```sql
-- Connect to RDS and run:
CREATE EXTENSION IF NOT EXISTS vector;
```
✓ Check: `SELECT * FROM pg_extension WHERE extname = 'vector';` returns a row

### 4. Secrets Manager — create all secrets
```bash
for SECRET in \
  "five-eyes/prod/database-url:postgresql://five_eyes_user:PASS@RDS_ENDPOINT:5432/five_eyes_v2" \
  "five-eyes/prod/api-key:$(openssl rand -hex 32)" \
  "five-eyes/prod/admin-password:CHOOSE_STRONG_PASSWORD" \
  "five-eyes/prod/ses-from-address:noreply@fiveeyesltd.com"
do
  NAME="${SECRET%%:*}"
  VALUE="${SECRET#*:}"
  aws secretsmanager create-secret --name "$NAME" --secret-string "$VALUE"
done
# ANTHROPIC_API_KEY optional — add if TTX AI assist needed
```
✓ Check: `aws secretsmanager get-secret-value --secret-id five-eyes/prod/api-key`

### 5. SES setup
```bash
# Verify sender domain (preferred) or email address
aws ses verify-domain-identity --domain fiveeyesltd.com
# Add DNS TXT record from verification response to Route 53
# Request production access (SES starts in sandbox — cannot send to unverified addresses)
```
✓ Check: domain shows "Verified" in SES console; account out of sandbox

### 6. ACM certificate
```bash
aws acm request-certificate \
  --domain-name "*.fiveeyesltd.com" \
  --validation-method DNS \
  --region us-east-1
# Add CNAME validation records to Route 53
```
✓ Check: certificate status = "Issued"

### 7. ECR repository
```bash
aws ecr create-repository --repository-name five-eyes-backend --region us-east-1
```
✓ Check: `aws ecr describe-repositories --repository-names five-eyes-backend`

---

## Phase 2 — Build and Push Image

### 8. Build and push backend image
```bash
# From project root
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=us-east-1
ECR_REPO="$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/five-eyes-backend"
GIT_SHA=$(git rev-parse --short HEAD)

# Authenticate
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build and push
docker build -t five-eyes-backend:$GIT_SHA ./backend
docker tag five-eyes-backend:$GIT_SHA $ECR_REPO:$GIT_SHA
docker tag five-eyes-backend:$GIT_SHA $ECR_REPO:latest
docker push $ECR_REPO:$GIT_SHA
docker push $ECR_REPO:latest
```
✓ Check: image appears in ECR console with correct tag

---

## Phase 3 — ECS + ALB

### 9. ECS cluster
```bash
aws ecs create-cluster --cluster-name five-eyes-prod --capacity-providers FARGATE
```

### 10. IAM roles
Create `five-eyes-task-execution-role`:
- Attach `AmazonECSTaskExecutionRolePolicy`
- Add inline policy: `secretsmanager:GetSecretValue` on `arn:aws:secretsmanager:us-east-1:*:secret:five-eyes/*`

Create `five-eyes-task-role`:
- Add inline policy: `ses:SendEmail` + `ses:SendRawEmail` (condition: from verified address)

### 11. Task definition
Register task definition using `out/aws-env-secrets.md` for environment/secrets blocks.
Key settings:
```json
{
  "family": "five-eyes-backend",
  "cpu": "512",
  "memory": "1024",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "executionRoleArn": "<five-eyes-task-execution-role-arn>",
  "taskRoleArn": "<five-eyes-task-role-arn>",
  "containerDefinitions": [{
    "name": "backend",
    "image": "<ECR_REPO>:latest",
    "portMappings": [{ "containerPort": 3001 }],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/five-eyes/backend",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    },
    "healthCheck": {
      "command": ["CMD-SHELL", "wget -qO- http://localhost:3001/health || exit 1"],
      "interval": 30, "timeout": 5, "retries": 3, "startPeriod": 15
    }
  }]
}
```

### 12. CloudWatch log group
```bash
aws logs create-log-group --log-group-name /five-eyes/backend
aws logs put-retention-policy --log-group-name /five-eyes/backend --retention-in-days 30
```

### 13. ALB + target group
```bash
# ALB (public subnets)
aws elbv2 create-load-balancer \
  --name five-eyes-alb \
  --subnets <public-subnet-1> <public-subnet-2> \
  --security-groups <five-eyes-alb-sg-id>

# Target group (IP mode for Fargate)
aws elbv2 create-target-group \
  --name five-eyes-backend \
  --protocol HTTP --port 3001 \
  --target-type ip \
  --vpc-id <vpc-id> \
  --health-check-path /health \
  --health-check-interval-seconds 30

# HTTPS listener (port 443)
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTPS --port 443 \
  --certificates CertificateArn=<acm-cert-arn> \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>

# HTTP → HTTPS redirect (port 80)
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTP --port 80 \
  --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,StatusCode=HTTP_301}'
```

### 14. ECS service
```bash
aws ecs create-service \
  --cluster five-eyes-prod \
  --service-name five-eyes-backend \
  --task-definition five-eyes-backend:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<private-subnet-1>,<private-subnet-2>],securityGroups=[<five-eyes-ecs-sg-id>],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<target-group-arn>,containerName=backend,containerPort=3001"
```
✓ Check: `aws ecs describe-services --cluster five-eyes-prod --services five-eyes-backend` → `runningCount: 1`

### 15. Run DB schema push
```bash
# One-time: exec into running task or run a one-off task with DATABASE_URL set
# From dev machine with direct RDS access (via bastion or VPN):
DATABASE_URL="postgresql://..." npm run db:push
# Or run the drizzle-kit push command directly
```
✓ Check: `GET /health` → `{ "status": "ok", "db": "ok" }`

---

## Phase 4 — DNS + Frontend

### 16. Route 53 — API subdomain
```bash
aws route53 change-resource-record-sets --hosted-zone-id <zone-id> --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "api.fiveeyesltd.com",
      "Type": "A",
      "AliasTarget": { "HostedZoneId": "<alb-hosted-zone-id>", "DNSName": "<alb-dns-name>", "EvaluateTargetHealth": true }
    }
  }]
}'
```

### 17. S3 + CloudFront — frontend
```bash
# Create S3 bucket
aws s3 mb s3://five-eyes-frontend-prod --region us-east-1
aws s3api put-public-access-block --bucket five-eyes-frontend-prod \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Build frontend (set env vars first)
VITE_API_BASE=https://api.fiveeyesltd.com \
VITE_API_KEY=<api-key-value> \
npm run build

# Upload to S3
aws s3 sync dist/ s3://five-eyes-frontend-prod/ --delete

# Create CloudFront distribution (OAC → S3, default root index.html,
#  custom error 404 → index.html for SPA routing, ACM cert for app.*)
# See CloudFront console or CDK for full distribution config.
```

### 18. Route 53 — app subdomain → CloudFront
Add A alias record for `app.fiveeyesltd.com` pointing to CloudFront distribution.

---

## Phase 5 — Post-deploy verification

Run this checklist immediately after deploy (see also `out/aws-post-deploy-tests.md`):

```bash
API=https://api.fiveeyesltd.com
KEY=<api-key-value>

# Health
curl "$API/health"
# → {"status":"ok","db":"ok"}

# API key gate
curl "$API/admin/access"
# → {"error":"Unauthorized"}  (no key)

curl -H "x-api-key: $KEY" "$API/admin/access"
# → {"error":"Admin authentication required"}

# Admin login
TOKEN=$(curl -s -X POST "$API/auth/admin/login" \
  -H "x-api-key: $KEY" -H "Content-Type: application/json" \
  -d '{"username":"arnettmcmurray@gmail.com","password":"<seed-password>"}' | jq -r .token)
echo "Admin token: ${TOKEN:0:10}..."

# Security headers
curl -sI "$API/health" | grep -E "X-Content-Type|X-Frame|Strict-Transport|Content-Security"

# OTP request — verify email arrives (requires SES out of sandbox)
curl -s -X POST "$API/auth/otp/request" \
  -H "x-api-key: $KEY" -H "Content-Type: application/json" \
  -d '{"handle":"your-email@example.com"}'
# → 204; check inbox for OTP email
```
