FROM jenkins/jenkins:lts

USER root

# Install Docker CLI, curl, git, python3-pip, yq, and ArgoCD CLI
RUN apt-get update && \
    apt-get install -y docker.io curl git python3-pip bash && \
    pip3 install yq && \
    curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64 && \
    chmod +x /usr/local/bin/argocd && \
    # Add jenkins user to docker group
    usermod -aG docker jenkins && \
    rm -rf /var/lib/apt/lists/*

USER jenkins

# Optional: verify docker CLI
RUN docker --version || true
