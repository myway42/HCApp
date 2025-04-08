/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react'
import HCWebSDK from './utils/HCVideoPlayer'
import { Select, Button, message, DatePicker, Table, Space } from 'antd'
import moment from 'moment'

const { RangePicker } = DatePicker

const App: React.FC = () => {
  const [channels, setChannels] = useState<any[]>([])
  const deviceIdentifyRef = useRef<string>('')
  const loggedInRef = useRef<boolean>(false)
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [channelInfo, setChannelInfo] = useState<any>(null)
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [recordList, setRecordList] = useState<any[]>([])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [timeRange, setTimeRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(1, 'day'),
    moment()
  ])
  const [isPluginVisible, setIsPluginVisible] = useState<boolean>(false)

  useEffect(() => {
    const initDevice = async () => {
      try {
        // 1. 初始化插件及注入到页面指定的容器
        const initRes = await HCWebSDK.I_InitPlugin({
          iWndowType: 1, // 4x4 分屏
          bDebugMode: true,
          // 插件事件回调（可根据需要处理）
          cbSelWnd: (xml: string) => console.log('选中窗口回调：', xml)
        })
        console.log('插件初始化成功：', initRes)

        // 注入插件到页面
        await HCWebSDK.I_InsertOBJECTPlugin('pluginContainer')
        console.log('插件注入成功')

        // 2. 登录设备
        const ip = '192.168.7.69' // 设备 IP
        const protocol = 1 // 1 表示 http 协议
        const port = 80 // 登录端口
        const username = 'admin'
        const password = 'cckj1688'
        const loginRes = await HCWebSDK.I_Login(ip, protocol, port, username, password)
        console.log('设备登录成功：', loginRes)

        // 设备标识为 ip_port 格式
        const devIdentify = `${ip}_${port}`
        deviceIdentifyRef.current = devIdentify
        loggedInRef.current = true
        const deviceInfo = await HCWebSDK.I_GetDeviceInfo(devIdentify)
        console.log('设备信息：', deviceInfo)

        // 3. 获取数字通道信息
        const digitalChannelInfo = await HCWebSDK.I_GetDigitalChannelInfo(devIdentify)
        console.log('数字通道信息：', digitalChannelInfo)

        // 根据返回的 XML 转为 JSON 后，提取通道列表
        let channelList: any[] = []
        const list = digitalChannelInfo?.InputProxyChannelStatusList?.InputProxyChannelStatus
        if (Array.isArray(list)) {
          channelList = list
        } else if (list) {
          channelList = [list]
        }
        setChannels(channelList)

        // 4. 针对每个通道启动预览
        // for (const [index, channel] of channelList.entries()) {
        //   try {
        //     const res = await HCWebSDK.I_StartRealPlay(devIdentify, {
        //       iWndIndex: index, // 使用对应的窗口索引
        //       iChannelID: Number(channel.id) || 1, // 取通道 id（若无则默认 1）
        //       iStreamType: 1, // 主码流
        //     });
        //     console.log(`通道 ${channel.id} 预览启动成功：`, res);
        //   } catch (err) {
        //     console.error(`通道 ${channel.id} 预览启动失败：`, err);
        //   }
        // }
      } catch (err: any) {
        console.error('初始化流程出错：', err)
        if (err.errorCode === 1002) {
          message.error('请先安装摄像头插件')
          try {
            const result = await window.api.executeExe()
            console.log('执行结果:', result)
            initDevice()
          } catch (error) {
            console.error('执行出错:', error)
          }
        }
      }
    }

    initDevice()

    // 5. 组件卸载时停止预览、登出设备、销毁插件
    return () => {
      const cleanup = async () => {
        if (loggedInRef.current && deviceIdentifyRef.current) {
          try {
            await HCWebSDK.I_StopAllPlay()
            console.log('已停止所有预览')
            await HCWebSDK.I_Logout(deviceIdentifyRef.current)
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
      cleanup()
    }
  }, [])

  const handleChannelSelect = async (channelId: string) => {
    const channel = channels.find((c) => c.id === channelId)
    if (channel && deviceIdentifyRef.current) {
      setSelectedChannel(channel)
      setChannelInfo(channel)

      try {
        // 只停止最后一个窗口的预览
        await HCWebSDK.I_Stop({ iWndIndex: 0 })

        // 在最后一个窗口启动新选择的通道预览
        const res = await HCWebSDK.I_StartRealPlay(deviceIdentifyRef.current, {
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
    // if (!selectedChannel) {
    //   message.warning('请先选择一个通道');
    //   return;
    // }

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

  const handleSearchRecord = async () => {
    if (!selectedChannel || !deviceIdentifyRef.current) {
      message.warning('请先选择通道')
      return
    }

    try {
      const startTime = timeRange[0].format('YYYY-MM-DD HH:mm:ss')
      const endTime = timeRange[1].format('YYYY-MM-DD HH:mm:ss')

      const records = await HCWebSDK.I_RecordSearch(
        deviceIdentifyRef.current,
        Number(selectedChannel.id),
        startTime,
        endTime
      )

      if (records?.CMSearchResult?.matchList?.searchMatchItem) {
        const recordArray = Array.isArray(records.CMSearchResult.matchList.searchMatchItem)
          ? records.CMSearchResult.matchList.searchMatchItem
          : [records.CMSearchResult.matchList.searchMatchItem]
        setRecordList(recordArray)
      } else {
        setRecordList([])
      }
    } catch (err) {
      console.error('搜索录像失败：', err)
      message.error('搜索录像失败')
    }
  }

  const handlePlayback = async (record: any) => {
    if (!deviceIdentifyRef.current) return

    try {
      // 只停止最后一个窗口的预览
      await HCWebSDK.I_Stop({ iWndIndex: 0 })
      // 开始回放
      const res = await HCWebSDK.I_StartPlay(deviceIdentifyRef.current, {
        iWndIndex: 0,
        szUrl: record.playbackURI,
        szStartTime: record.startTime,
        szEndTime: record.endTime
      })

      console.log('开始回放：', res)
      setIsPlaying(true)
      message.success('开始回放')
    } catch (err) {
      console.error('回放失败：', err)
      message.error('回放失败')
    }
  }

  const handlePause = async () => {
    try {
      await HCWebSDK.I_Pause()
      setIsPlaying(false)
      message.success('已暂停')
    } catch (err) {
      console.error('暂停失败：', err)
      message.error('暂停失败')
    }
  }

  const handleResume = async () => {
    try {
      await HCWebSDK.I_Resume()
      setIsPlaying(true)
      message.success('已恢复播放')
    } catch (err) {
      console.error('恢复播放失败：', err)
      message.error('恢复播放失败')
    }
  }

  // const handleTogglePlugin = async () => {
  //   try {
  //     if (isPluginVisible) {
  //       await HCWebSDK.I_HidPlugin()
  //     } else {
  //       await HCWebSDK.I_ShowPlugin()
  //     }
  //     setIsPluginVisible(!isPluginVisible)
  //   } catch (err) {
  //     console.error('切换插件显示状态失败：', err)
  //     message.error('切换插件显示状态失败')
  //   }
  // }

  const columns = [
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {isPlaying ? (
            <Button onClick={handlePause}>暂停</Button>
          ) : (
            <Button onClick={handleResume}>恢复</Button>
          )}
          <Button onClick={() => handlePlayback(record)}>回放</Button>
        </Space>
      )
    }
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">设备预览</h1>
      <main className="flex gap-4">
        <section className="w-1/2">
          {/* 通道选择下拉框 */}
          <div className="mb-4">
            <Select className="w-48" placeholder="请选择通道" onChange={handleChannelSelect}>
              {channels.map((channel) => (
                <Select.Option key={channel.id} value={channel.id}>
                  通道 {channel.name || channel.id}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* 录像搜索区域 */}
          <div className="mb-4">
            <Space>
              <RangePicker
                showTime
                // value={timeRange}
                onChange={(dates) => dates && setTimeRange(dates as [moment.Moment, moment.Moment])}
              />
              <Button type="primary" onClick={handleSearchRecord}>
                搜索录像
              </Button>
            </Space>
          </div>

          {/* 录像列表 */}
          <div className="mb-4">
            <Table
              columns={columns}
              dataSource={recordList}
              rowKey="startTime"
              pagination={false}
            />
          </div>

          {/* 抓图按钮 */}
          <div className="mb-4">
            <Button type="primary" onClick={handleCapture}>
              抓图
            </Button>
          </div>

          {/* 抓图结果显示 */}
          {capturedImage && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">抓图结果：</h3>
              <img
                src={capturedImage}
                alt="抓图结果"
                className="max-w-md max-h-[300px] border border-gray-200 rounded-lg"
              />
            </div>
          )}
        </section>
        {isPluginVisible && (
          <div className="w-1/2">
            {/* 插件容器，插件将被注入此处 */}
            <div id="pluginContainer" className="w-[398px] h-[224px]"></div>

            {/* 通道信息显示区域 */}
            {channelInfo && (
              <div className="p-4 rounded-lg mt-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">通道详细信息：</h3>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(channelInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
