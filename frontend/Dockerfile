FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (will be overridden by volume in docker-compose for dev)
COPY . .

# Expose Angular port
EXPOSE 4200

# Start Angular dev server
# --host 0.0.0.0 is necessary for Docker access
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
