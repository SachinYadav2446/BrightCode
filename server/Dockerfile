# Use a Node base image that includes build tools for native modules like node-pty
FROM node:20

# Set the working directory
WORKDIR /app

# Install build dependencies for node-pty and JDK for Java compilation
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create temp directory for java execution if it doesn't exist
RUN mkdir -p temp_exec

# Expose the port the app runs on
EXPOSE 5051

# Start the application
CMD ["npm", "start"]
