#!/bin/bash

# Configuration
ASG_NAME="url-shortner-asg"
REGION="ap-south-1"  # Change to your region
DOCKER_IMAGE="$1"
MAX_WAIT_TIME=600  # 10 minutes

echo "Starting deployment to ASG: $ASG_NAME"
echo "Docker Image: $DOCKER_IMAGE"

# Get list of instance IDs in ASG
INSTANCE_IDS=$(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names $ASG_NAME \
    --region $REGION \
    --query 'AutoScalingGroups[0].Instances[?HealthStatus==`Healthy`].InstanceId' \
    --output text)

if [ -z "$INSTANCE_IDS" ]; then
    echo "No healthy instances found in ASG"
    exit 1
fi

echo "Found instances: $INSTANCE_IDS"

# Deploy to each instance
for INSTANCE_ID in $INSTANCE_IDS; do
    echo "Deploying to instance: $INSTANCE_ID"
    
    # Send command via SSM
    COMMAND_ID=$(aws ssm send-command \
        --document-name "AWS-RunShellScript" \
        --instance-ids "$INSTANCE_ID" \
        --parameters "commands=[
            'docker pull $DOCKER_IMAGE',
            'docker stop myapp || true',
            'docker rm myapp || true',
            'docker run -d -p 80:3000 --name myapp --restart unless-stopped $DOCKER_IMAGE',
            'docker system prune -af'
        ]" \
        --region $REGION \
        --query 'Command.CommandId' \
        --output text)
    
    echo "Command sent: $COMMAND_ID"
    
    # Wait for command to complete
    sleep 5
    
    # Check status
    STATUS=$(aws ssm get-command-invocation \
        --command-id "$COMMAND_ID" \
        --instance-id "$INSTANCE_ID" \
        --region $REGION \
        --query 'Status' \
        --output text)
    
    echo "Deployment status for $INSTANCE_ID: $STATUS"
done

echo "Deployment completed successfully!"
