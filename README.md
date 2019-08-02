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
![](https://gitee.com/uploads/images/2019/0411/183650_15612898_24669.jpeg)
![](https://images.gitee.com/uploads/images/2019/0527/114330_f01b3f3c_24669.jpeg)

**主工作界面：**
![](https://images.gitee.com/uploads/images/2019/0527/114326_c8308ac6_24669.jpeg)
![](https://gitee.com/uploads/images/2019/0411/112013_835d9163_24669.jpeg)
![](https://gitee.com/uploads/images/2019/0411/183650_9a6efea9_24669.jpeg)
![](https://gitee.com/uploads/images/2019/0411/112017_72e44799_24669.jpeg)
代码模板编辑器 
![](https://gitee.com/uploads/images/2019/0411/112013_9a573b87_24669.jpeg)

**数据类型以及数据域：**
![](https://gitee.com/uploads/images/2019/0411/112019_1641bb4f_24669.jpeg)
![](https://oscimg.oschina.net/oscnet/80547a25e2f57c4ec107df1501aca9581fa.jpg)
![](https://images.gitee.com/uploads/images/2019/0527/114326_2bbc4e40_24669.jpeg)
![](https://images.gitee.com/uploads/images/2019/0527/114326_4a735cf7_24669.jpeg)

**脚本导出：**
![](https://oscimg.oschina.net/oscnet/5ac2315c047e3de1a03052666cda7a24d21.jpg)
导出特定类型的脚本 
![](https://gitee.com/uploads/images/2019/0411/112024_0135071c_24669.jpeg)

**数据库版本管理：**
![](https://gitee.com/uploads/images/2019/0411/112024_f09f22fb_24669.jpeg)
![](https://gitee.com/uploads/images/2019/0411/112024_f6b2ed31_24669.jpeg)
![](https://gitee.com/uploads/images/2019/0411/112025_ee6f36cd_24669.jpeg)
![](https://gitee.com/uploads/images/2019/0411/183706_5aab3a6a_24669.jpeg)

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
-   [Windows](https://gitee.com/robergroup/pdman/attach_files)
-   [Mac](https://gitee.com/robergroup/pdman/attach_files)
-   [Linux](https://gitee.com/robergroup/pdman/attach_files)

#### 欢迎加钉钉群交流
*** 钉钉一群已满 ***
![](https://static.oschina.net/uploads/img/201806/01151807_3YY6.jpg "")
*** 请加钉钉二群 ***
![](https://images.gitee.com/uploads/images/2019/0527/114326_b7a4d632_24669.png ".png")
#### 捐赠作者
![输入图片说明](https://gitee.com/uploads/images/2019/0411/183645_ee6e3e21_24669.png "屏幕截图.png")
![输入图片说明](https://gitee.com/uploads/images/2019/0411/183709_92999b1a_24669.png "屏幕截图.png")

