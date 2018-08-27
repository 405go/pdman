# PDMan模型定义工具使用手册

## 启动

### 项目运行环境
* node `^8.11.3`
* npm `^5.6.0`

### 如何开始

 你可以根据下面的命令在本地搭建一个PDMan项目:
 
```bash
$ git clone http://192.168.60.43:18001/rdc/PDMan
$ cd PDMan
$ npm install                   # 安装项目依赖
$ npm run start                # 编译代码并且启动electron界面
```

### 项目脚本

在项目的根目录下你可以运行:

### `npm run start`

译代码并且启动electron界面

如果你的代码有变化electron界面会自动刷新.<br>

### `npm run build `

编译并且打包项目代码，打包后的文件将会放在 `build` 目录下.

### `npm run package-win `

编译并且打包项目代码，打包后的文件将会放在 `build` 目录下，.<br>
同时electron打包工具启动，生成 `windows` 安装包放在 `dist` 目录下。

### `npm run package-linux `

编译并且打包项目代码，打包后的文件将会放在 `build` 目录下，.<br>
同时electron打包工具启动，生成 `linux` 安装包放在 `dist` 目录下。

### `npm run package-mac `

编译并且打包项目代码，打包后的文件将会放在 `build` 目录下，.<br>
同时electron打包工具启动，生成 `mac` 安装包放在 `dist` 目录下。

### `npm run package-all `

编译并且打包项目代码，打包后的文件将会放在 `build` 目录下，.<br>
同时electron打包工具启动，生成三个平台安装包放在 `dist` 目录下。