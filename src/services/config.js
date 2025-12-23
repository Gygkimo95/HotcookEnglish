// API 配置
// 支持 Google Gemini API

// 获取 API Key（支持临时设置和环境变量）
const getApiKey = () => {
  // 优先使用临时设置的 Key（通过界面设置）
  if (typeof window !== 'undefined' && window.__TEMP_API_KEY__) {
    return window.__TEMP_API_KEY__;
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const API_CONFIG = {
  // Gemini API 基础 URL
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
  
  // API 密钥 - 使用 getter 以支持动态获取
  get apiKey() {
    return getApiKey();
  },
  
  // 模型名称
  model: import.meta.env.VITE_MODEL || 'gemini-2.0-flash',
  
  // 请求超时时间（毫秒）
  timeout: 30000,
};

// 检查 API 是否已配置
export const isApiConfigured = () => {
  return Boolean(getApiKey());
};
