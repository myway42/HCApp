import { ipcMain, app } from 'electron'
import { spawn } from 'child_process'
import { machineIdSync } from 'node-machine-id'
import { existsSync, unlink, readdirSync, lstatSync, rmdirSync } from 'fs'
import { promisify } from 'util'
import { join } from 'path'

const unlinkAsync = promisify(unlink)

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

  // 删除文件
  ipcMain.handle('delete-file', async (_, filePath: string) => {
    // const fileStat = statSync(filePath)
    // console.log('文件状态:', fileStat)
    try {
      if (!existsSync(filePath)) {
        throw new Error('文件不存在')
      }
      await unlinkAsync(filePath)
      return true
    } catch (error) {
      console.error('删除文件失败:', error)
      throw error
    }
  })

  // 删除文件夹及其内容
  ipcMain.handle('delete-folder', async (_, folderPath: string) => {
    try {
      if (!folderPath) {
        console.warn('文件夹路径为空，无法删除')
        return false
      }

      if (existsSync(folderPath)) {
        // 递归删除文件夹及其内容
        const deleteFolderRecursive = (folderPath: string): void => {
          if (existsSync(folderPath)) {
            readdirSync(folderPath).forEach(async (file: string) => {
              const curPath = join(folderPath, file)
              if (lstatSync(curPath).isDirectory()) {
                // 递归删除子文件夹
                deleteFolderRecursive(curPath)
              } else {
                // 删除文件
                await unlinkAsync(curPath)
              }
            })
            // 删除空文件夹
            rmdirSync(folderPath)
          }
        }

        deleteFolderRecursive(folderPath)
        return true
      } else {
        console.log(`文件夹 ${folderPath} 不存在，无需删除`)
        return true
      }
    } catch (error) {
      console.error(`删除文件夹 ${folderPath} 失败:`, error)
      return false
    }
  })
}
