FROM node:14-alpine as builder

ADD package.json package-lock.json /code/

RUN yarn

WORKDIR code

ADD . /code

CMD node index.js

EXPOSE 3000

#FROM nginx:alpine
#
#COPY nginx.conf /etc/nginx/conf.d/default.conf