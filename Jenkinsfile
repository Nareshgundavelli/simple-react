pipeline {
    agent any

    environment {
        DOCKER_REPO      = 'nareshgundavelli/simple-react'
        DOCKER_CRED_ID   = 'dockerhub-credentials'

        K8S_MANIFEST_DIR = 'k8s'

        GIT_CRED_ID      = 'git_access_cred'
        GIT_USER_NAME    = 'Nareshgundavelli'
        GIT_USER_EMAIL   = 'nareshgundavelli09@gmail.com'

        ARGOCD_SERVER    = 'http://localhost:9090'
        ARGOCD_APP_NAME  = 'simple-react'
        ARGOCD_TOKEN_ID  = 'argocd-token'
    }

    stages {

        /**********************
         CHECKOUT SOURCE
        ***********************/
        stage('Checkout Source') {
            steps {
                echo "🔄 Checking out repository..."
                git branch: 'main', url: 'https://github.com/Nareshgundavelli/simple-react.git'
            }
        }

        /**********************
         DETECT CHANGES + VERSION
        ***********************/
        stage('Detect Changes & Version') {
            steps {
                script {
                    sh "git rev-parse HEAD~1 || true"

                    def diff = sh(
                        script: "git diff --name-only HEAD~1 HEAD || true",
                        returnStdout: true
                    ).trim()

                    echo "Changed files:\n${diff}"

                    env.FRONTEND_CHANGED = diff.contains("frontend/") ? "true" : "false"
                    env.BACKEND_CHANGED  = diff.contains("backend/")  ? "true" : "false"

                    def pkg = readJSON file: 'frontend/package.json'
                    env.APP_VERSION = pkg.version

                    echo "Frontend changed: ${env.FRONTEND_CHANGED}"
                    echo "Backend changed:  ${env.BACKEND_CHANGED}"
                    echo "App version:      ${env.APP_VERSION}"
                }
            }
        }

        /**********************
         VERIFY DOCKER ACCESS
        ***********************/
        // stage('Verify Docker Access') {
        //     steps {
        //         sh '''
        //             export PATH=/usr/bin:/usr/local/bin:$PATH

        //             echo "🧪 Checking Docker..."
        //             which docker
        //             docker --version

        //             echo "🧪 Checking socket..."
        //             ls -l /var/run/docker.sock || true

        //             echo "🧪 Checking docker ps..."
        //             docker ps || true
        //         '''
        //     }
        // }

        /**********************
         BUILD & PUSH IMAGES
        ***********************/
        stage('Build & Push Docker Images') {
            when { expression { env.FRONTEND_CHANGED == "true" || env.BACKEND_CHANGED == "true" } }
            steps {
                script {

                    withCredentials([usernamePassword(
                        credentialsId: env.DOCKER_CRED_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {

                        sh '''
                            export PATH=/usr/bin:/usr/local/bin:$PATH

                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                            if [ "$FRONTEND_CHANGED" = "true" ]; then
                                echo "🚀 Building FRONTEND image..."
                                docker build -t ${DOCKER_REPO}:frontend-${APP_VERSION} ./frontend
                                docker push ${DOCKER_REPO}:frontend-${APP_VERSION}
                            fi

                            if [ "$BACKEND_CHANGED" = "true" ]; then
                                echo "🚀 Building BACKEND image..."
                                docker build -t ${DOCKER_REPO}:backend-${APP_VERSION} ./backend
                                docker push ${DOCKER_REPO}:backend-${APP_VERSION}
                            fi

                            docker logout
                        '''
                    }
                }
            }
        }

        /**********************
         UPDATE K8S MANIFESTS
        ***********************/
        stage('Update K8s Manifests') {
            when { expression { env.FRONTEND_CHANGED == "true" || env.BACKEND_CHANGED == "true" } }
            steps {
                script {
                    if (env.FRONTEND_CHANGED == "true") {
                        sh """
                            yq e -i '.spec.template.spec.containers[0].image = "${DOCKER_REPO}:frontend-${APP_VERSION}"' \
                               ${K8S_MANIFEST_DIR}/frontend-deployment.yaml
                        """
                    }

                    if (env.BACKEND_CHANGED == "true") {
                        sh """
                            yq e -i '.spec.template.spec.containers[0].image = "${DOCKER_REPO}:backend-${APP_VERSION}"' \
                               ${K8S_MANIFEST_DIR}/backend-deployment.yaml
                        """
                    }

                    withCredentials([usernamePassword(
                        credentialsId: env.GIT_CRED_ID,
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )]) {

                        sh '''
                            git config user.name "$GIT_USER_NAME"
                            git config user.email "$GIT_USER_EMAIL"

                            git add k8s/*.yaml
                            git commit -m "Update images to v${APP_VERSION}" || echo "No changes to commit"
                            git push https://$GIT_USER:$GIT_PASS@github.com/Nareshgundavelli/simple-react.git main
                        '''
                    }
                }
            }
        }

        /**********************
         ArgoCD DEPLOYMENT
        ***********************/
        stage('Deploy via ArgoCD') {
            steps {
                withCredentials([string(credentialsId: env.ARGOCD_TOKEN_ID, variable: 'ARGO_TOKEN')]) {
                    sh '''
                        echo "🔐 Logging into ArgoCD..."

                        argocd login $ARGOCD_SERVER --grpc-web \
                            --username admin --password "$ARGO_TOKEN" --insecure || true

                        echo "🚀 Syncing application..."
                        argocd app sync $ARGOCD_APP_NAME \
                            --server $ARGOCD_SERVER --grpc-web \
                            --auth-token "$ARGO_TOKEN" --insecure || true

                        echo "⏳ Waiting for healthy state..."
                        argocd app wait $ARGOCD_APP_NAME \
                            --server $ARGOCD_SERVER --grpc-web \
                            --auth-token "$ARGO_TOKEN" \
                            --insecure --health --timeout 300 || true
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
