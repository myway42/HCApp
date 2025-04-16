import { XMLParser } from 'fast-xml-parser'

export function getNameFromRTSPUrl(url: string): string | null {
  const match = url.match(/name=([^&]+)/)
  return match ? match[1] : null
}

// 使用 fast-xml-parser 解析 XML 字符串
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseXML(xmlInput: string | Node): any {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true
  })
  let xmlString = xmlInput
  if (xmlInput instanceof Document) {
    // 将 DOM 对象转换为字符串
    const serializer = new XMLSerializer()
    xmlString = serializer.serializeToString(xmlInput)
  }
  if (!xmlString) {
    console.error('XML字符串为空')
    return null
  }
  try {
    const result = parser.parse(xmlString as string)
    return result
  } catch (error) {
    console.error('XML解析失败，详细错误：', error)
    return null
  }
}
