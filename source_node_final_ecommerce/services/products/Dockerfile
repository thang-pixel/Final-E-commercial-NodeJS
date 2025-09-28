FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# ENV NODE_ENV=production
# Giữ môi trường development để dùng nodemon
ENV NODE_ENV=development
RUN npm install
COPY . .
# CMD ["node", "server.js"]
CMD [ "npm", "run", "dev" ]
