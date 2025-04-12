import { Router } from 'express'
import { machineIdSync } from 'node-machine-id'

// 创建路由器
const router = Router()

// 获取主机唯一标识的API端点
router.get('/machine-id', async (req, res) => {
  try {
    const machineId = machineIdSync()
    return res.json({ machineId, success: true })
  } catch (error) {
    console.error('获取主机唯一标识失败:', error)
    return res.status(500).json({ message: '获取主机唯一标识失败', success: false })
  }
})

export default router
