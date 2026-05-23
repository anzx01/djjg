// 短剧解构师 - 内容脚本
// 智能内容捕获模块：自动检测短剧页面、提取字幕文案和元数据

console.log('短剧解构师内容脚本已加载');

// 等待页面完全加载
(function() {
    'use strict';

    let isAnalyzing = false;
    let pageDetector = null;
    let captureManager = null;

    // 平台配置和检测规则
    const PLATFORM_CONFIGS = {
        douyin: {
            name: '抖音',
            patterns: [
                /.*\.douyin\.com.*/,  // 匹配所有抖音域名
                /v\.douyin\.com.*/,   // 短链接
                /iesdouyin\.com.*/,   // 旧版域名
                /.*\.douyinpic\.com.*/, // 图片域名
                /www\.douyin\.com.*/   // 主域名
            ],
            shortDramaIndicators: ['短剧', '连续剧', '第.*集', 'EP\\d+', '完结', '全集', '连载'],
            selectors: {
                videoTitle: [
                    '[data-e2e="browse-video-desc"]',
                    '.browse-video-desc',
                    '[class*="title-text"]',
                    'h1[class*="title"]',
                    '.video-desc'
                ],
                videoDescription: [
                    '[data-e2e="video-desc"]',
                    '.video-desc-text',
                    '[class*="desc-text"]',
                    '.desc'
                ],
                subtitles: [
                    '.subtitle',
                    '.caption',
                    '[class*="subtitle"]',
                    '[class*="caption"]',
                    '.danmu'
                ],
                author: [
                    '[class*="author"]',
                    '[class*="nickname"]',
                    '.author-name',
                    '.user-name'
                ],
                episodeInfo: [
                    '[class*="episode"]',
                    '[class*="series"]',
                    '.episode-info'
                ],
                viewCount: [
                    '[class*="play-count"]',
                    '[class*="view-count"]',
                    '.play-count'
                ],
                likeCount: [
                    '[class*="like-count"]',
                    '[class*="praise-count"]',
                    '.like-count'
                ]
            }
        },
        kuaishou: {
            name: '快手',
            patterns: [
                /.*\.kuaishou\.com.*/,  // 匹配所有快手域名
                /kuaishou\.com.*/,      // 主域名
                /www\.kuaishou\.com.*/   // 主域名
            ],
            shortDramaIndicators: ['短剧', '连续剧', '第.*集', 'EP\\d+', '完结', '系列'],
            selectors: {
                videoTitle: [
                    '.video-title',
                    '.caption',
                    '[class*="title"]',
                    'h1'
                ],
                videoDescription: [
                    '.video-desc',
                    '.caption-text',
                    '[class*="desc"]'
                ],
                subtitles: [
                    '.subtitle',
                    '.caption-text',
                    '[class*="subtitle"]'
                ],
                author: [
                    '.user-name',
                    '.author-name',
                    '[class*="author"]',
                    '[class*="name"]'
                ],
                episodeInfo: [
                    '[class*="episode"]',
                    '[class*="series"]'
                ],
                viewCount: [
                    '.play-count',
                    '[class*="view"]'
                ],
                likeCount: [
                    '.like-count',
                    '[class*="like"]'
                ]
            }
        },
        bilibili: {
            name: 'B站',
            patterns: [
                /.*\.bilibili\.com.*/,  // 匹配所有B站域名
                /bilibili\.com.*/,      // 主域名
                /www\.bilibili\.com.*/, // 主域名
                /b23\.tv.*/              // 短链接
            ],
            shortDramaIndicators: ['短剧', '泡面番', '迷你剧', '第.*话', 'EP\\d+', '完结'],
            selectors: {
                videoTitle: [
                    '.video-title',
                    'h1',
                    '.title',
                    '[class*="title"]'
                ],
                videoDescription: [
                    '.desc',
                    '.video-desc',
                    '[class*="desc"]',
                    '.video-info'
                ],
                subtitles: [
                    '.bpx-player-subtitle',
                    '.bilibili-player-subtitle',
                    '.caption-text',
                    '.cc-subtitle'
                ],
                author: [
                    '.up-name',
                    '.name',
                    '.author',
                    '[class*="up"]',
                    '[class*="author"]'
                ],
                episodeInfo: [
                    '.ep-info',
                    '.episode-info',
                    '[class*="episode"]'
                ],
                viewCount: [
                    '.play-count',
                    '.view',
                    '[class*="play"]',
                    '[class*="view"]'
                ],
                danmakuCount: [
                    '.danmaku-count',
                    '.dm-count',
                    '[class*="danmaku"]',
                    '[class*="dm"]'
                ]
            }
        },
        ixigua: {
            name: '西瓜视频',
            patterns: [
                /.*\.ixigua\.com.*/,  // 匹配所有西瓜视频域名
                /ixigua\.com.*/,      // 主域名
                /www\.ixigua\.com.*/, // 主域名
                /.*\.toutiao\.com.*/  // 头条相关域名
            ],
            shortDramaIndicators: ['短剧', '连续剧', '第.*集', 'EP\\d+', '完结', '全集'],
            selectors: {
                videoTitle: [
                    '.title',
                    'h1',
                    '[class*="title"]',
                    '.video-title'
                ],
                videoDescription: [
                    '.desc',
                    '.video-desc',
                    '[class*="desc"]'
                ],
                subtitles: [
                    '.subtitle',
                    '.caption',
                    '[class*="subtitle"]'
                ],
                author: [
                    '.author-name',
                    '.user-name',
                    '[class*="author"]'
                ],
                episodeInfo: [
                    '[class*="episode"]',
                    '[class*="series"]'
                ],
                viewCount: [
                    '.play-count',
                    '[class*="play"]'
                ]
            }
        }
    };

    // 智能页面检测器
    class PageDetector {
        constructor() {
            this.currentPlatform = null;
            this.isShortDramaPage = false;
            this.lastUrl = '';
            this.lastTitle = '';
            this.detectionCache = new Map();
            this.init();
        }

        init() {
            this.startUrlMonitoring();
            this.startDomObservation();
            // 初始检测
            setTimeout(() => this.performDetection(), 2000);
        }

        startUrlMonitoring() {
            // 监听URL变化
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;

            history.pushState = (...args) => {
                originalPushState.apply(history, args);
                setTimeout(() => this.handleUrlChange(), 100);
            };

            history.replaceState = (...args) => {
                originalReplaceState.apply(history, args);
                setTimeout(() => this.handleUrlChange(), 100);
            };

            window.addEventListener('popstate', () => {
                setTimeout(() => this.handleUrlChange(), 100);
            });
        }

        startDomObservation() {
            const observer = new MutationObserver((mutations) => {
                let shouldDetect = false;
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        shouldDetect = true;
                        break;
                    }
                }
                if (shouldDetect) {
                    this.debouncedDetection();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false
            });
        }

        debouncedDetection = debounce(() => {
            this.performDetection();
        }, 1000);

        handleUrlChange() {
            if (window.location.href !== this.lastUrl) {
                this.lastUrl = window.location.href;
                this.performDetection();
            }
        }

        async performDetection() {
            const url = window.location.href;
            const title = document.title;
            const hostname = window.location.hostname.toLowerCase();

            console.log('开始页面检测:', {
                url,
                title,
                hostname,
                userAgent: navigator.userAgent.substring(0, 50) + '...'
            });

            // 避免重复检测
            const cacheKey = `${url}-${title}`;
            if (this.detectionCache.has(cacheKey)) {
                const cached = this.detectionCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 30000) { // 30秒缓存
                    this.currentPlatform = cached.platform;
                    this.isShortDramaPage = cached.isShortDrama;
                    console.log('使用缓存检测结果:', {
                        platform: this.currentPlatform,
                        isShortDrama: this.isShortDramaPage
                    });
                    return;
                }
            }

            // 检测平台
            this.currentPlatform = this.detectPlatform(url);
            console.log('平台检测结果:', this.currentPlatform);

            // 检测是否为短剧页面
            this.isShortDramaPage = await this.detectShortDramaPage();
            console.log('短剧页面检测结果:', this.isShortDramaPage);

            // 缓存结果
            this.detectionCache.set(cacheKey, {
                platform: this.currentPlatform,
                isShortDrama: this.isShortDramaPage,
                timestamp: Date.now()
            });

            // 通知后台脚本
            await this.notifyBackground();

            // 如果是短剧页面，自动开始内容捕获
            if (this.isShortDramaPage && captureManager) {
                console.log('开始自动内容捕获');
                captureManager.startAutoCapture();
            }
        }

        detectPlatform(url) {
            console.log('开始检测平台，当前URL:', url);

            // 检查当前域名
            const hostname = window.location.hostname.toLowerCase();
            console.log('当前主机名:', hostname);

            // 先检查精确匹配
            for (const [platformKey, config] of Object.entries(PLATFORM_CONFIGS)) {
                for (const pattern of config.patterns) {
                    if (pattern.test(url)) {
                        console.log(`匹配到平台: ${platformKey} (${config.name})`);
                        return platformKey;
                    }
                }
            }

            // 如果没有匹配到，尝试基于域名的模糊匹配
            if (hostname.includes('douyin')) {
                console.log('基于域名匹配到抖音');
                return 'douyin';
            } else if (hostname.includes('kuaishou') || hostname.includes('kwai')) {
                console.log('基于域名匹配到快手');
                return 'kuaishou';
            } else if (hostname.includes('bilibili') || hostname.includes('b23.tv')) {
                console.log('基于域名匹配到B站');
                return 'bilibili';
            } else if (hostname.includes('ixigua') || hostname.includes('toutiao')) {
                console.log('基于域名匹配到西瓜视频');
                return 'ixigua';
            }

            console.log('未检测到支持的平台');
            return null;
        }

        async detectShortDramaPage() {
            if (!this.currentPlatform) return false;

            const config = PLATFORM_CONFIGS[this.currentPlatform];

            // 1. URL关键词检测
            const urlKeywords = config.shortDramaIndicators;
            const urlMatches = urlKeywords.some(keyword =>
                new RegExp(keyword, 'i').test(window.location.href + ' ' + document.title)
            );

            // 2. DOM内容检测
            const domMatches = await this.checkDomContent(config);

            // 3. 结构特征检测
            const structureMatches = this.checkPageStructure(config);

            console.log(`短剧检测结果 - URL匹配: ${urlMatches}, DOM匹配: ${domMatches}, 结构匹配: ${structureMatches}`);

            return urlMatches || domMatches || structureMatches;
        }

        async checkDomContent(config) {
            const text = document.body.textContent.toLowerCase();
            return config.shortDramaIndicators.some(keyword =>
                new RegExp(keyword, 'i').test(text)
            );
        }

        checkPageStructure(config) {
            // 检查是否有剧集列表、播放列表等短剧特征结构
            const dramaSelectors = [
                '.episode-list',
                '.series-list',
                '[class*="episode"]',
                '[class*="series"]',
                '.playlist',
                '.collection'
            ];

            return dramaSelectors.some(selector =>
                document.querySelector(selector) !== null
            );
        }

        async notifyBackground() {
            const detectionData = {
                platform: this.currentPlatform,
                isShortDrama: this.isShortDramaPage,
                url: window.location.href,
                title: document.title,
                timestamp: Date.now()
            };

            console.log('发送页面检测结果到后台:', detectionData);

            try {
                const response = await chrome.runtime.sendMessage({
                    action: 'pageDetection',
                    data: detectionData
                });

                if (response && response.success) {
                    console.log('页面检测结果已成功发送到后台');
                } else {
                    console.warn('后台处理检测结果时出现问题:', response?.error);
                }
            } catch (error) {
                console.error('发送页面检测结果失败:', error);
            }
        }
    }

    // 智能内容捕获管理器
    class ContentCaptureManager {
        constructor(platform) {
            this.platform = platform;
            this.captureInterval = null;
            this.lastCaptureData = null;
            this.isCapturing = false;
        }

        startAutoCapture() {
            if (this.isCapturing) return;

            this.isCapturing = true;
            console.log(`开始自动捕获 ${PLATFORM_CONFIGS[this.platform]?.name} 的内容`);

            // 立即捕获一次
            this.performCapture();

            // 设置定期捕获
            this.captureInterval = setInterval(() => {
                this.performCapture();
            }, 5000); // 每5秒捕获一次
        }

        stopAutoCapture() {
            if (this.captureInterval) {
                clearInterval(this.captureInterval);
                this.captureInterval = null;
            }
            this.isCapturing = false;
            console.log('停止内容捕获');
        }

        async performCapture() {
            try {
                const capturedData = await this.captureAllContent();

                // 检查是否有新内容
                if (this.hasNewContent(capturedData)) {
                    this.lastCaptureData = capturedData;
                    await this.sendToBackground(capturedData);
                    console.log('捕获到新内容:', capturedData);
                }
            } catch (error) {
                console.error('内容捕获失败:', error);
            }
        }

        async captureAllContent() {
            const config = PLATFORM_CONFIGS[this.platform];
            if (!config) return null;

            const data = {
                platform: this.platform,
                timestamp: Date.now(),
                url: window.location.href,
                title: document.title
            };

            // 捕获各种内容
            data.videoInfo = await this.extractVideoInfo(config);
            data.textContent = await this.extractTextContent(config);
            data.metadata = await this.extractMetadata(config);
            data.engagement = await this.extractEngagementData(config);
            data.episodeInfo = await this.extractEpisodeInfo(config);

            return data;
        }

        async extractVideoInfo(config) {
            const title = this.querySelector(config.selectors.videoTitle);
            const description = this.querySelector(config.selectors.videoDescription);

            return {
                title: this.cleanText(title),
                description: this.cleanText(description)
            };
        }

        async extractTextContent(config) {
            const content = {
                subtitles: [],
                captions: [],
                description: '',
                comments: []
            };

            // 获取字幕/字幕
            const subtitleElements = document.querySelectorAll(config.selectors.subtitles.join(', '));
            subtitleElements.forEach(el => {
                const text = this.cleanText(el.textContent);
                if (text && text.length > 5) {
                    content.subtitles.push({
                        text: text,
                        timestamp: Date.now()
                    });
                }
            });

            // 获取描述
            const descElement = this.querySelector(config.selectors.videoDescription);
            content.description = this.cleanText(descElement) || '';

            return content;
        }

        async extractMetadata(config) {
            const author = this.querySelector(config.selectors.author);
            const duration = this.extractDuration();

            return {
                author: this.cleanText(author),
                duration: duration,
                platform: config.name,
                publishTime: this.extractPublishTime()
            };
        }

        async extractEngagementData(config) {
            const viewCount = this.querySelector(config.selectors.viewCount);
            const likeCount = this.querySelector(config.selectors.likeCount);

            const data = {
                viewCount: this.cleanText(viewCount),
                likeCount: this.cleanText(likeCount)
            };

            // B站特有数据
            if (this.platform === 'bilibili' && config.selectors.danmakuCount) {
                const danmakuCount = this.querySelector(config.selectors.danmakuCount);
                data.danmakuCount = this.cleanText(danmakuCount);
            }

            return data;
        }

        async extractEpisodeInfo(config) {
            const episodeElement = this.querySelector(config.selectors.episodeInfo);

            return {
                episodeNumber: this.extractEpisodeNumber(),
                episodeTitle: this.cleanText(episodeElement),
                seriesInfo: this.extractSeriesInfo()
            };
        }

        // 工具方法
        querySelector(selectors) {
            if (!Array.isArray(selectors)) selectors = [selectors];

            for (const selector of selectors) {
                try {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        return element;
                    }
                } catch (e) {
                    continue;
                }
            }
            return null;
        }

        cleanText(text) {
            if (!text) return '';
            return text.toString()
                .replace(/\s+/g, ' ')
                .replace(/[\r\n\t]/g, ' ')
                .trim();
        }

        extractDuration() {
            // 常见时长选择器
            const durationSelectors = [
                '.duration',
                '.time',
                '[class*="duration"]',
                '[class*="time"]',
                '.xgplayer-time'
            ];

            for (const selector of durationSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const text = this.cleanText(element.textContent);
                    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) {
                        return text;
                    }
                }
            }

            return '';
        }

        extractEpisodeNumber() {
            // 从标题或URL中提取集数
            const episodePatterns = [
                /第(\d+)集/,
                /EP(\d+)/i,
                /第(\d+)话/,
                /第(\d+)部/,
                /(\d+)集/
            ];

            const text = document.title + ' ' + window.location.href;
            for (const pattern of episodePatterns) {
                const match = text.match(pattern);
                if (match) {
                    return match[1];
                }
            }

            return '';
        }

        extractSeriesInfo() {
            // 尝试提取系列信息
            const seriesSelectors = [
                '.series-title',
                '.collection-title',
                '[class*="series"]',
                '[class*="collection"]'
            ];

            for (const selector of seriesSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    return this.cleanText(element.textContent);
                }
            }

            return '';
        }

        extractPublishTime() {
            // 提取发布时间
            const timeSelectors = [
                '.publish-time',
                '.time-text',
                '[class*="time"]',
                '[class*="date"]'
            ];

            for (const selector of timeSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    return this.cleanText(element.textContent);
                }
            }

            return '';
        }

        hasNewContent(newData) {
            if (!this.lastCaptureData) return true;

            // 简单的内容比较，可以优化为更精确的差异检测
            return JSON.stringify(newData) !== JSON.stringify(this.lastCaptureData);
        }

        async sendToBackground(data) {
            try {
                const response = await chrome.runtime.sendMessage({
                    action: 'contentCaptured',
                    data: data
                });

                if (!response || !response.success) {
                    console.warn('发送内容到后台失败:', response?.error);
                }
            } catch (error) {
                console.error('通信错误:', error);
            }
        }
    }

    // 防抖工具函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 初始化
    function initialize() {
        console.log('初始化短剧解构师内容脚本...');

        pageDetector = new PageDetector();

        // 立即执行一次检测
        pageDetector.performDetection().then(() => {
            console.log('初始页面检测完成:', {
                platform: pageDetector.currentPlatform,
                isShortDrama: pageDetector.isShortDramaPage,
                url: window.location.href
            });

            // 如果检测到平台，初始化捕获管理器
            if (pageDetector.currentPlatform) {
                captureManager = new ContentCaptureManager(pageDetector.currentPlatform);
                console.log('内容捕获管理器已初始化:', pageDetector.currentPlatform);

                // 如果是短剧页面，立即开始捕获
                if (pageDetector.isShortDramaPage) {
                    console.log('检测到短剧页面，开始自动捕获');
                    setTimeout(() => {
                        captureManager.startAutoCapture();
                    }, 1000);
                }
            }
        }).catch(error => {
            console.error('页面检测初始化失败:', error);
        });

        // 延迟再次检测，确保页面完全加载
        setTimeout(() => {
            if (pageDetector) {
                console.log('延迟检测执行...');
                pageDetector.performDetection().then(() => {
                    console.log('延迟检测结果:', {
                        platform: pageDetector.currentPlatform,
                        isShortDrama: pageDetector.isShortDramaPage
                    });
                });
            }
        }, 3000);
    }

    // 启动初始化 - 立即执行，不等待DOM加载完成
    console.log('立即开始初始化，readyState:', document.readyState);
    initialize();

    // 监听来自popup的消息 - 兼容新的智能捕获系统
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'ping') {
            // 简单的响应，确认内容脚本已加载
            sendResponse({
                success: true,
                message: '内容脚本已加载'
            });
            return true;
        } else if (request.action === 'getPlatformDetection') {
            // 返回平台检测结果
            if (pageDetector) {
                const platformName = pageDetector.currentPlatform;
                console.log('Popup请求平台检测结果:', platformName);
                sendResponse({
                    success: true,
                    platform: platformName
                });
            } else {
                sendResponse({
                    success: false,
                    error: '页面检测器未初始化'
                });
            }
        } else if (request.action === 'analyzeDrama') {
            if (isAnalyzing) {
                sendResponse({
                    success: false,
                    error: '正在进行其他分析任务，请稍后重试'
                });
                return;
            }

            // 使用新的智能捕获系统
            performIntelligentAnalysis()
                .then(result => {
                    sendResponse({
                        success: true,
                        data: result
                    });
                })
                .catch(error => {
                    sendResponse({
                        success: false,
                        error: error.message
                    });
                });
        } else if (request.action === 'getCapturedContent') {
            // 获取已捕获的内容
            if (captureManager && captureManager.lastCaptureData) {
                sendResponse({
                    success: true,
                    data: captureManager.lastCaptureData
                });
            } else {
                sendResponse({
                    success: false,
                    error: '暂无捕获的内容'
                });
            }
        } else if (request.action === 'forceCapture') {
            // 强制执行一次捕获
            if (captureManager) {
                captureManager.performCapture().then(data => {
                    sendResponse({
                        success: true,
                        data: data
                    });
                }).catch(error => {
                    sendResponse({
                        success: false,
                        error: error.message
                    });
                });
            } else {
                sendResponse({
                    success: false,
                    error: '捕获管理器未初始化'
                });
            }
        }
        return true;
    });

    // 智能分析功能 - 使用新的捕获系统
    async function performIntelligentAnalysis() {
        isAnalyzing = true;
        console.log('开始智能分析流程...');

        try {
            // 确保页面检测完成
            if (!pageDetector) {
                console.error('页面检测器未初始化');
                throw new Error('页面检测器未初始化');
            }

            console.log('页面检测器状态:', {
                platform: pageDetector.currentPlatform,
                isShortDrama: pageDetector.isShortDramaPage,
                url: window.location.href
            });

            // 如果还没有检测，先执行检测
            if (!pageDetector.currentPlatform) {
                console.log('未检测到平台，重新执行检测...');
                await pageDetector.performDetection();
            }

            if (!pageDetector.isShortDramaPage) {
                console.warn('当前页面不是短剧页面:', {
                    platform: pageDetector.currentPlatform,
                    url: window.location.href,
                    title: document.title
                });
                throw new Error('当前页面不是短剧页面，请在短剧播放页面使用');
            }

            // 确保捕获管理器已初始化
            if (!captureManager) {
                console.log('初始化内容捕获管理器...');
                captureManager = new ContentCaptureManager(pageDetector.currentPlatform);
            }

            // 执行一次完整的捕获
            console.log('执行内容捕获...');
            const capturedData = await captureManager.captureAllContent();

            if (!capturedData) {
                console.error('内容捕获失败，数据为空');
                throw new Error('未能捕获到内容数据');
            }

            console.log('内容捕获成功，发送到后台分析...', capturedData);

            // 发送到后台进行AI分析
            const response = await sendMessageToBackground({
                action: 'analyzeDrama',
                data: capturedData
            });

            if (response.success) {
                console.log('AI分析完成:', response.data);
                return response.data;
            } else {
                console.error('AI分析失败:', response.error);
                throw new Error(response.error || '分析失败');
            }

        } finally {
            isAnalyzing = false;
        }
    }

    // 发送消息到后台脚本
    function sendMessageToBackground(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, response => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
    }

})();