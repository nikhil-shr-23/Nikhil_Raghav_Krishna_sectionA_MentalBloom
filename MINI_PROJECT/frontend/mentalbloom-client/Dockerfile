FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PORT=3001
ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start", "--", "-p", "3001"]
