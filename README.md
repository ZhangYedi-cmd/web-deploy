# 前端工程部署

## 极简部署

### 手撕最简单的静态资源服务器

正如每个初学编程的小白一样，我们这次只部署一个最简单的HTML，不需要CSS/JS代码

使用node编写一个静态资源服务器，这里需要使用到node的http库。

```js
const http = require('http') // 引入http库
// 返回的响应体内容
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>
  hello, ZYD. 
</body>
</html>`

const server = http.createServer((req, res) => res.end(html))
// 将服务启动在3000端口
server.listen(3000, () => {
    console.log('Listening 3000')
})
```

### 手撕最简单的静态资源服务器：响应文件

当然，部署前端作为**纯静态资源**，需要我们使用文件系统(file system)去读取资源并将数据返回。

在代码中，html 以前以字符串形式进行维护，现在将其置于文件系统中的 `index.html` 中，并通过 nodejs 中文件系统读取文件的相关 API `fs.readFileSync('./index.html')` 进行获取文件内容，代码如下。

```js
const file = require('fs')
const html = file.readFileSync("./index.html")
```

我们将**hello 版前端应用**以文件系统的方式进行维护，并通过 `res.end()` 设置其为响应报文的响应体。最终代码如下。

```js
const file = require('fs')
const http = require('http')

const html = file.readFileSync("./index.html")

const server = http.createServer((req, res) => res.end(html))
server.listen(3000, () => {
    console.log('Listening 3000')
})
```

#### 为什么不适用我们自己写的静态资源服务器？

+ 性能较差
+ 负载均衡， 反向代理，缓存  ，重定向， 重写 ，cors
+ 需要使用IP + 端口号的形式进行部署
+ 每次使用npm run dev 的形式启动服务需要消耗大量内存及CPU性能

#### 为什么使用Docker部署服务？ 

+ 环境分离，并且不同的服务之间互不影响。 
+ 可移植性，在本地调试完代码之后，直接将容器打包部署到服务器即可。 
+ 例如我们需要不同版本的node服务，那么就需要在服务器上安装不同版本的node服务，这对开发者而言是不容易维护的。 

### Docker 部署

#### DockerFile 部署

**编写 DockerFile**

在我们的项目目录下新建DockerFile 。 

```dockerfile
# 选择一个体积小的镜像 (~5MB)
FROM node:14-alpine

# 设置为工作目录，以下 RUN/CMD 命令都是在工作目录中进行执行
WORKDIR /code

# 把宿主机的代码添加到镜像中
ADD . /code

# 安装依赖
RUN yarn

EXPOSE 3000

# 启动 Node Server
CMD npm start
```

**构建镜像**

```shell
# 构建一个名为simple-app的镜像
# -t 构建镜像的名称
$ docker build -t simple-app

# 查出所有的镜像
$ docker images 
REPOSITORY        TAG                IMAGE ID       CREATED         SIZE
simple-app        latest             b8d66309455b   9 minutes ago   133MB
```

**运行容器**

```shell
# 如果需要在后台运行则添加-d选项
# --rm 容器停止时则自动删除该容器
# -p: 3000:3000，将容器中的 3000 端口映射到宿主机的 3000 端口，左侧端口为宿主机端口，右侧为容器端口
docker run --rm -p 3000:3000 simple-app 

# 查看所有的容器
$ docker ps
```

此时在本地访问 `http://localhost:3000` 访问成功

然而，通过冗余繁琐的命令行构建镜像和容器，比如管理端口，存储、环境变量等，有其天然的劣势，不易维护。

#### Docker Compose 部署

打包镜像， 运行容器一站式服务。 

![docker-compose](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/886/docker-compose.0510d8.webp)

将命令行的选项翻译成配置文件，是更为简单且更容易维护的方式。比如对于 webpack 而言，基本上基于 `webpack.config.js` 配置文件使用。

而 `docker compose` 即可将 docker cli 的选项翻译成配置文件，除此之外，它还有更强大的功能。

编辑 `docker-compose.yaml` 配置文件如下所示。当然，由于这是一个最简项目，因此配置文件也极其简单。

```yaml
version: "3"
services:
  app:
    # build: 从当前路径构建镜像
    build: .
    ports:
      - 3000:3000
```

配置结束之后，即可通过一行命令 `docker-compose up` 替代以前关于构建及运行容器的所有命令。

```bash
# up: 创建并启动容器
# --build: 每次启动容器前构建镜像
$ docker-compose up --build
```

此时在本地访问 `http://localhost:3000` 访问成功

此时，通过 `docker`/`docker-compose` 便部署成功了第一个前端应用。