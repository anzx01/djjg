# 合规与版权审查

本文件记录发布到 GitHub 前的项目自查结果，不构成法律意见。

## 当前结论（2026-05-26 修订：UI 原型化重构后）

- **项目定位变更**：项目已重构为 Chrome 扩展的 UI 原型，弹窗内容为静态示例，不再读取、抓取或分析任何第三方网站内容。
- **manifest 权限收敛**：`manifest.json` 已移除 `host_permissions`、`content_scripts` 与 `background`，仅保留 `storage` 占位声明。
- **代码精简**：移除了所有针对第三方平台的 DOM 抓取逻辑与对应脚本（`content.js`、`background-clean.js` 等）。仓库根目录下不再保留多套并存的开发草稿/调试/测试文件。
- **平台名清理**：README、PRIVACY、NOTICE、icons/README 等文档中针对具体视频平台的引用已删除或泛化。
- **许可证主体**：`LICENSE` 的 `Copyright` 主体已更新为真实标识（`947057797`），不再使用占位符。
- **图标素材**：当前图标来自仓库内原创 SVG，已在 `NOTICE.md` 记录来源。
- **隐私说明**：`PRIVACY.md` 已同步：UI 原型不收集、不传输、不存储任何用户数据。
- **密钥风险**：未发现 API key、token、密码等敏感信息；`.gitignore` 排除本机工具配置、环境变量和导出数据。

## 仍需人工确认后再发布

- 若希望以个人真实姓名或机构名称署名，请将 `LICENSE` 中的 `947057797` 替换为对应主体。
- 任何未来重新加入网络请求、外部 AI、账号系统、数据同步、日志服务或广告/统计 SDK 的版本，必须：
  - 更新 `PRIVACY.md` 并重新审查数据流；
  - 重新评估扩展权限是否最小化；
  - 重新审查所引用第三方服务的服务条款。
- 任何未来重新引入对具体第三方平台域名的 `host_permissions` 或抓取逻辑，必须再次审查商标使用、平台 ToS 与 Chrome Web Store 政策。
- Chrome Web Store 上架前，需再次检查功能披露、权限最小化、隐私政策链接以及与商店政策的一致性。

## 参考

- Chrome Web Store Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- GitHub licensing guidance: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- GitHub secret scanning: https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning
