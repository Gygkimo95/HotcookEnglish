// AI 服务层 - 处理与 Gemini API 的通信

import { API_CONFIG, isApiConfigured } from './config';
import { 
  ENGLISH_TUTOR_SYSTEM_PROMPT, 
  LEARNING_REPORT_SYSTEM_PROMPT,
} from './prompts';

/**
 * 将聊天历史转换为 Gemini API 格式
 */
function formatMessagesForGemini(chatHistory, systemPrompt, userMessage) {
  const contents = [];
  
  // Gemini 使用 system_instruction 而不是 system role
  // 添加历史消息
  chatHistory.forEach(msg => {
    contents.push({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  });
  
  // 添加当前用户消息
  if (userMessage) {
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
  }
  
  return contents;
}

/**
 * 调用 Gemini API
 */
async function callGeminiAPI(contents, systemInstruction, options = {}) {
  if (!isApiConfigured()) {
    throw new Error('API 未配置。请在 .env 文件中设置 VITE_GEMINI_API_KEY。');
  }

  const model = options.model || API_CONFIG.model;
  const url = `${API_CONFIG.baseUrl}/models/${model}:generateContent?key=${API_CONFIG.apiKey}`;

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 1000,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  
  // 提取 Gemini 响应文本
  const candidate = data.candidates?.[0];
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error('API 响应格式错误');
  }
  
  return candidate.content.parts[0].text;
}

/**
 * 获取 AI 英语导师的回复
 */
export async function getAIResponse(chatHistory, userMessage) {
  const contents = formatMessagesForGemini(chatHistory, ENGLISH_TUTOR_SYSTEM_PROMPT, userMessage);

  return await callGeminiAPI(contents, ENGLISH_TUTOR_SYSTEM_PROMPT, {
    temperature: 0.7,
    maxTokens: 2048,
  });
}

/**
 * 生成学习报告
 */
export async function generateLearningReport(chatHistory) {
  if (chatHistory.length === 0) {
    return null;
  }

  const conversationSummary = chatHistory
    .map(msg => `${msg.type === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
    .join('\n');

  const contents = [
    { 
      role: 'user',
      parts: [{ 
        text: `Please analyze this English learning conversation and generate a learning report:\n\n${conversationSummary}`
      }]
    }
  ];

  const response = await callGeminiAPI(contents, LEARNING_REPORT_SYSTEM_PROMPT, {
    temperature: 0.3,
    maxTokens: 4096,
  });

  try {
    // 尝试解析 JSON 响应
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const report = JSON.parse(jsonMatch[0]);
      return {
        ...report,
        totalMessages: chatHistory.length,
        duration: calculateDuration(chatHistory),
      };
    }
    throw new Error('Invalid JSON response');
  } catch (e) {
    console.error('Failed to parse learning report:', e);
    // 返回基本报告结构
    return {
      topic: '英语对话练习',
      topicEnglish: 'English Conversation Practice',
      improvements: [],
      keywords: extractBasicKeywords(chatHistory),
      strengths: ['积极参与对话'],
      areasToImprove: ['继续多加练习'],
      overallScore: 75,
      totalMessages: chatHistory.length,
      duration: calculateDuration(chatHistory),
    };
  }
}

/**
 * 计算对话时长
 */
function calculateDuration(chatHistory) {
  if (chatHistory.length < 2) return '1分钟';
  
  const firstTime = parseTimeString(chatHistory[0].timestamp);
  const lastTime = parseTimeString(chatHistory[chatHistory.length - 1].timestamp);
  
  if (!firstTime || !lastTime) return '几分钟';
  
  const diffMinutes = Math.round((lastTime - firstTime) / 60000);
  return diffMinutes <= 0 ? '1分钟' : `${diffMinutes}分钟`;
}

/**
 * 解析时间字符串
 */
function parseTimeString(timeStr) {
  try {
    const today = new Date().toDateString();
    return new Date(`${today} ${timeStr}`);
  } catch {
    return null;
  }
}

/**
 * 提取基本关键词（备用方案）
 */
function extractBasicKeywords(chatHistory) {
  const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of',
    'in', 'for', 'on', 'with', 'at', 'by', 'from', 'or', 'and', 'but', 'if', 'then',
    'so', 'than', 'too', 'very', 'just', 'only', 'also', 'not', 'no', 'yes', 'it',
    'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our',
    'their', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose',
    'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'as', 'me', 'him', 'them', 'us']);

  const words = chatHistory
    .filter(msg => msg.type === 'ai')
    .map(msg => msg.content.toLowerCase())
    .join(' ')
    .match(/\b[a-z]{4,}\b/g) || [];

  const wordCount = {};
  words.forEach(word => {
    if (!commonWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => ({
      word,
      chinese: '（请查阅词典）',
      example: `Example with "${word}".`,
      translation: '例句翻译',
      difficulty: 'medium'
    }));
}

/**
 * 检查 API 配置状态
 */
export { isApiConfigured };
