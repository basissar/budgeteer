FROM node:18

WORKDIR /app

# Copy only the package files first to leverage Docker caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install


# Copy all frontend files
COPY . .

# Expose the frontend dev server port
EXPOSE 3000

# Default command (overridden by docker-compose.yml)
CMD ["npm", "run", "dev"]
