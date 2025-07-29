FROM node:lts-alpine3.21 AS build
ARG NUXT_PUBLIC_COMMIT_HASH
ENV NUXT_PUBLIC_COMMIT_HASH=${NUXT_PUBLIC_COMMIT_HASH}
WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache python3 py3-pip make g++ curl unzip rclone
RUN npm install
RUN npm run build

FROM nginx:1.29.0-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
