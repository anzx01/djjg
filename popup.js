// UI 原型演示脚本
// 本文件不读取任何页面，不调用任何 AI 服务。
// 报告内容为预设的静态示例，仅用于展示界面排版。

document.addEventListener('DOMContentLoaded', function () {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const statusDiv = document.getElementById('status');
    const loadingState = document.getElementById('loadingState');
    const analysisReport = document.getElementById('analysisReport');
    const resultsDiv = document.getElementById('results');

    init();

    function init() {
        updateStatus('ℹ️ 演示模式：点击按钮查看示例报告');
        analyzeBtn.disabled = false;
        analyzeBtn.addEventListener('click', runDemo);
    }

    async function runDemo() {
        showLoadingState();
        await delay(1200);
        try {
            displayDemoReport(getDemoReport());
        } catch (error) {
            console.error('演示渲染失败:', error);
            showError('演示渲染失败，请重试');
        }
    }

    function getDemoReport() {
        return {
            summary:
                '以下内容为演示性示例，不代表对任何真实作品的分析。' +
                '示例报告展示了一个原型界面如何呈现剧情摘要、关键节点、角色与套路标签。',
            plotPoints: [
                { time: '00:15', text: '【示例】开场冲突铺垫', type: '示例', intensity: 6 },
                { time: '01:30', text: '【示例】关键转折出现', type: '示例', intensity: 8 },
                { time: '03:00', text: '【示例】情绪高点', type: '示例', intensity: 9 },
                { time: '05:00', text: '【示例】收束与回响', type: '示例', intensity: 7 }
            ],
            characters: [
                { name: '示例角色 A', role: '主角（示例）', traits: ['示例特征 1', '示例特征 2'] },
                { name: '示例角色 B', role: '配角（示例）', traits: ['示例特征 3'] }
            ],
            tropes: [
                { name: '示例套路标签 1', confidence: 0.9 },
                { name: '示例套路标签 2', confidence: 0.75 }
            ],
            adaptationSuggestions: [
                '示例建议 1：用于展示卡片排版',
                '示例建议 2：用于展示长文案换行',
                '示例建议 3：用于展示列表渲染'
            ]
        };
    }

    function showLoadingState() {
        analyzeBtn.style.display = 'none';
        loadingState.style.display = 'block';
        analysisReport.style.display = 'none';
        if (resultsDiv) resultsDiv.style.display = 'none';
        const loadingText = loadingState.querySelector('.loading-text');
        if (loadingText) loadingText.textContent = '正在渲染演示数据...';
    }

    function displayDemoReport(data) {
        loadingState.style.display = 'none';
        analysisReport.style.display = 'block';
        analyzeBtn.style.display = 'block';
        analyzeBtn.textContent = '🔄 重新查看示例';
        updateStatus('✅ 演示数据已渲染（不代表真实分析）');

        renderSummary(data.summary);
        renderPlotPoints(data.plotPoints);
        renderCharacters(data.characters);
        renderTropes(data.tropes);
        renderSuggestions(data.adaptationSuggestions);
    }

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

    function renderSummary(summary) {
        const element = document.getElementById('summaryText');
        if (element) element.textContent = summary;
    }

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

    function renderSuggestions(suggestions) {
        const container = document.getElementById('suggestionsSection');
        if (!container) return;
        container.innerHTML = suggestions.map(suggestion =>
            '<div class="suggestion-item">💡 ' + escapeHtml(suggestion) + '</div>'
        ).join('');
    }

    function updateStatus(message) {
        if (statusDiv) statusDiv.textContent = message;
    }

    function showError(message) {
        loadingState.style.display = 'none';
        analysisReport.style.display = 'none';
        analyzeBtn.style.display = 'block';
        analyzeBtn.textContent = '🔄 重试';
        updateStatus('❌ ' + message);
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
