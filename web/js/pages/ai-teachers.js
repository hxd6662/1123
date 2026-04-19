/**
 * 个性化AI教师页面模块
 */

const aiTeachersPage = {
    currentSubject: null,
    sessionId: null,
    messages: [],

    async render(container, params = {}) {
        this.currentSubject = params?.subject || null;

        if (this.currentSubject) {
            await this.renderChatPage(container);
        } else {
            await this.renderTeachersList(container);
        }
    },

    async renderTeachersList(container) {
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">个性化AI教师</h2>
                    <p class="text-slate-500">选择一位专业的AI老师，进行一对一的学习辅导</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="teachers-grid">
                    <div class="col-span-full text-center py-12 text-slate-400">
                        <div class="loading-spinner mx-auto mb-4 border-t-primary-500"></div>
                        <p>加载中...</p>
                    </div>
                </div>
            </div>
        `;

        await this.loadTeachers();
    },

    async renderChatPage(container) {
        const teacherConfig = this.getTeacherConfig(this.currentSubject);

        container.innerHTML = `
            <div class="h-full flex flex-col animate-fade-in bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="flex items-center space-x-4 p-4 border-b border-slate-100 bg-slate-50/50">
                    <button onclick="window.app.navigateTo('ai-teachers')" class="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500 hover:text-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <div class="w-12 h-12 ${teacherConfig.bgColor} rounded-xl flex items-center justify-center text-2xl shadow-sm">
                        ${teacherConfig.avatar}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">${teacherConfig.name}</h3>
                        <p class="text-sm font-medium text-primary-500">一对一辅导中...</p>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30" id="chat-messages">
                </div>

                <div class="border-t border-slate-100 p-4 bg-white">
                    <div class="flex space-x-3 max-w-4xl mx-auto">
                        <input 
                            type="text" 
                            id="chat-input" 
                            class="input flex-1 shadow-sm" 
                            placeholder="请输入你的问题，按回车发送..."
                            onkeypress="if(event.key === 'Enter') aiTeachersPage.sendMessage()"
                        >
                        <button onclick="aiTeachersPage.sendMessage()" class="btn btn-primary px-6 shadow-sm">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                            发送
                        </button>
                    </div>
                </div>
            </div>
        `;

        await this.loadChatHistory();
    },

    getTeacherConfig(subject) {
        const configs = {
            chinese: {
                name: '语文老师',
                avatar: '📚',
                bgColor: 'bg-red-100',
                color: 'text-red-600'
            },
            math: {
                name: '数学老师',
                avatar: '🔢',
                bgColor: 'bg-blue-100',
                color: 'text-blue-600'
            },
            english: {
                name: '英语老师',
                avatar: '🌍',
                bgColor: 'bg-yellow-100',
                color: 'text-yellow-600'
            },
            physics: {
                name: '物理老师',
                avatar: '⚡',
                bgColor: 'bg-purple-100',
                color: 'text-purple-600'
            },
            chemistry: {
                name: '化学老师',
                avatar: '🧪',
                bgColor: 'bg-green-100',
                color: 'text-green-600'
            },
            biology: {
                name: '生物老师',
                avatar: '🌱',
                bgColor: 'bg-emerald-100',
                color: 'text-emerald-600'
            },
            geography: {
                name: '地理老师',
                avatar: '🗺️',
                bgColor: 'bg-amber-100',
                color: 'text-amber-600'
            },
            history: {
                name: '历史老师',
                avatar: '📜',
                bgColor: 'bg-stone-100',
                color: 'text-stone-600'
            },
            politics: {
                name: '政治老师',
                avatar: '⚖️',
                bgColor: 'bg-slate-100',
                color: 'text-slate-600'
            }
        };
        return configs[subject] || configs.chinese;
    },

    async loadTeachers() {
        try {
            const data = await window.aiTeachersAPI.getTeachers();
            
            if (data.success && data.data) {
                this.renderTeachersGrid(data.data);
            }
        } catch (error) {
            console.error('Failed to load teachers:', error);
            this.renderFallbackTeachers();
        }
    },

    renderTeachersGrid(teachers) {
        const container = document.getElementById('teachers-grid');
        if (!container) return;

        container.innerHTML = teachers.map(teacher => {
            const config = this.getTeacherConfig(teacher.id);
            return `
                <button 
                    onclick="window.app.navigateTo('ai-teachers', { subject: '${teacher.id}' })"
                    class="bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all text-left group"
                >
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 ${config.bgColor} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm">
                            ${config.avatar}
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-slate-800">${teacher.name}</h4>
                            <p class="text-sm text-slate-500 mt-1">点击开始一对一辅导</p>
                        </div>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div class="flex items-center text-sm font-medium text-primary-500 bg-primary-50 px-3 py-1 rounded-lg">
                            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            专业学科辅导
                        </div>
                        <svg class="w-5 h-5 text-slate-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </button>
            `;
        }).join('');
    },

    renderFallbackTeachers() {
        const fallbackTeachers = [
            { id: 'chinese', name: '语文老师' },
            { id: 'math', name: '数学老师' },
            { id: 'english', name: '英语老师' },
            { id: 'physics', name: '物理老师' },
            { id: 'chemistry', name: '化学老师' },
            { id: 'biology', name: '生物老师' },
            { id: 'geography', name: '地理老师' },
            { id: 'history', name: '历史老师' },
            { id: 'politics', name: '政治老师' }
        ];
        this.renderTeachersGrid(fallbackTeachers);
    },

    async loadChatHistory() {
        try {
            const data = await window.aiTeachersAPI.getChatHistory(this.currentSubject);
            
            if (data.success && data.data && data.data.length > 0) {
                this.messages = data.data;
                this.sessionId = data.data[0].session_id;
                this.renderMessages();
            } else {
                this.addWelcomeMessage();
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            this.addWelcomeMessage();
        }
    },

    addWelcomeMessage() {
        const teacherConfig = this.getTeacherConfig(this.currentSubject);
        const welcomeMessages = {
            chinese: '🎓 **同学你好！我是你的语文老师！** 👨‍🏫\n\n很高兴能与你一起探索语文的世界！✨\n\n我可以帮你：\n- 📖 解析古诗词，品味其中的意境与情感\n- 📝 指导阅读理解，掌握答题技巧\n- ✍️ 提升写作能力，让文章文采飞扬\n- 🌸 探讨文学作品，感受语言之美\n\n有什么想学习或探讨的吗？随时告诉我！',
            math: '同学你好！我是你的数学老师。数学其实很有趣，让我们一起探索数学的奥秘吧！有什么题目不会做吗？',
            english: 'Hello! I\'m your English teacher. Let\'s learn English together! Do you have any questions?',
            physics: '同学你好！我是你的物理老师。物理世界充满了奇妙的规律，让我们一起探索吧！',
            chemistry: '同学你好！我是你的化学老师。欢迎来到神奇的化学世界！有什么想了解的吗？',
            biology: '同学你好！我是你的生物老师。生命是多么奇妙啊！让我们一起探索生命的奥秘吧！',
            geography: '同学你好！我是你的地理老师。世界那么大，让我们一起去看看！',
            history: '同学你好！我是你的历史老师。以史为鉴，可以知兴替。让我们一起学习历史吧！',
            politics: '同学你好！我是你的政治老师。让我们一起学习，树立正确的价值观吧！'
        };

        const welcomeMessage = welcomeMessages[this.currentSubject] || welcomeMessages.chinese;
        
        this.messages = [{
            role: 'assistant',
            response: welcomeMessage
        }];
        
        this.renderMessages();
    },

    renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const teacherConfig = this.getTeacherConfig(this.currentSubject);

        container.innerHTML = this.messages.map(msg => {
            if (msg.role === 'user' || (msg.message && !msg.response)) {
                const content = msg.message || msg.content;
                return `
                    <div class="flex justify-end">
                        <div class="max-w-[80%] bg-primary-500 text-white px-5 py-3.5 rounded-2xl rounded-br-sm shadow-sm">
                            <p class="whitespace-pre-wrap">${content}</p>
                        </div>
                    </div>
                `;
            } else {
                const content = msg.response || msg.content;
                return `
                    <div class="flex space-x-3">
                        <div class="w-10 h-10 ${teacherConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm border border-slate-100">
                            ${teacherConfig.avatar}
                        </div>
                        <div class="flex-1 max-w-[80%] bg-white border border-slate-200 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm">
                            <div class="whitespace-pre-wrap text-slate-700 leading-relaxed">${this.formatMessage(content)}</div>
                        </div>
                    </div>
                `;
            }
        }).join('');

        container.scrollTop = container.scrollHeight;
    },

    formatMessage(content) {
        if (!content) return '';
        
        let html = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>');
        
        html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-slate-800 mt-5 mb-2">$1</h3>');
        html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-slate-800 mt-6 mb-3">$1</h2>');
        html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-slate-800 mt-8 mb-4">$1</h1>');
        
        html = html.replace(/^(\d+)\.\s(.*?)$/gm, '<div class="flex items-start mb-3"><span class="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">$1</span><span class="text-slate-700">$2</span></div>');
        html = html.replace(/^[-*]\s(.*?)$/gm, '<div class="flex items-start mb-2 text-slate-700"><span class="text-primary-400 mr-2 font-bold">•</span><span>$1</span></div>');
        
        html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-primary-600 px-1.5 py-0.5 rounded-md text-sm font-mono">$1</code>');
        
        html = html.replace(/\n/g, '<br>');
        
        return html;
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input?.value?.trim();
        
        if (!message) return;

        input.value = '';

        this.messages.push({
            role: 'user',
            message: message
        });
        this.renderMessages();

        try {
            const data = await window.aiTeachersAPI.chatWithTeacher(
                this.currentSubject, 
                message, 
                this.sessionId
            );
            
            if (data.success && data.data) {
                this.sessionId = data.data.session_id;
                this.messages.push({
                    role: 'assistant',
                    response: data.data.message
                });
                this.renderMessages();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            this.messages.push({
                role: 'assistant',
                response: '抱歉，暂时无法连接到老师，请稍后再试。'
            });
            this.renderMessages();
        }
    }
};

window.aiTeachersPage = aiTeachersPage;
