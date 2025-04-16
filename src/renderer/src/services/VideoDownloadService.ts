import HCWebSDK from '@renderer/utils/HCVideoPlayer'
import { getNameFromRTSPUrl } from '@renderer/utils'

// 定义任务接口
export interface DownloadTask {
  id: string
  channelId: number
  startTime: string
  endTime: string
  deviceIdentify: string
}

// 定义上传结果接口
interface UploadResult {
  taskId: string
  ossUrls: string[]
}

// 定义录像记录接口
interface RecordItem {
  playbackURI: string
  startTime: string
  endTime: string
  fileSize: number
  [key: string]: string | number
}

// 定义搜索结果接口
interface SearchResult {
  CMSearchResult: {
    numOfMatches: number
    matchList: {
      searchMatchItem: RecordItem | RecordItem[]
    }
  }
}

class VideoDownloadService {
  private isRunning: boolean = false
  private currentTask: DownloadTask | null = null
  private maxRetries: number = 3
  private downloadBasePath: string = ''
  private downloadNum: number = 0
  // 删除文件夹及其内容
  private async deleteFolder(folderPath: string): Promise<boolean> {
    try {
      if (!folderPath) {
        console.warn('文件夹路径为空，无法删除')
        return false
      }

      // 使用主进程的删除文件夹功能
      return await window.api.deleteFolder(folderPath)
    } catch (error) {
      console.error(`删除文件夹 ${folderPath} 失败:`, error)
      return false
    }
  }

  // 获取下载路径
  private async getDownloadPath(): Promise<string> {
    try {
      const localCfg = await HCWebSDK.I_GetLocalCfg()
      // 清空下载文件夹
      await this.deleteFolder(localCfg.downloadPath)
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0] // 格式：YYYY-MM-DD
      this.downloadBasePath = `${localCfg.downloadPath}\\${dateStr}`
      return this.downloadBasePath
    } catch (error) {
      console.error('获取下载路径失败:', error)
      throw error
    }
  }

  // 获取任务列表
  private async getTaskList(): Promise<DownloadTask[]> {
    try {
      // 获取下载路径
      await this.getDownloadPath()

      // 这里需要调用后端接口获取任务列表
      // 示例代码，实际需要替换为真实的API调用
      // const response = await fetch('/api/tasks')
      // const data = await response.json()
      const data = {
        tasks: [
          {
            id: '1',
            channelId: 5,
            startTime: '2025-04-13 14:35:00',
            endTime: '2025-04-13 14:38:00',
            deviceIdentify: '192.168.7.69_80'
          },
          {
            id: '2',
            channelId: 5,
            startTime: '2025-04-13 14:35:00',
            endTime: '2025-04-13 14:38:00',
            deviceIdentify: '192.168.7.69_80'
          },
          {
            id: '3',
            channelId: 5,
            startTime: '2025-04-13 14:35:00',
            endTime: '2025-04-13 14:38:00',
            deviceIdentify: '192.168.7.69_80'
          }
        ]
      }
      return data.tasks
    } catch (error) {
      console.error('获取任务列表失败:', error)
      return []
    }
  }

  // 通知后端任务开始执行
  private async notifyTaskStart(taskId: string): Promise<boolean> {
    try {
      // 这里需要调用后端接口通知任务开始
      // 示例代码，实际需要替换为真实的API调用
      await fetch(`/api/tasks/${taskId}/start`, {
        method: 'POST'
      })
      return true
    } catch (error) {
      console.error('通知任务开始失败:', error)
      return false
    }
  }

  // 通知后端任务失败
  private async notifyTaskFailed(taskId: string, error: string): Promise<boolean> {
    try {
      // 这里需要调用后端接口通知任务失败
      // 示例代码，实际需要替换为真实的API调用
      await fetch(`/api/tasks/${taskId}/failed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error })
      })
      return true
    } catch (err) {
      console.error('通知任务失败失败:', err)
      return false
    }
  }

  // 搜索录像
  private async searchRecord(task: DownloadTask): Promise<RecordItem[]> {
    try {
      const searchResult = (await HCWebSDK.I_RecordSearch(
        task.deviceIdentify,
        task.channelId,
        task.startTime,
        task.endTime
      )) as SearchResult

      if (searchResult.CMSearchResult.numOfMatches === 0) {
        console.warn('未找到录像')
        return []
      }

      // 处理搜索结果，确保返回数组
      const matchList = searchResult.CMSearchResult.matchList.searchMatchItem
      return Array.isArray(matchList) ? matchList : [matchList]
    } catch (error) {
      console.error('搜索录像失败:', error)
      return []
    }
  }

  // 下载录像
  private async downloadRecords(records: RecordItem[], task: DownloadTask): Promise<string[]> {
    const downloadPaths: string[] = []

    for (const record of records) {
      let downloadId = 0
      try {
        const fileName = getNameFromRTSPUrl(record.playbackURI) || `${Date.now()}`

        downloadId = await HCWebSDK.I_StartDownloadRecord(
          task.deviceIdentify,
          record.playbackURI,
          fileName
        )
        this.downloadNum++
        console.log('总下载次数:', this.downloadNum, records, task)
        // 等待下载完成
        await this.waitForDownloadComplete(downloadId)

        // 获取下载路径
        const filePath = `${this.downloadBasePath}\\${fileName}.mp4`
        downloadPaths.push(filePath)

        // 立即上传当前文件
        const ossUrl = await this.uploadToOSS([filePath])
        if (ossUrl.length > 0) {
          // 上传成功后删除本地文件
          await this.deleteLocalFile(filePath)
        }
      } catch (error) {
        console.error('下载或上传录像失败:', error)
      } finally {
        // 每次下载完成后主动停止下载并释放资源，不然下载64次后会报错
        await HCWebSDK.I_StopDownloadRecord(downloadId)
      }
    }

    return downloadPaths
  }

  // 等待下载完成
  private async waitForDownloadComplete(downloadId: number): Promise<void> {
    return new Promise((resolve) => {
      const checkProgress = async (): Promise<void> => {
        try {
          const progress = await HCWebSDK.I_GetDownloadProgress(downloadId)
          console.log('下载进度:', downloadId, progress)
          if (progress >= 100) {
            resolve()
          } else {
            setTimeout(checkProgress, 3000)
          }
        } catch (error) {
          console.error('获取下载进度失败:', error)
          resolve() // 出错时也结束等待
        }
      }

      checkProgress()
    })
  }

  // 删除本地文件
  private async deleteLocalFile(filePath: string): Promise<boolean> {
    const maxRetries = 3
    const retryDelay = 1000 // 1秒

    for (let i = 0; i < maxRetries; i++) {
      try {
        // 尝试删除文件
        await window.api.deleteFile(filePath)
        console.log(`文件 ${filePath} 已删除`)
        return true
      } catch (error) {
        console.error(`删除本地文件失败 (尝试 ${i + 1}/${maxRetries}):`, error)

        if (i < maxRetries - 1) {
          // 等待一段时间后重试
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
        } else {
          // 最后一次尝试失败
          return false
        }
      }
    }
    return false
  }

  // 上传到OSS
  private async uploadToOSS(filePaths: string[]): Promise<string[]> {
    // 这里需要实现上传到OSS的逻辑
    // 示例代码，实际需要替换为真实的上传逻辑
    const ossUrls: string[] = []

    for (const filePath of filePaths) {
      try {
        // 模拟上传过程
        // 实际实现时，这里需要调用OSS上传API
        // const ossUrl = await this.mockUploadToOSS(filePath)
        const ossUrl = filePath
        ossUrls.push(ossUrl)
      } catch (error) {
        console.error('上传到OSS失败:', error)
      }
    }

    return ossUrls
  }

  // 模拟上传到OSS
  private async mockUploadToOSS(filePath: string): Promise<string> {
    // 这里只是模拟，实际需要替换为真实的上传逻辑
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://example-oss.com/videos/${filePath.split('/').pop()}`)
      }, 1000)
    })
  }

  // 通知后端上传完成
  private async notifyUploadComplete(result: UploadResult): Promise<boolean> {
    try {
      // 这里需要调用后端接口通知上传完成
      // 示例代码，实际需要替换为真实的API调用
      // await fetch(`/api/tasks/${result.taskId}/complete`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ ossUrls: result.ossUrls })
      // })
      return true
    } catch (error) {
      console.error('通知上传完成失败:', error)
      return false
    }
  }

  // 处理单个任务（带重试机制）
  private async processTaskWithRetry(task: DownloadTask): Promise<boolean> {
    let retryCount = 0
    let lastError = ''

    while (retryCount < this.maxRetries) {
      try {
        console.log(`开始处理任务 ${task.id}，第 ${retryCount + 1} 次尝试`)
        const success = await this.processTask(task)

        if (success) {
          return true
        }

        retryCount++
        if (retryCount < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        console.error(`任务 ${task.id} 处理出错:`, error)
        retryCount++

        if (retryCount < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
      }
    }

    // 所有重试都失败，通知后端
    console.error(`任务 ${task.id} 处理失败，已重试 ${this.maxRetries} 次`)
    await this.notifyTaskFailed(
      task.id,
      `任务处理失败，已重试 ${this.maxRetries} 次。最后错误: ${lastError}`
    )
    return false
  }

  // 处理单个任务
  private async processTask(task: DownloadTask): Promise<boolean> {
    try {
      // 通知后端任务开始执行
      // await this.notifyTaskStart(task.id)

      // 搜索录像
      const records = await this.searchRecord(task)
      if (records.length === 0) {
        return true // 没有录像，任务完成
      }

      // 下载并上传录像
      const downloadPaths = await this.downloadRecords(records, task)
      if (downloadPaths.length === 0) {
        return false
      }

      // 通知后端上传完成
      const result: UploadResult = {
        taskId: task.id,
        ossUrls: downloadPaths // 这里存储的是已上传到OSS的URL
      }

      return await this.notifyUploadComplete(result)
    } catch (error) {
      console.error('处理任务失败:', error)
      throw error // 抛出错误以便重试机制捕获
    }
  }

  // 开始定时任务（后台静默执行）
  public async startScheduledTask(): Promise<void> {
    if (this.isRunning) {
      return
    }

    this.isRunning = true

    // 获取任务列表
    const tasks = await this.getTaskList()
    console.log('定时任务已启动', tasks)

    const runTask = async (): Promise<void> => {
      if (!this.isRunning) {
        return
      }
      if (tasks.length === 0) {
        this.isRunning = false
        return
      }

      try {
        // 处理第一个任务
        const task = tasks.shift()!
        this.currentTask = task

        await this.processTaskWithRetry(task)
        this.currentTask = null
      } catch (error) {
        console.error('执行定时任务失败:', error)
      }

      // 继续下一个任务
      runTask()
    }

    // 立即开始第一个任务
    runTask()
  }

  // 停止定时任务
  public stopScheduledTask(): void {
    this.isRunning = false
  }

  // 获取当前任务
  public getCurrentTask(): DownloadTask | null {
    return this.currentTask
  }
}

export default new VideoDownloadService()
