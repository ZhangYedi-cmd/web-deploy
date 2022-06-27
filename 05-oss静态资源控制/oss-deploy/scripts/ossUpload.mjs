import OSS from 'ali-oss'
import {createReadStream} from 'fs'
import {resolve} from 'path'
import readdirp from 'readdirp'
import PQueue from 'p-queue'

const queue = new PQueue({concurrency: 10})


let client = new OSS({
    region: 'oss-cn-beijing',
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
    bucket: 'webdeploy'
});


async function isExistObject(objectName) {
    try {
        await client.head(objectName)
        return true
    } catch (e) {
        return false
    }
}

// objectName: static/css/main.079c3a.css
// withHash: 该文件名是否携带 hash 值
async function uploadFile(objectName, withHash = false) {
    const file = resolve('./build', objectName)
    // 如果路径名称不带有 hash 值，则直接重新上传 -> 此处可优化
    const exist = withHash ? await isExistObject(objectName) : false
    if (!exist) {
        const cacheControl = withHash ? 'max-age=31536000' : 'no-cache'
        // 为了加速传输速度，这里使用 stream
        await client.putStream(objectName, createReadStream(file), {
            headers: {
                'Cache-Control': cacheControl
            }
        })
        console.log(`Done: ${objectName}`)
    } else {
        // 如果该文件在 OSS 已存在，则跳过该文件 (Object)
        console.log(`Skip: ${objectName}`)
    }
}

async function main() {
    for await (const entry of readdirp('./build', {depth: 0, type: 'files'})) {
        queue.add(() => uploadFile(entry.path))
        // uploadFile(entry.path)
    }
    for await (const entry of readdirp('./build/static', {type: 'files'})) {
        queue.add(() => uploadFile(`static/${entry.path}`, true))
    }

}

main().catch(e => {
    console.error(e)
    process.exitCode = 1
})