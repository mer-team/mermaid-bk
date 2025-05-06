FROM node:14-alpine

WORKDIR /app

COPY package*.json .
COPY dummy-service.js .

RUN npm install amqplib
RUN npm install --verbose

CMD ["node", "dummy-manager.js"]
