FROM node:20-alpine

# Install dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++ 

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (will be overridden by volume in docker-compose for dev)
COPY . .

# Expose NestJS port and LIS port
EXPOSE 3000
EXPOSE 5600

# Start in dev mode with hot-reload
CMD ["npm", "run", "start:dev"]
