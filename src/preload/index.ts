import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import HCWebSDKPlugin from '../../resources/HCWebSDKPlugin.exe?asset&asarUnpack'

// Custom APIs for renderer
const api = {
  executeExe: (): Promise<string> => {
    return ipcRenderer.invoke('execute-exe', HCWebSDKPlugin)
  },
  restartApp: (): Promise<void> => {
    return ipcRenderer.invoke('restart-app')
  },
  quitApp: (): Promise<void> => {
    return ipcRenderer.invoke('quit-app')
  },
  getMachineId: (): Promise<string> => {
    return ipcRenderer.invoke('get-machine-id')
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
