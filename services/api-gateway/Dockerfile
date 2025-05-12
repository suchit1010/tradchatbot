FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Create log directory
RUN mkdir -p logs

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "run", "dev"] 