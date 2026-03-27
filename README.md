# 毒舌训练营 (Sarcasm Bootcamp) v1.0

这是一个基于 AI 的“怼人”对线实战训练营。通过模拟真实的职场、生活和社交场景，训练你的临场反应、逻辑思维和幽默感。

## 核心功能

- **实战训练**：提供初级（职场小白）、中级（毒舌邻居）、高级（辩论之神）三个等级的对线挑战。
- **自定义挑战**：支持用户输入自定义话题或背景，生成专属的对线场景。
- **毒舌教练**：遇到现实生活中的尴尬场景？描述给教练，获取优雅或犀利的回击建议。
- **知识库**：内置反击策略、情绪管理技巧和经典辩论题库。
- **评分系统**：对线结束后，AI 会根据你的逻辑、幽默、杀伤力和情商进行综合评分。
- **双语支持**：支持中文和英文界面及对话。
- **多模型驱动**：支持 Google Gemini 和 阿里通义千问 (Qwen) 模型。
- **自定义 API Key**：支持用户配置自己的 API Key，享受更高的速率和额度。

## 技术栈

- **前端**：React, TypeScript, Tailwind CSS, Framer Motion (motion/react)
- **图标**：Lucide React
- **AI 模型**：Google Gemini API, DashScope (Qwen) API
- **动画**：Framer Motion

## 快速开始

### 环境配置

在根目录下创建 `.env` 文件，并配置以下环境变量：

```env
GEMINI_API_KEY=你的_Gemini_API_Key
VITE_QWEN_API_KEY=你的_Qwen_API_Key
VITE_QWEN_API_BASE=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### 安装与运行

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

## 备案信息

京ICP备2026014244号-1

## 许可证

MIT License
