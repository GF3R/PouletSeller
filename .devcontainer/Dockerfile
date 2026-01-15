# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ARG NODE_VERSION=20.19.6
ARG DOTNET_SDK_VERSION=10.0.101
ARG ANGULAR_CLI_VERSION=19

ENV DEBIAN_FRONTEND=noninteractive

# ---- Base tools ----
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git unzip xz-utils \
  && rm -rf /var/lib/apt/lists/*

# ---- Fix Ubuntu 24.04 devcontainer UID issue (optional but recommended) ----
# On ubuntu-24.04 base images, an "ubuntu" user can occupy UID 1000 and vscode becomes 1001.
# This can cause permission issues on bind mounts. Workaround: remove ubuntu user and move vscode to 1000.
RUN if id -u ubuntu >/dev/null 2>&1; then userdel -r ubuntu || true; fi \
 && if id -u vscode >/dev/null 2>&1; then \
      groupmod -g 1000 vscode || true; \
      usermod  -u 1000 -g 1000 vscode || true; \
    fi

# ---- Node.js (pinned, arm64-friendly) ----
# Angular 19 supports Node 18.19.1+, 20.11.1+, or 22.0.0+; we pin Node 20.19.6 LTS. :contentReference[oaicite:3]{index=3}
RUN ARCH="$(dpkg --print-architecture)" \
 && case "$ARCH" in \
      amd64) NODE_DIST="linux-x64" ;; \
      arm64) NODE_DIST="linux-arm64" ;; \
      *) echo "Unsupported arch: $ARCH" && exit 1 ;; \
    esac \
 && curl -fsSL "https://nodejs.org/download/release/v${NODE_VERSION}/node-v${NODE_VERSION}-${NODE_DIST}.tar.xz" -o /tmp/node.tar.xz \
 && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
 && rm /tmp/node.tar.xz \
 && node -v && npm -v

# ---- Angular CLI ----
RUN npm install -g "@angular/cli@${ANGULAR_CLI_VERSION}" \
 && ng version

# ---- .NET 10 SDK (pinned) ----
# Use dotnet-install to pin exact SDK version.
ENV DOTNET_ROOT=/usr/share/dotnet
ENV PATH="${PATH}:${DOTNET_ROOT}:${DOTNET_ROOT}/tools"

RUN mkdir -p ${DOTNET_ROOT} \
 && curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh \
 && chmod +x /tmp/dotnet-install.sh \
 && /tmp/dotnet-install.sh --version "${DOTNET_SDK_VERSION}" --install-dir "${DOTNET_ROOT}" \
 && rm /tmp/dotnet-install.sh \
 && dotnet --info

# Make sure vscode owns its home and common tool dirs
RUN chown -R vscode:vscode /home/vscode

USER vscode
WORKDIR /workspaces