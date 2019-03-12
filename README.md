# PDMan模型定义工具

## 启动

### 项目运行环境
* node `^8.11.3`
* npm `^5.6.0`

### 如何开始

 你可以根据下面的命令在本地搭建一个pdman项目:
 
```bash
$ git clone https://gitee.com/robergroup/pdman
$ cd pdman
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

---------------------
---------------------
---------------------
以下是软件介绍
---------------------
---------------------
---------------------

<base target="_blank" />


# 软件说明博客
[PDMan-国产免费通用数据库建模工具（极简，漂亮）](https://my.oschina.net/skymozn/blog/1821184)

#### 立志要做
1.  最好的 **数据库设计工具**
2.  最好的 **数据库版本管理工具**

#### 项目介绍
PDMan是由国内知名金融IT上市公司，内部研发团队设计的一款面向数据库模型建模的软件，是PowerDesigner的一个优秀的替代方案.特点如下：
1. 免费使用
2. 功能简洁，去除晦涩难懂的设置，化繁为简，实用为上，上手非常容易。
3. Windows，Mac，Linux三个平台均可以使用（**敲黑板，重点**）。
4. 自带参考案例，学习容易。新建一个项目，完全不需要做任何配置。
5. 对开发极其友好，可生成各种数据库以及编程语言的模型类。
6. 目前系统默认实现了MySQL,Oracle,Java的代码自动生成，并且带注释。其他类型的数据库或语言，只需要添加相应的“数据库”并设置好相应的doT模板就可以了。
7. 一键自动生成数据表结构文档，方便客户交付。
8. 数据库 **版本管理** 以及 **数据库同步** 功能,解决数据库版本管理的一大痛点。
9. 生成数据库脚本以及提供导出功能。

#### 上图

**启动画面：**
![](https://oscimg.oschina.net/oscnet/eba42e7a27d86d7c90712637d5342a43095.jpg)
![](https://oscimg.oschina.net/oscnet/967c2a16712629058b08e22184a3c3c5fcd.jpg)

**主工作界面：**
![](https://oscimg.oschina.net/oscnet/826d5265d68a43df33d8f4aef4498ff1469.jpg)
![](https://oscimg.oschina.net/oscnet/2cab05d55f076766d80fa654cb1c118b4a4.jpg)
![](https://oscimg.oschina.net/oscnet/b14b33c20a2f500add7cc6097b378a90bed.jpg)
![](https://oscimg.oschina.net/oscnet/1bd3093ec0ab6f188f2f41c35e63a0a3472.jpg)
代码模板编辑器 
![](https://oscimg.oschina.net/oscnet/fee036bae7c8c47213db925cd2197f1486a.jpg)

**数据类型以及数据域：**
![](https://oscimg.oschina.net/oscnet/f11f8fe73ba251618da4312ed58b0ecc42a.jpg)
![](https://oscimg.oschina.net/oscnet/80547a25e2f57c4ec107df1501aca9581fa.jpg)
![](https://oscimg.oschina.net/oscnet/761364fcd82574c0df3973a62f1bcae6294.jpg)
![](https://oscimg.oschina.net/oscnet/6ddeae5fa48746d2662b3e5d15587a77910.jpg)

**脚本导出：**
![](https://oscimg.oschina.net/oscnet/5ac2315c047e3de1a03052666cda7a24d21.jpg)
导出特定类型的脚本 
![](https://oscimg.oschina.net/oscnet/ae2b73dd7e0f250242f85b263a803eb2c53.jpg)

**数据库版本管理：**
![](https://oscimg.oschina.net/oscnet/59745fe5202ecd465d22db7765bfa9b102e.jpg)
![](https://oscimg.oschina.net/oscnet/479097dcbf242ea5b919719f344599d006e.jpg)
![](https://oscimg.oschina.net/oscnet/7564296e5e9be830fea96c24a8c2c398cd8.jpg)
![](https://oscimg.oschina.net/oscnet/78d0d9f13c1a3a8a5eec77f5266c707fe1c.jpg)

**生成文档: **
![](https://static.oschina.net/uploads/img/201805/30142335_afkp.jpg "")
![](https://static.oschina.net/uploads/img/201805/30142409_V3a7.jpg "")
![](https://static.oschina.net/uploads/img/201805/30142424_NNuW.jpg "")
![](https://static.oschina.net/uploads/img/201805/30142444_Y7hY.jpg "")

#### 鸣谢开源
&emsp;&emsp;站在巨人的肩上，PDMan的推出，离不开开源的支持，主要使用到的技术如下：
- React(<https://reactjs.org/>)
- Electron(<https://github.com/electron/electron>)
- font-awesome(<http://www.fontawesome.com.cn>)
- AntV-G6 (<http://antvis.github.io/g6/doc/index.html>) 
- highlightjs(<https://highlightjs.org>)
- ace editor(<https://ace.c9.io>)
- doT.js(<http://olado.github.io>)

#### 贡献者

- @[菠罗](https://gitee.com/teamsir) 主要设计者、兼任测试员
- @[牛叉刘教授](https://gitee.com/niuchaliujiaoshou) 主要开发者
- @[mtain](https://gitee.com/mtain) 开发者
- @[CaroTu](https://gitee.com/CaroTu) 先驱者
- #TinaYan 数据表图形展现皮肤设计
- #莎莎  UI界面以及LOGO设计（备注：是个纯爷们儿）

#### 下载

-   [码云地址](https://gitee.com/robergroup/pdman)
-   [Windows](https://share.weiyun.com/5L07rh4)
-   [Mac](https://share.weiyun.com/57ggCes)
-   [Linux](https://share.weiyun.com/5xMIsvj)

#### 欢迎加钉钉群交流
![](https://static.oschina.net/uploads/img/201806/01151807_3YY6.jpg "")
