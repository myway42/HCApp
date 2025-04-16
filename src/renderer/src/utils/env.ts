/**
 * 环境配置工具
 * 用于获取当前环境下的配置信息
 */

// 当前环境
export const ENV = import.meta.env.MODE || 'development'

// 是否为开发环境
export const isDev = ENV === 'development'

// 是否为生产环境
export const isProd = ENV === 'production'

// API 基础 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 获取当前环境名称
export function getEnvName(): string {
  if (isDev) return '开发环境'
  if (isProd) return '生产环境'
  return '未知环境'
}

// 环境配置接口
interface EnvConfig {
  env: string
  apiBaseUrl: string
  isDev: boolean
  isProd: boolean
}

// 获取当前环境配置
export function getEnvConfig(): EnvConfig {
  return {
    env: ENV,
    apiBaseUrl: API_BASE_URL,
    isDev,
    isProd
  }
}
