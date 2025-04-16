import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button, Space, Divider, Row, Col, message } from 'antd'
import { EditOutlined, SettingOutlined } from '@ant-design/icons'
import { PageType } from '@renderer/App'
import CameraView from '../CameraView'
import { getWarehouseNewAuth } from '@renderer/services/warehouse'

type Props = {
  setCurrentPage: Dispatch<SetStateAction<PageType>>
}

const ip = '192.168.7.69'
const port = 80
const username = 'admin'
const password = 'cckj1688'

const Component: React.FC<Props> = ({ setCurrentPage }) => {
  const [machineId, setMachineId] = useState<string>('')
  const [info, setInfo] = useState<Record<string, string>>({
    warehouseCode: '',
    stationCode: '',
    stationName: '',
    stationType: '',
    cameraChannel: ''
  })

  // 获取主机唯一标识
  const getMachineId = async (): Promise<void> => {
    try {
      const id = await window.api.getMachineId()
      setMachineId(id)
    } catch (err) {
      message.error('获取主机标识失败：' + err)
    }
  }

  useEffect(() => {
    getMachineId()
  }, [])

  const handleSelectWarehouse = (): void => {
    getWarehouseNewAuth({ useStorageType: 1 }).then((res) => {
      console.log(res)
    })
  }

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Space direction="vertical" size="large" className="text-white text-xl">
            <p>
              当前电脑编码：<span className="break-all">{machineId || '--'}</span>
            </p>
            <p>
              当前仓库：<span>{info.stationCode || '--'}</span>
              <Button
                onClick={handleSelectWarehouse}
                type="primary"
                size="small"
                icon={<EditOutlined />}
                className="ml-4"
              >
                {info.warehouseCode ? '解绑仓库' : '绑定仓库'}
              </Button>
            </p>
            <p>
              工位码：<span>{info.stationCode || '--'}</span>
              <Button type="primary" size="small" icon={<EditOutlined />} className="ml-4">
                {info.stationCode ? '解绑工位' : '绑定工位'}
              </Button>
            </p>
            <p>
              工位名称：<span>{info.stationName || '--'}</span>
            </p>
            <p>
              工位类型：<span>{info.stationType || '--'}</span>
            </p>
            <p>
              摄像头通道号：<span>{info.cameraChannel || '--'}</span>
              <Button type="primary" size="small" icon={<EditOutlined />} className="ml-4">
                {info.cameraChannel ? '解绑摄像头' : '绑定摄像头'}
              </Button>
            </p>
            <p>
              摄像头运行状态：<span>{info.cameraStatus || '--'}</span>
            </p>
            <p>
              摄像区域检测状态：<span>{info.cameraStatus || '--'}</span>
            </p>
          </Space>
        </Col>

        <Col xs={24} md={12}>
          <CameraView ip={ip} port={port} username={username} password={password} />
        </Col>
      </Row>

      <Divider className="my-6 border-white border-opacity-30" />

      <footer className="mt-auto">
        <Button
          type="primary"
          color="geekblue"
          icon={<SettingOutlined />}
          size="large"
          block
          onClick={() => setCurrentPage('settings')}
          className="font-bold text-2xl h-16"
        >
          配置检测区域
        </Button>
      </footer>
    </>
  )
}

export default Component
