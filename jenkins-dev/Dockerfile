FROM jenkins/jenkins:lts

USER root

# Install Docker CLI, kubectl, yq, ArgoCD CLI
RUN apt-get update && \
    apt-get install -y \
        docker.io \
        curl \
        git \
        bash \
        python3 \
        python3-pip && \
    \
    # Install YQ (binary, not pip)
    curl -sSL https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 \
        -o /usr/local/bin/yq && \
    chmod +x /usr/local/bin/yq && \
    \
    # Install ArgoCD CLI
    curl -sSL -o /usr/local/bin/argocd \
        https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64 && \
    chmod +x /usr/local/bin/argocd && \
    \
    # Install kubectl
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
    \
    # Add Jenkins to Docker group
    groupadd -f docker && \
    usermod -aG docker jenkins && \
    \
    rm -rf /var/lib/apt/lists/*

USER jenkins
