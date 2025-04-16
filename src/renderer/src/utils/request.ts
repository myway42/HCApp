import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { message } from 'antd'
import { API_BASE_URL, ENV } from './env'

// 获取基本信息
const getStoreInfo = () => {
  const token = Storage.localGet('_TOKEN_') ?? ''
  const storeList = Storage.localGet('storeList') || []
  const defaultWarehouseId = window.__WAREHOUSEID__ // 之前取localStorage导致多开页面共享warehouseId,现在取window下就不会有这样的问题了
  const servicePath = storeList.filter((item: any) => item.key == defaultWarehouseId)[0]?.path || ''

  return {
    token,
    storeList,
    defaultWarehouseId,
    servicePath
  }
}

// 创建请求实例
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    serviceToken: ENV === 'development' ? 'serviceToken' : undefined
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('wa')
    config.headers.area = servicePath
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.method === 'post' && !config.data) {
      // 后端需求没有参数必须要传空的对象
      config.data = {}
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response

    if (data.code === 200) {
      return Promise.resolve(data.data)
    } else {
      // 处理业务错误
      message.error(data.message || '请求失败')
      return Promise.reject(data)
    }
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response

      // 根据HTTP状态码处理
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          message.error('登录已过期，请重新登录')
          break
        case 403:
          message.error('没有权限访问该资源')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误，请稍后再试')
          break
        default:
          message.error(`请求失败: ${error.message}`)
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message.error('网络错误，请检查您的网络连接')
    } else {
      // 请求配置出错
      message.error(`请求配置错误: ${error.message}`)
    }

    return Promise.reject(error)
  }
)

// 封装GET请求
export function get<T = unknown>(
  url: string,
  params?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  return instance.get(url, { params, ...config }).then((response) => response.data)
}

// 封装POST请求
export function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  return instance.post(url, data, config).then((response) => response.data)
}

// 封装PUT请求
export function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  return instance.put(url, data, config).then((response) => response.data)
}

// 封装DELETE请求
export function del<T = unknown>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
  return instance.delete(url, config).then((response) => response.data)
}

export default instance
