FROM node:22-slim

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Create workspace and app dirs
RUN mkdir -p /workspace /app

WORKDIR /app

# Copy server files and install server dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY server.js ./
COPY CLAUDE.md /workspace/CLAUDE.md

# Build Vite client
COPY client/ ./client/
RUN npm run build

EXPOSE 3456

COPY claude-settings.json /claude-settings.json
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh && chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
