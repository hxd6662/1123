/**
 * 首页模块
 */

const homePage = {
    async render(container) {
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">欢迎回来，同学！</h2>
                    <p class="text-slate-500">今天是学习的好日子，让我们开始吧！</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="stat-card">
                        <div class="stat-icon bg-blue-50 text-blue-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="stat-study-time">2</div>
                        <div class="stat-label">今日学习时长</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-green-50 text-green-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="stat-questions">12</div>
                        <div class="stat-label">完成题目</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-purple-50 text-purple-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="stat-streak">7</div>
                        <div class="stat-label">连续学习天数</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-orange-50 text-orange-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="stat-wrong">3</div>
                        <div class="stat-label">错题数量</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div class="lg:col-span-2">
                        <div class="card h-full">
                            <div class="card-header flex items-center justify-between">
                                <h3 class="text-lg font-bold text-slate-800">快捷功能</h3>
                            </div>
                            <div class="card-body">
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button onclick="window.app.navigateTo('health')" class="p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 transition-all group text-center">
                                        <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-blue-200">
                                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                            </svg>
                                        </div>
                                        <p class="font-medium text-slate-800">坐姿检测</p>
                                        <p class="text-xs text-slate-500 mt-1">保护视力</p>
                                    </button>

                                    <button onclick="window.app.navigateTo('questions')" class="p-4 rounded-2xl bg-green-50/50 hover:bg-green-50 border border-green-100 hover:border-green-200 transition-all group text-center">
                                        <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-green-200">
                                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                                            </svg>
                                        </div>
                                        <p class="font-medium text-slate-800">错题本</p>
                                        <p class="text-xs text-slate-500 mt-1">查漏补缺</p>
                                    </button>

                                    <button onclick="window.app.navigateTo('assistant')" class="p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 hover:border-purple-200 transition-all group text-center">
                                        <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-purple-200">
                                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                            </svg>
                                        </div>
                                        <p class="font-medium text-slate-800">AI助手</p>
                                        <p class="text-xs text-slate-500 mt-1">随身家教</p>
                                    </button>

                                    <button onclick="window.app.navigateTo('resources')" class="p-4 rounded-2xl bg-orange-50/50 hover:bg-orange-50 border border-orange-100 hover:border-orange-200 transition-all group text-center">
                                        <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-orange-200">
                                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                            </svg>
                                        </div>
                                        <p class="font-medium text-slate-800">学习资源</p>
                                        <p class="text-xs text-slate-500 mt-1">知识拓展</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card h-full">
                        <div class="card-header">
                            <h3 class="text-lg font-bold text-slate-800">学习目标</h3>
                        </div>
                        <div class="card-body flex flex-col justify-center gap-6" id="goals-container">
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-medium text-slate-700">完成《静夜思》学习</span>
                                    <span class="text-sm font-semibold text-primary-500">75%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" style="width: 75%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-medium text-slate-700">数学口算练习</span>
                                    <span class="text-sm font-semibold text-primary-500">40%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" style="width: 40%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-medium text-slate-700">英语单词背诵</span>
                                    <span class="text-sm font-semibold text-primary-500">60%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" style="width: 60%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-800">个性化AI教师</h3>
                        <button onclick="window.app.navigateTo('ai-teachers')" class="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">
                            查看全部
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <button onclick="window.app.navigateTo('ai-teachers', { subject: 'chinese' })" class="p-4 rounded-2xl bg-red-50/50 hover:bg-red-50 border border-red-100 hover:border-red-200 transition-all group text-center">
                                <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-red-200">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                </div>
                                <p class="font-medium text-slate-800">语文老师</p>
                                <p class="text-xs text-slate-500 mt-1">诗词文章</p>
                            </button>

                            <button onclick="window.app.navigateTo('ai-teachers', { subject: 'math' })" class="p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 transition-all group text-center">
                                <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-blue-200">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <p class="font-medium text-slate-800">数学老师</p>
                                <p class="text-xs text-slate-500 mt-1">逻辑思维</p>
                            </button>

                            <button onclick="window.app.navigateTo('ai-teachers', { subject: 'english' })" class="p-4 rounded-2xl bg-yellow-50/50 hover:bg-yellow-50 border border-yellow-100 hover:border-yellow-200 transition-all group text-center">
                                <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-yellow-200">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                                    </svg>
                                </div>
                                <p class="font-medium text-slate-800">英语老师</p>
                                <p class="text-xs text-slate-500 mt-1">听说读写</p>
                            </button>

                            <button onclick="window.app.navigateTo('ai-teachers', { subject: 'physics' })" class="p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 hover:border-purple-200 transition-all group text-center">
                                <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-purple-200">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                    </svg>
                                </div>
                                <p class="font-medium text-slate-800">物理老师</p>
                                <p class="text-xs text-slate-500 mt-1">科学探索</p>
                            </button>

                            <button onclick="window.app.navigateTo('ai-teachers', { subject: 'chemistry' })" class="p-4 rounded-2xl bg-teal-50/50 hover:bg-teal-50 border border-teal-100 hover:border-teal-200 transition-all group text-center">
                                <div class="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-teal-200">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                                    </svg>
                                </div>
                                <p class="font-medium text-slate-800">化学老师</p>
                                <p class="text-xs text-slate-500 mt-1">奇妙反应</p>
                            </button>

                            <button onclick="window.app.navigateTo('ai-teachers')" class="p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group text-center">
                                <div class="w-12 h-12 bg-slate-400 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-sm shadow-slate-200">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                                    </svg>
                                </div>
                                <p class="font-medium text-slate-800">更多老师</p>
                                <p class="text-xs text-slate-500 mt-1">全科辅导</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
};

window.homePage = homePage;
