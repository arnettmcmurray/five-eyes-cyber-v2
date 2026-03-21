#!/bin/bash
set -e

echo "Getting OpenAI Key from .env..."
OPENAI_KEY=$(grep '^OPENAI_API_KEY=' backend/.env | cut -d '=' -f2-)

echo "Creating CloudWatch Log Group..."
aws logs create-log-group --log-group-name /ecs/five-eyes-v2-backend --region us-east-1 || true

echo "Checking execution role..."
ROLE_ARN=$(aws iam get-role --role-name ecsTaskExecutionRole --query 'Role.Arn' --output text 2>/dev/null || true)
if [ -z "$ROLE_ARN" ]; then
    echo "Creating ecsTaskExecutionRole..."
    aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Sid":"","Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}' > /dev/null
    aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    sleep 5
    ROLE_ARN=$(aws iam get-role --role-name ecsTaskExecutionRole --query 'Role.Arn' --output text)
fi

echo "Registering Task Definition..."
cat <<JSON > task-def.json
{
  "family": "five-eyes-v2-backend-task",
  "executionRoleArn": "${ROLE_ARN}",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "125140433567.dkr.ecr.us-east-1.amazonaws.com/five-eyes-v2-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "hostPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "API_KEY", "value": "dev-local-key"},
        {"name": "PORT", "value": "3001"},
        {"name": "DATABASE_URL", "value": "postgresql://postgres:five_eyes_staging_secure!@five-eyes-staging-db.ce7i0was6bvk.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"},
        {"name": "JWT_SECRET", "value": "five_eyes_jwt_staging_secret"},
        {"name": "TRUST_PROXY", "value": "1"},
        {"name": "OPENAI_API_KEY", "value": "${OPENAI_KEY}"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/five-eyes-v2-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
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
