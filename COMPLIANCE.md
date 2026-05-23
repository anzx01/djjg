# 合规与版权审查

本文件记录发布到 GitHub 前的项目自查结果，不构成法律意见。

## 当前结论（2026-05-23 审查更新）

- 许可证：已补充 MIT License，README 中的许可证声明现在有对应文件。
- 第三方依赖：当前仓库未提交第三方依赖包。
- 图标素材：当前图标来自仓库内原创 SVG，已在 `NOTICE.md` 记录来源。
- 隐私说明：已补充 `PRIVACY.md`，说明当前版本本地运行、不上传数据、不调用外部 AI API。
- 平台和商标：README/NOTICE 中已说明平台名称仅用于兼容性描述，不代表官方合作或背书。
- 密钥风险：未发现 API key、token、密码等明显敏感信息；已通过 `.gitignore` 排除本机工具配置、环境变量和导出数据。
- 扩展权限：生产 `manifest.json` 限定在受支持平台域名，并移除了当前未使用的 `scripting` 权限。
- 仓库整洁：已通过 `git rm --cached` 移除 15 个开发阶段的草稿/调试/测试文件，并更新 `.gitignore` 防止此类文件重新加入追踪。

## 仍需人工确认后再发布

- **⚠️ 重要**：`LICENSE` 中的版权主体当前为 `djjg contributors`（通用占位符）。如果项目属于个人、公司或团队，**必须**在提交前将其改为真实权利人的姓名或名称。
- 不要提交从平台采集的真实视频、字幕、评论、截图、导出 JSON 或分析样本，除非已取得授权。
- 如果未来版本接入云端 AI、账号系统、数据同步、日志服务或广告/统计 SDK，必须更新 `PRIVACY.md`，并重新审查权限、数据流和第三方服务条款。
- Chrome Web Store 上架前，需要再次检查扩展功能披露、权限最小化、隐私政策链接和平台内容使用方式。

## 参考

- Chrome Web Store Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- GitHub licensing guidance: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- GitHub secret scanning: https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning
