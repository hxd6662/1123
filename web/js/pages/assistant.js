

/**
 * AI助手页面模块
 */

const assistantPage = {
    messages: [],
    suggestions: [],
    isLoadingSuggestions: false,
    isGeneratingAnimation: false,
    currentAnimationHtml: '',

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade-in h-full flex flex-col max-w-5xl mx-auto">
                <div class="card flex-1 flex flex-col shadow-sm border border-slate-200 overflow-hidden">
                    <div class="card-header flex items-center justify-between bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-slate-800">AI学习助手</h3>
                                <p class="text-xs text-slate-500 font-medium">全天候解答你的学习问题</p>
                            </div>
                        </div>
                        <button id="clear-chat-btn" class="btn btn-secondary btn-sm shadow-sm">
                            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            清空对话
                        </button>
                    </div>
                    
                    <div id="chat-messages" class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30" style="min-height: 400px;">
                    </div>
                    
                    <div id="suggestions-container" class="px-6 pb-2">
                        <div id="suggestions-list" class="flex flex-wrap gap-2 hidden">
                        </div>
                    </div>
                    
                    <div class="card-footer bg-white border-t border-slate-100 p-4">
                        <div class="flex items-center space-x-2 mb-3">
                            <button id="toggle-animation-mode" class="btn btn-secondary btn-sm text-sm bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:border-blue-200">
                                🎬 生成动画解析
                            </button>
                        </div>
                        <form id="chat-form" class="flex items-center space-x-3">
                            <div class="relative flex-1">
                                <input type="text" id="chat-input" class="input w-full shadow-sm pr-12 py-3" placeholder="输入你的问题，例如：勾股定理是什么？" autocomplete="off">
                            </div>
                            <button type="submit" id="submit-btn" class="btn btn-primary px-6 shadow-sm py-3">
                                发送
                                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- 动画模态框 -->
                <div id="animation-modal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm hidden items-center justify-center z-50">
                    <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-6xl h-5/6 max-h-[800px] flex flex-col overflow-hidden animate-scale-in">
                        <div class="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl shadow-sm">
                                    🎬
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-slate-800">动画生成</h3>
                                    <p class="text-xs text-slate-500">将抽象知识转化为直观动画</p>
                                </div>
                            </div>
                            <button id="close-animation-modal" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="p-6 border-b border-slate-100 bg-white">
                            <div class="flex items-center space-x-3">
                                <input type="text" id="animation-topic" class="input flex-1 shadow-sm py-3" placeholder="输入想要生成动画的主题，例如：冒泡排序、光合作用...">
                                <button id="generate-animation-btn" class="btn btn-primary shadow-sm py-3 px-6">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                                    </svg>
                                    生成动画
                                </button>
                            </div>
                        </div>
                        <div id="animation-preview" class="flex-1 overflow-auto p-6 bg-slate-50/50 flex items-center justify-center">
                            <div class="text-center text-slate-400 flex flex-col items-center">
                                <svg class="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
                                </svg>
                                <p class="font-medium text-slate-500">输入主题后点击"生成动画"开始</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.renderMessages();
    },

    renderMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        if (this.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="chat-message assistant">
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm mr-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                    </div>
                    <div class="chat-bubble bg-white border border-slate-200 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm text-slate-700 leading-relaxed">
                        你好！我是你的专属AI学习助手，可以帮你解答各个学科的学习问题。
                        <br><br>
                        <button class="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors font-medium mt-2 border border-primary-100" onclick="assistantPage.openAnimationModal()">
                            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            尝试生成动画来直观学习知识点
                        </button>
                    </div>
                </div>
            `;
        } else {
            messagesContainer.innerHTML = '';
            this.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'flex mb-6 ' + (msg.role === 'user' ? 'justify-end' : '');
                
                if (msg.role === 'user') {
                    messageDiv.innerHTML = `
                        <div class="max-w-[80%] bg-primary-500 text-white px-5 py-3.5 rounded-2xl rounded-br-sm shadow-sm">
                            <div class="whitespace-pre-wrap leading-relaxed">${this.escapeHtml(msg.content)}</div>
                        </div>
                        <div class="w-10 h-10 bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center flex-shrink-0 ml-3 shadow-sm">
                            ${this.getUserInitial()}
                        </div>
                    `;
                } else {
                    const renderedContent = this.renderMarkdownWithLatex(msg.content);
                    messageDiv.innerHTML = `
                        <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm mr-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                        </div>
                        <div class="flex-1 max-w-[80%] bg-white border border-slate-200 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm">
                            <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed">${renderedContent}</div>
                        </div>
                    `;
                }
                
                messagesContainer.appendChild(messageDiv);
            });
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
            
            rendered = rendered.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
                try {
                    return '<div class="text-center my-4">' + katex.renderToString(formula, {
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
            return this.escapeHtml(text);
        }
    },

    setupEventListeners() {
        const form = document.getElementById('chat-form');
        const clearBtn = document.getElementById('clear-chat-btn');
        const toggleAnimationBtn = document.getElementById('toggle-animation-mode');
        const closeModalBtn = document.getElementById('close-animation-modal');
        const generateAnimationBtn = document.getElementById('generate-animation-btn');
        const animationModal = document.getElementById('animation-modal');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('chat-input');
                const message = input.value.trim();
                if (message) {
                    this.sendMessage(message);
                    input.value = '';
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearChat();
            });
        }

        if (toggleAnimationBtn) {
            toggleAnimationBtn.addEventListener('click', () => {
                this.openAnimationModal();
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeAnimationModal();
            });
        }

        if (generateAnimationBtn) {
            generateAnimationBtn.addEventListener('click', () => {
                this.generateAnimation();
            });
        }

        if (animationModal) {
            animationModal.addEventListener('click', (e) => {
                if (e.target === animationModal) {
                    this.closeAnimationModal();
                }
            });
        }
    },

    openAnimationModal() {
        const modal = document.getElementById('animation-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    },

    closeAnimationModal() {
        const modal = document.getElementById('animation-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    async generateAnimation() {
        if (this.isGeneratingAnimation) return;

        const topicInput = document.getElementById('animation-topic');
        const preview = document.getElementById('animation-preview');
        const generateBtn = document.getElementById('generate-animation-btn');
        const topic = topicInput?.value?.trim();

        if (!topic) {
            alert('请输入主题');
            return;
        }

        this.isGeneratingAnimation = true;
        this.currentAnimationHtml = '';
        
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';
        }

        if (preview) {
            preview.innerHTML = `
                <div class="text-center">
                    <div class="flex items-center justify-center space-x-2 mb-4">
                        <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                        <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                    </div>
                    <p class="text-gray-600">正在生成动画，请稍候...</p>
                    <div id="animation-progress" class="mt-4 text-left max-w-2xl mx-auto bg-white p-4 rounded-lg border"></div>
                </div>
            `;
        }

        try {
            await assistantAPI.generateAnimationStream(
                topic,
                (token) => {
                    this.currentAnimationHtml += token;
                    const progressDiv = document.getElementById('animation-progress');
                    if (progressDiv) {
                        progressDiv.innerHTML = `<div class="font-mono text-sm text-gray-700 whitespace-pre-wrap">${this.escapeHtml(this.currentAnimationHtml.slice(-500))}</div>`;
                    }
                },
                () => {
                    this.renderAnimationPreview();
                }
            );
        } catch (error) {
            console.error('Animation generation error:', error);
            if (preview) {
                preview.innerHTML = `
                    <div class="text-center text-red-500">
                        生成失败：${error.message}
                    </div>
                `;
            }
        } finally {
            this.isGeneratingAnimation = false;
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.textContent = '生成动画';
            }
        }
    },

    renderAnimationPreview() {
        const preview = document.getElementById('animation-preview');
        if (!preview) return;

        let htmlToRender = this.currentAnimationHtml;
        
        const htmlMatch = htmlToRender.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
        if (htmlMatch) {
            htmlToRender = htmlMatch[0];
        }

        preview.innerHTML = `
            <div class="w-full bg-white rounded-lg shadow overflow-hidden" style="height: 500px;">
                <iframe id="animation-iframe" class="w-full h-full border-0" srcdoc="${this.escapeHtmlForSrcdoc(htmlToRender)}" style="height: 500px;"></iframe>
            </div>
        `;
    },

    escapeHtmlForSrcdoc(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    async sendMessage(message) {
        this.messages.push({ role: 'user', content: message });
        this.renderMessages();

        const messagesContainer = document.getElementById('chat-messages');
        const aiLoadingDiv = document.createElement('div');
        aiLoadingDiv.className = 'flex mb-6';
        aiLoadingDiv.id = 'ai-current-message';
        aiLoadingDiv.innerHTML = `
            <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm mr-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
            </div>
            <div class="chat-bubble bg-white border border-slate-200 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center">
                <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-slate-300 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-slate-300 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        if (messagesContainer) {
            messagesContainer.appendChild(aiLoadingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        try {
            const response = await assistantAPI.chatWithSuggestions(message);
            const loadingDiv = document.getElementById('ai-current-message');
            if (loadingDiv) {
                loadingDiv.remove();
            }
            const aiMessage = response.data?.message || '抱歉，我无法回答这个问题。';
            this.messages.push({ role: 'assistant', content: aiMessage });
            
            if (response.data?.suggestions && response.data.suggestions.length > 0) {
                this.suggestions = response.data.suggestions;
                this.renderSuggestions();
            }
            
            this.renderMessages();
        } catch (error) {
            console.error('Chat error:', error);
            const loadingDiv = document.getElementById('ai-current-message');
            if (loadingDiv) {
                loadingDiv.remove();
            }
            this.messages.push({ role: 'assistant', content: '抱歉，发生了错误，请稍后再试。' });
            this.renderMessages();
        }
    },

    renderSuggestions() {
        const suggestionsList = document.getElementById('suggestions-list');
        if (!suggestionsList) return;

        if (this.suggestions.length === 0) {
            suggestionsList.classList.add('hidden');
            return;
        }

        suggestionsList.classList.remove('hidden');
        suggestionsList.innerHTML = this.suggestions.map((suggestion, index) => `
            <button 
                class="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-sm text-slate-700 rounded-full transition-all shadow-sm flex items-center"
                onclick="assistantPage.selectSuggestion(${index})"
            >
                <svg class="w-4 h-4 mr-1.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                ${this.escapeHtml(suggestion)}
            </button>
        `).join('');
    },

    selectSuggestion(index) {
        const suggestion = this.suggestions[index];
        if (suggestion) {
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = suggestion;
                input.focus();
            }
        }
    },

    clearChat() {
        this.messages = [];
        this.renderMessages();
    },

    getUserInitial() {
        const user = authService.getUser();
        return (user?.username?.charAt(0).toUpperCase()) || 'U';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
};

window.assistantPage = assistantPage;
