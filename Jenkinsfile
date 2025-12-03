pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = "devsujal"  // Change this
        IMAGE_NAME = "url-shortner"  // Change this
        AWS_REGION = "ap-south-1"  // Change to your region
        ASG_NAME = "url-shortner-asg"
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
	VITE_API_URL=credentials('lb-url')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Build with commit hash as tag
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
                    sh "docker build --build-arg VITE_API_URL=${VITE_API_URL} -t ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} ."
                    sh "docker tag ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest"
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                script {
                    sh "echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin"
                    sh "docker push ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest"
                }
            }
        }
        
        stage('Deploy to ASG') {
            steps {
                script {
                    sh """
                        export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                        export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                        export AWS_DEFAULT_REGION=${AWS_REGION}
                        
                        chmod +x scripts/deploy-to-asg.sh
                        ./scripts/deploy-to-asg.sh ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    sh """
                        export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                        export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                        export AWS_DEFAULT_REGION=${AWS_REGION}
                        
                        aws elbv2 describe-target-health \
                            --target-group-arn \$(aws elbv2 describe-target-groups \
                                --names app-target-group \
                                --query 'TargetGroups[0].TargetGroupArn' \
                                --output text) \
                            --query 'TargetHealthDescriptions[*].[Target.Id,TargetHealth.State]' \
                            --output table
                    """
                }
            }
        }
    }
    
    post {
        always {
	    sh 'docker system prune -af'
            sh 'docker logout'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
