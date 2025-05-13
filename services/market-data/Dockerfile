FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Create log directory
RUN mkdir -p logs

# Copy application code
COPY . .

# Expose port
EXPOSE 8004

# Start the application
CMD ["npm", "run", "dev"] 