/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseXML } from './index'

export interface Options {
  [key: string]: any
}

export class HCWebSDK {
  // 播放插件初始化（包含插件事件注册）
  static I_InitPlugin(options: Options): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        window.WebVideoCtrl.I_InitPlugin({
          ...options,
          cbInitPluginComplete: () => {
            resolve(true)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  // 检查插件版本
  static I_CheckPluginVersion(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_CheckPluginVersion()
        .then((res: boolean) => resolve(res))
        .catch(reject)
    })
  }

  // 嵌入播放插件
  static I_InsertOBJECTPlugin(szContainerID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_InsertOBJECTPlugin(szContainerID)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 登录设备
  static I_Login(
    szIP: string,
    iPrototocol: number,
    iPort: number,
    szUserName: string,
    szPassword: string,
    options: Options = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_Login(szIP, iPrototocol, iPort, szUserName, szPassword, {
        ...options,
        success: (xml: string) => {
          resolve(parseXML(xml))
        },
        error: (err: any) => {
          reject(err)
        }
      })
    })
  }

  // 登出设备
  static I_Logout(szDeviceIdentify: string): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_Logout(szDeviceIdentify)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 销毁插件
  static I_DestroyPlugin(): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_DestroyPlugin()
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 获取设备基本信息
  static I_GetDeviceInfo(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetDeviceInfo(szDeviceIdentify, {
        ...options,
        success: (xml: string) => resolve(parseXML(xml)),
        error: (err: any) => reject(err)
      })
    })
  }

  // 获取模拟通道信息
  static I_GetAnalogChannelInfo(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetAnalogChannelInfo(szDeviceIdentify, {
        ...options,
        success: (xml: string) => resolve(parseXML(xml)),
        error: (err: any) => reject(err)
      })
    })
  }

  // 获取数字通道信息
  static I_GetDigitalChannelInfo(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetDigitalChannelInfo(szDeviceIdentify, {
        ...options,
        success: (xml: string) => {
          const list = parseXML(xml)?.InputProxyChannelStatusList?.InputProxyChannelStatus ?? []
          resolve(Array.isArray(list) ? list : [list])
        },
        error: (err: any) => reject(err)
      })
    })
  }

  // 获取零通道信息
  static I_GetZeroChannelInfo(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetZeroChannelInfo(szDeviceIdentify, {
        ...options,
        success: (xml: string) => resolve(parseXML(xml)),
        error: (err: any) => reject(err)
      })
    })
  }

  // 录像搜索
  static I_RecordSearch(
    szDeviceIdentify: string,
    iChannelID: number,
    szStartTime: string,
    szEndTime: string,
    options: Options = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_RecordSearch(szDeviceIdentify, iChannelID, szStartTime, szEndTime, {
        ...options,
        success: (xml: string) => resolve(parseXML(xml)),
        error: (err: any) => reject(err)
      })
    })
  }

  // 获取语音对讲通道信息
  static I_GetAudioInfo(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetAudioInfo(szDeviceIdentify, {
        ...options,
        success: (xml: string) => resolve(parseXML(xml)),
        error: (err: any) => reject(err)
      })
    })
  }

  // 获取设备端口信息
  static I_GetDevicePort(szDeviceIdentify: string): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetDevicePort(szDeviceIdentify)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 开始预览/回放
  static I_StartPlay(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StartPlay(szDeviceIdentify, {
        ...options,
        success: (xml: string) => resolve(parseXML(xml)),
        error: (err: any) => reject(err)
      })
    })
  }

  // 开始预览
  static I_StartRealPlay(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
        ...options,
        success: (res: string) => resolve(res),
        error: (err: any) => reject(err)
      })
    })
  }

  // 开始回放
  static I_StartPlayback(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StartPlayback(szDeviceIdentify, {
        ...options,
        success: (xml: string) => resolve(parseXML(xml)),
        error: (err: any) => reject(err)
      })
    })
  }

  // 开始倒放
  static I_ReversePlayback(szDeviceIdentify: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_ReversePlayback(szDeviceIdentify, {
        ...options,
        success: (xml: string) => resolve(parseXML(xml)),
        error: (err: any) => reject(err)
      })
    })
  }

  // 停止播放
  static I_Stop(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_Stop(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 停止全部播放
  static I_StopAllPlay(): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StopAllPlay()
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 单帧播放
  static I_Frame(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_Frame(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 暂停播放
  static I_Pause(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_Pause(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 恢复播放
  static I_Resume(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_Resume(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 减速播放
  static I_PlaySlow(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_PlaySlow(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 加速播放
  static I_PlayFast(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_PlayFast(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 获取OSD时间
  static I_GetOSDTime(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetOSDTime({
        ...options,
        success: (res: string) => resolve(res),
        error: (err: any) => reject(err)
      })
    })
  }

  // 打开声音
  static I_OpenSound(iWndIndex: number): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_OpenSound(iWndIndex)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 关闭声音
  static I_CloseSound(iWndIndex: number): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_CloseSound(iWndIndex)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 设置音量（0~100）
  static I_SetVolume(iVolume: number, iWndIndex: number): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_SetVolume(iVolume, iWndIndex)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 抓图（保存到本地）
  static I_CapturePic(szPicName: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_CapturePic(szPicName, options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 抓图并返回图片的二进制数据
  static I_CapturePicData(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_CapturePicData(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 画面分割
  static I_ChangeWndNum(iWndType: number): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_ChangeWndNum(iWndType)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 开始录像
  static I_StartRecord(szFileName: string, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StartRecord(szFileName, options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 停止录像
  static I_StopRecord(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StopRecord(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 录像下载：开始下载
  static I_StartDownloadRecord(
    szDeviceIdentify: string,
    szPlaybackURI: string,
    szFileName: string,
    options: Options = {}
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StartDownloadRecord(
        szDeviceIdentify,
        szPlaybackURI,
        szFileName,
        options
      )
        .then((res: number) => resolve(res))
        .catch(reject)
    })
  }

  // 录像下载：开始按时间下载
  static I_StartDownloadRecordByTime(
    szDeviceIdentify: string,
    szPlaybackURI: string,
    szFileName: string,
    szStartTime: string,
    szEndTime: string,
    options: Options = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StartDownloadRecordByTime(
        szDeviceIdentify,
        szPlaybackURI,
        szFileName,
        szStartTime,
        szEndTime,
        options
      )
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 录像下载：停止下载录像
  static I_StopDownloadRecord(iDownloadID: number): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StopDownloadRecord(iDownloadID)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 获取下载进度
  static I_GetDownloadProgress(iDownloadID: number): Promise<number> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetDownloadProgress(iDownloadID)
        .then((res: number) => resolve(res))
        .catch(reject)
    })
  }
  // 开始语音对讲
  static I_StartVoiceIntercom(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StartVoiceIntercom(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 停止语音对讲
  static I_StopVoiceIntercom(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_StopVoiceIntercom(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 云台控制
  static I_PTZControl(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_PTZControl(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 设置预置点
  static I_SetPreset(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_SetPreset(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 调用预置点
  static I_CallPreset(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_CallPreset(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 隐藏视频插件窗口
  static I_HidPlugin(): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_HidPlugin()
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 显示视频插件窗口
  static I_ShowPlugin(): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_ShowPlugin()
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 获取插件配置信息
  static I_GetLocalCfg(): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetLocalCfg()
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 设置插件配置信息
  static I_SetLocalCfg(options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_SetLocalCfg(options)
        .then((res: any) => resolve(res))
        .catch(reject)
    })
  }

  // 获取错误信息
  static I_GetLastError(): Promise<any> {
    return new Promise((resolve, reject) => {
      window.WebVideoCtrl.I_GetLastError()
        .then((res: number) => resolve(res))
        .catch(reject)
    })
  }

  // 获取窗口状态
  static I_GetWindowStatus(iWndIndex: number): any {
    return window.WebVideoCtrl.I_GetWindowStatus(iWndIndex)
  }
  // 其它接口按需添加…
}

export default HCWebSDK
