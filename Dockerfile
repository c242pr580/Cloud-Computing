FROM node:18.17.1
WORKDIR /app
COPY . .
RUN npm install

CMD ["npm", "run", "start:prod"]
