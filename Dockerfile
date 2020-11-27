FROM node:12.18.4

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

EXPOSE 3000
CMD [ "node", "/media-analysis/dist/apps/backend/main.js" ]
