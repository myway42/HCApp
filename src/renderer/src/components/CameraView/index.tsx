/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react'
import HCWebSDK from '../../utils/HCVideoPlayer'
import { Button, message } from 'antd'

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
  const initDevice = async () => {
    try {
      // 1. 初始化插件
      await HCWebSDK.I_InitPlugin({
        iWndowType: 1, // 分屏
        bDebugMode: true,
        cbSelWnd: (xml: string) => console.log('选中窗口回调：', xml)
      })
      console.log('插件初始化成功')
      // 注入插件到页面
      await HCWebSDK.I_InsertOBJECTPlugin('pluginContainer')
      console.log('插件注入成功')

      // 2. 登录设备
      const loginRes = await HCWebSDK.I_Login(ip, 1, port, username, password)
      console.log('设备登录成功：', loginRes)
      loggedInRef.current = true

      // 3. 获取数字通道信息
      const channelList = await HCWebSDK.I_GetDigitalChannelInfo(szDeviceIdentify)
      console.log('数字通道信息：', channelList)
      setChannels(channelList)
    } catch (err: any) {
      console.error('初始化流程出错：', err)
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
  const cleanup = async () => {
    if (loggedInRef.current) {
      try {
        await HCWebSDK.I_StopAllPlay()
        console.log('已停止所有预览')
        await HCWebSDK.I_Logout(szDeviceIdentify)
        console.log('已登出设备')
        window.setTimeout(async () => {
          await HCWebSDK.I_DestroyPlugin()
          console.log('插件已销毁')
        }, 300)
      } catch (err) {
        console.error('清理操作出错：', err)
      }
    }
  }

  useEffect(() => {
    initDevice()

    return () => {
      cleanup()
    }
  }, [])

  const handleChannelSelect = async (channelId: string) => {
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

  const handleCapture = async () => {
    try {
      // 调用抓图接口获取二进制数据
      const imageData = await HCWebSDK.I_CapturePicData({
        iWndIndex: 0
      })

      if (!imageData) {
        throw new Error('获取图片数据失败')
      }

      // 将二进制数据转换为Base64字符串
      const base64Image = `data:image/jpeg;base64,${imageData}`
      setCapturedImage(base64Image)

      message.success('抓图成功')
    } catch (err: any) {
      console.error('抓图失败，详细错误：', err)
      message.error(`抓图失败：${err.message || '未知错误'}`)
    }
  }

  return <div id="pluginContainer" className="w-[398px] h-[224px]"></div>
}

export default Component
