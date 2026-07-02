pipeline {
    agent any

    environment {
        IMAGE_NAME = "tasklist-frontend"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Install & Test') {
            steps {
                sh 'npm ci'
                sh 'npm run test:coverage'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Trivy Scan') {
            steps {
                sh """
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v trivy-cache:/root/.cache/ \
                        aquasec/trivy:latest image \
                        --severity CRITICAL,HIGH \
                        --ignore-unfixed \
                        --exit-code 1 \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }
    }
}
