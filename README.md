# 英语对话学习助手

一个基于 AI 的英语对话练习应用，帮助用户通过实际对话提升英语表达能力。

## 功能特点

- 🗣️ **AI 英语导师对话** - 与 AI 进行英语对话练习，获得实时反馈和纠正
- 📊 **学习报告** - 对话结束后生成详细的学习报告，包含改进建议和核心词汇
- 📚 **词汇卡片** - 基于对话内容动态生成的词汇卡片，支持间隔重复学习
- 🎤 **语音输入** - 支持语音识别输入（需浏览器支持）
- 🔊 **单词朗读** - 支持单词和例句的语音朗读

## 环境安装

### 1. 安装 NVM（Node 版本管理器）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

### 2. 安装 Node.js 18

```bash
nvm install 18
nvm use 18
```

### 3. 安装依赖

```bash
npm install
# 或
yarn install
```

## API 配置

本应用使用 Google Gemini API。

### 获取 API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/apikey)
2. 创建或选择一个项目
3. 生成 API Key

### 配置方式一：环境变量（推荐）

编辑项目根目录的 `.env` 文件，填入你的 Gemini API Key：

```env
VITE_GEMINI_API_KEY=你的API密钥
```

### 配置方式二：界面临时配置

在应用界面右上角点击设置图标，可以临时输入 API Key（刷新页面后失效）。

### 可选配置

```env
# 模型名称（默认为 gemini-2.0-flash）
VITE_MODEL=gemini-2.0-flash
# VITE_MODEL=gemini-1.5-pro
# VITE_MODEL=gemini-1.5-flash
```

## 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:8080 即可使用。

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `build` 目录。

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 5
- **样式**: TailwindCSS
- **UI 组件**: Radix UI + shadcn/ui
- **路由**: React Router
- **状态管理**: React Query
- **图标**: Lucide React
- **动画**: Framer Motion

## 使用说明

1. **开始对话**: 在聊天界面输入英语内容，AI 会帮助你纠正语法和表达
2. **语音输入**: 点击麦克风按钮进行语音输入（需浏览器支持 Web Speech API）
3. **结束对话**: 点击"结束对话"按钮生成学习报告
4. **查看报告**: 查看本次对话的学习总结、改进建议和核心词汇
5. **词汇学习**: 使用词汇卡片功能记忆对话中的关键词汇

## 注意事项

- API Key 不要提交到版本控制系统中
- 语音识别功能需要使用支持 Web Speech API 的浏览器（如 Chrome）
- 建议使用 HTTPS 环境以确保语音功能正常工作
