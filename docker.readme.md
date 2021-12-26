[toc]

# docker for nodejs

## build images

### Create a Dockerfile for Node.js

```bash
# syntax=docker/dockerfile:1

FROM node:12.18.1
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "server.js" ]
```

### Create a .dockerignore file

```bash
node_modules
```

### Build image

```sh
docker build --tag node-docker .
```

### View local images

```sh
docker images
```

### Tag images

```sh
docker tag node-docker:latest node-docker:v1.0.0

docker rmi node-docker:v1.0.0
```

## run image as a container

```sh
docker run node-docker
# test
curl --request POST \
  --url http://localhost:8000/test \
  --header 'content-type: application/json' \
  --data '{"msg": "testing"}'
```

```sh
# run docker image
docker run --publish 8000:8000 node-docker
```

```sh
# Run in detached mode
docker run --detach --publish 8000:8000 node-docker
# List containers
docker ps
# stop docker
docker stop <docker-name>/<docker-tag>
# list containers whether they are stopped or started
docker ps -a
# restart docker images
docker restart <docker-name>/<docker-tag>
# remove docker images
docker rm <docker-name1> <docker-name2> <docker-name3>
# -d 释放终端 -p 映射网络端口 --name 修改语义化 image 名称
docker run -d -p 8000:8000 --name rest-server node-docker
```

## use containers for development

### loal database and containers

```sh
# 创建mongodb 的 data 目录 和 config 目录
docker volume create mongodb
docker volume create mongodb_config
# 建立网络
docker network create mongodb
# dockerHub 拉取并运行 mongodb 镜像
docker run -it --rm -d -v mongodb:/data/db \
  -v mongodb_config:/data/configdb -p 27017:27017 \
  --network mongodb \
  --name mongodb \
  mongo
```

### 添加 database 后，修改服务源码并手动启动 doker

第一步：修改服务源码

```js
const ronin = require("ronin-server");
const mocks = require("ronin-mocks");
const database = require("ronin-database");
const server = ronin.server();

database.connect(process.env.CONNECTIONSTRING);
server.use("/", mocks.server(server.Router(), false, false));
server.start();
```

```js
// 第二步： 装 nodejs 依赖包
npm install ronin-database
// 第三步： 重新打镜像
docker build --tag node-docker .
// 第四步： 重新运行docker镜像
docker run \
  -it --rm -d \
  --network mongodb \
  --name rest-server \
  -p 8000:8000 \
  -e CONNECTIONSTRING=mongodb://mongodb:27017/yoda_notes \
  node-docker
// 第五步：用curl进行网络请求测试
curl --request POST \
  --url http://localhost:8000/notes \
  --header 'content-type: application/json' \
  --data '{"name": "this is a note", "text": "this is a note that I wanted to take while I was working on writing a blog post.", "owner": "peter"}'
```

### 用 compose file 简化上面的步骤

第一步：创建 docker-compose.dev.yml 这个文件，这个文件可以简化 docker run 后面的参数

```yml
version: "3.8"

services:
  notes:
    build:
      context: .
    ports:
      - 8000:8000
      - 9229:9229
    environment:
      - SERVER_PORT=8000
      - CONNECTIONSTRING=mongodb://mongo:27017/notes
    volumes:
      - ./:/app
    command: npm run debug

  mongo:
    image: mongo:4.2.8
    ports:
      - 27017:27017
    volumes:
      - mongodb:/data/db
      - mongodb_config:/data/configdb
volumes:
  mongodb:
  mongodb_config:
```

第二步： 接着在 package.json 文件 的 script 里面添加

```sh
"debug": "nodemon --inspect=0.0.0.0:9229 server.js"
```

第三步： docker-compose 启动 docker 镜像

```sh
docker-compose -f docker-compose.dev.yml up --build
```

第四步： curl 测试

```sh
url --request GET --url http://localhost:8000/notes
```

### 连接到 debugger

第一步： 浏览器打开 about:inspect

第二步： open dedicated devtools for node

第三步： 添加本地源码 file 到浏览器中，并在指定位置打上断点

第四步： curl 测试

```sh
curl --request GET --url http://localhost:8000/foo
```

## run tests

```sh
mkdir -p test


```

./test/test.js

```js
var assert = require("assert");
describe("Array", function () {
  describe("#indexOf()", function () {
    it("should return -1 when the value is not present", function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
```

```sh
docker-compose -f docker-compose.dev.yml up --build
```

```sh
curl --request POST \
  --url http://localhost:8000/test \
  --header 'content-type: application/json' \
  --data '{"msg": "testing"}'


curl http://localhost:8000/test
```

### Install Mocha

```sh
npm install --save-dev mocha
```

Update package.json and Dockerfile to run tests

```json
"scripts": {
  "test": "mocha ./**/*.js",
  "start": "nodemon --inspect=0.0.0.0:9229 server.js"
},
```

run docker test

```sh
docker-compose -f docker-compose.dev.yml run notes npm run test
```

### Multi-stage Dockerfile for testing

Dockerfile

```sh
# syntax=docker/dockerfile:1
FROM node:14.15.4 as base

WORKDIR /code

COPY package.json package.json
COPY package-lock.json package-lock.json

FROM base as test
RUN npm ci
COPY . .
CMD [ "npm", "run", "test" ]

FROM base as prod
RUN npm ci --production
COPY . .
CMD [ "node", "server.js" ]
```

build for test

```sh
docker build -t node-docker --target test .
```

## Configure CI/CD

[参考链接](https://docs.docker.com/language/nodejs/configure-ci-cd/)

## Deploy app

[参考链接](https://docs.docker.com/language/nodejs/deploy/)

### Docker and Azure ACI

### DOker and AWS ECS

### Kubernetes
