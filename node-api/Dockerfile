FROM node:18-alpine
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy your source code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Expose your API port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["node", "./src/api.js"]
