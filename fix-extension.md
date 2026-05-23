# 🔧 修复"内容脚本加载失败"问题

## 立即解决方案

### 方案1：使用干净版本测试（推荐）

1. **备份当前文件**：
   ```bash
   mv manifest.json manifest-backup.json
   mv content.js content-backup.js
   ```

2. **使用干净版本**：
   ```bash
   mv manifest-clean.json manifest.json
   mv content-clean.js content.js
   ```

3. **重新加载插件**：
   - 在 `chrome://extensions/` 页面
   - 点击插件的刷新按钮
   - 或者移除后重新加载

4. **测试**：
   - 在任何页面刷新
   - 打开控制台
   - 应该看到：`🎯 短剧解构师 - 内容脚本已加载`

### 方案2：检查文件编码

1. **检查文件编码**：
   - 用文本编辑器打开 `content.js`
   - 确保是UTF-8编码
   - 确保没有BOM头

2. **检查特殊字符**：
   - 搜索是否有特殊Unicode字符
   - 确保没有不可见字符

### 方案3：分步加载

如果干净版本工作，但原版本不工作，可能是以下问题：

1. **文件过大**：content.js文件太大（目前约900行）
2. **复杂代码**：某些Chrome版本对复杂内容脚本有限制
3. **ES6语法**：某些环境可能不支持所有ES6特性

## 诊断步骤

### 第一步：确认插件状态
在 `chrome://extensions/` 检查：
- [ ] 插件已启用
- [ ] 没有红色错误提示
- [ ] 点击"详细信息"查看详细错误

### 第二步：查看具体错误
1. 点击插件的"详细信息"
2. 查看"错误"部分
3. 记录具体的错误信息

### 第三步：检查Chrome版本
1. 地址栏输入：`chrome://version/`
2. 确认Chrome版本支持Manifest V3
3. 更新到最新版本

### 第四步：清除缓存
1. 清除浏览器缓存
2. 重启Chrome
3. 重新加载插件

## 常见修复方法

### 方法1：简化manifest
```json
{
  "manifest_version": 3,
  "version": "0.1.0",
  "name": "短剧解构师",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

### 方法2：分离功能
将大的content.js拆分为多个小文件：
```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["detector.js", "capturer.js"]
    }
  ]
}
```

### 方法3：使用编程式注入
```javascript
// 在background.js中
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['content.js']
});
```

## 紧急恢复

如果所有方法都失败，重新创建：

1. **创建新目录**：`C:\drama-analyzer\`
2. **创建最简单的manifest**和**content.js**
3. **逐步添加功能**

---

**请先尝试方案1（干净版本），如果成功，我们再逐步恢复原有功能。**