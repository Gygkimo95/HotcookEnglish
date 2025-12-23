import React, { useState } from 'react';
import { 
  BookOpen, TrendingUp, Star, ArrowRight, RefreshCw, Award, Target, 
  AlertCircle, CheckCircle, XCircle, Lightbulb, Volume2, ChevronDown,
  ChevronUp, Sparkles, MessageSquare, Zap, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as htmlToImage from 'html-to-image';

// 可爱的头像组件 - 清新可爱风格
const CuteReportAvatar = () => (
  <div className="w-14 h-14 relative">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* 渐变定义 */}
      <defs>
        <linearGradient id="cuteFaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      {/* 脸 */}
      <circle cx="50" cy="50" r="45" fill="url(#cuteFaceGradient)" />
      {/* 腮红 */}
      <ellipse cx="22" cy="55" rx="8" ry="5" fill="#FECACA" opacity="0.7" />
      <ellipse cx="78" cy="55" rx="8" ry="5" fill="#FECACA" opacity="0.7" />
      {/* 眼睛 */}
      <ellipse cx="35" cy="45" rx="5" ry="7" fill="#1F2937" />
      <ellipse cx="65" cy="45" rx="5" ry="7" fill="#1F2937" />
      {/* 眼睛高光 */}
      <circle cx="37" cy="43" r="2" fill="white" />
      <circle cx="67" cy="43" r="2" fill="white" />
      {/* 微笑 */}
      <path d="M 38 62 Q 50 72 62 62" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
    {/* 小星星装饰 */}
    <div className="absolute -top-1 -right-1">
      <Sparkles className="w-4 h-4 text-amber-400" />
    </div>
  </div>
);

const LearningReport = ({ report, onStartCards, onNewConversation }) => {
  const [expandedSections, setExpandedSections] = useState({
    improvements: true,
    grammar: false,
    keywords: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 朗读功能
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 导出报告为图片
  const exportReport = async () => {
    const element = document.getElementById('learning-report');
    if (element) {
      try {
        const dataUrl = await htmlToImage.toPng(element, {
          quality: 1,
          backgroundColor: '#f3f4f6'
        });
        const link = document.createElement('a');
        link.download = `学习报告_${new Date().toLocaleDateString()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Export failed:', err);
      }
    }
  };

  if (!report) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* 提示头像 */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="promptFaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#FCD34D" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#promptFaceGradient)" />
            <ellipse cx="22" cy="55" rx="8" ry="5" fill="#FECACA" opacity="0.6" />
            <ellipse cx="78" cy="55" rx="8" ry="5" fill="#FECACA" opacity="0.6" />
            {/* 疑问的眼睛 */}
            <ellipse cx="35" cy="45" rx="6" ry="8" fill="#1F2937" />
            <ellipse cx="65" cy="45" rx="6" ry="8" fill="#1F2937" />
            <circle cx="37" cy="43" r="2" fill="white" />
            <circle cx="67" cy="43" r="2" fill="white" />
            {/* 小嘴 */}
            <circle cx="50" cy="65" r="5" fill="#1F2937" />
          </svg>
          <div className="absolute -top-1 -right-1 text-xl">❓</div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-3">还没有学习报告</h2>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          先和热炒老师进行一段英语对话吧！<br/>
          结束对话后会自动生成专属学习报告 📝
        </p>
        
        <button
          onClick={onNewConversation}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all inline-flex items-center"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          开始对话学习
        </button>
      </div>
    );
  }

  const scores = report.scores || { grammar: 75, vocabulary: 75, fluency: 75, overall: report.overallScore || 75 };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return '优秀 Excellent';
    if (score >= 80) return '良好 Good';
    if (score >= 70) return '中等 Fair';
    if (score >= 60) return '及格 Pass';
    return '需努力 Keep Going';
  };

  const getGrammarStatusIcon = (status) => {
    switch (status) {
      case 'correct': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'needs_work': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  // 圆形进度条组件 - 清新可爱风格
  const CircularProgress = ({ score, label, size = 100, color = 'orange' }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const colorMap = {
      rose: { stroke: '#FB7185', bg: '#FFF1F2', text: 'text-rose-500' },
      orange: { stroke: '#FB923C', bg: '#FFF7ED', text: 'text-orange-500' },
      amber: { stroke: '#FBBF24', bg: '#FFFBEB', text: 'text-amber-500' },
      emerald: { stroke: '#34D399', bg: '#ECFDF5', text: 'text-emerald-500' },
      sky: { stroke: '#38BDF8', bg: '#F0F9FF', text: 'text-sky-500' },
    };

    const colors = colorMap[color] || colorMap.orange;

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle
              stroke={colors.bg}
              strokeWidth="6"
              fill="white"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              stroke={colors.stroke}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-base font-bold ${colors.text}`}>{score}</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 mt-1.5 font-medium">{label}</span>
      </div>
    );
  };

  return (
    <div id="learning-report" className="space-y-6">
      {/* Header Card - 清新可爱风格 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl shadow-lg shadow-amber-100/50 p-6 overflow-hidden relative border border-amber-100/50"
      >
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/40 to-orange-200/40 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-200/40 to-yellow-200/40 rounded-full blur-2xl" />
        
        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <CuteReportAvatar />
            <div>
              <h2 className="text-xl font-bold text-gray-800">学习报告</h2>
              <p className="text-amber-600/70 text-sm">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <button
            onClick={exportReport}
            className="bg-white/70 hover:bg-white p-2.5 rounded-xl transition-colors border border-amber-200/50 text-amber-600 hover:text-amber-700 shadow-sm"
            title="导出报告"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

        {/* Overall Score */}
        <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold mb-1 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {scores.overall}
              </div>
              <div className="text-base text-amber-700/80 font-medium">{getScoreLabel(scores.overall)}</div>
            </div>
            <div className="flex gap-4">
              <CircularProgress score={scores.grammar} label="语法" size={72} color="rose" />
              <CircularProgress score={scores.vocabulary} label="词汇" size={72} color="orange" />
              <CircularProgress score={scores.fluency} label="流利度" size={72} color="amber" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Notice */}
      {report.error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-700 text-sm">{report.error}</p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-blue-500">
          <MessageSquare className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{report.totalMessages}</div>
          <div className="text-sm text-gray-600">对话消息</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-green-500">
          <BookOpen className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{report.keywords?.length || 0}</div>
          <div className="text-sm text-gray-600">核心词汇</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-purple-500">
          <Zap className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{report.duration}</div>
          <div className="text-sm text-gray-600">学习时长</div>
        </div>
      </motion.div>

      {/* Summary & Topic */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          学习总结
        </h3>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4">
          <p className="text-gray-800 font-medium">{report.topic}</p>
          {report.topicEnglish && (
            <p className="text-sm text-gray-600 mt-1 italic">{report.topicEnglish}</p>
          )}
        </div>
        {report.summary && (
          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
        )}
        {report.encouragement && (
          <div className="mt-4 flex items-start space-x-2 bg-blue-50 rounded-lg p-3">
            <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700 text-sm">{report.encouragement}</p>
      </div>
        )}
      </motion.div>

      {/* Strengths & Areas to Improve */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Strengths */}
        {report.strengths && report.strengths.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Award className="h-5 w-5 text-green-500 mr-2" />
              做得好的方面
        </h3>
            <div className="space-y-3">
              {report.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-3 bg-green-50 rounded-lg p-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    {typeof strength === 'object' ? (
                      <>
                        <p className="font-medium text-gray-800">{strength.title}</p>
                        <p className="text-sm text-gray-600">{strength.description}</p>
                      </>
                    ) : (
                      <p className="text-gray-700">{strength}</p>
                    )}
                  </div>
                </div>
              ))}
              </div>
              </div>
        )}

        {/* Areas to Improve */}
        {report.areasToImprove && report.areasToImprove.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Target className="h-5 w-5 text-orange-500 mr-2" />
              可以改进的方面
            </h3>
            <div className="space-y-3">
              {report.areasToImprove.map((area, index) => (
                <div key={index} className={`flex items-start space-x-3 rounded-lg p-3 border ${
                  typeof area === 'object' ? getPriorityColor(area.priority) : 'bg-orange-50 border-orange-200'
                }`}>
                  <Target className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-70" />
              <div>
                    {typeof area === 'object' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{area.title}</p>
                          {area.priority && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              area.priority === 'high' ? 'bg-red-200 text-red-800' :
                              area.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-green-200 text-green-800'
                            }`}>
                              {area.priority === 'high' ? '重要' : area.priority === 'medium' ? '中等' : '建议'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm opacity-80">{area.description}</p>
                      </>
                    ) : (
                      <p>{area}</p>
                    )}
              </div>
            </div>
          ))}
        </div>
      </div>
        )}
      </motion.div>

      {/* Improvements Section */}
      {report.improvements && report.improvements.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <button
            onClick={() => toggleSection('improvements')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              表达改进建议
              <span className="ml-2 text-sm font-normal text-gray-500">({report.improvements.length})</span>
            </h3>
            {expandedSections.improvements ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
          
          <AnimatePresence>
            {expandedSections.improvements && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                <div className="space-y-4">
                  {report.improvements.map((improvement, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      {improvement.type && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                          improvement.type === 'grammar' ? 'bg-purple-100 text-purple-700' :
                          improvement.type === 'vocabulary' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {improvement.type === 'grammar' ? '语法' : 
                           improvement.type === 'vocabulary' ? '词汇' : '表达'}
                        </span>
                      )}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">原始表达</p>
                          <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                            <p className="text-gray-800">{improvement.original}</p>
                            <button onClick={() => speak(improvement.original)} className="text-gray-400 hover:text-blue-500 ml-2">
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">改进建议</p>
                          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                            <p className="text-gray-800 font-medium">{improvement.improved}</p>
                            <button onClick={() => speak(improvement.improved)} className="text-gray-400 hover:text-blue-500 ml-2">
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{improvement.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Grammar Points */}
      {report.grammarPoints && report.grammarPoints.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <button
            onClick={() => toggleSection('grammar')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <CheckCircle className="h-5 w-5 text-purple-500 mr-2" />
              语法要点分析
            </h3>
            {expandedSections.grammar ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
          
          <AnimatePresence>
            {expandedSections.grammar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                <div className="space-y-3">
                  {report.grammarPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getGrammarStatusIcon(point.status)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{point.point}</p>
                        <p className="text-sm text-gray-600">{point.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Keywords Section */}
      {report.keywords && report.keywords.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <button
            onClick={() => toggleSection('keywords')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
              核心词汇
              <span className="ml-2 text-sm font-normal text-gray-500">({report.keywords.length})</span>
        </h3>
            {expandedSections.keywords ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
          
          <AnimatePresence>
            {expandedSections.keywords && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.keywords.map((keyword, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-bold text-gray-800">{keyword.word || keyword}</h4>
                          <button onClick={() => speak(keyword.word || keyword)} className="text-gray-400 hover:text-blue-500">
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          keyword.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          keyword.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {keyword.difficulty === 'easy' ? '简单' : 
                           keyword.difficulty === 'hard' ? '困难' : '中等'}
                        </span>
                      </div>
                      
                      {keyword.phonetic && (
                        <p className="text-sm text-gray-500 mb-1">{keyword.phonetic}</p>
                      )}
                      {keyword.partOfSpeech && (
                        <p className="text-xs text-purple-600 mb-2">{keyword.partOfSpeech}</p>
                      )}
                      
                      <p className="text-gray-700 font-medium mb-2">{keyword.chinese || '（请查阅词典）'}</p>
                      
                      {keyword.example && (
                        <div className="bg-white rounded-lg p-2 mb-2 border border-gray-100">
                          <p className="text-sm text-gray-600 italic">"{keyword.example}"</p>
                          {keyword.translation && (
                            <p className="text-xs text-gray-500 mt-1">{keyword.translation}</p>
                          )}
                        </div>
                      )}
                      
                      {keyword.tips && (
                        <div className="flex items-start space-x-1 mt-2">
                          <Lightbulb className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-600">{keyword.tips}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Next Steps */}
      {report.nextSteps && report.nextSteps.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-indigo-500 mr-2" />
            下一步学习建议
          </h3>
          <div className="space-y-2">
            {report.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
            </span>
                <p className="text-gray-700">{step}</p>
              </div>
          ))}
        </div>
        </motion.div>
      )}

      {/* 词汇已保存提示 */}
      {report.keywords && report.keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center"
        >
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <p className="text-green-700 text-sm">
            <span className="font-medium">{report.keywords.length} 个新词汇</span> 已自动添加到你的词库，可随时复习！
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={onStartCards}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          前往词汇复习
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
        <button
          onClick={onNewConversation}
          className="flex-1 bg-white text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-md border border-gray-200 flex items-center justify-center"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          开始新对话
        </button>
      </motion.div>
    </div>
  );
};

export default LearningReport;
