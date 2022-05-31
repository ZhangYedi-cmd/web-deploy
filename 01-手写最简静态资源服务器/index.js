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
  this is index
</body>
</html>`

const server = http.createServer((req, res) => res.end(html))
// 将服务启动在3000端口
server.listen(3000, () => {
    console.log('Listening 3000')
})