export interface PagingRequest<T> {
  data?: T
  pageNum: number
  pageSize: number
  beginDate?: string
  endDate?: string
}
export interface Paging<T> {
  /**
   * 请求条数
   */
  pageSize: number
  /**
   * 当前页面
   */
  pageNumber: number
  /**
   * 总记录数
   */
  totalRecords: number
  /**
   * 记录列表
   */
  content: Array<T>
}

// 将命名空间改为接口和类型定义
export interface GetWarehouseRequest {
  /**
   * 区域id
   */
  areaId?: number
  /**
   * 仓库类型 0测试 1真实 2虚拟 3SAAS仓
   */
  useStorageType?: number
  /**
   * 供应商是否可以发货到该仓库(0、否，1、是)
   */
  suppliersWillBeAbleToDeliver?: number
  /**
   * 该仓库是否有采购权限(0、否，1、是)
   */
  purchasingAuthority?: number
  /**
   * 是否需要VIP才能购买私有库存(0、否，1、是)
   */
  vipPrivateStockToBuy?: number
  /**
   * 是否允许放服务商品 0 否 1是
   */
  placeServerProduct?: number
  /**
   * 是否允许放私有商品 0否 1是
   */
  placePrivateProduct?: number
  /**
   * 仓库状态(0,删除，1、禁用，2 启用)
   */
  isDelete?: number
}

export interface GetWarehouseResponse {
  /**
   * 仓库id
   */
  id: string
  /**
   * 仓库名称
   */
  storageName: string
  /**
   * 区域id, 1: 国内仓，其他: 海外仓
   */
  areaId: number
  /**
   * 仓库路径
   */
  path: string
}
