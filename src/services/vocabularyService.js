// 词汇持久化存储服务
// 基于艾宾浩斯遗忘曲线的间隔重复系统

const STORAGE_KEY = 'english_tutor_vocabulary';

// 艾宾浩斯遗忘曲线复习间隔（以小时为单位）
// 第1次复习：20分钟后 (0.33h)
// 第2次复习：1小时后
// 第3次复习：9小时后
// 第4次复习：1天后 (24h)
// 第5次复习：2天后 (48h)
// 第6次复习：6天后 (144h)
// 第7次复习：31天后 (744h)
const REVIEW_INTERVALS = [0.33, 1, 9, 24, 48, 144, 744];

/**
 * 从 localStorage 获取所有词汇
 */
export function getAllVocabulary() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load vocabulary:', e);
    return [];
  }
}

/**
 * 保存词汇到 localStorage
 */
export function saveVocabulary(vocabulary) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabulary));
    return true;
  } catch (e) {
    console.error('Failed to save vocabulary:', e);
    return false;
  }
}

/**
 * 添加新词汇（去重）
 */
export function addVocabulary(newWords) {
  const existing = getAllVocabulary();
  const existingWords = new Set(existing.map(v => v.word.toLowerCase()));
  
  const wordsToAdd = newWords
    .filter(word => !existingWords.has((word.word || word).toLowerCase()))
    .map(word => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      word: word.word || word,
      phonetic: word.phonetic || '',
      partOfSpeech: word.partOfSpeech || '',
      chinese: word.chinese || '（请查阅词典）',
      example: word.example || '',
      translation: word.translation || '',
      difficulty: word.difficulty || 'medium',
      tips: word.tips || '',
      // 间隔重复相关字段
      level: 0, // 当前复习等级 (0-7)
      correctCount: 0, // 答对次数
      incorrectCount: 0, // 答错次数
      nextReviewTime: Date.now(), // 下次复习时间
      lastReviewTime: null, // 上次复习时间
      createdAt: Date.now(),
      source: word.source || 'conversation' // 来源：conversation, manual
    }));

  if (wordsToAdd.length > 0) {
    const updated = [...existing, ...wordsToAdd];
    saveVocabulary(updated);
    return wordsToAdd.length;
  }
  return 0;
}

/**
 * 更新词汇复习状态
 */
export function updateVocabularyReview(wordId, isCorrect) {
  const vocabulary = getAllVocabulary();
  const index = vocabulary.findIndex(v => v.id === wordId);
  
  if (index === -1) return null;
  
  const word = vocabulary[index];
  const now = Date.now();
  
  if (isCorrect) {
    // 答对：提升等级，延长复习间隔
    word.level = Math.min(word.level + 1, REVIEW_INTERVALS.length - 1);
    word.correctCount += 1;
  } else {
    // 答错：降低等级，缩短复习间隔
    word.level = Math.max(word.level - 1, 0);
    word.incorrectCount += 1;
  }
  
  // 计算下次复习时间
  const intervalHours = REVIEW_INTERVALS[word.level];
  word.nextReviewTime = now + intervalHours * 60 * 60 * 1000;
  word.lastReviewTime = now;
  
  vocabulary[index] = word;
  saveVocabulary(vocabulary);
  
  return word;
}

/**
 * 获取需要复习的词汇
 */
export function getWordsToReview() {
  const vocabulary = getAllVocabulary();
  const now = Date.now();
  
  return vocabulary
    .filter(word => word.nextReviewTime <= now)
    .sort((a, b) => a.nextReviewTime - b.nextReviewTime);
}

/**
 * 获取今日待复习数量
 */
export function getTodayReviewCount() {
  const vocabulary = getAllVocabulary();
  const now = Date.now();
  const todayEnd = new Date().setHours(23, 59, 59, 999);
  
  return vocabulary.filter(word => 
    word.nextReviewTime <= todayEnd
  ).length;
}

/**
 * 获取词汇统计
 */
export function getVocabularyStats() {
  const vocabulary = getAllVocabulary();
  const now = Date.now();
  
  const stats = {
    total: vocabulary.length,
    mastered: vocabulary.filter(v => v.level >= 5).length,
    learning: vocabulary.filter(v => v.level > 0 && v.level < 5).length,
    new: vocabulary.filter(v => v.level === 0).length,
    dueToday: vocabulary.filter(v => v.nextReviewTime <= now).length,
    totalCorrect: vocabulary.reduce((sum, v) => sum + v.correctCount, 0),
    totalIncorrect: vocabulary.reduce((sum, v) => sum + v.incorrectCount, 0),
  };
  
  stats.accuracy = stats.totalCorrect + stats.totalIncorrect > 0
    ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalIncorrect)) * 100)
    : 0;
    
  return stats;
}

/**
 * 删除词汇
 */
export function deleteVocabulary(wordId) {
  const vocabulary = getAllVocabulary();
  const filtered = vocabulary.filter(v => v.id !== wordId);
  saveVocabulary(filtered);
  return filtered;
}

/**
 * 手动添加单个词汇
 */
export function addSingleWord(wordData) {
  return addVocabulary([{
    ...wordData,
    source: 'manual'
  }]);
}

/**
 * 获取复习等级描述
 */
export function getLevelDescription(level) {
  const descriptions = [
    '新词汇',
    '初次记忆',
    '短期记忆',
    '记忆中',
    '熟悉中',
    '基本掌握',
    '熟练掌握',
    '完全掌握'
  ];
  return descriptions[level] || '未知';
}

/**
 * 获取下次复习时间描述
 */
export function getNextReviewDescription(nextReviewTime) {
  const now = Date.now();
  const diff = nextReviewTime - now;
  
  if (diff <= 0) return '现在';
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) return `${minutes}分钟后`;
  if (hours < 24) return `${hours}小时后`;
  return `${days}天后`;
}

