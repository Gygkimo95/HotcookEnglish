import React, { useState, useEffect, useMemo } from 'react';
import { 
  RotateCcw, Check, X, ArrowLeft, ArrowRight, Volume2, 
  AlertCircle, Sparkles, Plus, Trash2, Clock, Award,
  BookOpen, TrendingUp, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllVocabulary,
  getWordsToReview,
  updateVocabularyReview,
  deleteVocabulary,
  addSingleWord,
  getVocabularyStats,
  getLevelDescription,
  getNextReviewDescription
} from '../services/vocabularyService';

// 可爱的学习头像
const CuteStudyAvatar = ({ mood = 'normal' }) => {
  const gradients = {
    normal: { start: '#6EE7B7', mid: '#34D399', end: '#10B981' },
    happy: { start: '#FCD34D', mid: '#FBBF24', end: '#F59E0B' },
    thinking: { start: '#C4B5FD', mid: '#A78BFA', end: '#8B5CF6' }
  };
  const g = gradients[mood];
  
  return (
    <div className="w-16 h-16 relative mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <defs>
          <linearGradient id={`studyFace-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={g.start} />
            <stop offset="50%" stopColor={g.mid} />
            <stop offset="100%" stopColor={g.end} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill={`url(#studyFace-${mood})`} />
        <ellipse cx="25" cy="58" rx="10" ry="6" fill="#FFB5BA" opacity="0.6" />
        <ellipse cx="75" cy="58" rx="10" ry="6" fill="#FFB5BA" opacity="0.6" />
        {mood === 'happy' ? (
          <>
            <path d="M 28 45 Q 35 38 42 45" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 58 45 Q 65 38 72 45" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 30 62 Q 50 82 70 62" stroke="#2D3748" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="35" cy="45" rx="8" ry="10" fill="#2D3748" />
            <ellipse cx="65" cy="45" rx="8" ry="10" fill="#2D3748" />
            <circle cx="38" cy="42" r="3" fill="white" />
            <circle cx="68" cy="42" r="3" fill="white" />
            <path d="M 38 68 Q 50 72 62 68" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div className="absolute -top-1 -right-1 w-5 h-5">
        <Sparkles className="w-full h-full text-yellow-400" />
      </div>
    </div>
  );
};

const VocabularyCards = ({ onNewConversation, onStatsUpdate }) => {
  const [vocabulary, setVocabulary] = useState([]);
  const [wordsToReview, setWordsToReview] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [viewMode, setViewMode] = useState('review'); // 'review', 'all', 'add'
  const [stats, setStats] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newWord, setNewWord] = useState({ word: '', chinese: '', example: '' });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allWords = getAllVocabulary();
    const dueWords = getWordsToReview();
    const vocabStats = getVocabularyStats();
    
    setVocabulary(allWords);
    setWordsToReview(dueWords);
    setStats(vocabStats);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    
    if (onStatsUpdate) onStatsUpdate();
  };

  // 朗读功能
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 处理回答
  const handleAnswer = (isCorrect) => {
    const currentWord = wordsToReview[currentCardIndex];
    if (!currentWord) return;

    updateVocabularyReview(currentWord.id, isCorrect);
    
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    setShowAnswer(false);
    
    if (currentCardIndex < wordsToReview.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // 完成本轮复习
      loadData();
    }
  };

  // 删除词汇
  const handleDelete = (wordId) => {
    deleteVocabulary(wordId);
    loadData();
    setShowDeleteConfirm(null);
  };

  // 添加新词汇
  const handleAddWord = () => {
    if (!newWord.word.trim()) return;
    
    addSingleWord({
      word: newWord.word.trim(),
      chinese: newWord.chinese.trim() || '（待补充）',
      example: newWord.example.trim(),
      difficulty: 'medium'
    });
    
    setNewWord({ word: '', chinese: '', example: '' });
    loadData();
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  // 获取等级颜色
  const getLevelColor = (level) => {
    if (level >= 5) return 'bg-green-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 1) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  // 空状态
  if (vocabulary.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <CuteStudyAvatar mood="thinking" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-4">词库是空的</h2>
        <p className="text-gray-600 mb-6">完成对话后，新词汇会自动添加到词库中</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNewConversation}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            开始对话学习
          </button>
          <button
            onClick={() => setViewMode('add')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            手动添加词汇
          </button>
        </div>
        
        {/* 添加词汇表单 */}
        {viewMode === 'add' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gray-50 rounded-xl p-6 text-left"
          >
            <h3 className="font-semibold text-gray-800 mb-4">添加新词汇</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="英文单词"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <input
                type="text"
                placeholder="中文含义"
                value={newWord.chinese}
                onChange={(e) => setNewWord({ ...newWord, chinese: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <input
                type="text"
                placeholder="例句（可选）"
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                onClick={handleAddWord}
                disabled={!newWord.word.trim()}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                添加到词库
              </button>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // 复习完成状态
  if (viewMode === 'review' && wordsToReview.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
            <BookOpen className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-500">总词汇</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
            <Award className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.mastered}</div>
            <div className="text-sm text-gray-500">已掌握</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 text-center">
            <TrendingUp className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.learning}</div>
            <div className="text-sm text-gray-500">学习中</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
            <Sparkles className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.accuracy}%</div>
            <div className="text-sm text-gray-500">正确率</div>
          </div>
        </div>

        <div className="text-center">
          <CuteStudyAvatar mood="happy" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-4">🎉 今日复习完成！</h2>
          <p className="text-gray-600 mb-6">所有待复习的词汇都已完成，继续保持！</p>
          
          {sessionStats.correct + sessionStats.incorrect > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block">
              <p className="text-gray-600">
                本次复习：
                <span className="text-green-600 font-bold ml-2">{sessionStats.correct} 正确</span>
                <span className="text-red-500 font-bold ml-2">{sessionStats.incorrect} 错误</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setViewMode('all')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            查看全部词汇
          </button>
          <button
            onClick={onNewConversation}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            继续对话学习
          </button>
        </div>
      </div>
    );
  }

  // 全部词汇列表视图
  if (viewMode === 'all') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">全部词汇 ({vocabulary.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('add')}
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={() => { setViewMode('review'); loadData(); }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium text-sm"
            >
              开始复习
            </button>
          </div>
        </div>

        {/* 添加词汇表单 */}
        <AnimatePresence>
          {viewMode === 'add' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="英文单词"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <input
                    type="text"
                    placeholder="中文含义"
                    value={newWord.chinese}
                    onChange={(e) => setNewWord({ ...newWord, chinese: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <input
                    type="text"
                    placeholder="例句（可选）"
                    value={newWord.example}
                    onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    onClick={handleAddWord}
                    disabled={!newWord.word.trim()}
                    className="py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    添加
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 词汇列表 */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {vocabulary.map((word) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800 text-lg">{word.word}</span>
                    <button onClick={() => speak(word.word)} className="text-gray-400 hover:text-blue-500">
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(word.difficulty)}`}>
                      {word.difficulty === 'easy' ? '简单' : word.difficulty === 'hard' ? '困难' : '中等'}
                    </span>
                  </div>
                  <p className="text-gray-600">{word.chinese}</p>
                  {word.example && (
                    <p className="text-sm text-gray-500 mt-1 italic">"{word.example}"</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getLevelColor(word.level)}`} />
                      {getLevelDescription(word.level)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getNextReviewDescription(word.nextReviewTime)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(word.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* 删除确认 */}
              {showDeleteConfirm === word.id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-end gap-2"
                >
                  <span className="text-sm text-gray-500">确认删除？</span>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleDelete(word.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    删除
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // 复习卡片视图
  const currentWord = wordsToReview[currentCardIndex];
  const progress = ((currentCardIndex + 1) / wordsToReview.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">词汇复习</h2>
          <p className="text-sm text-gray-500">{wordsToReview.length} 个词汇待复习</p>
        </div>
        <button
          onClick={() => setViewMode('all')}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          查看全部
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            进度: {currentCardIndex + 1} / {wordsToReview.length}
          </span>
          <span className="text-sm text-gray-600">
            本次: {sessionStats.correct} 正确 / {sessionStats.incorrect} 错误
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card */}
      <motion.div
        key={currentWord?.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-8 min-h-[320px] flex flex-col justify-center mb-6"
      >
        <div className="text-center">
          {/* 难度和等级 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(currentWord?.difficulty)}`}>
              {currentWord?.difficulty === 'easy' ? '简单' : currentWord?.difficulty === 'hard' ? '困难' : '中等'}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {getLevelDescription(currentWord?.level || 0)}
            </span>
          </div>
          
          {/* 单词 */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <h3 className="text-4xl font-bold text-gray-800">{currentWord?.word}</h3>
            <button 
              onClick={() => speak(currentWord?.word)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
            >
              <Volume2 className="h-6 w-6" />
            </button>
          </div>
          
          {currentWord?.phonetic && (
            <p className="text-gray-500 mb-4">{currentWord.phonetic}</p>
          )}
          
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              显示答案
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-4"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xl font-medium text-gray-800 mb-2">{currentWord?.chinese}</p>
                {currentWord?.example && (
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-gray-600 italic">"{currentWord.example}"</p>
                    <button 
                      onClick={() => speak(currentWord.example)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {currentWord?.translation && (
                  <p className="text-sm text-gray-500 mt-1">{currentWord.translation}</p>
                )}
                {currentWord?.tips && (
                  <p className="text-sm text-blue-600 mt-2 bg-blue-50 rounded-lg p-2">💡 {currentWord.tips}</p>
                )}
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                  不认识
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  <Check className="h-5 w-5" />
                  认识
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            if (currentCardIndex > 0) {
              setCurrentCardIndex(currentCardIndex - 1);
              setShowAnswer(false);
            }
          }}
          disabled={currentCardIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          上一个
        </button>

        <button
          onClick={() => {
            setSessionStats({ correct: 0, incorrect: 0 });
            loadData();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          重新开始
        </button>

        <button
          onClick={() => {
            if (currentCardIndex < wordsToReview.length - 1) {
              setCurrentCardIndex(currentCardIndex + 1);
              setShowAnswer(false);
            }
          }}
          disabled={currentCardIndex === wordsToReview.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一个
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default VocabularyCards;
