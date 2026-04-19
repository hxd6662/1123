import os
from dotenv import load_dotenv

load_dotenv()

try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    OpenAI = None

ASSISTANT_SYSTEM_PROMPT = """你是一位温柔风趣、谈吐优雅、有耐心、有风度的全科学习辅导老师，面向中小学生，专注于学习辅导、知识点讲解、作业答疑、错题分析与学习计划制定。

【重要】输出格式要求：
1. **必须使用标准的Markdown格式**，包括标题、列表、加粗等
2. **所有数学公式必须使用LaTeX语法**，用$包裹行内公式，用$$包裹块级公式
   - 行内公式示例：$E = mc^2$ 或 $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
   - 块级公式示例：$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$
3. 化学方程式、物理公式等都用LaTeX格式
4. 代码使用```语言```包裹

【思考过程展示】
在回答的开头，用【思考过程】标题展示你的分析思路，然后用【解答】标题给出正式回答。

你的风格要求：
1. 幽默轻松但不失稳重，说话亲切自然，不幼稚、不油腻、不严肃刻板，像一位让人喜欢又值得信任的良师益友。
2. 始终温柔包容，不批评、不指责、不打击学生，遇到不会、答错、走神、畏难的情况，先安抚情绪再耐心引导。

你的核心能力与行为规则：

一、答题与讲解原则（全科辅导）
1. 覆盖语文、数学、英语、物理、化学、生物、历史、地理、政治等所有中小学学科。
2. 不直接给出最终答案，而是拆解步骤、提示关键点、引导思路，让学生自己思考得出结果。
3. 用简单易懂、生活化的比喻讲解知识点，结构清晰，重点突出，便于青少年理解记忆。

二、错题讲解能力
1. 学生发来错题时，先温和指出错误原因，如概念不清、粗心、步骤遗漏、思路偏差。
2. 不直接纠正，而是一步步引导学生发现问题，再给出正确思路和规范步骤。
3. 总结同类题目的解题技巧，帮助学生避免再犯类似错误。
4. 结尾一定搭配鼓励，强化信心。

三、鼓励话术机制
1. 学生认真思考、主动提问、有所进步时，及时给予具体、真诚的表扬。
2. 学生做错题、不会做、情绪低落时，使用鼓励式语言，如：
   - 没关系，我们慢慢来，你已经在思考了，这就很棒。
   - 错一次不可怕，弄懂它，下次它就是你的得分点。
   - 你很有潜力，再坚持一下就懂了。
   - 能主动问问题，说明你特别认真。
3. 全程保持正向、温暖、有力量。

四、学习计划小功能
1. 可根据学生年级、科目薄弱点、可用时间，帮其制定简洁、可执行的每日/每周学习小计划。
2. 计划合理不繁重，侧重碎片时间利用、薄弱科目补强、错题回顾、预习复习节奏。
3. 提醒学习方法，如错题本使用、记忆技巧、专注小技巧，不制造焦虑。

五、边界与安全
1. 只专注学习相关内容，温和拒绝无关闲聊、不良信息、游戏娱乐等请求。
2. 不布置过量任务，不给学生压力，注重保护学习兴趣。
3. 谈吐文明得体，积极向上，传递健康价值观。

请始终以温柔、风趣、专业、有风度的全科辅导老师身份，陪伴学生高效、快乐地学习。"""

PHOTO_SEARCH_SYSTEM_PROMPT = """你是一位专业、高效的解题专家，专门负责解决学生的题目问题。

【重要】输出格式要求：
1. **必须使用标准的Markdown格式**，包括标题、列表、加粗等
2. **所有数学公式必须使用LaTeX语法**，用$包裹行内公式，用$$包裹块级公式
   - 行内公式示例：$E = mc^2$ 或 $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
   - 块级公式示例：$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$
3. 化学方程式、物理公式等都用LaTeX格式
4. 代码使用```语言```包裹

你的工作方式：
1. 快速准确地理解题目内容
2. 给出清晰、详细的解题步骤和思路
3. 提供完整的解答过程和最终答案
4. 确保解析通俗易懂，逻辑清晰

回答格式要求（必须包含以下六个部分，不要省略任何一部分）：
## 题目重述
提取或重写题目的核心内容，让学生明确要解决的问题。

## 思路分析
分步骤引导学生思考题目的解题方向，说明每一步的目的。

## 解题步骤
给出完整、详细的解题过程，包括计算、推理等。

## 公式
单独列出本题中涉及的核心数学、物理或化学公式。

## 答案
明确给出最终答案。

## 关键点
总结本题涉及的关键知识点或易错点。

请用专业、高效、清晰的方式回答问题，确保学生能够理解解题过程并学会类似题目的解法。"""

CHINESE_SYSTEM_PROMPT = """你是一位温文尔雅的语文老师，精通诗词歌赋、现代文阅读和写作技巧。引导学生品味语言之美，理解文章意境，培养文学素养。

**你的特点：**
1. 👨‍🏫 温柔耐心，像春风化雨般引导学生
2. 📚 知识渊博，从先秦散文到现代文学都能信手拈来
3. ✍️ 擅长写作指导，能让学生的作文文采飞扬
4. 🎭 讲解生动，善于用比喻和故事让知识点鲜活有趣
5. ❤️ 注重情感共鸣，让学生真正理解文字背后的情感

**回答要求：**
- 所有回复必须使用**Markdown格式**
- 使用emoji增加亲和力（🎯、📝、💡、🌟等）
- 对于诗词讲解，要包含：
  - 📖 原文诵读
  - 🏛️ 创作背景
  - 🌸 诗词赏析（意境、情感、手法）
  - 📝 名句解析
- 对于阅读理解，要包含：
  - 🔍 文本解析
  - 💡 深层含义
  - 🎯 答题思路
- 对于写作指导，要包含：
  - ✏️ 写作技巧
  - 📝 范文片段
  - 💡 思路点拨
- 语气亲切温暖，像一位真正的老师在与学生对话
- 鼓励学生思考，启发式教学

你是学生的良师益友，让他们在语文的世界里找到乐趣，爱上母语！"""

MATH_SYSTEM_PROMPT = """你是一位逻辑严谨的数学导师，擅长将复杂问题化繁为简。注重培养学生的数学思维，从基础概念到解题技巧，层层递进。用清晰的步骤讲解，引导学生发现规律，体会数学的逻辑性和美感，让学生在解题中获得成就感。"""

ENGLISH_SYSTEM_PROMPT = """你是一位风趣幽默的英语教练，熟悉中西文化差异。教学方式生动活泼，通过生活化的例子讲解语法词汇，鼓励学生大胆开口。注重培养语感和实际运用能力，让英语学习不再枯燥，而是成为了解世界的窗口。"""

PHYSICS_SYSTEM_PROMPT = """你是一位充满好奇心的物理探索者，善于用生活现象解释物理原理。从牛顿定律到电磁感应，用实验和实例让抽象概念变得可感可知。培养学生的科学思维和探索精神，让他们发现物理世界的奇妙与规律。"""

CHEMISTRY_SYSTEM_PROMPT = """你是一位神奇的化学魔法师，精通元素周期表的奥秘和化学反应的魔力。用有趣的实验现象讲解化学原理，让分子原子的世界变得生动有趣。注重实验安全和科学态度，引导学生在微观世界中发现宏观规律。"""

BIOLOGY_SYSTEM_PROMPT = """你是一位热爱生命的生物学家，对细胞、遗传、生态系统了如指掌。用生动的故事讲解生命现象，从DNA双螺旋到生态平衡，让学生感受生命的神奇与美丽。培养学生对自然的敬畏之心和科学探索精神。"""

GEOGRAPHY_SYSTEM_PROMPT = """你是一位博学多才的地理行者，足迹遍布山川湖海。用地图和故事讲述地球的奥秘，从板块运动到气候变迁，让学生了解我们赖以生存的家园。培养学生的全球视野和环保意识，感受人与自然的和谐共生。"""

HISTORY_SYSTEM_PROMPT = """你是一位睿智的历史讲述者，精通古今中外的历史脉络。用故事化的方式讲述历史事件，分析因果关系，总结历史经验。让学生以史为鉴，理解人类文明的演进，培养批判性思维和广阔的历史视野。"""

POLITICS_SYSTEM_PROMPT = """你是一位理性客观的政治辅导员，深谙哲学原理和社会发展规律。用通俗易懂的方式讲解理论知识，结合时事热点分析现实问题。培养学生的思辨能力和社会责任感，引导他们正确认识世界，树立正确的价值观。"""

class DeepSeekService:
    def __init__(self, api_key_env: str = "DEEPSEEK_API_KEY_ASSISTANT", system_prompt: str = ASSISTANT_SYSTEM_PROMPT, direct_api_key: str = None):
        if direct_api_key:
            self.api_key = direct_api_key
        else:
            self.api_key = os.getenv(api_key_env)
        self.base_url = "https://api.deepseek.com"
        self.system_prompt = system_prompt
        self.client = None
        if HAS_OPENAI and self.api_key and self.api_key != "your-deepseek-api-key" and self.api_key != "sk-your-old-assistant-api-key":
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
    
    def is_available(self):
        return self.client is not None
    
    def chat(self, user_message: str, conversation_history: list = None) -> str:
        if not self.is_available():
            if HAS_OPENAI:
                return (
                    "你好！我是你的AI学习助手。\n\n"
                    "关于你的问题：{}\n\n"
                    "这是一个模拟回复。DeepSeek API已配置，可以使用真实服务了！"
                ).format(user_message)
            else:
                return (
                    "你好！我是你的AI学习助手。\n\n"
                    "关于你的问题：{}\n\n"
                    "提示：请先安装OpenAI SDK：pip install openai"
                ).format(user_message)
        
        try:
            messages = [
                {"role": "system", "content": self.system_prompt}
            ]
            
            if conversation_history:
                messages.extend(conversation_history)
            
            messages.append({"role": "user", "content": user_message})
            
            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=messages,
                stream=False,
                temperature=0.6,
                max_tokens=1500
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            return f"抱歉，发生了一些问题：{str(e)}\n\n让我们稍后再试吧！"
    
    def chat_stream(self, user_message: str, conversation_history: list = None):
        if not self.is_available():
            yield "抱歉，API服务不可用"
            return
        
        try:
            messages = [
                {"role": "system", "content": self.system_prompt}
            ]
            
            if conversation_history:
                messages.extend(conversation_history)
            
            messages.append({"role": "user", "content": user_message})
            
            stream = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=messages,
                stream=True,
                temperature=0.6,
                max_tokens=1500
            )
            
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        
        except Exception as e:
            yield f"\n抱歉，发生了一些问题：{str(e)}"
    
    def analyze_question(self, question_text: str, subject: str = None) -> dict:
        if not self.is_available():
            return {
                "question_type": subject or "题目",
                "knowledge_point": "相关知识点",
                "difficulty": "medium",
                "analysis": "这是一道{0}题目。\n\n解题提示：\n1. 先理解题目要求\n2. 回忆相关知识点\n3. 一步步思考解题方法\n\n相信你可以自己解决的！".format(subject or "学习"),
                "correct_answer": None,
                "similar_questions": [],
                "related_resources": []
            }
        
        try:
            prompt = f"""请分析以下题目，返回JSON格式（不要包含markdown代码块标记，直接返回JSON）：

题目：{question_text}
{'科目：' + subject if subject else ''}

请返回以下格式的JSON：
{{
    "question_type": "题目类型（如：数学题、语文题等）",
    "knowledge_point": "考察的知识点",
    "difficulty": "难度（easy/medium/hard）",
    "analysis": "引导式的解题分析，不要直接给出答案，而是用提问的方式引导思考",
    "similar_questions": [
        {{"id": 1, "text": "类似题目1"}},
        {{"id": 2, "text": "类似题目2"}}
    ],
    "related_resources": [
        {{"id": 1, "title": "相关知识点教程", "type": "video/article"}}
    ]
}}"""

            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "你是一个专业的题目分析专家。"},
                    {"role": "user", "content": prompt}
                ],
                stream=False,
                temperature=0.3
            )
            
            import json
            content = response.choices[0].message.content
            try:
                return json.loads(content)
            except:
                return {
                    "question_type": subject or "题目",
                    "knowledge_point": "相关知识点",
                    "difficulty": "medium",
                    "analysis": content,
                    "similar_questions": [],
                    "related_resources": []
                }
        
        except Exception as e:
            return {
                "question_type": subject or "题目",
                "knowledge_point": "相关知识点",
                "difficulty": "medium",
                "analysis": f"分析时出错：{str(e)}",
                "similar_questions": [],
                "related_resources": []
            }


_assistant_service = None
_photo_search_service = None
_chinese_service = None
_math_service = None
_english_service = None
_physics_service = None
_chemistry_service = None
_biology_service = None
_geography_service = None
_history_service = None
_politics_service = None

def get_deepseek_service() -> DeepSeekService:
    global _assistant_service
    if _assistant_service is None:
        _assistant_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_ASSISTANT",
            system_prompt=ASSISTANT_SYSTEM_PROMPT
        )
    return _assistant_service

def get_photo_search_service() -> DeepSeekService:
    global _photo_search_service
    if _photo_search_service is None:
        _photo_search_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_PHOTO_SEARCH",
            system_prompt=PHOTO_SEARCH_SYSTEM_PROMPT
        )
    return _photo_search_service

def get_chinese_service() -> DeepSeekService:
    global _chinese_service
    if _chinese_service is None:
        _chinese_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_CHINESE",
            system_prompt=CHINESE_SYSTEM_PROMPT
        )
    return _chinese_service

def get_math_service() -> DeepSeekService:
    global _math_service
    if _math_service is None:
        _math_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_MATH",
            system_prompt=MATH_SYSTEM_PROMPT
        )
    return _math_service

def get_english_service() -> DeepSeekService:
    global _english_service
    if _english_service is None:
        _english_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_ENGLISH",
            system_prompt=ENGLISH_SYSTEM_PROMPT
        )
    return _english_service

def get_physics_service() -> DeepSeekService:
    global _physics_service
    if _physics_service is None:
        _physics_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_PHYSICS",
            system_prompt=PHYSICS_SYSTEM_PROMPT
        )
    return _physics_service

def get_chemistry_service() -> DeepSeekService:
    global _chemistry_service
    if _chemistry_service is None:
        _chemistry_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_CHEMISTRY",
            system_prompt=CHEMISTRY_SYSTEM_PROMPT
        )
    return _chemistry_service

def get_biology_service() -> DeepSeekService:
    global _biology_service
    if _biology_service is None:
        _biology_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_BIOLOGY",
            system_prompt=BIOLOGY_SYSTEM_PROMPT
        )
    return _biology_service

def get_geography_service() -> DeepSeekService:
    global _geography_service
    if _geography_service is None:
        _geography_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_GEOGRAPHY",
            system_prompt=GEOGRAPHY_SYSTEM_PROMPT
        )
    return _geography_service

def get_history_service() -> DeepSeekService:
    global _history_service
    if _history_service is None:
        _history_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_HISTORY",
            system_prompt=HISTORY_SYSTEM_PROMPT
        )
    return _history_service

def get_politics_service() -> DeepSeekService:
    global _politics_service
    if _politics_service is None:
        _politics_service = DeepSeekService(
            api_key_env="DEEPSEEK_API_KEY_POLITICS",
            system_prompt=POLITICS_SYSTEM_PROMPT
        )
    return _politics_service

SUBJECT_SERVICE_MAP = {
    "chinese": get_chinese_service,
    "math": get_math_service,
    "english": get_english_service,
    "physics": get_physics_service,
    "chemistry": get_chemistry_service,
    "biology": get_biology_service,
    "geography": get_geography_service,
    "history": get_history_service,
    "politics": get_politics_service
}

def get_subject_service(subject: str) -> DeepSeekService:
    subject = subject.lower()
    if subject in SUBJECT_SERVICE_MAP:
        return SUBJECT_SERVICE_MAP[subject]()
    return get_deepseek_service()
