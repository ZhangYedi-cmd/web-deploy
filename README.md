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

#### 使用Nginx镜像来配置Docker

为什么使用nginx部署前端项目？ 

+ 镜像大小， nginx：alpine 只有23MB的大小， 而node有123MB左右， 从镜像的体积上优化。 
+ 性能上的差异， node服务器自身没有实现像nginx服务器那样的负载均衡，缓存控制等一系列功能，而在Nginx中只需要开启配置即可。 非常方便。

还是以我们之前的index.html为示例。 

查看nginx配置文件： 

```nginx
server {
    listen       80;
    server_name  localhost;

    location / {  
        root   /usr/share/nginx/html; # 将请求映射到这个路径
        index  index.html index.htm;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

那么我们只需要将我们自己的index.html 放到/usr/share/nginx/html/ 即可

DockerFile

```dockerfile
FROM nginx:alpine

ADD index.html   /usr/share/nginx/html/
```

DockerCompose

```yml
version: "3"
services:
  app:
    # build: 从当前路径构建镜像
    build: .
    ports:
      - 3000:80
```

打包并运行容器

```shell
docker-compose up --build
```



## 单页部署

### docker缓存优化及多阶段构建

我们以部署一个create-react-app为示例。 

正常情况下使用docker部署：

```dockerfile
FROM node:alpine

ADD . code 

RUN yarn && npm install 

RUN yarn build 

CMD npx serve -s build

EXPOSE 3000 
```

但是这样部署的问题点就是，每次我们修改代码，就会进行一次依赖的下载，这是没有任何必要的，可以从这个角度，来从时间上优化我们构建镜像的速度。 

docker 是基于[联合文件系统](https://blog.csdn.net/weixin_45880055/article/details/118057568)的，每次执行ADD命令都会查看缓存是否可用， 如果文件内容改变，则会生成一个新的层。 

上面的Dockerfile，我们每次修改代码，直接执行ADD命令， 那么这时候docker就会判断缓存是否可用, 此时，我们已经修改了代码，docker发现缓存是不可用的，那么就会重新执行命令。 

#### 构建时间优化：构建缓存

在本地环境中，如果没有新的 npm package 需要下载，不需要重新 npm i。

 Dockerfile 中，对于 `ADD` 指令来讲，如果**添加文件内容的 `checksum` 没有发生变化，则可以利用构建缓存**。

而对于前端项目而言，如果 `package.json/yarn.lock` 文件内容没有变更，则无需再次 `npm i`。

将 `package.json/yarn.lock` 事先置于镜像中，安装依赖将可以获得缓存的优化，优化如下。

```dockerfile
FROM node:14-alpine as builder

WORKDIR /code

# 先将依赖目录转入到code目录 -- 判断这一层的文件是否和缓存相同
ADD package.json package-lock.json /code/
# 如果相同， yarn就不会执行  
RUN yarn

# 再将src下更新的代码cope到code目录下
ADD . /code
RUN yarn && npm run build # 打包
CMD npx serve -s build

EXPOSE 3000 
```

这样，如果没有新的依赖，则不会进行yarn 。 

![image-20220609232250923](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/886/image-20220609232250923.png)

#### 构建体积优化：多阶段构建

更小的镜像体积： nginx

我们的静态资源，使用node进行服务会造成大量的资源浪费。node的镜像大概有100多MB， 而nginx只有23MB。 

可以使用多阶段构建进行优化，最终使用nginx进行服务化

```dockerfile
FROM node:14-alpine as builder

WORKDIR /code

# 先将依赖目录转入到code目录 -- 判断这一层的文件是否和缓存相同
ADD package.json package-lock.json /code/
# 如果相同， yarn就不会执行
RUN yarn

# 再将src下更新的代码cope到code目录下
ADD . /code
RUN yarn && npm run build # 打包

CMD npx serve -s build

FROM nginx:alpine  # nginx 服务化
COPY --from=builder code/build /usr/share/nginx/html
```

启动服务

```yaml
version: "3"
services:
  simple:
    build:
      context: .
      dockerfile: simple.Dockerfile
    ports:
      - 4000:80
```

但是这样有一个问题点，页面刷新之后会变成404页面。 

道理也很简单，我们的react应用是通过nginx部署的，当我们点击页面上的按钮进行跳转时，是通过React-router控制的，这就不会引起404错误。 但是当我们刷新页面时，nginx会判断我们的请求，我们没有为/about路由配置访问的资源，所以会导致404错误。 

解决方法：使用try_files解决，让react-router来处理我们的请求。 

```nginx
location / {
    # 解决单页应用服务端路由的问题
    try_files  $uri $uri/ /index.html;
}
```

这个过程：请求/about时，将请求打到index.html ，让index.html来处理/about，即可实现页面的跳转。 

### nginx配置长期缓存优化

我之前部署前端项目时的nginx配置：

```nginx
 server {
        listen       80;         #默认的web访问端口
        server_name  127.0.0.1;     #服务器名
           
		location ~/imaker {
      	 	root /home/imakervue; 
    	}
    	#   静态资源代理
     	location /static {
        	 alias  /home/imakerstatic/static/;
     	}
}
```

现在回过来看，这个nginx配置中的/static没有太大的意义，单独分离出一个path去接受请求并为对系统的性能做到一定的提升。 

现在我们可以通过nginx配置http缓存来减轻服务器的压力。 

以打包出来的react应用为例，打包后的资源主要是静态资源和非静态资源。静态资源在进行打包时webpack会默认在文件名后面加一个hash值。

![image-20220613125444792](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/886/image-20220613125444792.png)

对于这些带hash的静态资源我们可以为其设置缓存，因为当服务端的资源更新时，hash值一定是不一样的，此时客户端就会去请求服务器引用新的资源。 

对于非hash资源（例如index.html），我们不能为其设置缓存，因为当服务端更新index.html时，假设客户端还有缓存时，就不能请求到新的资源，在其中引用的静态资源也全部是过期的，这会导致很严重的问题。 

nginx配置： 

```nginx
server {
    listen       80;
    server_name  localhost;

    root   /usr/share/nginx/html;
    index  index.html index.htm;

    location / {
        # 解决单页应用服务端路由的问题
        try_files  $uri $uri/ /index.html;

        # 非带 hash 的资源，需要配置 Cache-Control: no-cache，避免浏览器默认为强缓存
        expires -1;
    }

    location /static {
        # 带 hash 的资源，需要配置长期缓存
        expires 1y;
    }
}
```

启动容器，现在访问静态资源已经设置为强缓存

![image-20220613130402375](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/886/image-20220613130402375.png)

非静态资源，不会进行缓存

![image-20220613130540632](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/886/image-20220613130540632.png)

### docker+Nginx部署express应用

接下来我们部署一个express服务和一个whoami服务。 

```js
/**
 * @author Yedi Zhang --Tust
 * @date 2022/6/13 8:50
 * @email 178320369@qq.com
 */

const express = require("express");

const app = express();

app.get("/api1/hello", (req, res) => {
    res.send("hello zyd!")
})

app.listen(3000, () => {
    console.log(`Example app listening on port 3000 🚀`)
})
```

这个案例折腾了半天，原因就是对docker认识上的错误，想要通过一个dockerfile实现nginx请求转发。 

错误的示例：

Dockerfile：  

```dockerfile
FROM node:14-alpine as builder

ADD package.json package-lock.json /code/

RUN yarn

WORKDIR code

ADD . /code

CMD node index.js

EXPOSE 3000

FROM nginx:alpine  # 再次FROM时，会在一个新的容器操作，两个环境之间是隔离的，所以这个容器中是访问不到上个容器中部署的服务的！

COPY nginx.conf /etc/nginx/conf.d/default.conf
```

nginx.conf： 

```nginx
server {
  listen       80;
  server_name  localhost;


  location /api {
    proxy_pass   http://localhost:3000;
  }

}
```

正确的做法是通过docker-compose部署，在docker-compose配置文件中声明多个服务。这其中就包括了一个nginx服务和一个express服务。

docker-compose.yaml 

```yaml
version: "3"
services:
  app:
    # build: 从当前路径构建镜像
    build: .
    ports:
      - 8800:3000 # 本地服务映射到80端口

  api:  # 山月老师的一个服务
    image: shanyue/whoami
    ports:
      - 8888:3000

  proxy:
    image: nginx:alpine
    ports:
      - 8300:80
    volumes:
      - ./proxy.conf:/etc/nginx/conf.d/default.conf
      - .:/usr/share/nginx/html
```

在proxy.conf中，实现请求的转发： 

```nginx
server {
  listen       80;
  server_name  localhost;

  location /api1 {
    proxy_pass   http://app:3000; # app即是我们的express应用
  }
    
   location /api2 {
       proxy_pass   http://api:3000;
    }
}
```

配置完成，运行容器：

```shell
docker-compose up --build
```

![image-20220613132447169](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/886/image-20220613132447169.png)

通过以上的示例，我们成功在一个容器中部署了两个应用和一个Nginx服务。

![image-20220613132230152](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/886/image-20220613132230152.png)