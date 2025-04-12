import express from 'express'
import cors from 'cors'
import { Server } from 'http'
import deviceRoutes from './routes/deviceRoutes'

// 创建Express应用
const app = express()
const PORT = 3000

// 启用CORS
app.use(cors())
app.use(express.json())

// 注册API路由
app.use('/api', deviceRoutes)

// 存储HTTP服务器实例
let server: Server | null = null

// 启动HTTP服务器
export function startHttpServer(): void {
  if (server) {
    console.log('HTTP服务器已经在运行中')
    return
  }

  server = app.listen(PORT, () => {
    console.log(`HTTP服务器已启动，监听端口: ${PORT}`)
  })
}

// 停止HTTP服务器
export function stopHttpServer(): void {
  if (server) {
    server.close(() => {
      console.log('HTTP服务器已停止')
      server = null
    })
  }
}
