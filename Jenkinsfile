pipeline {
  agent any

  stages {
    stage('Checkout Source') {
      steps {
        echo "🔄 Checking out main branch..."
        git branch: 'main', url: 'https://github.com/Nareshgundavelli/kubernetes-.git'
      }
    }
  }

  post {
    success { echo "✅ Checkout completed." }
    failure { echo "❌ Checkout failed." }
  }
}
pipeline {
  agent any

  stages {
    stage('Detect Changes & Read Version') {
      steps {
        script {
          def frontendChanged = sh(script: "git diff --name-only HEAD~1 HEAD | grep '^frontend/' || true", returnStdout: true).trim()
          def backendChanged  = sh(script: "git diff --name-only HEAD~1 HEAD | grep '^backend/' || true", returnStdout: true).trim()

          env.FRONTEND_CHANGED = frontendChanged ? "true" : "false"
          env.BACKEND_CHANGED  = backendChanged ? "true" : "false"

          def pkg = readJSON file: 'frontend/package.json'
          env.APP_VERSION = pkg.version

          echo "📦 Frontend changed: ${env.FRONTEND_CHANGED}"
          echo "📦 Backend changed: ${env.BACKEND_CHANGED}"
          echo "📦 Application version: ${env.APP_VERSION}"
        }
      }
    }
  }

  post {
    success { echo "✅ Change detection & version reading completed." }
    failure { echo "❌ Stage failed." }
  }
}

