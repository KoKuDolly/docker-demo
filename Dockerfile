# syntax=docker/dockerfile:experimental

FROM node:14.15.1 as base

WORKDIR /app

# ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]

FROM base as test
RUN npm ci
COPY . .
# CMD ["npm", "run", "test"]
RUN npm run test

FROM base as prod
RUN npm ci --production
COPY . .
CMD ["node", "server.js"]