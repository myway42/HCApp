/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react'
import HCWebSDK from '@renderer/utils/HCVideoPlayer'
import { message } from 'antd'
import VideoDownloadService from '@renderer/services/VideoDownloadService'
import { parseXML } from '@renderer/utils'

type Props = {
  ip: string
  port: number
  username: string
  password: string
}

const Component: React.FC<Props> = ({ ip, port, username, password }) => {
  // 设备标识为 ip_port 格式
  const szDeviceIdentify = `${ip}_${port}`
  const [channels, setChannels] = useState<any[]>([])
  const loggedInRef = useRef<boolean>(false)
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [channelInfo, setChannelInfo] = useState<any>(null)
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [isPluginVisible, setIsPluginVisible] = useState<boolean>(true)

  // 初始化设备
  const initDevice = async (): Promise<void> => {
    if (loggedInRef.current) {
      return
    }
    try {
      // 1. 初始化插件
      await HCWebSDK.I_InitPlugin({
        iWndowType: 4, // 分屏
        bDebugMode: true,
        cbSelWnd: (xml: string) =>
          console.log('选中窗口回调：', parseXML(xml).RealPlayInfo.SelectWnd)
      })
      // 注入插件到页面
      await HCWebSDK.I_InsertOBJECTPlugin('pluginContainer')

      // 2. 登录设备
      const loginRes = await HCWebSDK.I_Login(ip, 1, port, username, password)
      console.log('设备登录成功：', loginRes)
      loggedInRef.current = true

      // 3. 获取数字通道信息
      const channelList = await HCWebSDK.I_GetDigitalChannelInfo(szDeviceIdentify)
      console.log('数字通道信息：', channelList)
      setChannels(channelList)
      // 判断在线状态
      if (!channelList?.find((c) => c.id === 3)?.sourceInputPortDescriptor?.online) {
        message.error('通道3未在线')
        return
      }
      VideoDownloadService.startScheduledTask()

      // 4. 启动预览
      window.setTimeout(async () => {
        await HCWebSDK.I_StartRealPlay(szDeviceIdentify, {
          iChannelID: 3
          // szStartTime: '20250413T143501Z',
          // szEndTime: '20250413T143851Z'
          // szUrl:
          //   'rtsp://192.168.7.69/Streaming/tracks/501/?starttime=20250413T143501Z&endtime=20250413T143851Z&name=00000001456000100&size=19670920'
        })
        setIsPluginVisible(true)
      }, 1000)
    } catch (err: any) {
      console.error('初始化流程出错：', err)
      const lastError = await HCWebSDK.I_GetLastError()
      console.log('错误代码：', lastError)
      if (err.errorCode === 2001) {
        message.warning('设备已登录')
      }
      if (err.errorCode === 3000) {
        message.error('请先安装摄像头插件')
        try {
          const result = await window.api.executeExe()
          console.log('执行结果:', result)
          message.success('插件安装成功，正在重启应用...')
          window.api.restartApp()
        } catch (error: any) {
          console.error('安装错误:', error)
          if (error.message.includes('Windows')) {
            message.error('该功能仅支持 Windows 系统')
          } else if (error.message.includes('不存在')) {
            message.error('插件文件不存在，请确保安装包完整')
          } else {
            message.error('插件安装失败：' + error.message)
          }
          // window.api.quitApp()
        }
      }
    }
  }
  // 组件卸载时停止预览、登出设备、销毁插件
  const cleanup = async (): Promise<void> => {
    if (loggedInRef.current) {
      try {
        await HCWebSDK.I_StopAllPlay()
        console.log('已停止所有预览')
        await HCWebSDK.I_Logout(szDeviceIdentify)
        console.log('已登出设备')
        window.setTimeout(async () => {
          await HCWebSDK.I_DestroyPlugin()
          loggedInRef.current = false
          console.log('插件已销毁')
        }, 300)
      } catch (err) {
        console.error('清理操作出错：', err)
      }
    }
  }

  useEffect(() => {
    initDevice()
    // 注册接口监听
    window.api.onRequest(async (type: string) => {
      let result = {}
      if (type === 'capture') {
        result = await handleCapture()
      }
      if (type === 'getTime') {
        result = await handleGetTime()
      }
      window.api.sendResponse(result)
    })
    // 定时下载上传视频任务
    const interval = setInterval(() => {
      VideoDownloadService.startScheduledTask()
    }, 10000)

    return (): void => {
      cleanup()
      clearInterval(interval)
    }
  }, [])

  const handleChannelSelect = async (channelId: string): Promise<void> => {
    const channel = channels.find((c) => c.id === channelId)
    if (channel && szDeviceIdentify) {
      setSelectedChannel(channel)
      setChannelInfo(channel)

      try {
        // 只停止最后一个窗口的预览
        await HCWebSDK.I_Stop({ iWndIndex: 0 })

        // 在最后一个窗口启动新选择的通道预览
        const res = await HCWebSDK.I_StartRealPlay(szDeviceIdentify, {
          iWndIndex: 0,
          iChannelID: Number(channel.id) || 1,
          iStreamType: 1
        })
        setIsPluginVisible(true)
        console.log(`通道 ${channel.id} 预览启动成功：`, res)
      } catch (err) {
        console.error(`预览操作失败：`, err)
      }
    }
  }

  const handleCapture = async (): Promise<{ data?: string; error?: string }> => {
    try {
      // 调用抓图接口获取二进制数据
      const imageData = await HCWebSDK.I_CapturePicData({
        iWndIndex: 0
      })
      if (!imageData) {
        return { error: '获取图片数据失败' }
      }

      // 将二进制数据转换为Base64字符串
      const base64Image = `data:image/jpeg;base64,${imageData}`
      setCapturedImage(base64Image)
      return { data: base64Image }
    } catch (err: any) {
      console.error('抓图失败，详细错误：', err)
      return {
        error: `errorCode: ${err.errorCode || '未知'}, errorMsg: ${err.errorMsg || err || '未知'}`
      }
    }
  }

  const handleGetTime = async (): Promise<{ data?: string; error?: string }> => {
    try {
      const value = await HCWebSDK.I_GetOSDTime({ iWndIndex: 0 })
      return { data: value }
    } catch (err: any) {
      console.error('获取OSD时间失败，详细错误：', err)
      return {
        error: `errorCode: ${err.errorCode || '未知'}, errorMsg: ${err.errorMsg || err || '未知'}`
      }
    }
  }

  return (
    <>
      <div id="pluginContainer" className="w-[398px] h-[224px]" />
    </>
  )
}

export default Component
