/**
 * 学习资源页面模块
 */

const grades = [
    { name: '小学', grades: ['小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级'] },
    { name: '初中', grades: ['初中一年级', '初中二年级', '初中三年级'] },
    { name: '高中', grades: ['高中一年级', '高中二年级', '高中三年级'] }
];

const gradeSubjects = {
    '小学一年级': ['语文', '数学'],
    '小学二年级': ['语文', '数学'],
    '小学三年级': ['语文', '数学', '英语'],
    '小学四年级': ['语文', '数学', '英语'],
    '小学五年级': ['语文', '数学', '英语'],
    '小学六年级': ['语文', '数学', '英语'],
    '初中一年级': ['语文', '数学', '英语', '政治', '历史', '地理', '生物'],
    '初中二年级': ['语文', '数学', '英语', '物理', '政治', '历史', '地理', '生物'],
    '初中三年级': ['语文', '数学', '英语', '物理', '化学', '政治', '历史'],
    '高中一年级': ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'],
    '高中二年级': ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'],
    '高中三年级': ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理']
};

const resourcesPage = {
    resources: [],
    currentGrade: null,
    currentSubject: null,
    currentType: 'all',

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">学习资源</h2>
                    <p class="text-slate-500">海量优质学习资源，助力你的学习成长</p>
                </div>
                
                <div class="mb-6">
                    <div class="relative max-w-2xl">
                        <input type="text" id="search-input" class="input pl-11 shadow-sm border-slate-200 focus:border-primary-400 py-3 rounded-xl" placeholder="搜索课程、知识点、习题...">
                        <svg class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>

                <div class="mb-6">
                    <div class="flex items-center space-x-2 mb-3">
                        <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <h3 class="font-bold text-slate-700">选择年级</h3>
                    </div>
                    <div class="space-y-3">
                        ${grades.map((stage, stageIndex) => `
                            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <button 
                                    class="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                    onclick="resourcesPage.toggleStage(${stageIndex})"
                                >
                                    <span class="font-bold text-slate-800">${stage.name}</span>
                                    <svg id="stage-icon-${stageIndex}" class="w-5 h-5 text-slate-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                <div id="stage-grades-${stageIndex}" class="hidden px-5 py-3 space-y-2 border-t border-slate-100">
                                    ${stage.grades.map(grade => `
                                        <button 
                                            class="grade-btn w-full px-4 py-2.5 text-left rounded-lg transition-colors ${this.currentGrade === grade ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}"
                                            data-grade="${grade}"
                                            onclick="resourcesPage.selectGrade('${grade}')"
                                        >
                                            ${grade}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="subject-section" class="mb-6 ${this.currentGrade ? '' : 'hidden'}">
                    <div class="flex items-center space-x-2 mb-3">
                        <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        <h3 class="font-bold text-slate-700">选择学科</h3>
                    </div>
                    <div id="subject-buttons" class="flex flex-wrap gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        ${this.currentGrade ? this.renderSubjectButtons() : ''}
                    </div>
                </div>

                <div class="tabs mb-6 border-b border-slate-200">
                    <button class="tab ${this.currentType === 'all' ? 'active' : ''}" data-type="all" onclick="resourcesPage.filterByType('all')">全部内容</button>
                    <button class="tab ${this.currentType === 'video' ? 'active' : ''}" data-type="video" onclick="resourcesPage.filterByType('video')">视频课程</button>
                    <button class="tab ${this.currentType === 'article' ? 'active' : ''}" data-type="article" onclick="resourcesPage.filterByType('article')">文章资料</button>
                    <button class="tab ${this.currentType === 'exercise' ? 'active' : ''}" data-type="exercise" onclick="resourcesPage.filterByType('exercise')">配套练习</button>
                </div>

                <div id="selected-filter" class="mb-4 ${this.currentGrade || this.currentSubject ? '' : 'hidden'}">
                    <div class="flex flex-wrap gap-2">
                        ${this.currentGrade ? `
                            <div class="inline-flex items-center space-x-2 bg-primary-50 px-3 py-2 rounded-lg">
                                <span class="text-sm font-medium text-primary-700">${this.currentGrade}</span>
                                <button onclick="resourcesPage.clearGrade()" class="text-primary-500 hover:text-primary-700 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        ` : ''}
                        ${this.currentSubject ? `
                            <div class="inline-flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                                <span class="text-sm font-medium text-green-700">${this.currentSubject}</span>
                                <button onclick="resourcesPage.clearSubject()" class="text-green-500 hover:text-green-700 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div id="resources-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="col-span-full text-center py-12">
                        <div class="loading-spinner mx-auto mb-4 border-t-primary-500"></div>
                        <p class="text-slate-500">加载中...</p>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        await this.loadResources();
    },

    renderSubjectButtons() {
        if (!this.currentGrade) return '';
        const subjects = gradeSubjects[this.currentGrade] || [];
        return `
            <button 
                class="subject-btn px-4 py-2 rounded-lg transition-colors ${!this.currentSubject ? 'bg-primary-50 text-primary-700 font-medium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}"
                onclick="resourcesPage.selectSubject(null)"
            >
                全部学科
            </button>
            ${subjects.map(subject => `
                <button 
                    class="subject-btn px-4 py-2 rounded-lg transition-colors ${this.currentSubject === subject ? 'bg-primary-50 text-primary-700 font-medium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}"
                    data-subject="${subject}"
                    onclick="resourcesPage.selectSubject('${subject}')"
                >
                    ${subject}
                </button>
            `).join('')}
        `;
    },

    toggleStage(stageIndex) {
        const gradesDiv = document.getElementById(`stage-grades-${stageIndex}`);
        const icon = document.getElementById(`stage-icon-${stageIndex}`);
        
        if (gradesDiv.classList.contains('hidden')) {
            gradesDiv.classList.remove('hidden');
            icon.classList.add('rotate-180');
        } else {
            gradesDiv.classList.add('hidden');
            icon.classList.remove('rotate-180');
        }
    },

    selectGrade(grade) {
        this.currentGrade = grade;
        this.currentSubject = null;
        this.updateGradeButtons();
        this.updateSubjectSection();
        this.updateFilterDisplay();
        this.loadResources();
    },

    selectSubject(subject) {
        this.currentSubject = subject;
        this.updateSubjectButtons();
        this.updateFilterDisplay();
        this.loadResources();
    },

    updateGradeButtons() {
        document.querySelectorAll('.grade-btn').forEach(btn => {
            if (btn.dataset.grade === this.currentGrade) {
                btn.classList.add('bg-primary-50', 'text-primary-700', 'font-medium');
                btn.classList.remove('text-slate-600', 'hover:bg-slate-50');
            } else {
                btn.classList.remove('bg-primary-50', 'text-primary-700', 'font-medium');
                btn.classList.add('text-slate-600', 'hover:bg-slate-50');
            }
        });
    },

    updateSubjectSection() {
        const section = document.getElementById('subject-section');
        const buttons = document.getElementById('subject-buttons');
        
        if (this.currentGrade) {
            section.classList.remove('hidden');
            buttons.innerHTML = this.renderSubjectButtons();
        } else {
            section.classList.add('hidden');
        }
    },

    updateSubjectButtons() {
        document.querySelectorAll('.subject-btn').forEach(btn => {
            const subject = btn.dataset.subject;
            if ((!this.currentSubject && !subject) || (this.currentSubject === subject)) {
                btn.classList.add('bg-primary-50', 'text-primary-700', 'font-medium');
                btn.classList.remove('bg-slate-50', 'text-slate-600', 'hover:bg-slate-100');
            } else {
                btn.classList.remove('bg-primary-50', 'text-primary-700', 'font-medium');
                btn.classList.add('bg-slate-50', 'text-slate-600', 'hover:bg-slate-100');
            }
        });
    },

    updateFilterDisplay() {
        const filterDiv = document.getElementById('selected-filter');
        filterDiv.innerHTML = `
            <div class="flex flex-wrap gap-2">
                ${this.currentGrade ? `
                    <div class="inline-flex items-center space-x-2 bg-primary-50 px-3 py-2 rounded-lg">
                        <span class="text-sm text-primary-700">${this.currentGrade}</span>
                        <button onclick="resourcesPage.clearGrade()" class="text-primary-500 hover:text-primary-700">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                ` : ''}
                ${this.currentSubject ? `
                    <div class="inline-flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                        <span class="text-sm text-green-700">${this.currentSubject}</span>
                        <button onclick="resourcesPage.clearSubject()" class="text-green-500 hover:text-green-700">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        if (this.currentGrade || this.currentSubject) {
            filterDiv.classList.remove('hidden');
        } else {
            filterDiv.classList.add('hidden');
        }
    },

    clearGrade() {
        this.currentGrade = null;
        this.currentSubject = null;
        this.updateGradeButtons();
        this.updateSubjectSection();
        this.updateFilterDisplay();
        this.loadResources();
    },

    clearSubject() {
        this.currentSubject = null;
        this.updateSubjectButtons();
        this.updateFilterDisplay();
        this.loadResources();
    },

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.filterResources(e.target.value);
            }, 300));
        }
    },

    async loadResources() {
        try {
            const params = {};
            if (this.currentGrade) {
                params.grade = this.currentGrade;
            }
            if (this.currentSubject) {
                params.subject = this.currentSubject;
            }
            if (this.currentType !== 'all') {
                params.resource_type = this.currentType;
            }
            
            const response = await resourcesAPI.getResources(params);
            this.resources = response?.data?.resources || [];
            this.renderResources(this.resources);
        } catch (error) {
            console.error('Failed to load resources:', error);
            this.showError();
        }
    },

    renderResources(resources) {
        const container = document.getElementById('resources-grid');
        if (!container) return;

        if (resources.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <p class="text-lg font-medium text-gray-900 mb-2">暂无学习资源</p>
                    <p class="text-sm text-gray-500">请选择其他年级或学科</p>
                </div>
            `;
            return;
        }

        container.innerHTML = resources.map(resource => {
            const typeIcons = {
                video: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>`,
                article: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>`,
                exercise: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-6 9l2 2 4-4"></path>
                </svg>`,
            };

            const typeColors = {
                video: 'bg-red-50 text-red-500',
                article: 'bg-blue-50 text-blue-500',
                exercise: 'bg-green-50 text-green-500',
            };

            const difficultyColors = {
                easy: 'badge-success',
                medium: 'badge-warning',
                hard: 'badge-danger',
            };

            const difficultyLabels = {
                easy: '简单',
                medium: '中等',
                hard: '困难',
            };

            const gradeTag = resource.tags?.find(t => 
                t.includes('小学') || t.includes('初中') || t.includes('高中')
            );

            return `
                <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group" onclick="resourcesPage.viewResource(${resource.id})">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div class="w-12 h-12 ${typeColors[resource.resource_type] || 'bg-slate-50 text-slate-500'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                ${typeIcons[resource.resource_type] || typeIcons.article}
                            </div>
                            <div class="flex flex-col items-end space-y-2">
                                ${resource.difficulty ? `<span class="badge ${difficultyColors[resource.difficulty] || 'badge-gray'} shadow-sm">${difficultyLabels[resource.difficulty] || resource.difficulty}</span>` : ''}
                            </div>
                        </div>
                        <h4 class="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">${resource.title}</h4>
                        <p class="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">${resource.description || '暂无描述'}</p>
                        <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                            ${gradeTag ? `<span class="badge badge-primary bg-primary-50 text-primary-600">${gradeTag}</span>` : ''}
                            ${resource.subject ? `<span class="badge bg-slate-100 text-slate-600">${resource.subject}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    showError() {
        const container = document.getElementById('resources-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="w-16 h-16 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p class="text-lg font-medium text-gray-900 mb-2">加载失败</p>
                <button onclick="resourcesPage.loadResources()" class="btn btn-primary btn-sm">
                    重新加载
                </button>
            </div>
        `;
    },

    filterResources(keyword) {
        if (!keyword) {
            this.renderResources(this.resources);
            return;
        }

        const filtered = this.resources.filter(r => 
            r.title?.toLowerCase().includes(keyword.toLowerCase()) ||
            r.description?.toLowerCase().includes(keyword.toLowerCase()) ||
            r.subject?.toLowerCase().includes(keyword.toLowerCase())
        );
        this.renderResources(filtered);
    },

    filterByType(type) {
        this.currentType = type;
        document.querySelectorAll('.tab').forEach(tab => {
            if (tab.dataset.type === type) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        this.loadResources();
    },

    viewResource(id) {
        const resource = this.resources.find(r => r.id === id);
        if (!resource) return;

        const typeLabels = {
            video: '视频课程',
            article: '文章',
            exercise: '练习题',
        };

        const gradeTag = resource.tags?.find(t => 
            t.includes('小学') || t.includes('初中') || t.includes('高中')
        );

        const renderContent = (content) => {
            if (!content) return '<p class="text-slate-500">暂无详细内容</p>';
            
            let html = content
                .replace(/```([\s\S]*?)```/g, function(match, code) {
                    return '<div class="my-4"><pre class="bg-slate-50 p-4 rounded-xl overflow-x-auto text-sm font-mono text-slate-800 border border-slate-200"><code>' + code.trim() + '</code></pre></div>';
                })
                .replace(/^### (.*$)/gim, '<h4 class="text-lg font-bold text-slate-800 mt-6 mb-3 pl-3 border-l-4 border-primary-400">$1</h4>')
                .replace(/^## (.*$)/gim, '<div class="mt-8 mb-4"><h3 class="text-xl font-bold text-slate-800 flex items-center gap-2"><span class="bg-primary-50 text-primary-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">📚</span>$1</h3></div>')
                .replace(/^# (.*$)/gim, '<div class="text-center mb-8 pb-6 border-b border-slate-200"><h2 class="text-2xl font-bold text-slate-800">$1</h2></div>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 font-bold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="text-slate-600 italic">$1</em>')
                .replace(/^- (.*$)/gim, '<li class="ml-6 mb-2 text-slate-700 list-disc">$1</li>')
                .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 mb-2 text-slate-700 list-decimal">$2</li>')
                .replace(/\n\n---\n\n/g, '<hr class="my-8 border-slate-200 border-dashed">');
            
            const paragraphs = html.split('\n\n');
            html = paragraphs.map(p => {
                if (p.trim().startsWith('<h') || p.trim().startsWith('<pre') || p.trim().startsWith('<div') || p.trim().startsWith('<ul') || p.trim().startsWith('<ol') || p.trim().startsWith('<li') || p.trim().startsWith('<hr')) {
                    return p;
                }
                return p ? '<p class="mb-4 text-slate-700 leading-relaxed">' + p.replace(/\n/g, '<br>') + '</p>' : '';
            }).join('');
            
            return html;
        };

        const contentHtml = `
            <div class="p-0">
                <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 md:p-8 rounded-t-2xl">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">${typeLabels[resource.resource_type] || '资源'}</span>
                                ${gradeTag ? `<span class="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">${gradeTag}</span>` : ''}
                                ${resource.subject ? `<span class="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">${resource.subject}</span>` : ''}
                            </div>
                            <h3 class="text-2xl font-bold mb-2">${resource.title}</h3>
                            <p class="text-white/90 text-sm">${resource.description || '暂无描述'}</p>
                        </div>
                        <button onclick="hideModal()" class="text-white/80 hover:text-white ml-4 p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="bg-slate-50/50 border-b border-slate-100 px-6 md:px-8 py-4">
                    <div class="flex flex-wrap gap-6 text-sm">
                        ${resource.knowledge_points?.length ? `
                        <div class="flex items-center gap-2 text-slate-600">
                            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            <span>知识点: <span class="font-bold text-slate-800">${resource.knowledge_points.length}个</span></span>
                        </div>
                        ` : ''}
                        ${resource.difficulty ? `
                        <div class="flex items-center gap-2 text-slate-600">
                            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            <span>难度: <span class="font-bold text-slate-800">${resource.difficulty}</span></span>
                        </div>
                        ` : ''}
                        <div class="flex items-center gap-2 text-slate-600">
                            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span>浏览: <span class="font-bold text-slate-800">${resource.view_count || 0}</span>次</span>
                        </div>
                    </div>
                </div>
                
                <div class="px-6 md:px-8 py-4 border-b border-slate-100">
                    <div class="flex flex-wrap gap-2">
                        ${resource.knowledge_points?.map(kp => `<span class="bg-primary-50 border border-primary-100 text-primary-700 px-3 py-1 rounded-lg text-sm font-medium">${kp}</span>`).join('') || ''}
                    </div>
                </div>
                
                <div class="max-h-[50vh] overflow-y-auto px-6 md:px-8 py-6 bg-white">
                    <div class="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600">
                        ${renderContent(resource.content)}
                    </div>
                </div>
                
                <div class="bg-slate-50 border-t border-slate-100 px-6 md:px-8 py-4 flex justify-end space-x-3 rounded-b-2xl">
                    <button onclick="hideModal()" class="btn btn-secondary px-6">关闭</button>
                    <button class="btn btn-primary px-8 shadow-sm">开始学习</button>
                </div>
            </div>
        `;

        showModal(contentHtml);
    },
};

window.resourcesPage = resourcesPage;
