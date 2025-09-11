# Use Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build React app
RUN npm run build

# Install serve to serve production build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve React build
CMD ["serve", "-s", "build", "-l", "3000"]
