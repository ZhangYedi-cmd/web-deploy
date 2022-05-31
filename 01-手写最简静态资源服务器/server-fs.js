const file = require('fs')
const http = require('http')

const html = file.readFileSync("./index.html")

const server = http.createServer((req, res) => {
    res.end(html)
} )
server.listen(3000, () => {
    console.log('Listening 3000')
})