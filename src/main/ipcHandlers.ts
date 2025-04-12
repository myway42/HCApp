import { ipcMain, app } from 'electron'
import { spawn } from 'child_process'
import { machineIdSync } from 'node-machine-id'
import { existsSync } from 'fs'

/**
 * 注册所有IPC处理程序
 */
export function registerIpcHandlers(): void {
  // 执行 exe 文件
  ipcMain.handle('execute-exe', async (_, exePath: string) => {
    // 检查文件是否存在
    if (!existsSync(exePath)) {
      throw new Error('插件文件不存在')
    }

    return new Promise((resolve, reject) => {
      const process = spawn(exePath)

      let output = ''
      let errorOutput = ''

      process.stdout.on('data', (data) => {
        output += data.toString()
      })

      process.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output)
        } else {
          reject(new Error(`Process exited with code ${code}\nError: ${errorOutput}`))
        }
      })

      process.on('error', (err) => {
        reject(err)
      })
    })
  })

  // 重启应用
  ipcMain.handle('restart-app', () => {
    app.relaunch()
    app.quit()
  })

  // 退出应用
  ipcMain.handle('quit-app', () => {
    app.quit()
  })

  // 获取主机唯一标识
  ipcMain.handle('get-machine-id', () => {
    return machineIdSync()
  })
}
