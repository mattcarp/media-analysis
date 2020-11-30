# builder image
FROM node:12.18.4 as builder

# directory of the app
RUN mkdir -p /media-analysis

# set newly created directory as a working directory
WORKDIR /media-analysis

# copy both package.json & package-lock.json
COPY package.json .
COPY package-lock.json .

# install node modules
RUN npm install

# copy rest of the files
COPY . .

# build both apps
RUN npm run build:all

# main image
FROM node:alpine

RUN apk add  --no-cache ffmpeg

# directory of the app
RUN mkdir -p /media-analysis

# set newly created directory as a working directory
WORKDIR /media-analysis

# copy files that will be served by node
COPY --from=builder /media-analysis /media-analysis

EXPOSE 3000
CMD [ "node", "/media-analysis/dist/apps/backend/main.js" ]
