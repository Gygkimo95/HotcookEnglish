import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import LearningReport from '../components/LearningReport';
import VocabularyCards from '../components/VocabularyCards';
import { MessageCircle, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { generateLearningReport } from '../services/aiService';
import { addVocabulary, getTodayReviewCount, getVocabularyStats } from '../services/vocabularyService';

const Index = () => {
  const [currentPhase, setCurrentPhase] = useState('chat'); // 'chat', 'report', 'cards'
  const [chatHistory, setChatHistory] = useState([]);
  const [learningReport, setLearningReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [dueReviewCount, setDueReviewCount] = useState(0);
  const [vocabStats, setVocabStats] = useState({ total: 0 });

  // 加载词汇统计
  useEffect(() => {
    updateVocabStats();
  }, [currentPhase]);

  const updateVocabStats = () => {
    const count = getTodayReviewCount();
    const stats = getVocabularyStats();
    setDueReviewCount(count);
    setVocabStats(stats);
  };

  const handleEndConversation = async (history) => {
    if (history.length === 0) {
      return;
    }

    setIsGeneratingReport(true);
    setCurrentPhase('report');

    try {
      const report = await generateLearningReport(history);
      setLearningReport(report);
      
      // 自动将新词汇添加到词库
      if (report.keywords && report.keywords.length > 0) {
        const addedCount = addVocabulary(report.keywords.map(k => ({
          ...k,
          source: 'conversation'
        })));
        if (addedCount > 0) {
          console.log(`Added ${addedCount} new words to vocabulary`);
        }
        updateVocabStats();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      setLearningReport({
        topic: '英语对话练习',
        topicEnglish: 'English Conversation Practice',
        improvements: [],
        keywords: [],
        strengths: ['积极参与对话练习'],
        areasToImprove: ['继续保持练习'],
        overallScore: 70,
        totalMessages: history.length,
        duration: '几分钟',
        error: '报告生成遇到问题，显示基本信息'
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleStartNewConversation = () => {
    setChatHistory([]);
    setLearningReport(null);
    setCurrentPhase('chat');
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'chat':
        return (
          <ChatInterface 
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            onEndConversation={handleEndConversation}
          />
        );
      case 'report':
        return (
          <>
            {isGeneratingReport ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <Loader2 className="h-16 w-16 mx-auto text-orange-500 mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">正在生成学习报告</h2>
                <p className="text-gray-600">AI 正在分析您的对话内容...</p>
              </div>
            ) : (
              <LearningReport 
                report={learningReport}
                onStartCards={() => setCurrentPhase('cards')}
                onNewConversation={handleStartNewConversation}
              />
            )}
          </>
        );
      case 'cards':
        return (
          <VocabularyCards 
            onNewConversation={handleStartNewConversation}
            onStatsUpdate={updateVocabStats}
          />
        );
      default:
        return null;
    }
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'chat': return <MessageCircle className="h-5 w-5" />;
      case 'report': return <BookOpen className="h-5 w-5" />;
      case 'cards': return <Sparkles className="h-5 w-5" />;
      default: return null;
    }
  };

  const getPhaseTitle = (phase) => {
    switch (phase) {
      case 'chat': return '英语对话';
      case 'report': return '学习报告';
      case 'cards': return '词汇复习';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/80 relative overflow-x-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-2">
            🔥 热炒英语
          </h1>
          <p className="text-lg text-gray-500">与 AI 导师对话，提升英语表达能力</p>
        </div>

        {/* Phase Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg shadow-gray-200/50 p-1.5 flex space-x-1 border border-white/80">
            {['chat', 'report', 'cards'].map((phase) => (
              <button
                key={phase}
                onClick={() => {
                  if (!isGeneratingReport) {
                    setCurrentPhase(phase);
                  }
                }}
                disabled={isGeneratingReport}
                className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                  currentPhase === phase
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-gray-600 hover:bg-gray-100/80'
                } ${isGeneratingReport ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {getPhaseIcon(phase)}
                <span className="font-medium">{getPhaseTitle(phase)}</span>
                
                {/* 词汇卡片的待复习数量徽章 */}
                {phase === 'cards' && dueReviewCount > 0 && currentPhase !== 'cards' && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5 animate-pulse">
                    {dueReviewCount > 99 ? '99+' : dueReviewCount}
                  </span>
                )}
                
                {/* 词汇总数提示 */}
                {phase === 'cards' && vocabStats.total > 0 && currentPhase !== 'cards' && dueReviewCount === 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center bg-gray-400 text-white text-xs font-bold rounded-full px-1.5">
                    {vocabStats.total}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Phase Content */}
        <div className="max-w-4xl mx-auto pb-8">
          {renderPhaseContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
