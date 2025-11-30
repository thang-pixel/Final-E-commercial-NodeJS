# Stage 1: development
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "start"]   
# React dev server (hot reload)

# Stage 2: build React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 3: production (serve bằng Nginx)
FROM nginx:alpine AS prod
WORKDIR /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built React app từ stage build
COPY --from=build /app/build .   

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]