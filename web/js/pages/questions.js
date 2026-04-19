/**
 * 错题本页面模块
 */

const questionsPage = {
    questions: [],
    currentSubject: null,

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="card mb-6">
                    <div class="card-header flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-800">错题本</h3>
                        <button id="add-question-btn" class="btn btn-primary btn-sm shadow-sm">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            添加错题
                        </button>
                    </div>
                    <div class="card-body" id="questions-container">
                        <div class="text-center py-12 text-slate-400">
                            <div class="loading-spinner mx-auto mb-4 border-t-primary-500"></div>
                            <p>加载中...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        await this.loadQuestions();
    },

    setupEventListeners() {
        const addBtn = document.getElementById('add-question-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
    },

    async loadQuestions() {
        try {
            const response = await questionsAPI.getWrongQuestions();
            this.questions = response?.data?.questions || [];
            this.renderSubjectCards();
        } catch (error) {
            console.error('Failed to load questions:', error);
            this.showError();
        }
    },

    renderSubjectCards() {
        const container = document.getElementById('questions-container');
        if (!container) return;

        if (this.questions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-slate-400">
                    <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p class="text-lg font-bold text-slate-700 mb-2">暂无错题</p>
                    <p class="text-sm">点击上方按钮添加你的第一道错题</p>
                </div>
            `;
            return;
        }

        const subjects = this.groupBySubject();
        
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${Object.entries(subjects).map(([subject, questions]) => `
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer hover:border-slate-300"
                         onclick="questionsPage.showSubjectDetail('${subject}')">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 rounded-xl ${this.getSubjectColor(subject)} flex items-center justify-center mr-3 shadow-sm">
                                        ${this.getSubjectIcon(subject)}
                                    </div>
                                    <div>
                                        <h4 class="text-lg font-bold text-slate-800">${subject}</h4>
                                        <p class="text-sm text-slate-500">${questions.length} 道错题</p>
                                    </div>
                                </div>
                                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </div>
                            <div class="space-y-2">
                                ${questions.slice(0, 3).map(q => `
                                    <div class="text-sm text-slate-600 truncate flex items-center">
                                        <span class="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-2 flex-shrink-0"></span>
                                        <span class="truncate">${q.question_text}</span>
                                    </div>
                                `).join('')}
                                ${questions.length > 3 ? `
                                    <div class="text-xs font-medium text-slate-400 mt-2 bg-slate-50 inline-block px-2 py-1 rounded-md">
                                        还有 ${questions.length - 3} 道错题...
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    groupBySubject() {
        const grouped = {};
        this.questions.forEach(q => {
            const subject = q.subject || '未分类';
            if (!grouped[subject]) {
                grouped[subject] = [];
            }
            grouped[subject].push(q);
        });
        return grouped;
    },

    getSubjectColor(subject) {
        const colors = {
            '数学': 'bg-blue-50 border border-blue-100',
            '语文': 'bg-red-50 border border-red-100',
            '英语': 'bg-yellow-50 border border-yellow-100',
            '物理': 'bg-purple-50 border border-purple-100',
            '化学': 'bg-teal-50 border border-teal-100',
            '生物': 'bg-green-50 border border-green-100',
            '历史': 'bg-orange-50 border border-orange-100',
            '地理': 'bg-cyan-50 border border-cyan-100',
            '政治': 'bg-rose-50 border border-rose-100',
            '未分类': 'bg-slate-50 border border-slate-100'
        };
        return colors[subject] || 'bg-slate-50 border border-slate-100';
    },

    getSubjectIcon(subject) {
        const icons = {
            '数学': '<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>',
            '语文': '<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
            '英语': '<svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>',
            '物理': '<svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
            '化学': '<svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>',
            '生物': '<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
            '历史': '<svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            '地理': '<svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            '政治': '<svg class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>'
        };
        return icons[subject] || '<svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>';
    },

    showSubjectDetail(subject) {
        this.currentSubject = subject;
        const questions = this.questions.filter(q => (q.subject || '未分类') === subject);
        
        const content = `
            <div class="p-6 max-h-[70vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <button onclick="questionsPage.backToSubjects()" class="mr-3 p-2 hover:bg-slate-100 rounded-xl transition">
                            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <h3 class="text-xl font-bold text-slate-800">${subject}错题集</h3>
                    </div>
                    <span class="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">共 ${questions.length} 道错题</span>
                </div>
                
                <div class="space-y-4">
                    ${questions.map(q => `
                        <div class="bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary-200 hover:shadow-md transition-all">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="text-slate-800 font-medium mb-3">${q.question_text}</div>
                                    <div class="flex items-center space-x-6 text-sm bg-slate-50 p-3 rounded-xl mb-3">
                                        <div class="flex items-start">
                                            <span class="text-slate-500 mr-2 flex-shrink-0">正确答案：</span>
                                            <span class="text-green-600 font-medium">${q.correct_answer || '未填写'}</span>
                                        </div>
                                        <div class="flex items-start">
                                            <span class="text-slate-500 mr-2 flex-shrink-0">我的答案：</span>
                                            <span class="text-red-500 font-medium">${q.user_answer || '未填写'}</span>
                                        </div>
                                    </div>
                                    <div class="text-xs text-slate-400">
                                        添加时间：${formatDate(q.created_at)}
                                    </div>
                                </div>
                                <div class="flex flex-col space-y-2 ml-4">
                                    <button onclick="questionsPage.viewQuestion(${q.id})" class="btn btn-secondary btn-sm rounded-lg">
                                        查看
                                    </button>
                                    <button onclick="questionsPage.deleteQuestion(${q.id})" class="btn btn-danger btn-sm rounded-lg">
                                        删除
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        showModal(content);
    },

    backToSubjects() {
        hideModal();
    },

    showError() {
        const container = document.getElementById('questions-container');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-12 text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p class="text-lg font-bold text-slate-800 mb-2">加载失败</p>
                <button onclick="questionsPage.loadQuestions()" class="btn btn-primary btn-sm">
                    重新加载
                </button>
            </div>
        `;
    },

    showAddModal() {
        const content = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-6">添加错题</h3>
                <form id="add-question-form" class="space-y-4">
                    <div class="form-group">
                        <label class="form-label">科目 <span class="text-red-500">*</span></label>
                        <select name="subject" class="input" required>
                            <option value="">请选择科目</option>
                            <option value="数学">数学</option>
                            <option value="语文">语文</option>
                            <option value="英语">英语</option>
                            <option value="物理">物理</option>
                            <option value="化学">化学</option>
                            <option value="生物">生物</option>
                            <option value="历史">历史</option>
                            <option value="地理">地理</option>
                            <option value="政治">政治</option>
                            <option value="其他">其他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">题目内容 <span class="text-red-500">*</span></label>
                        <textarea name="question_content" class="input" rows="4" placeholder="请输入题目内容" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">拍照上传</label>
                        <div class="flex space-x-4">
                            <button type="button" onclick="questionsPage.takePhoto()" class="btn btn-outline">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                拍照
                            </button>
                            <button type="button" onclick="questionsPage.uploadImage()" class="btn btn-outline">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                上传图片
                            </button>
                        </div>
                        <div id="image-preview" class="mt-3 hidden">
                            <img id="preview-img" src="" alt="预览" class="max-h-48 rounded-xl border border-slate-200">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="flex items-center justify-between mb-2">
                            <label class="form-label mb-0">正确答案</label>
                            <button type="button" id="ai-solve-btn" class="btn btn-outline btn-sm text-xs border-primary-500 text-primary-600 hover:bg-primary-50">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                                AI解题
                            </button>
                        </div>
                        <textarea name="answer" class="input" rows="2" placeholder="请输入正确答案"></textarea>
                        <div id="ai-loading" class="mt-2 hidden">
                            <div class="flex items-center text-sm text-slate-500">
                                <div class="loading-spinner w-4 h-4 mr-2 border-t-primary-500"></div>
                                AI正在思考中...
                            </div>
                        </div>
                        <div id="ai-result" class="mt-2 hidden">
                            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                                <div class="font-bold text-blue-800 mb-2">AI解题结果</div>
                                <div id="ai-result-content" class="text-blue-700"></div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">我的答案</label>
                        <textarea name="wrong_answer" class="input" rows="2" placeholder="请输入你的答案"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="hideModal()" class="btn btn-secondary">取消</button>
                        <button type="submit" class="btn btn-primary">添加错题</button>
                    </div>
                </form>
            </div>
        `;

        showModal(content);

        // 添加AI解题按钮的事件监听
        const aiSolveBtn = document.getElementById('ai-solve-btn');
        if (aiSolveBtn) {
            aiSolveBtn.addEventListener('click', async () => {
                const questionContent = document.querySelector('textarea[name="question_content"]').value.trim();
                const subject = document.querySelector('select[name="subject"]').value;
                
                if (!questionContent) {
                    showToast('请先输入题目内容', 'warning');
                    return;
                }
                
                // 显示加载状态
                document.getElementById('ai-loading').classList.remove('hidden');
                document.getElementById('ai-result').classList.add('hidden');
                aiSolveBtn.disabled = true;
                
                try {
                    const result = await questionsAPI.aiSolve(questionContent, subject);
                    
                    // 隐藏加载状态，显示结果
                    document.getElementById('ai-loading').classList.add('hidden');
                    document.getElementById('ai-result').classList.remove('hidden');
                    
                    const resultContent = document.getElementById('ai-result-content');
                    // 处理Markdown内容
                    if (typeof marked !== 'undefined') {
                        resultContent.innerHTML = questionsPage.renderMarkdownWithLatex(result.data?.solution || '');
                    } else {
                        resultContent.textContent = result.data?.solution || '暂无结果';
                    }
                    
                    // 保存解析到隐藏字段
                    let analysisInput = document.querySelector('input[name="analysis"]');
                    if (!analysisInput) {
                        analysisInput = document.createElement('input');
                        analysisInput.type = 'hidden';
                        analysisInput.name = 'analysis';
                        document.getElementById('add-question-form').appendChild(analysisInput);
                    }
                    analysisInput.value = result.data?.solution || '';
                    
                    // 自动填充正确答案
                    const answerTextarea = document.querySelector('textarea[name="answer"]');
                    if (answerTextarea && result.data?.correct_answer) {
                        answerTextarea.value = result.data.correct_answer;
                    }
                    
                    showToast('AI解题成功！', 'success');
                } catch (error) {
                    document.getElementById('ai-loading').classList.add('hidden');
                    showToast(error.message || 'AI解题失败', 'error');
                } finally {
                    aiSolveBtn.disabled = false;
                }
            });
        }

        document.getElementById('add-question-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                question_text: formData.get('question_content'),
                subject: formData.get('subject'),
                correct_answer: formData.get('answer') || undefined,
                user_answer: formData.get('wrong_answer') || undefined,
                analysis: formData.get('analysis') || undefined,
            };

            try {
                await questionsAPI.addWrongQuestion(data);
                hideModal();
                showToast('错题添加成功', 'success');
                await this.loadQuestions();
            } catch (error) {
                showToast(error.message || '添加失败', 'error');
            }
        });
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

    viewQuestion(id) {
        const question = this.questions.find(q => q.id === id);
        if (!question) return;

        const renderContent = (text) => {
            if (!text) return '<span class="text-slate-400">未填写</span>';
            if (text.includes('##') || text.includes('$') || text.includes('*')) {
                return this.renderMarkdownWithLatex(text);
            }
            return text.replace(/\n/g, '<br>');
        };

        const content = `
            <div class="p-6 max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-800">错题详情</h3>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${this.getSubjectColor(question.subject || '未分类').split(' ')[0]} text-slate-700 bg-slate-100 border border-slate-200">${question.subject || '未分类'}</span>
                </div>
                
                <div class="space-y-6">
                    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div class="bg-slate-50 px-4 py-3 border-b border-slate-200">
                            <label class="text-sm font-bold text-slate-700">📝 题目内容</label>
                        </div>
                        <div class="p-5 text-slate-800 leading-relaxed whitespace-pre-wrap">${question.question_text}</div>
                    </div>
                    
                    ${question.analysis ? `
                    <div class="bg-white border border-blue-200 rounded-xl overflow-hidden">
                        <div class="bg-blue-50 px-4 py-3 border-b border-blue-200">
                            <label class="text-sm font-bold text-blue-700">💡 AI 解析</label>
                        </div>
                        <div class="p-5 text-slate-800 leading-relaxed markdown-body prose prose-slate max-w-none">
                            ${this.renderMarkdownWithLatex(question.analysis)}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="bg-white border border-green-200 rounded-xl overflow-hidden">
                        <div class="bg-green-50 px-4 py-3 border-b border-green-200">
                            <label class="text-sm font-bold text-green-700">✅ 正确答案</label>
                        </div>
                        <div class="p-5 text-slate-800 leading-relaxed markdown-body prose prose-slate max-w-none">
                            ${renderContent(question.correct_answer)}
                        </div>
                    </div>
                    
                    ${question.user_answer ? `
                    <div class="bg-white border border-red-200 rounded-xl overflow-hidden">
                        <div class="bg-red-50 px-4 py-3 border-b border-red-200">
                            <label class="text-sm font-bold text-red-700">❌ 我的答案</label>
                        </div>
                        <div class="p-5 text-slate-800 leading-relaxed markdown-body prose prose-slate max-w-none">
                            ${renderContent(question.user_answer)}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="text-xs text-slate-400 text-right">
                        添加时间：${formatDate(question.created_at)}
                        ${question.review_count ? ` · 已复习 ${question.review_count} 次` : ''}
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-8">
                    <button onclick="hideModal()" class="btn btn-secondary">关闭</button>
                    <button onclick="hideModal(); questionsPage.deleteQuestion(${question.id})" class="btn btn-danger">删除错题</button>
                </div>
            </div>
        `;

        showModal(content);
    },

    async deleteQuestion(id) {
        if (!confirm('确定要删除这道错题吗？')) return;

        try {
            await questionsAPI.deleteWrongQuestion(id);
            showToast('错题已删除', 'success');
            await this.loadQuestions();
            // 如果当前在科目详情页，刷新显示
            if (this.currentSubject) {
                this.showSubjectDetail(this.currentSubject);
            }
        } catch (error) {
            showToast(error.message || '删除失败', 'error');
        }
    },

    takePhoto() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'camera';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processImage(file);
            }
        };
        input.click();
    },

    uploadImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processImage(file);
            }
        };
        input.click();
    },

    async processImage(file) {
        const preview = document.getElementById('preview-img');
        const previewContainer = document.getElementById('image-preview');
        
        // 显示预览
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);

        // 调用OCR识别
        try {
            showToast('正在识别题目...', 'info');
            const result = await ocrAPI.recognize(file);
            
            if (result.success && result.data) {
                const questionContent = result.data.text;
                if (questionContent) {
                    document.querySelector('textarea[name="question_content"]').value = questionContent;
                    showToast('识别成功！已自动填充题目内容', 'success');
                }
            }
        } catch (error) {
            console.error('OCR识别失败:', error);
            showToast('识别失败，请手动输入题目内容', 'error');
        }
    },
};

window.questionsPage = questionsPage;
