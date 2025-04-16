import { post } from '../../utils/request'
import type { GetWarehouseRequest, GetWarehouseResponse } from './type'
/**
 * 获取仓库列表
 */
export function getWarehouseNewAuth(data?: GetWarehouseRequest): Promise<GetWarehouseResponse> {
  return post('/storehouse-center-web/syncStorehouseDetail/getStorehouseInfoNew', data)
}
