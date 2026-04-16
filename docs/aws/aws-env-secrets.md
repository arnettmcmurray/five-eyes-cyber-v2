# AWS Env / Secrets Map (2026-03-16)

All runtime configuration is injected into the ECS task at container start.
Nothing is baked into the container image.

## Secrets Manager (sensitive values)

Store each as a plain-text secret (not JSON). Path prefix: `five-eyes/prod/`

| Secret path | Env var name | Description |
|------------|--------------|-------------|
| `five-eyes/prod/database-url` | `DATABASE_URL` | `postgresql://user:pass@rds-host:5432/five_eyes_v2` |
| `five-eyes/prod/api-key` | `API_KEY` | `openssl rand -hex 32` — global API gateway key |
| `five-eyes/prod/admin-password` | `ADMIN_PASSWORD` | Seed password for admin accounts; change after first login |
| `five-eyes/prod/openai-api-key` | `OPENAI_API_KEY` | Required for learner chat and TTX AI assist (optional) |
| `five-eyes/prod/ses-from-address` | `SES_FROM_ADDRESS` | Verified SES sender (e.g. `noreply@fiveeyesltd.com`) |

## Parameter Store (non-sensitive config)

Path prefix: `/five-eyes/prod/`

| Parameter path | Env var name | Value |
|---------------|--------------|-------|
| `/five-eyes/prod/cors-origin` | `CORS_ORIGIN` | `https://app.fiveeyesltd.com` |
| `/five-eyes/prod/app-base-url` | `APP_BASE_URL` | `https://app.fiveeyesltd.com` |
| `/five-eyes/prod/trust-proxy` | `TRUST_PROXY` | `1` |
| `/five-eyes/prod/port` | `PORT` | `3001` |
| `/five-eyes/prod/aws-region` | `AWS_REGION` | `us-east-1` |

## ECS Task Definition — environment / secrets blocks

In the task definition JSON (or CDK/Terraform), inject as follows:

```json
{
  "environment": [
    { "name": "PORT",        "value": "3001" },
    { "name": "TRUST_PROXY", "value": "1" },
    { "name": "DB_SSL",      "value": "true" },
    { "name": "AWS_REGION",  "value": "us-east-1" },
    { "name": "CORS_ORIGIN", "value": "https://app.fiveeyesltd.com" },
    { "name": "APP_BASE_URL","value": "https://app.fiveeyesltd.com" }
  ],
  "secrets": [
    { "name": "DATABASE_URL",      "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:five-eyes/prod/database-url" },
    { "name": "API_KEY",           "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:five-eyes/prod/api-key" },
    { "name": "ADMIN_PASSWORD",    "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:five-eyes/prod/admin-password" },
    { "name": "OPENAI_API_KEY",    "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:five-eyes/prod/openai-api-key" },
    { "name": "SES_FROM_ADDRESS",  "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:five-eyes/prod/ses-from-address" }
  ]
}
```

## Frontend Build-time Env Vars (Vite)

Set in CI/CD pipeline before `npm run build`. These are bundled into the JS — not secrets.

| Var | Value |
|-----|-------|
| `VITE_API_BASE` | `https://api.fiveeyesltd.com` |
| `VITE_API_KEY` | Must match the `API_KEY` Secrets Manager value above |

**Note:** `VITE_API_KEY` is visible to browser users. It is a weak bot-deterrent gate, not a real secret. It does not need to match the Secrets Manager value exactly — it just must match `API_KEY` in the backend env.

## Startup Behaviour

The server logs `[WARN]` at startup if any of these are unset:
- `CORS_ORIGIN`
- `TRUST_PROXY`
- `OPENAI_API_KEY`
- `SES_FROM_ADDRESS`
- `APP_BASE_URL`

The server exits `[FATAL]` if:
- `API_KEY` is missing
- `DATABASE_URL` is missing (validated at DB client module load)
- `ADMIN_PASSWORD` is missing AND no admin accounts exist in the database
