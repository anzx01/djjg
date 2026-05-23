// 极简后台脚本 - 用于调试
console.log('🚀 简化版后台脚本已加载!');

// 监听消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📨 收到消息:', request);
    console.log('📤 发送者信息:', sender);

    // 回应测试消息
    if (request.action === 'test') {
        console.log('✅ 这是测试消息，正在回复...');
        sendResponse({
            success: true,
            message: '后台收到测试消息',
            timestamp: Date.now(),
            receivedData: request
        });
        return;
    }

    // 回应ping消息
    if (request.action === 'ping') {
        console.log('🏓 收到ping，回复pong');
        sendResponse({
            success: true,
            message: 'pong',
            timestamp: Date.now()
        });
        return;
    }

    // 处理分析请求
    if (request.action === 'analyzeDrama') {
        console.log('🎬 收到分析请求:', request.data);

        // 立即返回简单的分析结果
        const result = {
            summary: `分析完成：${request.data.title}`,
            highlights: [
                '标题解析成功',
                'URL识别成功',
                '平台检测成功'
            ],
            patterns: [
                '简化分析模式',
                '快速响应设计'
            ],
            suggestions: '建议完善真实的内容分析功能',
            debug: {
                platform: request.data.platform,
                url: request.data.url,
                analysisTime: new Date().toLocaleString()
            }
        };

        console.log('✅ 返回分析结果:', result);
        sendResponse({
            success: true,
            data: result
        });
        return;
    }

    console.log('❓ 未知操作:', request.action);
    sendResponse({
        success: false,
        error: '未知操作: ' + request.action
    });
});

// 插件安装时
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('🔧 插件已安装:', details.reason);

    if (details.reason === 'install') {
        console.log('🎉 首次安装调试版本');
    }
});

// 页面更新监听
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('🔄 页面加载完成:', tab.url);
    }
});

console.log('✅ background-simple.js 初始化完成');