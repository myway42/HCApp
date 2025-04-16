import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import HCWebSDKPlugin from '../../resources/HCWebSDKPlugin.exe?asset&asarUnpack'

// 给渲染进程调用的 API
const api = {
  executeExe: (): Promise<string> => {
    // 只在 Windows 系统上执行
    if (process.platform === 'win32') {
      return ipcRenderer.invoke('execute-exe', HCWebSDKPlugin)
    } else {
      return Promise.reject(new Error('该功能仅支持 Windows 系统'))
    }
  },
  restartApp: (): Promise<void> => {
    return ipcRenderer.invoke('restart-app')
  },
  quitApp: (): Promise<void> => {
    return ipcRenderer.invoke('quit-app')
  },
  getMachineId: (): Promise<string> => {
    return ipcRenderer.invoke('get-machine-id')
  },
  // 注册请求监听器
  onRequest: (callback: (type: string) => void): void => {
    ipcRenderer.on('request', (_, type: string) => callback(type))
  },
  // 发送结果到主进程
  sendResponse: (result: { error?: string; data?: string }): void => {
    ipcRenderer.send('response', result)
  },
  deleteFile: (filePath: string): Promise<boolean> => {
    return ipcRenderer.invoke('delete-file', filePath)
  },
  deleteFolder: (folderPath: string): Promise<boolean> => {
    return ipcRenderer.invoke('delete-folder', folderPath)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
