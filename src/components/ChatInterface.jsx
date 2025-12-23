import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, User, AlertCircle, Settings, X, Sparkles, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIResponse, isApiConfigured } from '../services/aiService';

// 可爱的 AI 头像组件 - 热炒主题
const CuteAvatar = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-20 h-20'
  };
  
  const sparkleSize = {
    sm: 'w-2.5 h-2.5 -top-0.5 -right-0.5',
    md: 'w-3 h-3 -top-1 -right-1',
    lg: 'w-5 h-5 -top-1 -right-1'
  };
  
  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        {/* 脸 */}
        <circle cx="50" cy="50" r="45" fill="url(#faceGradient)" />
        {/* 腮红 */}
        <ellipse cx="25" cy="58" rx="10" ry="6" fill="#FECACA" opacity="0.7" />
        <ellipse cx="75" cy="58" rx="10" ry="6" fill="#FECACA" opacity="0.7" />
        {/* 眼睛 */}
        <ellipse cx="35" cy="45" rx="8" ry="10" fill="#1F2937" />
        <ellipse cx="65" cy="45" rx="8" ry="10" fill="#1F2937" />
        {/* 眼睛高光 */}
        <circle cx="38" cy="42" r="3" fill="white" />
        <circle cx="68" cy="42" r="3" fill="white" />
        <circle cx="36" cy="44" r="1.5" fill="white" opacity="0.5" />
        <circle cx="66" cy="44" r="1.5" fill="white" opacity="0.5" />
        {/* 微笑 */}
        <path d="M 35 65 Q 50 78 65 65" stroke="#1F2937" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* 渐变定义 - 暖橙色 */}
        <defs>
          <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="50%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
      {/* 火焰效果 */}
      <div className={`absolute ${sparkleSize[size]}`}>
        <span className="text-sm">🔥</span>
      </div>
    </div>
  );
};

// 用户头像组件
const UserAvatar = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
      <User className="h-4 w-4 text-white" />
    </div>
  );
};

const ChatInterface = ({ chatHistory, setChatHistory, onEndConversation }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // 检查 API 配置状态
  const apiReady = isApiConfigured();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponseText = await getAIResponse(chatHistory, currentInput);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI response error:', err);
      setError(err.message || '获取 AI 回复时出错，请重试。');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I encountered an error. Please try again or check your API configuration.",
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = async () => {
    onEndConversation(chatHistory);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(prev => prev + ' ' + transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } else {
        alert('您的浏览器不支持语音识别功能');
        setIsRecording(false);
      }
    }
  };

  const handleSaveApiKey = () => {
    if (tempApiKey) {
      window.__TEMP_API_KEY__ = tempApiKey;
      setShowApiConfig(false);
      setError(null);
    }
  };

  // 消息气泡动画
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 40 }
    }
  };

  return (
    <div className="relative h-[650px] flex flex-col">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 rounded-3xl" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-100/40 to-blue-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* 主容器 */}
      <div className="relative flex flex-col h-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white/80 overflow-hidden">
        
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-100/80 bg-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <CuteAvatar size="md" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">热炒老师</h2>
                <p className="text-xs text-gray-500">在线 · 随时为你服务</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!apiReady && (
                <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full font-medium">
                  需配置 API
                </span>
              )}
              <button
                onClick={() => setShowApiConfig(!showApiConfig)}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  showApiConfig 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="API 设置"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleEndConversation}
                disabled={chatHistory.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                结束对话
              </button>
            </div>
          </div>

          {/* API 配置面板 */}
          <AnimatePresence>
            {showApiConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">
                    临时设置 Gemini API Key（刷新后失效）
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="输入您的 API Key"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                    <button
                      onClick={handleSaveApiKey}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                    >
                      保存
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mt-3 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center"
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 ml-2 flex-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-red-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth">
          {chatHistory.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center px-4"
            >
              <CuteAvatar size="lg" className="mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">嗨！我是热炒老师 🔥</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                我是你的 AI 英语导师，随时准备帮助你提升英语表达能力。用英语和我聊聊天吧！
              </p>
              
              {!apiReady ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 max-w-sm border border-amber-100">
                  <p className="text-amber-700 text-sm font-medium mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    请先配置 API Key
                  </p>
                  <p className="text-amber-600 text-xs mb-3">
                    点击右上角设置按钮，或创建 .env 文件：
                  </p>
                  <code className="block bg-white/80 p-3 rounded-xl text-xs text-amber-800 font-mono">
                    VITE_GEMINI_API_KEY=your-key
                  </code>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {['Hello!', 'How are you?', "Let's practice!"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 text-sm rounded-full border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {chatHistory.map((message, index) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] lg:max-w-[70%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {/* Avatar */}
                    {message.type === 'ai' && (
                      message.isError ? (
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <CuteAvatar size="sm" className="flex-shrink-0" />
                      )
                    )}
                    {message.type === 'user' && (
                      <UserAvatar size="sm" />
                    )}
                    
                    {/* Bubble */}
                    <div className={`group relative ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-blue-500/20'
                        : message.isError 
                          ? 'bg-red-50 text-red-700 rounded-2xl rounded-bl-md border border-red-100'
                          : 'bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                    } px-4 py-3`}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-[11px] mt-1.5 ${
                        message.type === 'user' 
                          ? 'text-blue-200' 
                          : 'text-gray-400'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="flex items-end gap-2">
                  <CuteAvatar size="sm" className="flex-shrink-0" />
                  <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-1.5">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100/80">
          <div className="flex items-center gap-3">
            {/* Voice Button */}
            <button
              onClick={toggleRecording}
              className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
              title={isRecording ? '停止录音' : '语音输入'}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            {/* Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Type your message in English..."
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                disabled={isLoading}
              />
              {inputMessage && (
                <button
                  onClick={() => setInputMessage('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="flex-shrink-0 p-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 group"
            >
              <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          
          {/* Quick Tips */}
          <div className="flex items-center justify-center mt-3 space-x-1 text-xs text-gray-400">
            <Sparkles className="h-3 w-3" />
            <span>按 Enter 发送 · 用英语和我对话，我会帮你纠正表达</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
