---
title: 隆重推出 MTR：站间物语
date: 2026-11-14 00:53:18
author: Creating工程组
tags: [MTR, mods]
cover: https://raw.githubusercontent.com/teamCreating/MTR-Navigation/v0.1.1/docs/screenshots/0.1.1/journey-query.png
---

从附近的车站出发，哪条线路最快？想少换一次车，又该怎么走？Creating 工程组很高兴向大家介绍 **MTR：站间物语（MTR Navigation）**。这是 Minecraft Transit Railway（MTR）的铁路导航模组，能在游戏里查车站、比换乘、看班次，并在途中提示下一步该做什么。

项目于 2026 年 10 月 26 日发布首个公开 Alpha 测试版，11 月 14 日（北京时间）推出 **v0.1.1 正式版**。这一版统一采用 Ore UI 风格，新增车型筛选，并在行程摘要中按乘车顺序列出线路和步行时间。封面拍摄于「苔灯群岛」测试存档，画面中的站名、线路和班次均为演示数据。[首个公开测试版](https://github.com/teamCreating/MTR-Navigation/releases/tag/v0.1.0-alpha.1) · [v0.1.1 发布说明](https://github.com/teamCreating/MTR-Navigation/releases/tag/v0.1.1)

## 查换乘，也能选车型

在游戏里按 **N** 或输入 `/mtrnav`，就能搜索中英文站名，也可以从附近车站选起点。一次查询最多显示五种走法，可以按「最快到达」或「少换乘」排序，再点开方案查看乘车方向、站台和途经站。提前录入的站间或站台间步行时间也会计入换乘计算。[快速上手](https://github.com/teamCreating/MTR-Navigation/blob/v0.1.1/README.md#快速开始)

如果想特意搭乘某种列车，可以把对应车型设为「优先乘坐」或「必须乘坐」。车型筛选需要服务端支持新版 Navigation 查询，行程详情可以查看实际或计划编组。[车型筛选说明](https://github.com/teamCreating/MTR-Navigation/blob/v0.1.1/docs/vehicles.md)

## 看车站到发，设置班次提醒

车站到发页按线路列出班次，展开就能查看站台、到站及发车倒计时。点选一班列车，可设置到站前提醒，默认提前 9 分钟。开始导航后，即使关闭主界面，HUD 也会继续提示下一步。导航和班次提醒可以分别调整位置和大小。[到发与班次提醒](https://github.com/teamCreating/MTR-Navigation/blob/v0.1.1/README.md#到发与班次提醒)

## 下载与安装

v0.1.1 为 Minecraft **1.21.1** 和 **1.21.4** 分别提供 NeoForge、Fabric 安装包，需要 **Java 21** 和与游戏版本、加载器匹配的 **MTR 4.1.0-beta.2**。Fabric 环境还需安装对应版本的 Fabric API。选好一个 JAR 后，将它放入游戏实例的 `mods` 文件夹。

客户端需要安装站间物语。若服务端只装了 MTR，基本查询依赖 MTR 原生地图服务。服务端也安装新版站间物语后，可使用专用的全网查询。已经装有 MTR Map Overlay 的玩家也可复用它同步的车站目录。[Overlay 对接指南](https://github.com/teamCreating/MTR-Navigation/blob/v0.1.1/docs/overlay-integration.md)

**下载与文档**　[GitHub Releases](https://github.com/teamCreating/MTR-Navigation/releases/tag/v0.1.1) · [项目主页](https://github.com/teamCreating/MTR-Navigation) · [安装与兼容说明](https://github.com/teamCreating/MTR-Navigation/blob/v0.1.1/README.md#安装与兼容)

欢迎在自己的 MTR 路网上试一趟。如果遇到查不到的班次，或发现换乘方案有误，可以在 GitHub 附上游戏版本和复现步骤。[提交问题或建议](https://github.com/teamCreating/MTR-Navigation/issues)
