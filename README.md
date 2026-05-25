# 内容解构演示 - UI 原型

> 一个 Chrome 扩展的 UI 原型，仅用于演示界面排版。**不分析、不抓取、不上传任何内容**。

## 项目定位

本仓库是一个**演示性的界面原型（UI prototype）**，不是可用的分析工具：

- 不读取任何网页内容
- 不调用任何 AI / 后端服务
- 弹窗中展示的"剧情摘要 / 关键剧情点 / 角色 / 套路标签 / 改编建议"全部是**预先写死的静态示例文本**，与用户当前浏览的任何内容无关
- 仅作为 Chrome 扩展弹窗布局、卡片样式、动效的参考实现

> 如果你在寻找可用的内容分析能力，本项目不能满足你的需求。请考虑使用通用大模型或专业 SaaS 工具。

## 现状

- 扩展无 `host_permissions`、无 `content_scripts`、无 `background` 脚本
- 仅有一个 popup（HTML + 一个不发起任何外部请求的本地 JS）
- 权限声明仅保留 `storage`，目前实际未使用

## 文件结构

```
.
├── manifest.json     # 扩展配置（MV3，仅声明 popup）
├── popup.html        # 弹窗界面
├── popup.js          # 仅渲染预设示例数据
├── icons/            # 图标（来源见 NOTICE.md）
├── LICENSE
├── PRIVACY.md        # 隐私说明
├── NOTICE.md         # 素材与第三方声明
├── COMPLIANCE.md     # 合规自查记录
├── SECURITY.md
└── README.md
```

## 安装方法（开发者模式）

1. 克隆或下载本仓库到本地
2. 打开 Chrome，进入 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"，选择本目录
5. 在工具栏点击扩展图标，查看演示弹窗

> 图标文件需要按照 `icons/README.md` 自行生成或替换为已授权的素材。

## 技术栈

- Chrome Extensions Manifest V3
- 原生 HTML / CSS / JavaScript
- 无构建工具、无第三方依赖

## 不在本项目范围内的事项

为避免误导，以下能力**明确不属于本仓库**：

- 任何形式的视频/图文内容分析
- 任何对第三方平台数据的抓取或自动化访问
- 任何账号系统、云端同步、API 服务、团队协作功能
- 任何 AI 模型调用（无论本地还是云端）

历史版本曾包含针对若干视频平台的 DOM 抓取代码，已全部移除。

## 合规与版权

- 项目仅作为 UI 原型公开，不提供下载、搬运、转载或破解任何第三方内容的功能
- 详见 [PRIVACY.md](PRIVACY.md)、[NOTICE.md](NOTICE.md)、[COMPLIANCE.md](COMPLIANCE.md)

## 许可证

MIT License，详见 [LICENSE](LICENSE)。
