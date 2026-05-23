// 短剧解构师 - 清理版后台脚本
console.log('🚀 短剧解构师后台脚本启动');

// 监听来自popup和内容脚本的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📬 收到消息:', request.action);

    // Ping测试
    if (request.action === 'ping') {
        console.log('🏓 Ping响应');
        sendResponse({
            success: true,
            message: '后台脚本正常运行',
            timestamp: Date.now()
        });
        return;
    }

    // 短剧分析请求
    if (request.action === 'analyzeDrama') {
        console.log('🎬 开始短剧分析');
        handleDramaAnalysis(request.data, sendResponse);
        return true;
    }

    // 内容捕获
    if (request.action === 'contentCaptured') {
        console.log('📥 收到内容捕获');
        sendResponse({ success: true });
        return;
    }

    // 页面检测
    if (request.action === 'pageDetection') {
        console.log('🎯 收到页面检测');
        sendResponse({ success: true });
        return;
    }

    console.log('❓ 未知操作:', request.action);
    sendResponse({ success: false, error: '未知操作' });
});

// 处理短剧分析
async function handleDramaAnalysis(data, sendResponse) {
    try {
        console.log('📊 分析数据:', data);

        if (!data || !data.platform) {
            throw new Error('无效的分析数据');
        }

        // 模拟AI分析
        const analysisResult = generateAnalysisResult(data);
        console.log('✅ 分析完成');

        // 返回结果
        sendResponse({
            success: true,
            data: analysisResult
        });

    } catch (error) {
        console.error('❌ 分析失败:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// 生成分析结果
function generateAnalysisResult(data) {
    const title = data.videoInfo?.title || data.title || '未知短剧';
    const description = data.videoInfo?.description || '';
    const platform = data.platform;

    const platformName = platform === 'bilibili' ? 'B站' :
                        platform === 'douyin' ? '抖音' :
                        platform === 'kuaishou' ? '快手' :
                        platform === 'ixigua' ? '西瓜视频' : platform;

    const hasEpisodeInfo = data.episodeInfo && data.episodeInfo.episodeNumber;
    const hasSubtitle = data.textContent && data.textContent.subtitles && data.textContent.subtitles.length > 0;

    return {
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

        debug: {
            platform: data.platform,
            url: data.url,
            analysisTime: new Date().toLocaleString(),
            dataSource: hasSubtitle ? '有字幕数据' : '无字幕数据'
        }
    };
}

// 计算内容质量分数
function calculateContentQuality(data) {
    let score = 50;
    if (data.videoInfo?.title && data.videoInfo.title.length > 10) score += 10;
    if (data.videoInfo?.description && data.videoInfo.description.length > 50) score += 10;
    if (data.textContent?.subtitles && data.textContent.subtitles.length > 5) score += 15;
    if (data.metadata?.author) score += 5;
    return Math.min(100, score);
}

// 计算互动潜力分数
function calculateEngagementPotential(data) {
    let score = 40;
    const viewCount = parseCount(data.engagement?.viewCount);
    const likeCount = parseCount(data.engagement?.likeCount);
    if (viewCount > 10000) score += 20;
    if (viewCount > 100000) score += 15;
    if (likeCount > 1000) score += 15;
    return Math.min(100, score);
}

// 计算原创性分数
function calculateOriginalityScore(data) {
    let score = 60;
    const title = (data.videoInfo?.title || '').toLowerCase();
    if (title.includes('原创')) score += 20;
    if (data.episodeInfo?.episodeNumber) score += 10;
    if (data.textContent?.subtitles && data.textContent.subtitles.length > 10) score += 10;
    return Math.min(100, score);
}

// 解析数字
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

// 插件安装处理
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('🎉 插件安装完成:', details.reason);

    if (details.reason === 'install') {
        chrome.storage.local.set({
            settings: {
                autoAnalyze: false,
                showNotifications: true
            },
            analysisHistory: [],
            capturedContent: []
        });
    }
});

console.log('✅ 后台脚本加载完成');