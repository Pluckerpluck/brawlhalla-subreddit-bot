FROM node:6.3.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
# RUN npm install
COPY . /usr/src/app

RUN npm install

CMD [ "npm", "start" ]
