# Stage 1: development
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Stage 2: production
FROM node:20-alpine AS prod
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=production
RUN npm install --omit=dev
COPY . .
CMD ["node", "src/server.js"]
