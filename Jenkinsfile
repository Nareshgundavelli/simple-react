pipeline {
    agent any  // Using custom Jenkins image with Docker CLI or Docker socket mounted

    environment {
        DOCKER_REPO      = 'nareshgundavelli/simple-react'
        DOCKER_CRED_ID   = 'dockerhub-credentials'
        K8S_MANIFEST_DIR = 'k8s'
        GIT_CRED_ID      = 'git_access_cred'
        GIT_USER_NAME    = 'Nareshgundavelli'
        GIT_USER_EMAIL   = 'nareshgundavelli09@gmail.com'
        ARGOCD_SERVER    = 'http://localhost:30210'
        ARGOCD_APP_NAME  = 'simple-react'
        ARGOCD_TOKEN_ID  = 'argocd-token'
        FRONTEND_SERVICE = 'frontend'
        BACKEND_SERVICE  = 'backend'
    }

    stages {

        stage('Ensure Docker CLI') {
            steps {
                script {
                    def dockerExists = sh(script: 'which docker || true', returnStdout: true).trim()
                    if (!dockerExists) {
                        echo "Docker CLI not found. Installing..."
                        sh '''
                            apt-get update && \
                            apt-get install -y docker.io curl bash && \
                            docker --version
                        '''
                    } else {
                        echo "Docker CLI is already installed"
                    }
                }
            }
        }

        stage('Checkout Source') {
            steps {
                echo "🔄 Checking out main branch..."
                git branch: 'main', url: 'https://github.com/Nareshgundavelli/simple-react.git'
            }
        }

        stage('Detect Changes & Read Version') {
            steps {
                script {
                    def frontendChanged = sh(script: "git diff --name-only HEAD~1 HEAD | grep '^frontend/' || true", returnStdout: true).trim()
                    def backendChanged  = sh(script: "git diff --name-only HEAD~1 HEAD | grep '^backend/' || true", returnStdout: true).trim()
                    env.FRONTEND_CHANGED = frontendChanged ? "true" : "false"
                    env.BACKEND_CHANGED  = backendChanged ? "true" : "false"
                    def pkg = readJSON file: 'frontend/package.json'
                    env.APP_VERSION = pkg.version
                }
            }
        }

        stage('Build & Push Docker Images') {
            when { expression { env.FRONTEND_CHANGED == "true" || env.BACKEND_CHANGED == "true" } }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            
                            if [ "$FRONTEND_CHANGED" = "true" ]; then
                                docker build -t ${DOCKER_REPO}:frontend-${APP_VERSION} ./frontend
                                docker push ${DOCKER_REPO}:frontend-${APP_VERSION}
                            fi

                            if [ "$BACKEND_CHANGED" = "true" ]; then
                                docker build -t ${DOCKER_REPO}:backend-${APP_VERSION} ./backend
                                docker push ${DOCKER_REPO}:backend-${APP_VERSION}
                            fi

                            docker logout
                        '''
                    }
                }
            }
        }

        stage('Update K8s Manifests') {
            steps {
                script {
                    if (env.FRONTEND_CHANGED == "true") {
                        sh "yq e -i '.spec.template.spec.containers[0].image = \"${DOCKER_REPO}:frontend-${APP_VERSION}\"' ${K8S_MANIFEST_DIR}/frontend-deployment.yaml"
                    }
                    if (env.BACKEND_CHANGED == "true") {
                        sh "yq e -i '.spec.template.spec.containers[0].image = \"${DOCKER_REPO}:backend-${APP_VERSION}\"' ${K8S_MANIFEST_DIR}/backend-deployment.yaml"
                    }

                    withCredentials([usernamePassword(credentialsId: env.GIT_CRED_ID, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh '''
                            git config user.name "$GIT_USER_NAME"
                            git config user.email "$GIT_USER_EMAIL"
                            git add ${K8S_MANIFEST_DIR}/*.yaml
                            git commit -m "chore: update images to v${APP_VERSION}" || echo "No changes to commit"
                            git push https://$GIT_USER:$GIT_PASS@github.com/Nareshgundavelli/simple-react.git main
                        '''
                    }
                }
            }
        }

        stage('Deploy via ArgoCD') {
            steps {
                withCredentials([string(credentialsId: env.ARGOCD_TOKEN_ID, variable: 'ARGO_TOKEN')]) {
                    sh '''
                        argocd login $ARGOCD_SERVER --grpc-web --username admin --password "$ARGO_TOKEN" --insecure || true
                        argocd app sync $ARGOCD_APP_NAME --server $ARGOCD_SERVER --grpc-web --auth-token "$ARGO_TOKEN" --insecure || true
                        argocd app wait $ARGOCD_APP_NAME --server $ARGOCD_SERVER --grpc-web --auth-token "$ARGO_TOKEN" --insecure --health --timeout 300 || true
                    '''
                }
            }
        }

    }

    post {
        success { echo "✅ Pipeline completed successfully." }
        failure { echo "❌ Pipeline failed." }
    }
}
