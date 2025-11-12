pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        IMAGE_NAME = "nareshgundavelli/simple-react:frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Nareshgundavelli/kubernetes-.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $IMAGE_NAME:frontend .'
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


        stage('Push to Docker Hub') {
            steps {
                script {
                    sh 'docker push $IMAGE_NAME:frontend'
                }
            }
        }
    }
}
