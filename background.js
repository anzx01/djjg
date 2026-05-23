// 短剧解构师 - 智能后台服务工作脚本
// 负责内容处理、数据存储和智能分析协调

// 全局状态管理
let contentCache = new Map();
let processingQueue = [];
let isProcessing = false;

// 插件启动时的调试信息
console.log('🚀 短剧解构师后台脚本已启动');

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('🎉 短剧解构师插件已安装:', details.reason);

    // 创建默认存储设置
    chrome.storage.local.set({
        settings: {
            autoAnalyze: false,
            showNotifications: true,
            analysisDepth: 'medium', // shallow, medium, deep
            autoCapture: true,
            captureInterval: 5000,
            maxCacheSize: 100
        },
        capturedContent: [], // 存储捕获的内容
        analysisHistory: [], // 分析历史记录
        pageDetectionLog: [] // 页面检测日志
    });

    // 显示欢迎通知
    if (details.reason === 'install') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '短剧解构师已安装',
            message: '在抖音、西瓜视频、快手或B站等平台点击插件图标开始使用'
        });
    }
});

// 监听来自内容脚本的消息 - 增强版
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📬 收到消息:', request.action, request.data);

    switch (request.action) {
        case 'ping':
            console.log('🏓 收到ping请求');
            sendResponse({
                success: true,
                message: '后台脚本正常运行',
                timestamp: Date.now()
            });
            return;

        case 'analyzeDrama':
            console.log('🎬 收到分析请求');
            handleDramaAnalysis(request.data, sender.tab, sendResponse);
            return true;

        case 'contentCaptured':
            handleContentCapture(request.data, sender.tab, sendResponse);
            break;

        case 'pageDetection':
            handlePageDetection(request.data, sender.tab, sendResponse);
            break;

        case 'saveAnalysis':
            saveAnalysisResult(request.data, sendResponse);
            break;

        case 'getAnalysisHistory':
            getAnalysisHistory(sendResponse);
            break;

        case 'getCapturedContent':
            getCapturedContent(request.data, sendResponse);
            break;

        case 'clearCache':
            clearContentCache(sendResponse);
            break;

        default:
            sendResponse({ success: false, error: '未知的操作类型' });
    }

    // 保持消息通道开放以进行异步响应
    return true;
});

// 处理页面检测结果
async function handlePageDetection(detectionData, tab, sendResponse) {
    try {
        console.log('🎯 收到页面检测结果:', {
            platform: detectionData.platform,
            isShortDrama: detectionData.isShortDrama,
            url: detectionData.url,
            title: detectionData.title,
            timestamp: new Date(detectionData.timestamp).toLocaleString()
        });

        // 记录检测日志
        const logEntry = {
            timestamp: Date.now(),
            url: detectionData.url,
            title: detectionData.title,
            platform: detectionData.platform,
            isShortDrama: detectionData.isShortDrama,
            tabId: tab?.id
        };

        // 保存到存储
        chrome.storage.local.get(['pageDetectionLog'], function(result) {
            const logs = result.pageDetectionLog || [];
            logs.unshift(logEntry);

            // 保留最近100条日志
            if (logs.length > 100) {
                logs.splice(100);
            }

            chrome.storage.local.set({ pageDetectionLog: logs });
        });

        // 如果检测到短剧页面，显示通知
        if (detectionData.isShortDrama && detectionData.platform) {
            const platformNames = {
                'douyin': '抖音',
                'kuaishou': '快手',
                'bilibili': 'B站',
                'ixigua': '西瓜视频'
            };

            chrome.storage.local.get(['settings'], function(result) {
                const settings = result.settings || {};
                if (settings.showNotifications !== false) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: '检测到短剧页面',
                        message: `在${platformNames[detectionData.platform]}发现短剧内容，可以开始分析`
                    });
                }
            });
        }

        sendResponse({ success: true });

    } catch (error) {
        console.error('处理页面检测结果失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 处理内容捕获
async function handleContentCapture(contentData, tab, sendResponse) {
    try {
        console.log('处理内容捕获:', contentData);

        // 数据验证和清理
        const cleanedData = validateAndCleanContent(contentData);
        if (!cleanedData) {
            sendResponse({ success: false, error: '内容数据无效' });
            return;
        }

        // 生成唯一ID
        const contentId = generateContentId(cleanedData);

        // 检查是否为重复内容
        if (contentCache.has(contentId)) {
            console.log('跳过重复内容:', contentId);
            sendResponse({ success: true, message: '内容已存在' });
            return;
        }

        // 添加到缓存
        contentCache.set(contentId, {
            ...cleanedData,
            id: contentId,
            captureTime: Date.now(),
            tabId: tab?.id
        });

        // 保存到持久存储
        await saveCapturedContent(cleanedData, contentId);

        // 检查缓存大小，清理旧内容
        await manageCacheSize();

        // 如果启用了自动分析，添加到处理队列
        chrome.storage.local.get(['settings'], function(result) {
            const settings = result.settings || {};
            if (settings.autoAnalyze) {
                addToProcessingQueue(contentId);
            }
        });

        sendResponse({ success: true, contentId: contentId });

    } catch (error) {
        console.error('处理内容捕获失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 数据验证和清理
function validateAndCleanContent(data) {
    if (!data || !data.platform) {
        return null;
    }

    // 基本结构验证
    const cleanedData = {
        platform: data.platform,
        url: data.url || '',
        title: data.title || '',
        timestamp: data.timestamp || Date.now(),
        videoInfo: data.videoInfo || {},
        textContent: data.textContent || {},
        metadata: data.metadata || {},
        engagement: data.engagement || {},
        episodeInfo: data.episodeInfo || {}
    };

    // 清理文本内容
    if (cleanedData.videoInfo.title) {
        cleanedData.videoInfo.title = cleanText(cleanedData.videoInfo.title);
    }
    if (cleanedData.videoInfo.description) {
        cleanedData.videoInfo.description = cleanText(cleanedData.videoInfo.description);
    }

    return cleanedData;
}

// 文本清理工具
function cleanText(text) {
    if (!text) return '';
    return text.toString()
        .replace(/\s+/g, ' ')
        .replace(/[\r\n\t]/g, ' ')
        .trim()
        .substring(0, 1000); // 限制长度
}

// 生成内容ID
function generateContentId(data) {
    const keyString = `${data.platform}-${data.url}-${data.title}-${data.timestamp}`;
    return btoa(keyString).substring(0, 16);
}

// 保存捕获的内容
async function saveCapturedContent(data, contentId) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['capturedContent'], function(result) {
            const contents = result.capturedContent || [];

            const contentEntry = {
                id: contentId,
                ...data,
                savedAt: Date.now()
            };

            contents.unshift(contentEntry);

            // 限制存储数量
            if (contents.length > 200) {
                contents.splice(200);
            }

            chrome.storage.local.set({ capturedContent: contents }, function() {
                if (chrome.runtime.lastError) {
                    console.error('保存内容失败:', chrome.runtime.lastError);
                } else {
                    console.log('内容已保存:', contentId);
                }
                resolve();
            });
        });
    });
}

// 管理缓存大小
async function manageCacheSize() {
    chrome.storage.local.get(['settings'], function(result) {
        const settings = result.settings || {};
        const maxSize = settings.maxCacheSize || 100;

        if (contentCache.size > maxSize) {
            // 转换为数组并排序
            const entries = Array.from(contentCache.entries())
                .sort((a, b) => a[1].captureTime - b[1].captureTime);

            // 删除最旧的条目
            const toDelete = entries.slice(0, contentCache.size - maxSize);
            toDelete.forEach(([id]) => {
                contentCache.delete(id);
            });

            console.log(`清理缓存，删除了 ${toDelete.length} 个旧条目`);
        }
    });
}

// 添加到处理队列
function addToProcessingQueue(contentId) {
    if (!processingQueue.includes(contentId)) {
        processingQueue.push(contentId);
        processQueue();
    }
}

// 处理队列
async function processQueue() {
    if (isProcessing || processingQueue.length === 0) {
        return;
    }

    isProcessing = true;

    while (processingQueue.length > 0) {
        const contentId = processingQueue.shift();
        const content = contentCache.get(contentId);

        if (content) {
            try {
                await processContentForAnalysis(content);
            } catch (error) {
                console.error('处理内容失败:', contentId, error);
            }
        }

        // 添加延迟避免过快处理
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    isProcessing = false;
}

// 处理内容进行分析
async function processContentForAnalysis(content) {
    console.log('处理内容进行分析:', content.id);

    // 这里可以集成实际的AI分析服务
    // 目前使用模拟分析
    const analysisResult = await simulateAIAnalysis(content);

    // 保存分析结果
    await saveAnalysisResult({
        contentId: content.id,
        content: content,
        analysis: analysisResult,
        timestamp: Date.now()
    });
}

// 获取捕获的内容
async function getCapturedContent(request, sendResponse) {
    try {
        chrome.storage.local.get(['capturedContent'], function(result) {
            const contents = result.capturedContent || [];

            let filteredContents = contents;

            // 应用过滤器
            if (request.platform) {
                filteredContents = filteredContents.filter(item =>
                    item.platform === request.platform
                );
            }

            if (request.limit) {
                filteredContents = filteredContents.slice(0, request.limit);
            }

            sendResponse({
                success: true,
                data: filteredContents,
                total: contents.length
            });
        });
    } catch (error) {
        console.error('获取捕获内容失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 清理缓存
async function clearContentCache(sendResponse) {
    try {
        contentCache.clear();

        chrome.storage.local.set({ capturedContent: [] }, function() {
            console.log('内容缓存已清理');
            sendResponse({ success: true });
        });
    } catch (error) {
        console.error('清理缓存失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 处理短剧分析请求 - 增强版
async function handleDramaAnalysis(data, tab, sendResponse) {
    try {
        console.log('🎬 开始短剧分析:', data);

        // 数据验证
        if (!data || !data.platform) {
            console.error('❌ 分析数据无效:', data);
            sendResponse({
                success: false,
                error: '无效的分析数据'
            });
            return;
        }

        console.log('📊 正在进行AI分析...');
        const analysisResult = await simulateAIAnalysis(data);
        console.log('✅ AI分析完成:', analysisResult);

        console.log('📤 直接返回分析结果到popup（跳过保存以避免问题）');
        sendResponse({
            success: true,
            data: analysisResult
        });

    } catch (error) {
        console.error('❌ 短剧分析失败:', error);
        sendResponse({
            success: false,
            error: '分析失败: ' + error.message
        });
    }
}

// 模拟AI分析功能（实际项目中应该调用真实的AI服务）
async function simulateAIAnalysis(data) {
    console.log('🤖 开始AI分析，输入数据:', data);

    // 模拟分析延迟 - 减少到500毫秒用于调试
    await new Promise(resolve => setTimeout(resolve, 500));

    // 提取关键信息
    const title = data.videoInfo?.title || data.title || '未知短剧';
    const description = data.videoInfo?.description || data.textContent?.description || '';
    const platform = data.metadata?.platform || '未知平台';
    const platformName = data.platform === 'bilibili' ? 'B站' :
                        data.platform === 'douyin' ? '抖音' :
                        data.platform === 'kuaishou' ? '快手' :
                        data.platform === 'ixigua' ? '西瓜视频' : platform;

    console.log('📝 提取的信息:', { title, description, platform, platformName });

    // 根据内容生成分析结果
    const hasEpisodeInfo = data.episodeInfo && data.episodeInfo.episodeNumber;
    const hasSubtitle = data.textContent && data.textContent.subtitles && data.textContent.subtitles.length > 0;

    const mockResults = {
        summary: `这是一个来自${platformName}的${hasEpisodeInfo ? '连载' : '独立'}短剧，标题为"${title}"。${hasSubtitle ? '包含字幕内容，' : ''}主要描述了${description.substring(0, 50) || '精彩剧情内容'}。`,

        highlights: [
            hasEpisodeInfo ? `第${data.episodeInfo.episodeNumber}集的精彩情节` : '独立完整的剧情设计',
            hasSubtitle ? '丰富的对白和字幕内容' : '视觉驱动的叙事方式',
            `${platformName}平台特有的表现形式`,
            '目标用户群体的精准定位'
        ].filter(Boolean),

        patterns: [
            '现代都市情感题材',
            '快节奏叙事结构',
            '年轻化内容风格',
            hasEpisodeInfo ? '系列化内容制作' : '单集完整故事'
        ].filter(Boolean),

        suggestions: `基于对"${title}"的分析，建议在保持原有风格的基础上：${hasEpisodeInfo ? '1. 加强系列连贯性；2. 优化分集节奏；' : '1. 完善故事结构；2. 增强情感共鸣；'}3. 提升视觉表现力；4. 优化目标受众定位。`,

        metrics: {
            contentQuality: calculateContentQuality(data),
            engagementPotential: calculateEngagementPotential(data),
            originalityScore: calculateOriginalityScore(data)
        },

        // 添加调试信息
        debug: {
            platform: data.platform,
            url: data.url,
            analysisTime: new Date().toLocaleString(),
            dataSource: hasSubtitle ? '有字幕数据' : '无字幕数据'
        }
    };

    console.log('✅ AI分析完成:', mockResults);
    return mockResults;
}

// 计算内容质量分数
function calculateContentQuality(data) {
    let score = 50; // 基础分

    if (data.videoInfo?.title && data.videoInfo.title.length > 10) score += 10;
    if (data.videoInfo?.description && data.videoInfo.description.length > 50) score += 10;
    if (data.textContent?.subtitles && data.textContent.subtitles.length > 5) score += 15;
    if (data.metadata?.author) score += 5;
    if (data.engagement?.viewCount) score += 10;

    return Math.min(100, score);
}

// 计算互动潜力分数
function calculateEngagementPotential(data) {
    let score = 40; // 基础分

    const viewCount = parseCount(data.engagement?.viewCount);
    const likeCount = parseCount(data.engagement?.likeCount);

    if (viewCount > 10000) score += 20;
    if (viewCount > 100000) score += 15;
    if (likeCount > 1000) score += 15;
    if (likeCount > 10000) score += 10;

    return Math.min(100, score);
}

// 计算原创性分数
function calculateOriginalityScore(data) {
    let score = 60; // 基础分

    const title = (data.videoInfo?.title || '').toLowerCase();
    const description = (data.videoInfo?.description || '').toLowerCase();

    // 检测原创性指标
    if (title.includes('原创') || description.includes('原创')) score += 20;
    if (data.episodeInfo?.episodeNumber) score += 10; // 系列内容
    if (data.textContent?.subtitles && data.textContent.subtitles.length > 10) score += 10;

    return Math.min(100, score);
}

// 解析数字（如"1.2万"转换为12000）
function parseCount(countStr) {
    if (!countStr) return 0;

    const match = countStr.toString().match(/(\d+\.?\d*)([万千]?)/);
    if (!match) return 0;

    const num = parseFloat(match[1]);
    const unit = match[2];

    switch (unit) {
        case '万': return Math.floor(num * 10000);
        case '千': return Math.floor(num * 1000);
        default: return Math.floor(num);
    }
}

// 保存分析结果到本地存储
function saveAnalysisResult(data, sendResponse) {
    chrome.storage.local.get(['analysisHistory'], function(result) {
        const history = result.analysisHistory || [];

        // 添加新的分析记录
        history.unshift({
            ...data,
            id: Date.now().toString()
        });

        // 限制历史记录数量（保留最近50条）
        if (history.length > 50) {
            history.splice(50);
        }

        chrome.storage.local.set({ analysisHistory: history }, function() {
            if (chrome.runtime.lastError) {
                sendResponse && sendResponse({
                    success: false,
                    error: '保存失败'
                });
            } else {
                sendResponse && sendResponse({
                    success: true
                });
            }
        });
    });
}

// 获取分析历史记录
function getAnalysisHistory(sendResponse) {
    chrome.storage.local.get(['analysisHistory'], function(result) {
        sendResponse({
            success: true,
            data: result.analysisHistory || []
        });
    });
}

// 标签页更新时的处理
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // 当页面加载完成时检查是否为支持的短剧平台
    if (changeInfo.status === 'complete' && tab.url) {
        const supportedPlatforms = [
            'douyin.com',
            'ixigua.com',
            'kuaishou.com',
            'bilibili.com'
        ];

        const isSupported = supportedPlatforms.some(platform =>
            tab.url.includes(platform)
        );

        if (isSupported) {
            console.log('检测到支持的短剧平台页面:', tab.url);
            // 通知内容脚本进行页面检测
            chrome.tabs.sendMessage(tabId, {
                action: 'checkPage'
            }).catch(() => {
                // 忽略错误，可能是内容脚本未加载
            });
        }
    }
});

// 处理插件图标点击
chrome.action.onClicked.addListener(function(tab) {
    console.log('插件图标被点击');
});

// 定期清理过期的存储数据
chrome.alarms.create('cleanupData', { periodInMinutes: 60 * 24 }); // 每天清理一次

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'cleanupData') {
        cleanupExpiredData();
    }
});

// 清理过期数据
function cleanupExpiredData() {
    console.log('开始清理过期数据');

    chrome.storage.local.get(['analysisHistory', 'capturedContent', 'pageDetectionLog'], function(result) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        let hasChanges = false;

        // 清理分析历史
        if (result.analysisHistory) {
            const filteredHistory = result.analysisHistory.filter(item => {
                const itemDate = new Date(item.timestamp);
                return itemDate > thirtyDaysAgo;
            });
            if (filteredHistory.length !== result.analysisHistory.length) {
                chrome.storage.local.set({ analysisHistory: filteredHistory });
                hasChanges = true;
            }
        }

        // 清理捕获内容
        if (result.capturedContent) {
            const filteredContent = result.capturedContent.filter(item => {
                const itemDate = new Date(item.timestamp || item.savedAt);
                return itemDate > thirtyDaysAgo;
            });
            if (filteredContent.length !== result.capturedContent.length) {
                chrome.storage.local.set({ capturedContent: filteredContent });
                hasChanges = true;
            }
        }

        // 清理页面检测日志
        if (result.pageDetectionLog) {
            const filteredLogs = result.pageDetectionLog.filter(item => {
                const itemDate = new Date(item.timestamp);
                return itemDate > thirtyDaysAgo;
            });
            if (filteredLogs.length !== result.pageDetectionLog.length) {
                chrome.storage.local.set({ pageDetectionLog: filteredLogs });
                hasChanges = true;
            }
        }

        if (hasChanges) {
            console.log('已清理过期数据');
        }
    });
}