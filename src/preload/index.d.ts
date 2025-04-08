import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      executeExe: () => Promise<string>
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WebVideoCtrl: any
  }
}
