// 极简测试版本 - 用于调试插件加载问题
console.log('🚀 简短剧解构师测试脚本已加载!');
console.log('📍 当前页面信息:', {
    url: window.location.href,
    title: document.title,
    hostname: window.location.hostname,
    readyState: document.readyState
});

// 立即测试基本功能
console.log('🧪 开始基本功能测试...');

// 测试Chrome扩展API
if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('✅ Chrome扩展API可用');

    // 测试消息发送
    chrome.runtime.sendMessage({
        action: 'test',
        message: '来自content-simple.js的测试消息',
        url: window.location.href,
        timestamp: Date.now()
    }, function(response) {
        if (chrome.runtime.lastError) {
            console.error('❌ 消息发送失败:', chrome.runtime.lastError);
        } else {
            console.log('✅ 消息发送成功:', response);
        }
    });
} else {
    console.error('❌ Chrome扩展API不可用');
}

// 测试DOM操作
console.log('🔍 DOM元素数量:', document.querySelectorAll('*').length);
console.log('📄 页面标题:', document.title);
console.log('🌐 页面URL:', window.location.href);

// 5秒后再次测试
setTimeout(() => {
    console.log('⏰ 5秒后测试 - 页面状态:', {
        readyState: document.readyState,
        title: document.title,
        url: window.location.href
    });
}, 5000);

console.log('✅ content-simple.js 执行完成');