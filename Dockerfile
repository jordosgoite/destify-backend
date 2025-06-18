# Use the official Node.js 18 LTS image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port the NestJS application listens on
EXPOSE 3000

# Command to run the application
CMD [ "node", "dist/main" ]
