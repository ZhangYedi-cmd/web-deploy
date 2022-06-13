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