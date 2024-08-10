FROM node:18.19.1-alpine
WORKDIR /usr/src/app

COPY ./dist ./
COPY ./package.json ./

RUN npm install

EXPOSE 3000

ENTRYPOINT ["node", "index.js"]