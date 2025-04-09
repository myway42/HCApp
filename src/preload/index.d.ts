import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      executeExe: () => Promise<string>
      restartApp: () => Promise<void>
      quitApp: () => Promise<void>
      getMachineId: () => Promise<string>
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WebVideoCtrl: any
  }
}
