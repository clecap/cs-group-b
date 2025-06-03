FROM node:24

WORKDIR /usr/src/app

COPY ./package*.json ./

# install the needed dependencies
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
