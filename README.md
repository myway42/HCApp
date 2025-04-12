# hc-app

仓库摄像头检测程序，只支持 windows 系统，框架：electron + react + typescript + antd5 + tailwindcss + vite

## 项目启动

### 安装依赖

```bash
$ yarn
```

### 开发

```bash
$ yarn dev
```

### 打包

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## 项目结构

```
app/
├── src/                    # 源代码目录
│   ├── main/              # 主进程代码
│   ├── renderer/          # 渲染进程代码
│   └── preload/           # 预加载脚本
├── resources/             # 资源文件目录
├── build/                 # 构建相关配置
├── electron.vite.config.ts # Vite 配置
├── electron-builder.yml   # 打包配置
├── tailwind.config.js     # Tailwind CSS 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖配置
```

## 项目依赖

- `electron` - Electron 框架
- `react` - React 框架
- `antd` - Ant Design 组件库
- `tailwindcss` - Tailwind CSS 样式框架
- `typescript` - TypeScript 支持
- `vite` - 构建工具
- `electron-vite` - Electron + Vite 集成
- `electron-builder` - 应用打包工具
- `@electron-toolkit/*` - Electron 开发工具集
- `electron-updater` - 应用自动更新
- `node-machine-id` - 设备 ID 生成
- `dayjs` - 日期处理
- `fast-xml-parser` - XML 解析
