import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { join } from 'path'

// Custom APIs for renderer
const api = {
  executeExe: (): Promise<string> => {
    // 使用 __dirname 获取当前文件所在目录，然后向上两级到项目根目录
    const exePath = join(__dirname, '..', '..', 'resources', 'HCWebSDKPlugin.exe')
    return ipcRenderer.invoke('execute-exe', exePath)
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
