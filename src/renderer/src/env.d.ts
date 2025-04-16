/// <reference types="vite/client" />

interface Window {
  api: {
    executeExe: () => Promise<string>
    restartApp: () => Promise<void>
    quitApp: () => Promise<void>
    getMachineId: () => Promise<string>
    onRequest: (callback: (type: string) => void) => void
    sendResponse: (result: { error?: string; data?: string }) => void
    deleteFile: (filePath: string) => Promise<boolean>
    deleteFolder: (folderPath: string) => Promise<boolean>
  }
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
