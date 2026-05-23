// 短剧解构师 - 弹窗功能脚本 v2.0 (修复版)
document.addEventListener('DOMContentLoaded', function() {
    // DOM元素引用
    const analyzeBtn = document.getElementById('analyzeBtn');
    const statusDiv = document.getElementById('status');
    const loadingState = document.getElementById('loadingState');
    const analysisReport = document.getElementById('analysisReport');
    const resultsDiv = document.getElementById('results'); // 保留用于兼容性

    // 页面状态管理
    let currentPlatform = null;
    let capturedContent = null;

    // 初始化
    initializeExtension();

    /**
     * 初始化扩展
     */
    function initializeExtension() {
        console.log('🎬 短剧解构师 v2.0 启动 (修复版)');

        // 绑定事件监听器
        analyzeBtn.addEventListener('click', startAnalysis);

        // 检查当前页面
        checkCurrentPage();

        // 监听后台消息
        chrome.runtime.onMessage.addListener(handleBackgroundMessage);
    }

    /**
     * 检查当前页面状态
     */
    function checkCurrentPage() {
        updateStatus('🔍 正在检测当前页面...');

        chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
            const currentTab = tabs[0];
            const currentUrl = currentTab.url;

            console.log('📍 当前页面:', currentUrl);

            // 平台检测
            currentPlatform = detectPlatform(currentUrl);

            if (!currentPlatform) {
                updateStatus('❌ 请在抖音、西瓜视频、快手或B站等平台使用');
                return;
            }

            updateStatus('✅ <strong>' + currentPlatform.name + '</strong> 平台已识别');

            // 尝试获取已捕获的内容
            await getCapturedContent();

            if (capturedContent && capturedContent.length > 0) {
                analyzeBtn.disabled = false;
                updateStatus('✅ 已就绪 - 捕获到 ' + capturedContent.length + ' 条内容');
            } else {
                analyzeBtn.disabled = false;
                updateStatus('✅ 已就绪 - 点击开始分析');
            }
        });
    }

    /**
     * 检测平台类型
     */
    function detectPlatform(url) {
        const PLATFORM_CONFIGS = {
            douyin: {
                name: '抖音',
                patterns: [
                    /.*\.douyin\.com.*/,
                    /v\.douyin\.com.*/,
                    /iesdouyin\.com.*/,
                    /.*\.douyinpic\.com.*/,
                    /www\.douyin\.com.*/
                ]
            },
            kuaishou: {
                name: '快手',
                patterns: [
                    /.*\.kuaishou\.com.*/,
                    /kuaishou\.com.*/,
                    /www\.kuaishou\.com.*/
                ]
            },
            bilibili: {
                name: 'B站',
                patterns: [
                    /.*\.bilibili\.com.*/,
                    /bilibili\.com.*/,
                    /www\.bilibili\.com.*/,
                    /b23\.tv.*/
                ]
            },
            ixigua: {
                name: '西瓜视频',
                patterns: [
                    /.*\.ixigua\.com.*/,
                    /ixigua\.com.*/,
                    /www\.ixigua\.com.*/,
                    /.*\.toutiao\.com.*/
                ]
            }
        };

        for (const [platformKey, config] of Object.entries(PLATFORM_CONFIGS)) {
            for (const pattern of config.patterns) {
                if (pattern.test(url)) {
                    return { key: platformKey, name: config.name };
                }
            }
        }

        // 模糊匹配
        const hostname = new URL(url).hostname.toLowerCase();
        if (hostname.includes('douyin')) return { key: 'douyin', name: '抖音' };
        if (hostname.includes('kuaishou') || hostname.includes('kwai')) return { key: 'kuaishou', name: '快手' };
        if (hostname.includes('bilibili') || hostname.includes('b23.tv')) return { key: 'bilibili', name: 'B站' };
        if (hostname.includes('ixigua') || hostname.includes('toutiao')) return { key: 'ixigua', name: '西瓜视频' };

        return null;
    }

    /**
     * 获取已捕获的内容
     */
    async function getCapturedContent() {
        try {
            // 从Chrome存储获取内容
            const result = await chrome.storage.local.get(['capturedContents', 'currentVideo']);

            if (result.currentVideo && result.currentVideo.content) {
                capturedContent = [result.currentVideo];
                console.log('📥 获取到当前视频内容:', capturedContent);
            } else if (result.capturedContents && result.capturedContents.length > 0) {
                capturedContent = result.capturedContents.slice(-5); // 获取最新5条
                console.log('📥 获取到历史内容:', capturedContent);
            } else {
                console.log('📭 暂无捕获内容');
            }
        } catch (error) {
            console.error('❌ 获取内容失败:', error);
        }
    }

    /**
     * 开始分析
     */
    async function startAnalysis() {
        console.log('🚀 开始深度解构分析...');

        // 更新UI状态
        showLoadingState();

        // 获取内容用于分析
        const analysisContent = getAnalysisContent();

        if (!analysisContent) {
            showError('未检测到可分析的内容，请刷新页面后重试');
            return;
        }

        // 模拟分析延迟
        await simulateAnalysisDelay();

        try {
            // 调用AI分析API（当前为模拟）
            const analysisResult = await callAIAnalysisAPI(analysisContent);

            // 显示分析结果
            displayAnalysisResults(analysisResult);

        } catch (error) {
            console.error('❌ 分析失败:', error);
            showError('分析过程中出现错误，请重试');
        }
    }

    /**
     * 获取用于分析的内容
     */
    function getAnalysisContent() {
        if (capturedContent && capturedContent.length > 0) {
            // 合并所有内容用于分析
            const allContent = capturedContent.map(item => ({
                title: item.title || item.videoTitle || '',
                description: item.description || '',
                subtitles: item.subtitles || [],
                author: item.author || '',
                platform: currentPlatform.name
            }));

            return allContent;
        }
        return null;
    }

    /**
     * 显示加载状态
     */
    function showLoadingState() {
        analyzeBtn.style.display = 'none';
        loadingState.style.display = 'block';
        analysisReport.style.display = 'none';

        // 更新加载文本
        const loadingMessages = [
            'AI正在分析剧情结构...',
            '正在识别关键爽点...',
            '检测常见套路模式...',
            '生成改编建议...'
        ];

        let messageIndex = 0;
        const loadingText = loadingState.querySelector('.loading-text');

        const messageInterval = setInterval(() => {
            if (loadingState.style.display === 'none') {
                clearInterval(messageInterval);
                return;
            }
            loadingText.textContent = loadingMessages[messageIndex % loadingMessages.length];
            messageIndex++;
        }, 2000);
    }

    /**
     * 模拟分析延迟
     */
    function simulateAnalysisDelay() {
        return new Promise(resolve => {
            setTimeout(resolve, 3000 + Math.random() * 2000); // 3-5秒随机延迟
        });
    }

    /**
     * AI分析API调用（模拟版本）
     */
    async function callAIAnalysisAPI(content) {
        console.log('🤖 调用AI分析API，输入内容:', content);

        // 这里是模拟AI分析的结果
        // 在实际版本中，这里会调用真实的AI服务
        return generateMockAnalysisData(content);
    }

    /**
     * 生成模拟分析数据
     */
    function generateMockAnalysisData(content) {
        // 根据内容生成更真实的模拟数据
        const videoTitles = content.map(c => c.title).filter(Boolean).join(' ');
        const hasKeywords = {
            war: videoTitles.includes('战神') || videoTitles.includes('战争'),
            rich: videoTitles.includes('总裁') || videoTitles.includes('豪门'),
            revenge: videoTitles.includes('复仇') || videoTitles.includes('归来'),
            love: videoTitles.includes('爱情') || videoTitles.includes('恋爱'),
            modern: !videoTitles.includes('古代') && !videoTitles.includes('仙侠')
        };

        // 确定主角特质
        let mainTrait = '成长蜕变、实现自我';
        if (hasKeywords.war) mainTrait = '浴血奋战、王者归来';
        else if (hasKeywords.rich) mainTrait = '从平凡到逆袭成功';
        else if (hasKeywords.revenge) mainTrait = '历经磨难、雪耻复仇';

        // 确定特殊能力
        let specialAbility = '过人武艺和军事才能';
        if (hasKeywords.rich) specialAbility = '商业头脑和坚韧意志';

        // 确定起点
        let startPoint = '迷茫到坚定';
        if (hasKeywords.rich) startPoint = '草根到豪门';
        else if (hasKeywords.war) startPoint = '普通士兵到战神';

        // 确定社会背景
        let socialBackground = hasKeywords.modern ? '现代社会' : '古代江湖';
        let elementStyle = hasKeywords.modern ? '现代都市' : '古装';

        // 动态生成剧情摘要
        const summaries = [
            '这是一个关于主角' + mainTrait + '的精彩故事。剧情紧凑，节奏明快，' + (hasKeywords.love ? '情感纠葛复杂，' : '') + '充满了各种' + elementStyle + '元素的碰撞。',
            '故事讲述了主角在' + socialBackground + '中面对重重困难，如何凭借' + specialAbility + '一步步走向巅峰的历程。剧中设置多个' + (hasKeywords.revenge ? '复仇爽点' : '情感高潮') + '，让观众情绪随着剧情起伏。',
            '这部作品以' + (hasKeywords.love ? '爱情为主线' : '成长为主题') + '，描绘了主角从' + startPoint + '的蜕变过程。剧情设置巧妙，' + (hasKeywords.love ? '感情线细腻，' : '') + '各种反转和' + (hasKeywords.revenge ? '复仇' : '励志') + '情节设计合理。'
        ];

        // 生成关键剧情点
        const plotPointsTemplates = [
            { time: "00:15", text: "主角被当众羞辱，陷入绝境", type: "受辱", intensity: 8 },
            { time: "01:30", text: "意外发现隐藏身份或能力", type: "转折", intensity: 9 },
            { time: "02:45", text: "首次展现实力，震惊众人", type: "爽点", intensity: 10 },
            { time: "04:20", text: "遭遇强大对手的挑战", type: "冲突", intensity: 7 },
            { time: "06:10", text: "获得关键盟友的支持", type: "助力", intensity: 6 },
            { time: "08:30", text: "最终对决，彻底逆转", type: "高潮", intensity: 10 }
        ];

        const plotPoints = plotPointsTemplates.map((point, index) => ({
            time: (index + 1) + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
            text: point.text,
            type: point.type,
            intensity: Math.max(5, Math.min(10, point.intensity + Math.floor(Math.random() * 3) - 1))
        }));

        // 生成角色分析
        const characterTemplates = [
            { name: "苏沫", role: "主角", traits: ["坚韧", "隐藏身份", "智勇双全"] },
            { name: "林辰", role: "主角", traits: ["霸气", "重情义", "逆袭王者"] },
            { name: "叶凡", role: "主角", traits: ["低调", "实力强", "守护者"] },
            { name: "萧炎", role: "主角", traits: ["不屈", "天赋异禀", "复仇者"] }
        ];

        const selectedCharacters = characterTemplates.slice(0, 2 + Math.floor(Math.random() * 2));

        // 生成套路标签
        const tropesTemplates = [
            { name: "战神归来", baseConfidence: 0.95 },
            { name: "豪门恩怨", baseConfidence: 0.87 },
            { name: "逆袭爽文", baseConfidence: 0.92 },
            { name: "隐藏身份", baseConfidence: 0.89 },
            { name: "复仇雪恨", baseConfidence: 0.85 },
            { name: "赘婿逆袭", baseConfidence: 0.78 },
            { name: "神医下山", baseConfidence: 0.82 },
            { name: "都市修仙", baseConfidence: 0.75 }
        ];

        const selectedTropes = tropesTemplates
            .filter(trope => {
                if (trope.name.includes('战神') && !hasKeywords.war) return false;
                if (trope.name.includes('豪门') && !hasKeywords.rich) return false;
                if (trope.name.includes('复仇') && !hasKeywords.revenge) return Math.random() > 0.5;
                return Math.random() > 0.3;
            })
            .slice(0, 3 + Math.floor(Math.random() * 3))
            .map(trope => ({
                name: trope.name,
                confidence: Math.min(0.99, trope.baseConfidence + (Math.random() - 0.5) * 0.1)
            }));

        // 生成改编建议
        const suggestions = [
            "多分支叙事游戏 - 让玩家选择不同剧情走向",
            "卡牌收集养成 - 收集角色卡牌，培养升级",
            "短视频系列改编 - 拆分成多个短剧续集",
            "互动剧情APP - 观众选择影响剧情发展",
            "虚拟主播演绎 - AI角色重现经典片段",
            "桌面游戏开发 - 剧情解谜类桌游设计"
        ];

        const selectedSuggestions = suggestions.slice(0, 2 + Math.floor(Math.random() * 3));

        return {
            summary: summaries[Math.floor(Math.random() * summaries.length)],
            plotPoints: plotPoints,
            characters: selectedCharacters,
            tropes: selectedTropes,
            adaptationSuggestions: selectedSuggestions,
            analysisMetadata: {
                platform: currentPlatform.name,
                contentCount: content.length,
                analysisTime: new Date().toISOString()
            }
        };
    }

    /**
     * 显示分析结果
     */
    function displayAnalysisResults(data) {
        console.log('📊 显示分析结果:', data);

        // 隐藏加载状态，显示报告
        loadingState.style.display = 'none';
        analysisReport.style.display = 'block';
        analyzeBtn.style.display = 'block';
        analyzeBtn.textContent = '🔄 重新分析';

        updateStatus('✅ 深度解构完成！');

        // 渲染各个部分
        renderSummary(data.summary);
        renderPlotPoints(data.plotPoints);
        renderCharacters(data.characters);
        renderTropes(data.tropes);
        renderSuggestions(data.adaptationSuggestions);
    }

    /**
     * 转义外部/分析内容，避免未来接入真实页面文本或AI结果后注入HTML
     */
    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function toPercent(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return 0;
        return Math.max(0, Math.min(100, number));
    }

    /**
     * 渲染剧情摘要
     */
    function renderSummary(summary) {
        const element = document.getElementById('summaryText');
        if (element) {
            element.textContent = summary;
        }
    }

    /**
     * 渲染关键剧情点
     */
    function renderPlotPoints(plotPoints) {
        const container = document.getElementById('plotPoints');
        if (!container) return;

        container.innerHTML = plotPoints.map(point =>
            '<div class="plot-point">' +
                '<span class="plot-time">' + escapeHtml(point.time) + '</span>' +
                '<span class="plot-text">' + escapeHtml(point.text) + '</span>' +
                '<span class="plot-type">' + escapeHtml(point.type) + '</span>' +
                '<div class="intensity-bar">' +
                    '<div class="intensity-fill" style="width: ' + toPercent(point.intensity * 10) + '%"></div>' +
                '</div>' +
            '</div>'
        ).join('');
    }

    /**
     * 渲染角色分析
     */
    function renderCharacters(characters) {
        const container = document.getElementById('charactersSection');
        if (!container) return;

        container.innerHTML = characters.map(character =>
            '<div class="character-card">' +
                '<div class="character-name">' + escapeHtml(character.name) + '</div>' +
                '<div class="character-role">' + escapeHtml(character.role) + '</div>' +
                '<div class="character-traits">' +
                    (character.traits || []).map(trait => '<span class="trait-tag">' + escapeHtml(trait) + '</span>').join('') +
                '</div>' +
            '</div>'
        ).join('');
    }

    /**
     * 渲染套路标签
     */
    function renderTropes(tropes) {
        const container = document.getElementById('tropesSection');
        if (!container) return;

        container.innerHTML = tropes.map(trope =>
            '<div class="trope-item">' +
                '<span>' + escapeHtml(trope.name) + '</span>' +
                '<span class="confidence-badge">' + toPercent(trope.confidence * 100).toFixed(1) + '%</span>' +
            '</div>'
        ).join('');
    }

    /**
     * 渲染改编建议
     */
    function renderSuggestions(suggestions) {
        const container = document.getElementById('suggestionsSection');
        if (!container) return;

        container.innerHTML = suggestions.map(suggestion =>
            '<div class="suggestion-item">💡 ' + escapeHtml(suggestion) + '</div>'
        ).join('');
    }

    /**
     * 更新状态显示
     */
    function updateStatus(message) {
        if (statusDiv) {
            statusDiv.innerHTML = message;
        }
    }

    /**
     * 显示错误信息
     */
    function showError(message) {
        loadingState.style.display = 'none';
        analysisReport.style.display = 'none';
        analyzeBtn.style.display = 'block';
        analyzeBtn.textContent = '🚀 重新分析';

        updateStatus('❌ ' + message);

        // 显示错误详情（可选）
        if (resultsDiv) {
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML =
                '<div class="result-item" style="background: rgba(255,100,100,0.2); display: block;">' +
                    '<strong>❌ 错误详情：</strong> ' + escapeHtml(message) +
                '</div>';
        }
    }

    /**
     * 处理来自后台脚本的消息
     */
    function handleBackgroundMessage(request, sender, sendResponse) {
        console.log('📨 收到后台消息:', request);

        switch (request.action) {
            case 'contentCaptured':
                // 内容被更新时，重新获取
                getCapturedContent();
                break;
            case 'updateStatus':
                updateStatus(request.message);
                break;
            default:
                console.log('未知消息类型:', request.action);
        }
    }

    console.log('✅ 短剧解构师 v2.0 修复版脚本加载完成');
});
