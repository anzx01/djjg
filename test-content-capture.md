# 智能内容捕获模块测试指南

## 功能概述

"短剧解构师"插件的智能内容捕获模块已经完成，包含以下核心功能：

### 🎯 核心功能

1. **智能页面检测**
   - 自动识别支持的平台：抖音、快手、B站、西瓜视频
   - 检测短剧内容特征（关键词、URL模式、DOM结构）
   - SPA路由变化监控
   - 30秒智能缓存避免重复检测

2. **多层次内容捕获**
   - 视频信息：标题、描述、时长
   - 文本内容：字幕、描述、评论
   - 元数据：作者、发布时间、平台信息
   - 互动数据：播放量、点赞数、B站弹幕数
   - 剧集信息：集数、系列信息

3. **智能数据管理**
   - 内容去重和缓存管理
   - 自动处理队列系统
   - 数据验证和清理
   - 本地存储优化

4. **增强通信机制**
   - 可靠的消息传递
   - 错误处理和重试
   - 异步操作支持

## 数据流向

```
页面加载 → 内容脚本检测 → 自动内容捕获 → 后台处理 → 存储管理
    ↓              ↓                 ↓            ↓
URL监控       DOM元素提取      数据验证清理    队列处理
    ↓              ↓                 ↓            ↓
页面分类       平台特定逻辑     重复检测       AI分析
    ↓              ↓                 ↓            ↓
通知后台       内容结构化       缓存管理       结果存储
```

## 测试步骤

### 1. 基础功能测试

**测试环境准备：**
1. 在Chrome中加载插件：`chrome://extensions/` → 开发者模式 → 加载已解压的扩展程序
2. 选择项目文件夹

**页面检测测试：**
1. 访问抖音：`https://www.douyin.com/`
2. 搜索"短剧"相关内容
3. 打开开发者工具查看控制台日志
4. 验证是否输出："短剧检测结果 - URL匹配: true/false"

### 2. 内容捕获测试

**自动捕获验证：**
1. 打开任意短剧播放页面
2. 等待5-10秒
3. 检查控制台是否输出："捕获到新内容"
4. 验证后台是否收到内容数据

**手动捕获测试：**
1. 打开插件popup
2. 点击"开始解构当前短剧"
3. 观察是否显示分析结果
4. 检查数据结构的完整性

### 3. 数据存储测试

**存储验证：**
1. 右键插件图标 → 检查 → Application → Storage
2. 查看 `capturedContent` 数组是否有数据
3. 验证数据结构包含：videoInfo, textContent, metadata, engagement, episodeInfo

**缓存管理测试：**
1. 连续访问多个短剧页面
2. 验证是否自动清理旧内容（超过100条限制）
3. 检查重复内容是否被过滤

## 关键代码结构

### content.js 核心类

```javascript
// 平台配置
const PLATFORM_CONFIGS = {
    douyin: { /* 抖音特定配置 */ },
    kuaishou: { /* 快手特定配置 */ },
    bilibili: { /* B站特定配置 */ },
    ixigua: { /* 西瓜视频特定配置 */ }
};

// 智能页面检测器
class PageDetector {
    // URL监控、DOM观察、短剧识别
}

// 智能内容捕获管理器
class ContentCaptureManager {
    // 自动捕获、数据提取、平台适配
}
```

### background.js 核心功能

```javascript
// 内容处理
handleContentCapture(contentData, tab, sendResponse)

// 页面检测处理
handlePageDetection(detectionData, tab, sendResponse)

// 数据管理
validateAndCleanContent(data)
saveCapturedContent(data, contentId)
manageCacheSize()

// AI分析模拟
simulateAIAnalysis(data)
```

## 预期数据结构

### 捕获的内容数据
```json
{
    "platform": "douyin",
    "timestamp": 1703001234567,
    "url": "https://www.douyin.com/video/...",
    "title": "短剧标题",
    "videoInfo": {
        "title": "视频标题",
        "description": "视频描述"
    },
    "textContent": {
        "subtitles": [
            {"text": "字幕内容", "timestamp": 1234567890}
        ],
        "description": "视频描述文本"
    },
    "metadata": {
        "author": "作者名称",
        "duration": "3:45",
        "platform": "抖音",
        "publishTime": "2024-01-01"
    },
    "engagement": {
        "viewCount": "10.2万",
        "likeCount": "5.6千"
    },
    "episodeInfo": {
        "episodeNumber": "5",
        "episodeTitle": "第5集标题",
        "seriesInfo": "系列名称"
    }
}
```

### 分析结果数据
```json
{
    "summary": "剧情摘要...",
    "highlights": ["爽点1", "爽点2"],
    "patterns": ["套路1", "套路2"],
    "suggestions": "改编建议...",
    "metrics": {
        "contentQuality": 85,
        "engagementPotential": 92,
        "originalityScore": 78
    }
}
```

## 性能优化

1. **防抖机制**：避免频繁DOM查询
2. **智能缓存**：30秒检测缓存，100条内容限制
3. **异步处理**：队列系统避免阻塞
4. **资源管理**：定期清理过期数据

## 错误处理

1. **网络错误**：自动重试机制
2. **数据验证**：多层验证确保数据完整性
3. **用户反馈**：友好的错误提示信息
4. **日志记录**：详细的调试信息

## 下一步优化

1. **AI集成**：替换模拟分析为真实AI服务
2. **更多平台**：支持小红书、微博视频等
3. **高级功能**：批量分析、数据导出
4. **用户体验**：实时状态指示、进度显示

---

**测试完成后，这个智能内容捕获模块将为短剧解构师提供强大的数据基础，支持后续的AI分析和内容创作工作。**