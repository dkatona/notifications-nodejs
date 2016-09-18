FROM node:4.5.0

MAINTAINER Dusan Katona

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD . /usr/src/app/
RUN npm install

#to prevent problem with sigint and pid 1, run with node instead of npm
CMD ["node", "src/consumer.js"]
