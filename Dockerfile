FROM node:18.17.1-alpine

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package*.json ./
COPY mydatashare-core-*.tgz ./
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
