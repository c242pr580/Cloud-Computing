FROM node:18.17.1

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 8080

CMD ["npm", "run", "start:prod"]