/**
 * 学习统计页面模块
 */

const learningPage = {
    currentReport: null,

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="stat-card">
                        <div class="stat-icon bg-blue-100 text-blue-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="total-study-time">120</div>
                        <div class="stat-label">总学习时长（分钟）</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-green-100 text-green-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="total-questions">12</div>
                        <div class="stat-label">完成题目</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-purple-100 text-purple-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="consecutive-days">7</div>
                        <div class="stat-label">连续学习天数</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-orange-100 text-orange-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="accuracy-rate">85%</div>
                        <div class="stat-label">正确率</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="card">
                        <div class="card-header flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">学习目标</h3>
                            <button id="add-goal-btn" class="btn btn-primary btn-sm">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                添加目标
                            </button>
                        </div>
                        <div class="card-body" id="goals-list">
                            <div class="text-center py-8 text-gray-500">
                                <p>加载中...</p>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">学情报告</h3>
                            <button id="generate-report-btn" class="btn btn-primary btn-sm">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                生成报告
                            </button>
                        </div>
                        <div class="card-body" id="report-container">
                            <div class="text-center py-8 text-gray-500">
                                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <p>点击上方按钮生成学情报告</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        await this.loadData();
    },

    setupEventListeners() {
        const addGoalBtn = document.getElementById('add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => this.showAddGoalModal());
        }

        const generateReportBtn = document.getElementById('generate-report-btn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
    },

    async loadData() {
        try {
            const goalsResponse = await learningAPI.getGoals();
            this.updateGoals(goalsResponse);
        } catch (error) {
            console.error('Failed to load goals:', error);
            this.showMockGoals();
        }
    },

    showMockGoals() {
        const container = document.getElementById('goals-list');
        if (!container) return;

        const mockGoals = [
            { id: 1, title: '完成《静夜思》学习', description: '背诵并理解古诗含义', progress: 75, is_completed: false },
            { id: 2, title: '数学口算练习', description: '每天练习20道口算题', progress: 40, is_completed: false },
            { id: 3, title: '英语单词背诵', description: '背诵50个新单词', progress: 60, is_completed: false }
        ];

        container.innerHTML = mockGoals.map(goal => `
            <div class="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <span class="font-medium text-gray-900 ${goal.is_completed ? 'line-through text-gray-400' : ''}">${goal.title}</span>
                        ${goal.is_completed ? '<span class="ml-2 badge badge-success">已完成</span>' : ''}
                        <button onclick="learningPage.showGoalPlan('${goal.title.replace(/'/g, "\\'")}', '${(goal.description || '').replace(/'/g, "\\'")}')" class="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-1" title="AI规划">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            AI规划
                        </button>
                    </div>
                    ${goal.description ? `<p class="text-sm text-gray-500 mb-2">${goal.description}</p>` : ''}
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span>进度: ${goal.progress || 0}%</span>
                    </div>
                    <div class="progress mt-2">
                        <div class="progress-bar" style="width: ${goal.progress || 0}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    updateGoals(response) {
        const container = document.getElementById('goals-list');
        if (!container) return;

        const goals = response?.data || [];

        if (goals.length === 0) {
            this.showMockGoals();
            return;
        }

        container.innerHTML = goals.map(goal => `
            <div class="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <span class="font-medium text-gray-900 ${goal.is_completed ? 'line-through text-gray-400' : ''}">${goal.title}</span>
                        ${goal.is_completed ? '<span class="ml-2 badge badge-success">已完成</span>' : ''}
                        <button onclick="learningPage.showGoalPlan('${goal.title.replace(/'/g, "\\'")}', '${(goal.description || '').replace(/'/g, "\\'")}')" class="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-1" title="AI规划">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            AI规划
                        </button>
                    </div>
                    ${goal.description ? `<p class="text-sm text-gray-500 mb-2">${goal.description}</p>` : ''}
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span>进度: ${goal.progress || 0}%</span>
                        ${goal.target_date ? `<span>目标日期: ${goal.target_date}</span>` : ''}
                    </div>
                    <div class="progress mt-2">
                        <div class="progress-bar" style="width: ${goal.progress || 0}%"></div>
                    </div>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    <button onclick="learningPage.updateGoalProgress(${goal.id}, ${(goal.progress || 0) + 10})" class="btn btn-secondary btn-sm" ${goal.is_completed ? 'disabled' : ''}>
                        +10%
                    </button>
                    <button onclick="learningPage.deleteGoal(${goal.id})" class="btn btn-danger btn-sm">
                        删除
                    </button>
                </div>
            </div>
        `).join('');
    },

    async generateReport() {
        const container = document.getElementById('report-container');
        const btn = document.getElementById('generate-report-btn');

        container.innerHTML = `
            <div class="text-center py-8">
                <div class="loading-spinner mb-4 mx-auto"></div>
                <p class="text-gray-500">AI正在为您生成学情报告，请稍候...</p>
            </div>
        `;
        btn.disabled = true;
        btn.innerHTML = `
            <svg class="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            生成中...
        `;

        try {
            const response = await learningAPI.generateReport();
            this.currentReport = response?.data?.report;
            this.renderReport(this.currentReport);
        } catch (error) {
            console.error('Failed to generate report:', error);
            this.showMockReport();
        } finally {
            btn.disabled = false;
            btn.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                生成报告
            `;
        }
    },

    showMockReport() {
        const mockReport = `# 学情分析报告

## 1. 学习概况总结

你近期的学习表现非常出色！总学习时长达到2小时，完成了12道题目，正确率达到85%，并且已经连续学习7天了。这是一个非常棒的开始！

## 2. 优势分析

✨ **语文阅读**：你的阅读理解能力很强，能够快速把握文章主旨。  
✨ **物理基础**：对物理概念的理解很透彻，基础扎实。

## 3. 不足与改进建议

📚 **数学几何**：建议多做一些几何图形的练习题，可以使用画图工具帮助理解。  
📚 **英语语法**：可以通过阅读英语短文来培养语感，每天坚持15分钟。

## 4. 具体学习计划

1. **每天安排30分钟数学几何练习**
2. **每天阅读1-2篇英语短文**
3. **每周复习一次物理知识点**
4. **保持语文阅读的好习惯**

## 5. 鼓励与期望

你已经展现出了很好的学习毅力和潜力！继续保持这种积极的学习态度，相信你一定能够在各学科都取得优异的成绩。记住，每一点进步都值得庆祝！加油！💪`;

        this.currentReport = mockReport;
        this.renderReport(mockReport);
    },

    renderReport(report) {
        const container = document.getElementById('report-container');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-4">
                <div class="prose prose-blue max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    ${marked.parse(report)}
                </div>
                <div class="flex justify-end space-x-3">
                    <button onclick="learningPage.saveReport()" class="btn btn-primary btn-sm">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                        </svg>
                        保存报告
                    </button>
                </div>
            </div>
        `;
    },

    saveReport() {
        if (!this.currentReport) {
            showToast('没有可保存的报告', 'error');
            return;
        }

        const blob = new Blob([this.currentReport], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `学情报告_${date}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('报告保存成功！', 'success');
    },

    showAddGoalModal() {
        const content = `
            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-6">添加学习目标</h3>
                <form id="add-goal-form" class="space-y-4">
                    <div class="form-group">
                        <label class="form-label">目标标题 <span class="text-red-500">*</span></label>
                        <input type="text" name="title" class="input" placeholder="例如：完成数学第一章" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">目标描述</label>
                        <textarea name="description" class="input" rows="3" placeholder="详细描述你的学习目标"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">目标日期</label>
                        <input type="date" name="target_date" class="input">
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="hideModal()" class="btn btn-secondary">取消</button>
                        <button type="submit" class="btn btn-primary">添加</button>
                    </div>
                </form>
            </div>
        `;

        showModal(content);

        document.getElementById('add-goal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                title: formData.get('title'),
                description: formData.get('description') || undefined,
                target_date: formData.get('target_date') || undefined,
            };

            try {
                await learningAPI.createGoal(data);
                hideModal();
                showToast('目标添加成功', 'success');
                await this.loadData();
            } catch (error) {
                showToast(error.message || '添加失败', 'error');
            }
        });
    },

    async updateGoalProgress(goalId, progress) {
        try {
            await learningAPI.updateGoal(goalId, { 
                progress: Math.min(progress, 100),
                is_completed: progress >= 100 
            });
            showToast('进度更新成功', 'success');
            await this.loadData();
        } catch (error) {
            showToast(error.message || '更新失败', 'error');
        }
    },

    async deleteGoal(goalId) {
        if (!confirm('确定要删除这个目标吗？')) return;

        try {
            await learningAPI.deleteGoal(goalId);
            showToast('目标已删除', 'success');
            await this.loadData();
        } catch (error) {
            showToast(error.message || '删除失败', 'error');
        }
    },

    async showGoalPlan(goalTitle, goalDescription) {
        const loadingContent = `
            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-6">AI 学习规划</h3>
                <div class="text-center py-8">
                    <div class="loading-spinner mb-4 mx-auto"></div>
                    <p class="text-gray-500">AI正在为您规划学习目标，请稍候...</p>
                </div>
            </div>
        `;
        showModal(loadingContent);

        try {
            const response = await learningAPI.planGoal(goalTitle, goalDescription);
            const plan = response?.data?.plan || '暂无规划建议';

            const content = `
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-6">AI 学习规划</h3>
                    <div class="bg-blue-50 p-4 rounded-lg mb-4">
                        <h4 class="font-medium text-gray-800 mb-2">📌 目标：${goalTitle}</h4>
                        ${goalDescription ? `<p class="text-sm text-gray-600">${goalDescription}</p>` : ''}
                    </div>
                    <div class="prose prose-blue max-w-none text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                        ${marked.parse(plan)}
                    </div>
                    <div class="flex justify-end mt-6">
                        <button onclick="hideModal()" class="btn btn-primary">关闭</button>
                    </div>
                </div>
            `;
            showModal(content);
        } catch (error) {
            const errorContent = `
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-6">AI 学习规划</h3>
                    <div class="text-center py-8 text-red-500">
                        <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p>生成规划失败：${error.message || '未知错误'}</p>
                    </div>
                    <div class="flex justify-end mt-6">
                        <button onclick="hideModal()" class="btn btn-secondary">关闭</button>
                    </div>
                </div>
            `;
            showModal(errorContent);
        }
    },
};

window.learningPage = learningPage;
