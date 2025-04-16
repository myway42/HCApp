import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      executeExe: () => Promise<string>
      restartApp: () => Promise<void>
      quitApp: () => Promise<void>
      getMachineId: () => Promise<string>
      onRequest: (callback: (type: string) => void) => void
      sendResponse: (result: { error?: string; data?: string }) => void
      deleteFile: (filePath: string) => Promise<boolean>
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WebVideoCtrl: any
  }
}
