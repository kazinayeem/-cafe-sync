# Use Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the Vite app
RUN npm run build

# Expose port for preview
EXPOSE 4173

# Run Vite preview in production mode
CMD ["npm", "run", "preview", "--", "--port", "3000", "--host"]
