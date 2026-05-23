// 短剧解构师 - 简化版弹窗功能脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 短剧解构师简化版启动');

    // DOM元素引用
    const analyzeBtn = document.getElementById('analyzeBtn');
    const statusDiv = document.getElementById('status');
    const loadingState = document.getElementById('loadingState');
    const analysisReport = document.getElementById('analysisReport');

    // 初始化
    initializeExtension();

    function initializeExtension() {
        console.log('🚀 初始化扩展');

        // 绑定事件
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', startAnalysis);
        } else {
            console.error('❌ 找不到分析按钮');
        }

        // 检查当前页面
        checkCurrentPage();
    }

    function checkCurrentPage() {
        updateStatus('🔍 正在检测当前页面...');

        // 模拟平台检测
        setTimeout(() => {
            updateStatus('✅ <strong>抖音</strong> 平台已识别');
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = '🚀 开始深度解构';
            }
        }, 1000);
    }

    async function startAnalysis() {
        console.log('🚀 开始分析...');

        // 显示加载状态
        showLoadingState();

        // 模拟分析延迟
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 生成模拟数据
        const mockData = {
            summary: "这是一个关于主角浴血奋战、王者归来的精彩故事。剧情紧凑，节奏明快，充满了各种现代都市元素的碰撞。",
            plotPoints: [
                { time: "1:15", text: "主角被当众羞辱，陷入绝境", type: "受辱", intensity: 8 },
                { time: "2:30", text: "意外发现隐藏身份或能力", type: "转折", intensity: 9 },
                { time: "3:45", text: "首次展现实力，震惊众人", type: "爽点", intensity: 10 }
            ],
            characters: [
                { name: "苏沫", role: "主角", traits: ["坚韧", "隐藏身份", "智勇双全"] },
                { name: "林辰", role: "主角", traits: ["霸气", "重情义", "逆袭王者"] }
            ],
            tropes: [
                { name: "战神归来", confidence: 0.95 },
                { name: "隐藏身份", confidence: 0.89 },
                { name: "复仇雪恨", confidence: 0.85 }
            ],
            adaptationSuggestions: [
                "多分支叙事游戏 - 让玩家选择不同剧情走向",
                "卡牌收集养成 - 收集角色卡牌，培养升级",
                "短视频系列改编 - 拆分成多个短剧续集"
            ]
        };

        // 显示结果
        displayAnalysisResults(mockData);
    }

    function showLoadingState() {
        if (analyzeBtn) analyzeBtn.style.display = 'none';
        if (loadingState) loadingState.style.display = 'block';
        if (analysisReport) analysisReport.style.display = 'none';
    }

    function displayAnalysisResults(data) {
        console.log('📊 显示分析结果:', data);

        // 隐藏加载，显示报告
        if (loadingState) loadingState.style.display = 'none';
        if (analysisReport) analysisReport.style.display = 'block';
        if (analyzeBtn) {
            analyzeBtn.style.display = 'block';
            analyzeBtn.textContent = '🔄 重新分析';
        }

        updateStatus('✅ 深度解构完成！');

        // 渲染结果
        renderSummary(data.summary);
        renderPlotPoints(data.plotPoints);
        renderCharacters(data.characters);
        renderTropes(data.tropes);
        renderSuggestions(data.adaptationSuggestions);
    }

    function renderSummary(summary) {
        const element = document.getElementById('summaryText');
        if (element) element.textContent = summary;
    }

    function renderPlotPoints(plotPoints) {
        const container = document.getElementById('plotPoints');
        if (!container) return;

        container.innerHTML = plotPoints.map(point => `
            <div class="plot-point">
                <span class="plot-time">${point.time}</span>
                <span class="plot-text">${point.text}</span>
                <span class="plot-type">${point.type}</span>
                <div class="intensity-bar">
                    <div class="intensity-fill" style="width: ${point.intensity * 10}%"></div>
                </div>
            </div>
        `).join('');
    }

    function renderCharacters(characters) {
        const container = document.getElementById('charactersSection');
        if (!container) return;

        container.innerHTML = characters.map(character => `
            <div class="character-card">
                <div class="character-name">${character.name}</div>
                <div class="character-role">${character.role}</div>
                <div class="character-traits">
                    ${character.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderTropes(tropes) {
        const container = document.getElementById('tropesSection');
        if (!container) return;

        container.innerHTML = tropes.map(trope => `
            <div class="trope-item">
                <span>${trope.name}</span>
                <span class="confidence-badge">${(trope.confidence * 100).toFixed(1)}%</span>
            </div>
        `).join('');
    }

    function renderSuggestions(suggestions) {
        const container = document.getElementById('suggestionsSection');
        if (!container) return;

        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">💡 ${suggestion}</div>
        `).join('');
    }

    function updateStatus(message) {
        if (statusDiv) {
            statusDiv.innerHTML = message;
        }
    }

    console.log('✅ 简化版脚本加载完成');
});