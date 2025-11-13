pipeline {
  agent any
  
  environment {
    FRONTEND_SERVICE = 'frontend'
    BACKEND_SERVICE  = 'backend'
    DOCKER_REPO      = 'nareshgundavelli/simple-react'
    DOCKER_CRED_ID   = 'dockerhub-credentials'
    APP_VERSION      = '1.0.0' // temporary, override if needed
    FRONTEND_CHANGED = 'true'
    BACKEND_CHANGED  = 'true'
  }

  stages {
    stage('Checkout Source') {
      steps {
        echo "🔄 Checking out main branch..."
        git branch: 'main', url: 'https://github.com/Nareshgundavelli/kubernetes-.git'
      }
    }

    stage('Detect Changes & Read Version') {
      steps {
        script {
          echo "🔍 Detecting changes and reading version..."

          // Detect changed folders
          def frontendChanged = sh(script: "git diff --name-only HEAD~1 HEAD | grep '^frontend/' || true", returnStdout: true).trim()
          def backendChanged  = sh(script: "git diff --name-only HEAD~1 HEAD | grep '^backend/' || true", returnStdout: true).trim()

          // Set environment variables
          env.FRONTEND_CHANGED = frontendChanged ? "true" : "false"
          env.BACKEND_CHANGED  = backendChanged ? "true" : "false"

          // Read version from package.json
          def pkg = readJSON file: 'frontend/package.json'
          env.APP_VERSION = pkg.version

          // Print summary
          echo "📦 Frontend changed: ${env.FRONTEND_CHANGED}"
          echo "📦 Backend changed: ${env.BACKEND_CHANGED}"
          echo "📦 Application version: ${env.APP_VERSION}"
        }
      }
    }
  



    stage('Build & Push Docker Images') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh '''
              echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

              if [ "${FRONTEND_CHANGED}" = "true" ]; then
                echo "🚀 Building Frontend image..."
                docker build -t ${DOCKER_REPO}:frontend-${APP_VERSION} ./frontend
                docker push ${DOCKER_REPO}:frontend-${APP_VERSION}
              fi

              if [ "${BACKEND_CHANGED}" = "true" ]; then
                echo "🚀 Building Backend image..."
                docker build -t ${DOCKER_REPO}:backend-${APP_VERSION} ./backend
                docker push ${DOCKER_REPO}:backend-${APP_VERSION}
              fi

              docker logout
            '''
          }
        }
      }
    }
  }

  post {
    success { echo "✅ Docker images built and pushed." }
    failure { echo "❌ Docker build stage failed." }
  }
}
