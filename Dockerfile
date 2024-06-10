FROM node:21
WORKDIR /app
COPY . /app
RUN yarn
CMD yarn start:dev