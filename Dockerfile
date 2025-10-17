FROM node:lts-alpine3.21

WORKDIR /usr/src/app
RUN apk add --no-cache python3 py3-pip make g++ curl unzip rclone
COPY . .
RUN npm install
