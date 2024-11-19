FROM node:20.18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

#CMD [ "node", "dist/main.js" ]
CMD [ "npm", "run", "start" ]
