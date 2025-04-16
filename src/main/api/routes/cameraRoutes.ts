/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { Router } from 'express'
import { machineIdSync } from 'node-machine-id'

export default function CameraRoutes(mainWindow: BrowserWindow): Router {
  // 创建路由器
  const router = Router()

  // 获取主机唯一标识的API端点
  router.get('/machine-id', async (_req, res) => {
    try {
      const machineId = machineIdSync()
      return res.json({ data: machineId || '', success: true })
    } catch (error) {
      console.error('获取主机唯一标识失败:', error)
      return res.status(500).json({ message: '获取主机唯一标识失败', success: false })
    }
  })

  // 抓图API端点
  router.get('/capture', async (_req, res) => {
    let t: NodeJS.Timeout | null = null
    const listener = (_event: IpcMainEvent, result: { error?: string; data?: string }): void => {
      ipcMain.off('response', listener)
      if (result.error) {
        throw new Error(result.error)
      } else {
        return res.json({ success: true, data: result.data || '' })
      }
    }
    try {
      ipcMain.once('response', listener)
      // 设置超时，防止无限等待
      t = setTimeout(() => {
        ipcMain.off('response', listener)
        throw new Error('抓图超时')
      }, 6000)
      mainWindow.webContents.send('request', 'capture')
    } catch (error: any) {
      console.error('抓图失败:', error)
      return res.status(500).json({
        message: error || '抓图失败',
        success: false
      })
    } finally {
      if (t) {
        clearTimeout(t)
      }
    }
  })

  // 获取OSD时间API端点
  router.get('/getTime', async (_req, res) => {
    let t: NodeJS.Timeout | null = null
    const listener = (_event: IpcMainEvent, result: { error?: string; data?: string }): void => {
      ipcMain.off('response', listener)
      if (result.error) {
        throw new Error(result.error)
      } else {
        return res.json({ success: true, data: result.data || '' })
      }
    }
    try {
      ipcMain.once('response', listener)
      // 设置超时，防止无限等待
      t = setTimeout(() => {
        ipcMain.off('response', listener)
        throw new Error('获取OSD时间超时')
      }, 6000)
      mainWindow.webContents.send('request', 'getTime')
    } catch (error: any) {
      console.error('获取OSD时间失败:', error)
      return res.status(500).json({
        message: error || '获取OSD时间失败',
        success: false
      })
    } finally {
      if (t) {
        clearTimeout(t)
      }
    }
  })

  return router
}
