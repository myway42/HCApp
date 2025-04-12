import { useEffect, useState } from 'react'
import { Card, Button } from 'antd'
import Home from './components/Home'

// 定义页面类型
export type PageType = 'home' | 'detection' | 'settings'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home')

  // 渲染检测页面
  const renderDetectionPage = (): JSX.Element => (
    <div className="text-white">
      <Button onClick={() => setCurrentPage('home')} className="mb-4">
        返回首页
      </Button>
      <h2 className="text-2xl mb-4">头盔检测页面</h2>
      {/* 这里添加检测页面的具体内容 */}
    </div>
  )

  // 渲染设置页面
  const renderSettingsPage = (): JSX.Element => (
    <div className="text-white">
      <Button onClick={() => setCurrentPage('home')} className="mb-4">
        返回首页
      </Button>
      <h2 className="text-2xl mb-4">检测区域配置页面</h2>
      {/* 这里添加设置页面的具体内容 */}
    </div>
  )

  return (
    <div
      className="min-h-screen p-4 flex"
      style={{ background: 'linear-gradient(348deg, #3f8089,#009b81,#14af3f)' }}
    >
      <Card hoverable variant="borderless" className="flex-1 bg-white bg-opacity-30 cursor-default">
        {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
        {currentPage === 'detection' && renderDetectionPage()}
        {currentPage === 'settings' && renderSettingsPage()}
      </Card>
    </div>
  )
}

export default App
