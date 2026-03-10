FROM node:22-slim

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Create workspace and app dirs
RUN mkdir -p /workspace /app

WORKDIR /app

# Copy server files
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY server.js ./
COPY public/ ./public/
COPY CLAUDE.md /workspace/CLAUDE.md

EXPOSE 3456

COPY claude-settings.json /claude-settings.json
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh && chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
