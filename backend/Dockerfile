## stage 1
FROM node:18-alpine

WORKDIR /home/training-video-generator-backend
COPY package*.json ./
COPY tsconfig.json ./
COPY ./ ./

RUN npm install
RUN npm run build

## stage 2
FROM node:18-alpine

WORKDIR /home/training-video-generator-backend

COPY package*.json ./

RUN npm install --only=production

COPY --from=0 /home/training-video-generator-backend/dist .

COPY serviceAccountKey.json ./

COPY assets ./assets

RUN mkdir /home/training-video-generator-backend/temp

RUN apk add --no-cache ffmpeg

CMD [ "node", "./lib/index.js" ]