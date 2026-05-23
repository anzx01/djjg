# 🔧 短剧解构师调试指南

## 问题诊断

插件内容脚本没有在页面上执行，这通常由以下几个原因造成：

### 🚨 常见问题

1. **权限问题** - content.js只在特定域名执行
2. **插件未正确加载** - 需要重新安装
3. **控制台被过滤** - 可能看不到所有日志
4. **文件路径错误** - 引用的图标文件不存在

## 🧪 快速测试方案

### 方案1：使用调试版本（推荐）

我已创建了简化调试版本，可以测试基本功能：

**步骤：**
1. 备份当前的 `manifest.json`
2. 将 `manifest-simple.json` 重命名为 `manifest.json`
3. 刷新插件
4. 在任何页面打开控制台

**期望看到的日志：**
```
🚀 简短剧解构师测试脚本已加载!
📍 当前页面信息: {...}
🧪 开始基本功能测试...
✅ Chrome扩展API可用
✅ 消息发送成功: {...}
✅ content-simple.js 执行完成
```

### 方案2：手动测试插件

**步骤：**
1. 打开 `chrome://extensions/`
2. 找到"短剧解构师"插件
3. 点击"详细信息"
4. 检查是否有错误信息

**检查项目：**
- ✅ 插件已启用（不是灰色状态）
- ✅ 没有红色的错误提示
- ✅ 权限列表正确

### 方案3：在支持的平台上测试

**测试平台：**
- 抖音: https://www.douyin.com/
- 快手: https://www.kuaishou.com/
- B站: https://www.bilibili.com/
- 西瓜视频: https://www.ixigua.com/

**在这些平台上应该能看到：**
```
短剧解构师内容脚本已加载
初始化短剧解构师内容脚本...
```

## 🔍 逐步排查

### 第一步：检查插件状态
1. 打开 `chrome://extensions/`
2. 确认插件状态：
   - [x] 已启用
   - [x] 开发者模式已开启
   - [x] 没有错误提示

### 第二步：检查后台日志
1. 在 `chrome://extensions/` 页面
2. 找到"短剧解构师"插件
3. 点击"服务工作进程"或"背景页"
4. 查看后台控制台输出

**应该看到：**
```
短剧解构师插件已安装
🎯 收到页面检测结果: {...}
```

### 第三步：检查内容脚本
1. 访问支持的平台页面
2. 打开开发者工具 (F12)
3. 查看Console标签页
4. 按F5刷新页面

### 第四步：测试简化版本
如果原版本不工作，使用简化版本：

```bash
# 备份原文件
mv manifest.json manifest-original.json
mv background.js background-original.json

# 使用调试版本
mv manifest-simple.json manifest.json
mv background-simple.js background-simple.js
```

## 🛠️ 修复方案

### 修复1：创建缺失的图标文件
图标文件不存在会导致插件加载失败：

```html
<!-- 在 icons/ 目录中创建简单的PNG文件 -->
<!-- 或者暂时注释掉manifest.json中的图标配置 -->
```

### 修复2：更新权限配置
确保有正确的权限：

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "notifications"
  ],
  "host_permissions": [
    "*://*.douyin.com/*",
    "*://*.kuaishou.com/*",
    "*://*.bilibili.com/*",
    "*://*.ixigua.com/*"
  ]
}
```

### 修复3：重新安装插件
1. 在 `chrome://extensions/` 中移除插件
2. 点击"加载已解压的扩展程序"
3. 重新选择项目文件夹

## 📝 调试技巧

### 查看所有日志
```javascript
// 在任何页面控制台中执行
console.clear();
console.log('当前页面:', window.location.href);
console.log('插件状态:', typeof chrome !== 'undefined');
```

### 检查脚本注入
```javascript
// 检查content script是否已执行
if (window.location.href.includes('douyin.com') ||
    window.location.href.includes('kuaishou.com') ||
    window.location.href.includes('bilibili.com') ||
    window.location.href.includes('ixigua.com')) {
    console.log('在支持的平台，应该看到插件日志');
}
```

### 手动注入脚本
```javascript
// 在控制台手动测试插件功能
chrome.runtime.sendMessage({
    action: 'test',
    message: '手动测试'
}, function(response) {
    console.log('响应:', response);
});
```

## 🎯 成功标准

当插件正常工作时，你应该能够：

1. **在任意页面**（使用调试版本）：
   - 看到 `🚀 简短剧解构师测试脚本已加载!`
   - 看到Chrome API测试结果

2. **在支持的平台**（使用原版本）：
   - 看到 `短剧解构师内容脚本已加载`
   - 看到页面检测日志

3. **在后台控制台**：
   - 看到插件初始化消息
   - 看到页面检测结果

4. **在popup界面**：
   - 显示 "✅ 已检测到支持的短剧平台"

## 📞 问题反馈

如果按照以上步骤仍然无法解决，请提供：

1. 浏览器控制台截图
2. 后台服务控制台截图
3. chrome://extensions/ 中插件状态截图
4. 具体使用的浏览器和版本

---

**提示：** 从简到繁，先确保基础功能工作，再逐步添加复杂功能。