pipeline {
  agent any

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
  }

  post {
    success {
      echo "✅ Change detection & version reading completed successfully."
    }
    failure {
      echo "❌ Pipeline failed during execution."
    }
  }
}
