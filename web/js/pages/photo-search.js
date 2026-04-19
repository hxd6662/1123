/**
 * 拍照搜题页面模块
 */

const photoSearchPage = {
    isProcessing: false,
    result: null,
    currentDisplayedContent: '',
    loadingTimer: null,
    hasStartedDisplay: false,
    renderDebounceTimer: null,

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade-in max-w-3xl mx-auto">
                <div class="card mb-6">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">拍照搜题</h3>
                    </div>
                    <div class="card-body">
                        <div class="text-center py-8">
                            <div id="upload-area" class="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer">
                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <p class="text-lg font-medium text-gray-700 mb-2">点击或拖拽上传图片</p>
                                <p class="text-sm text-gray-500">支持 JPG、PNG 格式，最大 10MB</p>
                            </div>
                            <input type="file" id="file-input" accept="image/*" class="hidden">
                            
                            <div class="mt-6 flex items-center justify-center space-x-4">
                                <span class="text-gray-500">或者</span>
                                <button id="camera-btn" class="btn btn-primary">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    拍照
                                </button>
                            </div>
                        </div>

                        <div id="preview-section" class="hidden">
                            <div class="mb-4">
                                <img id="preview-image" class="max-w-full max-h-96 mx-auto rounded-lg shadow-md" alt="预览图片">
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label">科目（可选）</label>
                                <select id="subject-select" class="input">
                                    <option value="">请选择科目</option>
                                    <option value="语文">语文</option>
                                    <option value="数学">数学</option>
                                    <option value="英语">英语</option>
                                    <option value="物理">物理</option>
                                    <option value="化学">化学</option>
                                    <option value="生物">生物</option>
                                    <option value="历史">历史</option>
                                    <option value="地理">地理</option>
                                    <option value="政治">政治</option>
                                </select>
                            </div>

                            <div class="flex space-x-4">
                                <button id="reset-btn" class="btn btn-secondary flex-1">
                                    重新上传
                                </button>
                                <button id="search-btn" class="btn btn-primary flex-1">
                                    <span class="btn-icon">🔍</span>
                                    开始搜题
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="result-section" class="hidden">
                    <div class="card">
                        <div class="card-header flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">搜题结果</h3>
                            <div class="flex space-x-2">
                                <button id="add-to-wrongbook-btn" class="btn btn-secondary btn-sm hidden">
                                    <span class="btn-icon">⭐</span>
                                    加入错题本
                                </button>
                                <button id="new-search-btn" class="btn btn-primary btn-sm">
                                    新搜索
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-6">
                                <h4 class="font-medium text-gray-900 mb-3">📝 识别结果</h4>
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <p id="ocr-text" class="text-gray-700 whitespace-pre-wrap"></p>
                                </div>
                            </div>

                            <div class="divider"></div>

                            <div>
                                <h4 class="font-medium text-gray-900 mb-3">💡 AI解析</h4>
                                <div id="ai-analysis" class="bg-blue-50 rounded-lg p-4">
                                    <p class="text-gray-700 whitespace-pre-wrap"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="loading-section" class="hidden">
                    <div class="card">
                        <div class="card-body text-center py-12">
                            <div class="loading-spinner mx-auto mb-4"></div>
                            <p class="text-lg font-medium text-gray-700">正在分析中...</p>
                            <p class="text-sm text-gray-500 mt-2">OCR识别 + AI分析，请稍候</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    setupEventListeners() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const cameraBtn = document.getElementById('camera-btn');
        const resetBtn = document.getElementById('reset-btn');
        const searchBtn = document.getElementById('search-btn');
        const newSearchBtn = document.getElementById('new-search-btn');
        const addToWrongbookBtn = document.getElementById('add-to-wrongbook-btn');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-primary-500', 'bg-primary-50');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => this.showCameraModal());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetUpload());
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        if (newSearchBtn) {
            newSearchBtn.addEventListener('click', () => this.resetUpload());
        }

        if (addToWrongbookBtn) {
            addToWrongbookBtn.addEventListener('click', () => this.addToWrongbook());
        }
    },

    handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast('图片大小不能超过10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('preview-image');
            const uploadArea = document.getElementById('upload-area');
            const previewSection = document.getElementById('preview-section');

            if (previewImage) {
                previewImage.src = e.target.result;
            }
            if (uploadArea) {
                uploadArea.closest('.text-center').classList.add('hidden');
            }
            if (previewSection) {
                previewSection.classList.remove('hidden');
            }

            this.currentFile = file;
        };
        reader.readAsDataURL(file);
    },

    showCameraModal() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast('您的浏览器不支持摄像头功能', 'error');
            return;
        }

        const content = `
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-gray-900">拍照</h3>
                    <button onclick="hideModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="video-container mb-4">
                    <video id="camera-preview" autoplay playsinline class="w-full rounded-lg"></video>
                    <canvas id="camera-canvas" style="display: none;"></canvas>
                </div>
                <div class="flex justify-center space-x-4">
                    <button onclick="photoSearchPage.capturePhoto()" class="btn btn-primary btn-lg">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                            <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                        </svg>
                        拍照
                    </button>
                </div>
            </div>
        `;

        showModal(content, {
            onClose: () => this.stopCamera()
        });

        this.startCamera();
    },

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            const preview = document.getElementById('camera-preview');
            if (preview) {
                preview.srcObject = stream;
            }
            this.cameraStream = stream;
        } catch (error) {
            console.error('Camera error:', error);
            showToast('无法访问摄像头', 'error');
            hideModal();
        }
    },

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    },

    capturePhoto() {
        const preview = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');

        if (!preview || !canvas) return;

        canvas.width = preview.videoWidth;
        canvas.height = preview.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(preview, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            this.handleFileSelect(file);
            hideModal();
            this.stopCamera();
        }, 'image/jpeg', 0.8);
    },

    resetUpload() {
        const uploadAreaContainer = document.querySelector('#upload-area').closest('.text-center');
        const previewSection = document.getElementById('preview-section');
        const resultSection = document.getElementById('result-section');
        const fileInput = document.getElementById('file-input');
        const subjectSelect = document.getElementById('subject-select');

        if (uploadAreaContainer) {
            uploadAreaContainer.classList.remove('hidden');
        }
        if (previewSection) {
            previewSection.classList.add('hidden');
        }
        if (resultSection) {
            resultSection.classList.add('hidden');
        }
        if (fileInput) {
            fileInput.value = '';
        }
        if (subjectSelect) {
            subjectSelect.value = '';
        }

        this.currentFile = null;
        this.result = null;
    },

    async performSearch() {
        if (!this.currentFile) {
            showToast('请先选择图片', 'error');
            return;
        }

        if (this.isProcessing) {
            showToast('正在处理中，请稍候...', 'info');
            return;
        }

        this.isProcessing = true;
        this.currentDisplayedContent = '';
        this.hasStartedDisplay = false;
        this.retryCount = 0;
        const maxRetries = 2;

        const loadingSection = document.getElementById('loading-section');
        const resultSection = document.getElementById('result-section');
        const subjectSelect = document.getElementById('subject-select');
        const searchBtn = document.getElementById('search-btn');

        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<span class="loading-spinner w-4 h-4 mr-2 border-2"></span>分析中...';
        }

        if (loadingSection) {
            loadingSection.classList.remove('hidden');
            const loadingText = loadingSection.querySelector('p.text-lg');
            if (loadingText) loadingText.textContent = '正在识别图片文字...';
            const loadingSubtext = loadingSection.querySelector('p.text-sm');
            if (loadingSubtext) loadingSubtext.textContent = 'OCR识别中，通常需要3-5秒';
        }
        if (resultSection) {
            resultSection.classList.add('hidden');
            const ocrText = document.getElementById('ocr-text');
            const aiAnalysis = document.getElementById('ai-analysis');
            if (ocrText) ocrText.textContent = '等待识别结果...';
            if (aiAnalysis) aiAnalysis.innerHTML = '<div class="flex items-center space-x-2"><div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div></div>';
        }

        const executeSearch = async () => {
            const subject = subjectSelect ? subjectSelect.value : null;
            
            // 先尝试非流式API，更快更稳定
            try {
                const response = await ocrAPI.photoSearch(this.currentFile, subject);
                
                if (response.success) {
                    if (loadingSection) loadingSection.classList.add('hidden');
                    if (resultSection) resultSection.classList.remove('hidden');

                    const ocrText = document.getElementById('ocr-text');
                    if (ocrText && response.data?.ocr_text) {
                        ocrText.textContent = response.data.ocr_text;
                    }

                    this.currentDisplayedContent = response.data?.ai_analysis || '';
                    this.updateDisplay();
                    
                    this.result = {
                        ai_analysis: this.currentDisplayedContent,
                        ocr_text: response.data?.ocr_text
                    };
                    
                    const addBtn = document.getElementById('add-to-wrongbook-btn');
                    if (addBtn) addBtn.classList.remove('hidden');
                    
                    showToast('解析完成！', 'success');
                    return;
                } else {
                    throw new Error(response.error || '解析失败');
                }
            } catch (error) {
                console.error('Photo search error:', error);
                
                if (this.retryCount < maxRetries) {
                    this.retryCount++;
                    showToast(`解析失败，正在重试 (${this.retryCount}/${maxRetries})...`, 'info');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return executeSearch();
                }
                
                throw error;
            }
        };

        try {
            await executeSearch();
        } catch (error) {
            console.error('Photo search error:', error);
            showToast(error.message || '搜题失败，请重试', 'error');
            if (loadingSection) loadingSection.classList.add('hidden');
        } finally {
            this.isProcessing = false;
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.innerHTML = '<span class="btn-icon">🔍</span>开始搜题';
            }
            if (loadingSection) {
                loadingSection.classList.add('hidden');
            }
            if (this.renderDebounceTimer) {
                clearTimeout(this.renderDebounceTimer);
            }
        }
    },

    addToDisplayQueue(chunk) {
        this.currentDisplayedContent += chunk;
        this.scheduleUpdateDisplay();
        
        if (!this.hasStartedDisplay) {
            this.hasStartedDisplay = true;
        }
    },

    scheduleUpdateDisplay() {
        if (this.renderDebounceTimer) {
            clearTimeout(this.renderDebounceTimer);
        }
        this.renderDebounceTimer = setTimeout(() => {
            this.updateDisplay();
        }, 30);
    },

    updateDisplay() {
        const aiAnalysis = document.getElementById('ai-analysis');
        if (!aiAnalysis) return;
        
        aiAnalysis.innerHTML = this.renderMarkdownWithLatex(this.currentDisplayedContent);
        
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
            resultSection.scrollTop = resultSection.scrollHeight;
        }
    },

    showResult() {
        const resultSection = document.getElementById('result-section');
        const ocrText = document.getElementById('ocr-text');
        const aiAnalysis = document.getElementById('ai-analysis');
        const addBtn = document.getElementById('add-to-wrongbook-btn');

        if (resultSection) {
            resultSection.classList.remove('hidden');
        }
        if (ocrText && this.result.ocr_text) {
            ocrText.textContent = this.result.ocr_text;
        }
        if (aiAnalysis && this.result.ai_analysis) {
            aiAnalysis.innerHTML = this.renderMarkdownWithLatex(this.result.ai_analysis);
        }
        if (addBtn && this.result.ai_analysis) {
            addBtn.classList.remove('hidden');
        }
    },

    async addToWrongbook() {
        if (!this.result || !this.result.ai_analysis) {
            showToast('没有可保存的解析结果', 'error');
            return;
        }
        
        const btn = document.getElementById('add-to-wrongbook-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="loading-spinner w-4 h-4 mr-2 border-2"></span>保存中...';
        }
        
        try {
            const ocrText = document.getElementById('ocr-text')?.textContent || '未知题目';
            const subjectSelect = document.getElementById('subject-select');
            const subject = subjectSelect ? subjectSelect.value : null;
            
            // Extract correct answer from ai_analysis if possible
            let correctAnswer = '';
            const answerMatch = this.result.ai_analysis.match(/##\s*答案[:：]?\s*(.*?)(?=\n##|$)/s);
            if (answerMatch) {
                correctAnswer = answerMatch[1].trim();
            }
            
            const response = await questionsAPI.addWrongQuestion({
                question_text: ocrText,
                subject: subject || '综合',
                difficulty: 'medium',
                analysis: this.result.ai_analysis,
                correct_answer: correctAnswer
            });
            
            if (response.success) {
                if (response.message) {
                    showToast(response.message, 'info'); // like "该题目已在错题本中"
                } else {
                    showToast('已成功加入错题本', 'success');
                }
            } else {
                throw new Error(response.message || '保存失败');
            }
        } catch (e) {
            console.error('Failed to add to wrong book:', e);
            showToast(e.message || '加入错题本失败', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="btn-icon">⭐</span>加入错题本';
            }
        }
    },

    renderMarkdownWithLatex(text) {
        if (!text) return '';
        
        try {
            let rendered = marked.parse(text);
            
            rendered = rendered.replace(/\$([^$\n]+)\$/g, (match, formula) => {
                try {
                    return katex.renderToString(formula, {
                        throwOnError: false,
                        displayMode: false
                    });
                } catch (e) {
                    return match;
                }
            });
            
            rendered = rendered.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
                try {
                    return '<div class="text-center my-4 overflow-x-auto">' + katex.renderToString(formula, {
                        throwOnError: false,
                        displayMode: true
                    }) + '</div>';
                } catch (e) {
                    return match;
                }
            });
            
            return rendered;
        } catch (e) {
            console.error('Rendering error:', e);
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    },
};

window.photoSearchPage = photoSearchPage;
