import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3001

// 智能探测数据文件路径：生产环境 dist/ -> 开发环境 public/ -> 独立部署同级目录
function getDataFilePath() {
  if (process.env.DATA_FILE && fs.existsSync(process.env.DATA_FILE)) {
    return path.resolve(process.env.DATA_FILE)
  }
  const distPath = path.resolve(__dirname, 'dist/dashboardData.json')
  if (fs.existsSync(distPath)) {
    return distPath
  }
  const publicPath = path.resolve(__dirname, 'public/dashboardData.json')
  if (fs.existsSync(publicPath)) {
    return publicPath
  }
  const rootPath = path.resolve(__dirname, 'dashboardData.json')
  if (fs.existsSync(rootPath)) {
    return rootPath
  }
  return publicPath
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res)

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const currentDataFile = getDataFilePath()

  // 路由：/api/dashboard
  if (url.pathname === '/api/dashboard') {
    if (req.method === 'GET') {
      try {
        if (!fs.existsSync(currentDataFile)) {
          res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ code: 404, message: '数据文件不存在: ' + currentDataFile }))
          return
        }
        const fileContent = fs.readFileSync(currentDataFile, 'utf-8')
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(fileContent)
      } catch (err) {
        console.error('读取数据失败:', err)
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ code: 500, message: '读取数据失败: ' + err.message }))
      }
      return
    }

    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })

      req.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          // 确保父目录存在
          const targetDir = path.dirname(currentDataFile)
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true })
          }
          fs.writeFileSync(currentDataFile, JSON.stringify(parsed, null, 2), 'utf-8')
          console.log(`[${new Date().toLocaleTimeString()}] 数据保存成功 -> ${currentDataFile}`)
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ code: 200, message: '保存成功', data: parsed }))
        } catch (err) {
          console.error('保存数据失败:', err)
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ code: 400, message: 'JSON 格式错误或保存失败: ' + err.message }))
        }
      })
      return
    }

    res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ code: 405, message: '方法不支持' }))
    return
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ code: 404, message: '接口未找到' }))
})

server.listen(PORT, () => {
  const activeFile = getDataFilePath()
  console.log(`========================================`)
  console.log(` 🚀 极简后端服务已启动: http://localhost:${PORT}`)
  console.log(` 📄 当前绑定数据文件: ${activeFile}`)
  console.log(` 🔌 接口地址: http://localhost:${PORT}/api/dashboard`)
  console.log(`========================================`)
})
