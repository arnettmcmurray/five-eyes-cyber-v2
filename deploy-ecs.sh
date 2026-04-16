#!/bin/bash
set -euo pipefail

: "${AWS_REGION:=us-east-1}"
: "${ECS_EXECUTION_ROLE_ARN:?Set ECS_EXECUTION_ROLE_ARN}"
: "${ECS_TASK_ROLE_ARN:?Set ECS_TASK_ROLE_ARN}"
: "${ECR_IMAGE_URI:?Set ECR_IMAGE_URI}"
: "${DATABASE_URL_SECRET_ARN:?Set DATABASE_URL_SECRET_ARN}"
: "${API_KEY_SECRET_ARN:?Set API_KEY_SECRET_ARN}"
: "${ADMIN_PASSWORD_SECRET_ARN:?Set ADMIN_PASSWORD_SECRET_ARN}"
: "${OPENAI_API_KEY_SECRET_ARN:?Set OPENAI_API_KEY_SECRET_ARN}"
: "${SES_FROM_ADDRESS_SECRET_ARN:?Set SES_FROM_ADDRESS_SECRET_ARN}"
: "${CORS_ORIGIN:?Set CORS_ORIGIN}"
: "${APP_BASE_URL:?Set APP_BASE_URL}"

aws logs create-log-group --log-group-name /five-eyes/backend --region "${AWS_REGION}" >/dev/null 2>&1 || true

cat <<JSON > task-def.json
{
  "family": "five-eyes-backend",
  "executionRoleArn": "${ECS_EXECUTION_ROLE_ARN}",
  "taskRoleArn": "${ECS_TASK_ROLE_ARN}",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "${ECR_IMAGE_URI}",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "PORT", "value": "3001"},
        {"name": "AWS_REGION", "value": "${AWS_REGION}"},
        {"name": "TRUST_PROXY", "value": "1"},
        {"name": "DB_SSL", "value": "true"},
        {"name": "CORS_ORIGIN", "value": "${CORS_ORIGIN}"},
        {"name": "APP_BASE_URL", "value": "${APP_BASE_URL}"}
      ],
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "${DATABASE_URL_SECRET_ARN}"},
        {"name": "API_KEY", "valueFrom": "${API_KEY_SECRET_ARN}"},
        {"name": "ADMIN_PASSWORD", "valueFrom": "${ADMIN_PASSWORD_SECRET_ARN}"},
        {"name": "OPENAI_API_KEY", "valueFrom": "${OPENAI_API_KEY_SECRET_ARN}"},
        {"name": "SES_FROM_ADDRESS", "valueFrom": "${SES_FROM_ADDRESS_SECRET_ARN}"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/five-eyes/backend",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -qO- http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 15
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024"
}
JSON

aws ecs register-task-definition --cli-input-json file://task-def.json > /dev/null
echo "Task Definition registered successfully!"
