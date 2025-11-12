pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        FRONTEND_IMAGE = "nareshgundavelli/simple-react:frontend"
        BACKEND_IMAGE = "nareshgundavelli/simple-react:backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Nareshgundavelli/kubernetes-.git'
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        script {
                            sh 'docker build -t $FRONTEND_IMAGE -f frontend/Dockerfile ./frontend'
                        }
                    }
                }

                stage('Build Backend') {
                    steps {
                        script {
                            sh 'docker build -t $BACKEND_IMAGE -f backend/Dockerfile ./backend'
                        }
                    }
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                        sh 'echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin'
                    }
                }
            }
        }

        stage('Push Docker Images') {
            parallel {
                stage('Push Frontend') {
                    steps {
                        script {
                            sh 'docker push $FRONTEND_IMAGE'
                        }
                    }
                }

                stage('Push Backend') {
                    steps {
                        script {
                            sh 'docker push $BACKEND_IMAGE'
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Both frontend and backend images have been successfully built and pushed!"
        }
        failure {
            echo "❌ Pipeline failed. Check the Jenkins logs for details."
        }
    }
}
