/**
 * 坐姿检测页面模块 - 优化版
 * 包含：美观骨骼辅助线、表情关键点检测、平滑滤波、学习报告模块
 */

const healthPage = {
    isMonitoring: false,
    videoStream: null,
    poseDetector: null,
    faceDetector: null,
    camera: null,
    currentPosture: null,
    lastStatus: null,
    speechEnabled: true,
    
    // 数据平滑滤波
    landmarkHistory: [],
    maxHistoryLength: 10,
    
    // 不良姿势统计
    badPostureStats: {
        head_down: 0,
        hunchback: 0,
        lean_forward: 0,
        total: 0
    },
    
    // 疲劳表情统计
    fatigueCount: 0,
    squintCount: 0,
    
    // 个性化设置
    settings: {
        sensitivity: 'standard',
        scenario: 'pc',
        focusMode: false,
    },
    
    // 防抖与提醒状态
    timers: {
        badPostureStart: null,
        lastWarningTime: null,
        headDownStart: null,
        studyStart: null,
        goodPostureContinuousStart: null,
    },
    
    // 标准基准
    baseline: null,
    
    localStats: {
        reminders_count: 0,
        longest_good_duration: 0,
        current_good_duration: 0,
        total_healthy_duration: 0,
        start_time: null,
    },

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade-in">
                <!-- 学习报告模块 - 独立区域 -->
                <div class="card mb-6 bg-gradient-to-br from-blue-50 to-teal-50 border-none">
                    <div class="card-header border-none pb-2">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            今日学习报告
                        </h3>
                    </div>
                    <div class="card-body pt-0">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-white rounded-xl p-4 shadow-sm">
                                <div class="flex items-center mb-2">
                                    <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <span class="text-xs text-slate-500">学习时长</span>
                                </div>
                                <div class="text-2xl font-bold text-slate-800" id="report-study-duration">0分钟</div>
                            </div>
                            
                            <div class="bg-white rounded-xl p-4 shadow-sm">
                                <div class="flex items-center mb-2">
                                    <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                                        <svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <span class="text-xs text-slate-500">坐姿合规率</span>
                                </div>
                                <div class="text-2xl font-bold text-teal-600" id="report-compliance-rate">--%</div>
                            </div>
                            
                            <div class="bg-white rounded-xl p-4 shadow-sm">
                                <div class="flex items-center mb-2">
                                    <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                                        <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                        </svg>
                                    </div>
                                    <span class="text-xs text-slate-500">不良姿势次数</span>
                                </div>
                                <div class="text-2xl font-bold text-orange-600" id="report-bad-posture">0次</div>
                            </div>
                            
                            <div class="bg-white rounded-xl p-4 shadow-sm">
                                <div class="flex items-center mb-2">
                                    <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                        <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <span class="text-xs text-slate-500">疲劳表情次数</span>
                                </div>
                                <div class="text-2xl font-bold text-purple-600" id="report-fatigue-count">0次</div>
                            </div>
                        </div>
                        
                        <!-- 不良姿势详细统计 -->
                        <div class="mt-4 grid grid-cols-3 gap-3">
                            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                                <div class="text-xs text-slate-500 mb-1">低头</div>
                                <div class="text-lg font-semibold text-red-500" id="stat-head-down">0</div>
                            </div>
                            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                                <div class="text-xs text-slate-500 mb-1">驼背</div>
                                <div class="text-lg font-semibold text-orange-500" id="stat-hunchback">0</div>
                            </div>
                            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                                <div class="text-xs text-slate-500 mb-1">前倾</div>
                                <div class="text-lg font-semibold text-yellow-500" id="stat-lean-forward">0</div>
                            </div>
                        </div>
                        
                        <!-- 建议区域 -->
                        <div id="report-suggestion" class="mt-4 p-3 bg-white rounded-xl shadow-sm text-sm text-slate-600">
                            <div class="flex items-start">
                                <svg class="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>开始学习后，这里会显示个性化的健康建议</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 顶部数据统计 -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div class="stat-card">
                        <div class="stat-icon bg-green-100 text-green-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="stat-value text-green-600" id="healthy-duration">0 分钟</div>
                        <div class="stat-label">今日健康学习</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-blue-100 text-blue-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                            </svg>
                        </div>
                        <div class="stat-value text-blue-600" id="longest-good-duration">0 分钟</div>
                        <div class="stat-label">最长端正坐姿</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-orange-100 text-orange-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                        </div>
                        <div class="stat-value text-orange-500" id="reminders-count">0 次</div>
                        <div class="stat-label">温馨提醒次数</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                        <div class="card h-full">
                            <div class="card-header flex items-center justify-between">
                                <h3 class="text-lg font-bold text-slate-800">实时监测</h3>
                                <div id="monitor-status" class="status-indicator text-slate-400">
                                    未启动
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="video-container mb-4 relative rounded-xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                                    <video id="video-preview" autoplay playsinline class="w-full h-full object-cover hidden"></video>
                                    <canvas id="video-canvas" class="absolute inset-0 w-full h-full object-cover z-10"></canvas>
                                    
                                    <!-- 悬浮温馨提示气泡 -->
                                    <div id="friendly-toast" class="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-100 z-20 flex items-center space-x-3 transform translate-y-2 opacity-0 transition-all duration-300">
                                        <div id="friendly-toast-icon" class="w-2 h-2 rounded-full bg-green-400"></div>
                                        <p id="friendly-toast-msg" class="text-sm font-medium text-slate-700">正在监测坐姿...</p>
                                    </div>

                                    <div id="video-overlay" class="absolute inset-0 flex flex-col items-center justify-center z-30">
                                        <svg class="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="text-slate-400 font-medium">摄像头未启动</p>
                                    </div>
                                </div>

                                <div class="flex flex-wrap items-center justify-center gap-4">
                                    <button id="start-monitor-btn" class="btn bg-teal-500 hover:bg-teal-600 text-white btn-lg shadow-sm rounded-full px-8">
                                        开始检测
                                    </button>
                                    <button id="calibrate-btn" class="btn bg-blue-500 hover:bg-blue-600 text-white btn-lg shadow-sm rounded-full px-8 hidden">
                                        标定标准坐姿
                                    </button>
                                    <button id="stop-monitor-btn" class="btn bg-slate-100 hover:bg-slate-200 text-slate-600 btn-lg shadow-sm rounded-full px-8 hidden">
                                        停止检测
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <!-- 个性化设置面板 -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="text-lg font-bold text-slate-800">个性化设置</h3>
                            </div>
                            <div class="card-body space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 mb-2">学习场景</label>
                                    <div class="flex bg-slate-100 rounded-lg p-1">
                                        <button class="scenario-btn flex-1 py-1.5 text-sm font-medium rounded-md bg-white shadow-sm text-slate-800" data-val="pc">看电脑</button>
                                        <button class="scenario-btn flex-1 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-700" data-val="reading">写字/看书</button>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 mb-2">提醒灵敏度</label>
                                    <select id="sensitivity-select" class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500">
                                        <option value="strict">严格 (稍微低头即提醒)</option>
                                        <option value="standard" selected>标准 (适合大多数人)</option>
                                        <option value="loose">宽松 (仅严重不良时提醒)</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between pt-2">
                                    <div>
                                        <div class="text-sm font-medium text-slate-700">专注模式</div>
                                        <div class="text-xs text-slate-500">仅角落提示，不弹窗打扰</div>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="focus-mode-toggle" class="sr-only peer">
                                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                    </label>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="text-sm font-medium text-slate-700">语音/提示音</div>
                                        <div class="text-xs text-slate-500">温柔的女声语音提醒</div>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="speech-toggle" class="sr-only peer" checked>
                                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- 实时状态面板 -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="text-lg font-bold text-slate-800">姿态反馈</h3>
                            </div>
                            <div class="card-body">
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <span class="text-slate-600 text-sm">头颈角度</span>
                                        <span id="head-angle-val" class="font-medium text-slate-800">--°</span>
                                    </div>
                                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <span class="text-slate-600 text-sm">双肩状态</span>
                                        <span id="shoulder-status-val" class="font-medium text-slate-800">--</span>
                                    </div>
                                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <span class="text-slate-600 text-sm">面部状态</span>
                                        <span id="face-status-val" class="font-medium text-slate-800">--</span>
                                    </div>
                                </div>
                                <div id="ai-recommendation" class="mt-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-xl">
                                    保持好习惯，保护颈椎和视力哦～
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    setupEventListeners() {
        const startBtn = document.getElementById('start-monitor-btn');
        const stopBtn = document.getElementById('stop-monitor-btn');
        const calibrateBtn = document.getElementById('calibrate-btn');
        
        // 设置选项
        const speechToggle = document.getElementById('speech-toggle');
        const focusToggle = document.getElementById('focus-mode-toggle');
        const sensitivitySelect = document.getElementById('sensitivity-select');
        const scenarioBtns = document.querySelectorAll('.scenario-btn');

        if (startBtn) startBtn.addEventListener('click', () => this.startMonitoring());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopMonitoring());
        if (calibrateBtn) calibrateBtn.addEventListener('click', () => this.calibrateBaseline());

        if (speechToggle) {
            speechToggle.addEventListener('change', (e) => {
                this.speechEnabled = e.target.checked;
            });
        }
        
        if (focusToggle) {
            focusToggle.addEventListener('change', (e) => {
                this.settings.focusMode = e.target.checked;
            });
        }
        
        if (sensitivitySelect) {
            sensitivitySelect.addEventListener('change', (e) => {
                this.settings.sensitivity = e.target.value;
            });
        }

        scenarioBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                scenarioBtns.forEach(b => {
                    b.classList.remove('bg-white', 'shadow-sm', 'text-slate-800');
                    b.classList.add('text-slate-500');
                });
                const target = e.target;
                target.classList.remove('text-slate-500');
                target.classList.add('bg-white', 'shadow-sm', 'text-slate-800');
                this.settings.scenario = target.getAttribute('data-val');
            });
        });
    },

    calibrateBaseline() {
        if (!this.currentPosture) {
            this.showFriendlyToast('请先坐在画面中央哦', 'info');
            return;
        }
        this.baseline = {
            shoulderAngle: this.currentPosture.raw_shoulder_angle,
            earAngle: this.currentPosture.raw_ear_angle,
            forwardLean: this.currentPosture.raw_forward_lean,
            shoulderWidth: this.currentPosture.raw_shoulder_width
        };
        this.showFriendlyToast('标定成功！这就是你的标准坐姿啦', 'success');
        this.speak('标定成功');
    },

    showFriendlyToast(message, type = 'info') {
        const toast = document.getElementById('friendly-toast');
        const msgEl = document.getElementById('friendly-toast-msg');
        const iconEl = document.getElementById('friendly-toast-icon');
        
        if (!toast || !msgEl || !iconEl) return;
        
        msgEl.textContent = message;
        
        // 重置样式
        iconEl.className = 'w-2 h-2 rounded-full';
        if (type === 'success' || type === 'good') {
            iconEl.classList.add('bg-green-400');
        } else if (type === 'warning') {
            iconEl.classList.add('bg-orange-400');
        } else if (type === 'danger') {
            iconEl.classList.add('bg-red-400');
        } else {
            iconEl.classList.add('bg-blue-400');
        }
        
        toast.classList.remove('translate-y-2', 'opacity-0');
        
        // 如果有旧的定时器，清除它
        if (this._toastTimeout) clearTimeout(this._toastTimeout);
        
        // 3秒后消失
        this._toastTimeout = setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
        }, 3000);
    },

    speak(text) {
        if (!this.speechEnabled) return;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 1;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    },

    // 平滑滤波 - 移动平均
    smoothLandmarks(landmarks) {
        if (!landmarks) return null;
        
        // 添加到历史记录
        this.landmarkHistory.push(landmarks.map(lm => ({x: lm.x, y: lm.y, z: lm.z})));
        
        if (this.landmarkHistory.length > this.maxHistoryLength) {
            this.landmarkHistory.shift();
        }
        
        // 计算平均值
        const smoothed = landmarks.map((lm, idx) => {
            const values = this.landmarkHistory.map(history => history[idx]);
            return {
                x: values.reduce((sum, v) => sum + v.x, 0) / values.length,
                y: values.reduce((sum, v) => sum + v.y, 0) / values.length,
                z: values.reduce((sum, v) => sum + v.z, 0) / values.length
            };
        });
        
        return smoothed;
    },

    async startMonitoring() {
        try {
            // 重置状态
            this.landmarkHistory = [];
            this.badPostureStats = { head_down: 0, hunchback: 0, lean_forward: 0, total: 0 };
            this.fatigueCount = 0;
            this.squintCount = 0;
            
            // 初始化本地统计数据
            this.localStats = {
                reminders_count: 0,
                longest_good_duration: 0,
                current_good_duration: 0,
                total_healthy_duration: 0,
                start_time: Date.now(),
            };
            
            // 重置定时器
            this.timers = {
                badPostureStart: null,
                lastWarningTime: null,
                headDownStart: null,
                studyStart: Date.now(),
                goodPostureContinuousStart: Date.now(),
            };

            const video = document.getElementById('video-preview');
            const canvas = document.getElementById('video-canvas');
            if (!video || !canvas) return;
            const ctx = canvas.getContext('2d');

            // 初始化 MediaPipe Pose
            this.poseDetector = new window.Pose({locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }});

            // 提高模型复杂度并启用平滑
            this.poseDetector.setOptions({
                modelComplexity: 2,
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: false,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            // 初始化 MediaPipe Face Mesh 用于表情检测
            this.faceDetector = new window.FaceMesh({locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }});

            this.faceDetector.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            let poseLandmarks = null;
            let faceLandmarks = null;

            // 姿态检测回调
            this.poseDetector.onResults((results) => {
                poseLandmarks = results.poseLandmarks;
                this.processDetections(poseLandmarks, faceLandmarks, video, canvas, ctx);
            });

            // 面部检测回调
            this.faceDetector.onResults((results) => {
                faceLandmarks = results.multiFaceLandmarks?.[0];
                this.processDetections(poseLandmarks, faceLandmarks, video, canvas, ctx);
            });

            // 使用 Camera Utils 获取视频流
            this.camera = new window.Camera(video, {
                onFrame: async () => {
                    if (this.isMonitoring && this.poseDetector && this.faceDetector) {
                        await this.poseDetector.send({image: video});
                        await this.faceDetector.send({image: video});
                    }
                },
                width: 640,
                height: 480
            });

            await this.camera.start();

            this.isMonitoring = true;
            this.updateUI();

            this.showFriendlyToast('监测已启动，请保持端正坐姿哦', 'success');
        } catch (error) {
            console.error('Failed to start monitoring:', error);
            this.showFriendlyToast('无法访问摄像头或加载AI模型失败', 'danger');
        }
    },

    processDetections(poseLandmarks, faceLandmarks, video, canvas, ctx) {
        if (!this.isMonitoring) return;

        // 绘制视频背景
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (poseLandmarks) {
            // 平滑处理关键点
            const smoothedLandmarks = this.smoothLandmarks(poseLandmarks);
            
            // 分析姿态
            const postureData = this.analyzePosture(smoothedLandmarks);
            
            // 分析表情
            let faceStatus = '正常';
            let isFatigue = false;
            if (faceLandmarks) {
                const faceAnalysis = this.analyzeFaceExpression(faceLandmarks);
                faceStatus = faceAnalysis.status;
                isFatigue = faceAnalysis.isFatigue;
                
                // 更新疲劳统计
                if (isFatigue && !this._lastFatigueState) {
                    this.fatigueCount++;
                }
                this._lastFatigueState = isFatigue;
            }

            if (postureData) {
                this.currentPosture = { ...postureData, faceStatus, isFatigue };
                this.processPostureDebounced(this.currentPosture);
            }

            // 绘制美观的骨骼辅助线
            this.drawEnhancedFeedback(smoothedLandmarks, faceLandmarks, canvas, ctx, this.currentPosture);
            
            // 更新面部状态UI
            const faceStatusVal = document.getElementById('face-status-val');
            if (faceStatusVal) {
                faceStatusVal.textContent = faceStatus;
            }
        } else {
            if (this.currentPosture && this.currentPosture.status !== 'pause') {
                this.currentPosture = { status: 'pause', message: '未检测到人像，已暂停' };
                this.timers.badPostureStart = null;
                this.updatePostureUI(this.currentPosture);
                this.showFriendlyToast('人出框啦，检测暂停～', 'info');
            }
        }
    },

    analyzeFaceExpression(landmarks) {
        if (!landmarks) return { status: '正常', isFatigue: false };

        // 关键点索引 (MediaPipe Face Mesh)
        const leftEyeTop = landmarks[386];
        const leftEyeBottom = landmarks[374];
        const rightEyeTop = landmarks[159];
        const rightEyeBottom = landmarks[145];
        const leftEyeOuter = landmarks[33];
        const leftEyeInner = landmarks[133];
        const rightEyeOuter = landmarks[263];
        const rightEyeInner = landmarks[362];

        // 计算眼睛开合程度 (EAR - Eye Aspect Ratio)
        const leftEyeHeight = Math.abs(leftEyeTop.y - leftEyeBottom.y);
        const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x);
        const rightEyeHeight = Math.abs(rightEyeTop.y - rightEyeBottom.y);
        const rightEyeWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x);

        const leftEAR = leftEyeHeight / leftEyeWidth;
        const rightEAR = rightEyeHeight / rightEyeWidth;
        const avgEAR = (leftEAR + rightEAR) / 2;

        // 阈值判断
        const EYE_CLOSED_THRESHOLD = 0.2;
        const SQUINT_THRESHOLD = 0.25;

        let status = '正常';
        let isFatigue = false;

        if (avgEAR < EYE_CLOSED_THRESHOLD) {
            status = '闭眼';
            isFatigue = true;
        } else if (avgEAR < SQUINT_THRESHOLD) {
            status = '眯眼';
            this.squintCount++;
            isFatigue = true;
        }

        return { status, isFatigue, ear: avgEAR };
    },

    processPostureDebounced(data) {
        const now = Date.now();
        
        // 专注模式下需要持续 5 秒才提醒，否则 2 秒
        const debounceTime = this.settings.focusMode ? 5000 : 2000;
        // 提醒冷却时间：专注模式 30 秒，否则 10 秒
        const cooldownTime = this.settings.focusMode ? 30000 : 10000;

        // 更新不良姿势统计
        if (data.status !== 'good' && data.status !== 'pause') {
            if (!this._lastBadPostureState) {
                this.badPostureStats.total++;
                
                // 分类统计
                if (data.message.includes('低头') || data.message.includes('歪头')) {
                    this.badPostureStats.head_down++;
                } else if (data.message.includes('驼背') || data.message.includes('腰背')) {
                    this.badPostureStats.hunchback++;
                } else if (data.message.includes('前倾') || data.message.includes('离屏幕')) {
                    this.badPostureStats.lean_forward++;
                }
            }
            this._lastBadPostureState = true;
        } else {
            this._lastBadPostureState = false;
        }

        // 更新学习报告UI
        this.updateReportUI(now);

        if (data.status !== 'good' && data.status !== 'pause') {
            if (this.timers.goodPostureContinuousStart) {
                const duration = (now - this.timers.goodPostureContinuousStart) / 1000;
                this.localStats.total_healthy_duration += duration;
                if (duration > this.localStats.longest_good_duration) {
                    this.localStats.longest_good_duration = duration;
                }
                this.timers.goodPostureContinuousStart = null;
            }

            if (!this.timers.badPostureStart) {
                this.timers.badPostureStart = now;
            } else if (now - this.timers.badPostureStart > debounceTime) {
                if (!this.timers.lastWarningTime || now - this.timers.lastWarningTime > cooldownTime) {
                    this.localStats.reminders_count++;
                    this.showFriendlyToast(data.message, data.status);
                    if (data.status === 'danger') {
                        this.speak(data.message);
                    } else if (!this.settings.focusMode) {
                        this.speak(data.message);
                    }
                    this.timers.lastWarningTime = now;
                }
            }
        } else if (data.status === 'good') {
            this.timers.badPostureStart = null;
            if (!this.timers.goodPostureContinuousStart) {
                this.timers.goodPostureContinuousStart = now;
            } else {
                const goodDur = (now - this.timers.goodPostureContinuousStart) / 1000;
                if (goodDur > 0 && Math.floor(goodDur) % 300 === 0) {
                    if (!this.timers.lastWarningTime || now - this.timers.lastWarningTime > 60000) {
                        this.showFriendlyToast('已经保持端正坐姿 5 分钟啦，真棒！', 'success');
                        this.timers.lastWarningTime = now;
                    }
                }
            }
        }

        const studyDur = (now - this.timers.studyStart) / 1000;
        if (studyDur > 45 * 60) {
            if (!this._eyeCareShown) {
                this.showFriendlyToast('学习了很久啦，起来走动一下，看看远处吧', 'warning');
                this.speak('学习了很久啦，起来走动一下，看看远处吧');
                this._eyeCareShown = true;
            }
        }

        this.updatePostureUI(data);
        this.updateLocalStatsUI();
    },

    updateReportUI(now) {
        const studyDuration = Math.floor((now - this.timers.studyStart) / 1000 / 60);
        
        document.getElementById('report-study-duration').textContent = studyDuration + '分钟';
        document.getElementById('report-bad-posture').textContent = this.badPostureStats.total + '次';
        document.getElementById('report-fatigue-count').textContent = this.fatigueCount + '次';
        
        document.getElementById('stat-head-down').textContent = this.badPostureStats.head_down;
        document.getElementById('stat-hunchback').textContent = this.badPostureStats.hunchback;
        document.getElementById('stat-lean-forward').textContent = this.badPostureStats.lean_forward;

        // 计算合规率
        if (this.localStats.start_time) {
            const totalDuration = (now - this.localStats.start_time) / 1000;
            const goodDuration = this.localStats.total_healthy_duration + 
                (this.timers.goodPostureContinuousStart ? (now - this.timers.goodPostureContinuousStart) / 1000 : 0);
            const complianceRate = totalDuration > 0 ? Math.round((goodDuration / totalDuration) * 100) : 0;
            document.getElementById('report-compliance-rate').textContent = complianceRate + '%';
        }

        // 更新建议
        const suggestionEl = document.getElementById('report-suggestion');
        let suggestions = [];
        
        if (this.badPostureStats.head_down > 5) {
            suggestions.push('频繁低头，注意颈椎健康');
        }
        if (this.badPostureStats.hunchback > 3) {
            suggestions.push('驼背较多，挺直腰背');
        }
        if (this.fatigueCount > 3) {
            suggestions.push('出现疲劳表情，建议休息');
        }
        if (suggestions.length === 0) {
            suggestions.push('保持良好状态，继续加油！');
        }

        suggestionEl.innerHTML = `
            <div class="flex items-start">
                <svg class="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>${suggestions.join('，')}</span>
            </div>
        `;
    },

    drawEnhancedFeedback(poseLandmarks, faceLandmarks, canvas, ctx, postureData) {
        if (!poseLandmarks || !ctx || !canvas) return;

        const w = canvas.width;
        const h = canvas.height;

        const toPx = (coord) => ({
            x: coord.x * w,
            y: coord.y * h
        });

        const isBad = postureData && postureData.status !== 'good' && postureData.status !== 'pause';
        const isFatigue = postureData && postureData.isFatigue;

        // 定义骨骼连接
        const POSE_CONNECTIONS = [
            [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
            [11, 23], [12, 24], [23, 24]
        ];

        // 提取关键点
        const nose = poseLandmarks[0];
        const leftShoulder = poseLandmarks[11];
        const rightShoulder = poseLandmarks[12];
        const leftHip = poseLandmarks[23];
        const rightHip = poseLandmarks[24];
        const leftEar = poseLandmarks[7];
        const rightEar = poseLandmarks[8];

        if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

        const shoulderCenter = {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2
        };
        const hipCenter = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
        };

        // 1. 绘制柔和脊柱线 (重点)
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const spineColor = isBad ? 'rgba(251, 146, 60, 0.8)' : 'rgba(74, 222, 128, 0.8)';
        
        // 绘制渐变脊柱
        const spineGradient = ctx.createLinearGradient(
            nose.x * w, nose.y * h,
            hipCenter.x * w, hipCenter.y * h
        );
        spineGradient.addColorStop(0, spineColor);
        spineGradient.addColorStop(1, isBad ? 'rgba(251, 146, 60, 0.4)' : 'rgba(74, 222, 128, 0.4)');
        
        ctx.strokeStyle = spineGradient;
        ctx.setLineDash([]);
        ctx.beginPath();
        
        // 平滑曲线
        const nosePt = toPx(nose);
        const shoulderPt = toPx(shoulderCenter);
        const hipPt = toPx(hipCenter);
        
        ctx.moveTo(nosePt.x, nosePt.y);
        ctx.quadraticCurveTo(shoulderPt.x, shoulderPt.y - 10, shoulderPt.x, shoulderPt.y);
        ctx.quadraticCurveTo((shoulderPt.x + hipPt.x) / 2, (shoulderPt.y + hipPt.y) / 2 - 5, hipPt.x, hipPt.y);
        ctx.stroke();

        // 2. 绘制肩膀辅助线 (重点)
        ctx.lineWidth = 5;
        const shoulderColor = isBad ? 'rgba(251, 191, 36, 0.8)' : 'rgba(52, 211, 153, 0.8)';
        ctx.strokeStyle = shoulderColor;
        ctx.beginPath();
        ctx.moveTo(leftShoulder.x * w, leftShoulder.y * h);
        ctx.lineTo(rightShoulder.x * w, rightShoulder.y * h);
        ctx.stroke();

        // 3. 绘制头颈区域 (重点)
        ctx.lineWidth = 4;
        const neckColor = isBad ? 'rgba(248, 113, 113, 0.8)' : 'rgba(16, 185, 129, 0.8)';
        ctx.strokeStyle = neckColor;
        ctx.beginPath();
        ctx.moveTo(nose.x * w, nose.y * h);
        ctx.lineTo(shoulderCenter.x * w, shoulderCenter.y * h);
        ctx.stroke();

        // 4. 绘制骨骼关键点 (美观的圆点)
        const drawPoint = (point, color, size = 8) => {
            const pt = toPx(point);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, size, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        // 关键骨骼点
        const keyPointsColor = isBad ? 'rgba(248, 113, 113, 0.9)' : 'rgba(16, 185, 129, 0.9)';
        drawPoint(nose, keyPointsColor, 10);
        drawPoint(leftEar, keyPointsColor, 8);
        drawPoint(rightEar, keyPointsColor, 8);
        drawPoint(leftShoulder, keyPointsColor, 10);
        drawPoint(rightShoulder, keyPointsColor, 10);

        // 5. 绘制面部表情关键点 (如果有)
        if (faceLandmarks) {
            const faceColor = isFatigue ? 'rgba(168, 85, 247, 0.8)' : 'rgba(99, 102, 241, 0.6)';
            
            // 眼睛周围点
            const eyeIndices = [
                33, 133, 145, 159, 263, 362, 374, 386
            ];
            
            eyeIndices.forEach(idx => {
                if (faceLandmarks[idx]) {
                    drawPoint(faceLandmarks[idx], faceColor, 4);
                }
            });
        }

        // 6. 绘制身体框架 (柔和)
        ctx.lineWidth = 2;
        ctx.strokeStyle = isBad ? 'rgba(251, 146, 60, 0.3)' : 'rgba(74, 222, 128, 0.3)';
        ctx.setLineDash([4, 4]);
        
        ctx.beginPath();
        POSE_CONNECTIONS.forEach(([a, b]) => {
            const p1 = poseLandmarks[a];
            const p2 = poseLandmarks[b];
            if (p1 && p2) {
                ctx.moveTo(p1.x * w, p1.y * h);
                ctx.lineTo(p2.x * w, p2.y * h);
            }
        });
        ctx.stroke();
        
        ctx.setLineDash([]);
    },

    async stopMonitoring() {
        if (this.camera) {
            await this.camera.stop();
            this.camera = null;
        }

        if (this.poseDetector) {
            await this.poseDetector.close();
            this.poseDetector = null;
        }
        
        if (this.faceDetector) {
            await this.faceDetector.close();
            this.faceDetector = null;
        }

        const now = Date.now();
        if (this.timers.goodPostureContinuousStart) {
            const duration = (now - this.timers.goodPostureContinuousStart) / 1000;
            this.localStats.total_healthy_duration += duration;
            if (duration > this.localStats.longest_good_duration) {
                this.localStats.longest_good_duration = duration;
            }
        }

        const session_duration = Math.floor((now - this.localStats.start_time) / 1000);
        const good_duration = Math.floor(this.localStats.total_healthy_duration);
        const good_rate = session_duration > 0 ? Math.round((good_duration / session_duration) * 100) : 0;

        let report = {
            summary: good_rate > 80 ? '本次学习坐姿表现非常优秀，给你点个赞！' : '本次坐姿有一些小瑕疵，下次继续努力哦～',
            session_duration: session_duration,
            healthy_duration: good_duration,
            longest_duration: Math.floor(this.localStats.longest_good_duration),
            reminders_count: this.localStats.reminders_count,
            good_posture_rate: good_rate,
            bad_posture_stats: { ...this.badPostureStats },
            fatigue_count: this.fatigueCount,
            recommendations: [
                '保持屏幕与眼睛的距离在一臂左右',
                '避免长时间低头，每 45 分钟休息一下眼睛',
                '双肩保持水平，可以适当做些拉伸运动放松'
            ]
        };

        this.isMonitoring = false;
        this.updateUI();
        this.showFriendlyToast('检测已结束，休息一下吧', 'info');
        
        this.showReport(report);
    },
    
    updateLocalStatsUI() {
        const healthyDuration = document.getElementById('healthy-duration');
        const longestDuration = document.getElementById('longest-good-duration');
        const remindersCount = document.getElementById('reminders-count');

        const now = Date.now();
        let currentGood = 0;
        if (this.timers.goodPostureContinuousStart) {
            currentGood = (now - this.timers.goodPostureContinuousStart) / 1000;
        }
        
        const total = Math.floor((this.localStats.total_healthy_duration + currentGood) / 60);
        const longest = Math.floor(Math.max(this.localStats.longest_good_duration, currentGood) / 60);

        if (healthyDuration) healthyDuration.textContent = total + ' 分钟';
        if (longestDuration) longestDuration.textContent = longest + ' 分钟';
        if (remindersCount) remindersCount.textContent = this.localStats.reminders_count + ' 次';
    },
    
    showReport(report) {
        const formatDuration = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}分${secs}秒`;
        };
        
        const modalContent = `
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center">
                        <svg class="w-7 h-7 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        坐姿学习报告
                    </h2>
                    <button id="close-report-btn" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100">
                    <p class="text-lg font-medium text-teal-800">${report.summary}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <p class="text-sm text-slate-500 mb-1">学习总时长</p>
                        <p class="text-2xl font-bold text-slate-800">${formatDuration(report.session_duration)}</p>
                    </div>
                    <div class="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <p class="text-sm text-slate-500 mb-1">健康坐姿时长</p>
                        <p class="text-2xl font-bold text-green-600">${formatDuration(report.healthy_duration)}</p>
                    </div>
                    <div class="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <p class="text-sm text-slate-500 mb-1">最长端正时长</p>
                        <p class="text-2xl font-bold text-blue-600">${formatDuration(report.longest_duration)}</p>
                    </div>
                    <div class="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <p class="text-sm text-slate-500 mb-1">健康坐姿率</p>
                        <p class="text-2xl font-bold text-teal-600">${report.good_posture_rate}%</p>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-3">不良姿势统计</h3>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="p-3 bg-red-50 rounded-xl text-center">
                            <div class="text-xs text-red-600 mb-1">低头</div>
                            <div class="text-xl font-bold text-red-600">${report.bad_posture_stats.head_down}次</div>
                        </div>
                        <div class="p-3 bg-orange-50 rounded-xl text-center">
                            <div class="text-xs text-orange-600 mb-1">驼背</div>
                            <div class="text-xl font-bold text-orange-600">${report.bad_posture_stats.hunchback}次</div>
                        </div>
                        <div class="p-3 bg-yellow-50 rounded-xl text-center">
                            <div class="text-xs text-yellow-600 mb-1">前倾</div>
                            <div class="text-xl font-bold text-yellow-600">${report.bad_posture_stats.lean_forward}次</div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-3">疲劳表情统计</h3>
                    <div class="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                        <span class="text-slate-600">疲劳/眯眼次数</span>
                        <span class="font-medium text-purple-600">${report.fatigue_count} 次</span>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-3">今日提醒</h3>
                    <div class="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                        <span class="text-slate-600">温馨提醒次数</span>
                        <span class="font-medium text-orange-600">${report.reminders_count} 次</span>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-bold text-slate-800 mb-3">健康建议</h3>
                    <ul class="space-y-3">
                        ${report.recommendations.map(rec => `
                            <li class="flex items-start">
                                <div class="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <span class="text-slate-600 leading-relaxed">${rec}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="mt-8 flex justify-end">
                    <button id="close-report-btn-2" class="btn bg-teal-500 hover:bg-teal-600 text-white rounded-full px-8 py-2.5">
                        关闭报告
                    </button>
                </div>
            </div>
        `;
        
        showModal(modalContent);
        
        setTimeout(() => {
            const closeButtons = document.querySelectorAll('#close-report-btn, #close-report-btn-2');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => hideModal());
            });
        }, 100);
    },

    calculateAngle(A, B, C) {
        const radians = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) {
            angle = 360.0 - angle;
        }
        return angle;
    },

    analyzePosture(landmarks) {
        if (!landmarks || landmarks.length === 0) return null;

        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const nose = landmarks[0];

        let thresh_shoulder = 6;
        let thresh_ear = 10;
        let thresh_lean = -0.15;
        let thresh_dist = 0.65;

        if (this.settings.scenario === 'reading') {
            thresh_lean = -0.20;
            thresh_ear = 15;
        }

        if (this.settings.sensitivity === 'strict') {
            thresh_shoulder -= 2;
            thresh_ear -= 3;
            thresh_lean += 0.05;
            thresh_dist -= 0.05;
        } else if (this.settings.sensitivity === 'loose') {
            thresh_shoulder += 4;
            thresh_ear += 5;
            thresh_lean -= 0.05;
            thresh_dist += 0.1;
        }

        let status = 'good';
        let messages = [];
        let recommendation = '坐姿很棒哦，继续保持～';
        let shoulder_balance = '平衡';
        let head_angle = 0;

        const raw_shoulder_angle = this.calculateAngle(
            { x: rightShoulder.x, y: rightShoulder.y },
            { x: leftShoulder.x, y: leftShoulder.y },
            { x: leftShoulder.x + 1, y: leftShoulder.y }
        );
        let diff_shoulder = raw_shoulder_angle;
        if (this.baseline) diff_shoulder = Math.abs(raw_shoulder_angle - this.baseline.shoulderAngle);

        if (diff_shoulder > thresh_shoulder && diff_shoulder < 180 - thresh_shoulder) {
            status = 'warning';
            messages.push('两边肩膀放松一点哦');
            shoulder_balance = '略微倾斜';
        }

        const raw_ear_angle = this.calculateAngle(
            { x: rightEar.x, y: rightEar.y },
            { x: leftEar.x, y: leftEar.y },
            { x: leftEar.x + 1, y: leftEar.y }
        );
        let diff_ear = Math.min(raw_ear_angle, 180 - raw_ear_angle);
        head_angle = diff_ear.toFixed(1);
        if (this.baseline) diff_ear = Math.abs(raw_ear_angle - this.baseline.earAngle);

        if (diff_ear > thresh_ear) {
            status = status === 'danger' ? 'danger' : 'warning';
            messages.push('头有点歪啦');
        }

        const leftForwardLean = leftEar.z - leftShoulder.z;
        const rightForwardLean = rightEar.z - rightShoulder.z;
        const raw_forward_lean = (leftForwardLean + rightForwardLean) / 2;
        
        let lean_val = raw_forward_lean;
        if (this.baseline) lean_val = raw_forward_lean - this.baseline.forwardLean + thresh_lean;

        if (lean_val < thresh_lean) {
            status = 'danger';
            messages.push('腰背挺直一点，会更舒服哦');
        }

        const raw_shoulder_width = Math.abs(rightShoulder.x - leftShoulder.x);
        let dist_val = raw_shoulder_width;
        if (this.baseline) dist_val = raw_shoulder_width - this.baseline.shoulderWidth + thresh_dist;

        if (dist_val > thresh_dist) {
            status = 'danger';
            messages.push('离屏幕有点近了，保护视力呀');
        }
        
        let eye_distance = Math.round(60 - (raw_shoulder_width - 0.4) * 50);
        if (eye_distance < 10) eye_distance = 10;

        let message = messages.length > 0 ? messages.join('，') : '坐姿端正';
        if (messages.length > 0) {
            recommendation = messages[0];
        }

        return {
            status,
            message,
            details: { recommendation },
            head_angle,
            shoulder_balance,
            eye_distance,
            raw_shoulder_angle,
            raw_ear_angle,
            raw_forward_lean,
            raw_shoulder_width,
        };
    },

    updateUI() {
        const startBtn = document.getElementById('start-monitor-btn');
        const stopBtn = document.getElementById('stop-monitor-btn');
        const calibrateBtn = document.getElementById('calibrate-btn');
        const overlay = document.getElementById('video-overlay');
        const status = document.getElementById('monitor-status');
        const video = document.getElementById('video-preview');

        if (startBtn) {
            startBtn.classList.toggle('hidden', this.isMonitoring);
        }
        if (stopBtn) {
            stopBtn.classList.toggle('hidden', !this.isMonitoring);
        }
        if (calibrateBtn) {
            calibrateBtn.classList.toggle('hidden', !this.isMonitoring);
        }
        if (overlay) {
            overlay.classList.toggle('hidden', this.isMonitoring);
        }
        if (video) {
            video.classList.toggle('hidden', !this.isMonitoring);
        }
        if (status) {
            status.textContent = this.isMonitoring ? '监测中' : '未启动';
            status.className = `status-indicator ${this.isMonitoring ? 'text-teal-500' : 'text-slate-400'}`;
        }
    },

    updatePostureUI(data) {
        const headAngleVal = document.getElementById('head-angle-val');
        const shoulderStatusVal = document.getElementById('shoulder-status-val');
        const aiRecommendation = document.getElementById('ai-recommendation');

        if (headAngleVal) {
            headAngleVal.textContent = data.status === 'pause' ? '--' : `${data.head_angle || 0}°`;
        }
        
        if (shoulderStatusVal) {
            shoulderStatusVal.textContent = data.status === 'pause' ? '--' : (data.shoulder_balance || '平衡');
        }

        if (aiRecommendation) {
            aiRecommendation.textContent = data.details?.recommendation || '保持好习惯，保护颈椎和视力哦～';
            if (data.status === 'danger') {
                aiRecommendation.className = 'mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl';
            } else if (data.status === 'warning') {
                aiRecommendation.className = 'mt-4 p-3 bg-orange-50 text-orange-700 text-sm rounded-xl';
            } else if (data.status === 'pause') {
                aiRecommendation.className = 'mt-4 p-3 bg-slate-50 text-slate-500 text-sm rounded-xl';
            } else {
                aiRecommendation.className = 'mt-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-xl';
            }
        }
        this.lastStatus = data.status;
    },
};

window.healthPage = healthPage;
