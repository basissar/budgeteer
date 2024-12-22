FROM denoland/deno:alpine

WORKDIR /app

# Copy all backend files
COPY . .

COPY .env.dev .env.dev

# Install dependencies
RUN deno install

# Expose the backend port (adjust if needed)
EXPOSE 8000

# Default command (overridden by docker-compose.yml)
CMD ["deno", "run", "--inspect", "--allow-all", "--env-file=.env.dev", "server.ts"]