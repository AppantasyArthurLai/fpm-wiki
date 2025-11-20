# UIKI - 雪 | 結構化技術知識庫

一個支援多技術主題的架構式 wiki 平台，整理各種技術主題的核心概念、問題診斷與最佳實踐。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)

## ✨ 特色功能

- 🏔️ **多主題架構**：支援多個技術主題，每個主題獨立管理分類與文章
- 📚 **完整的知識體系**：每個主題包含基礎概念、問題診斷、解決方案等完整內容
- 🔍 **即時搜尋**：支援主題內全文搜尋，快速找到需要的內容
- 📱 **響應式設計**：完美支援手機、平板、桌面等各種裝置
- 🎨 **雪花主題**：採用冰藍色配色方案與雪花圖標，象徵知識的純淨與結晶
- 🔗 **智慧推薦**：每篇文章底部顯示相關文章，方便深入學習
- 📖 **Markdown 渲染**：支援程式碼高亮、表格、引用等豐富格式
- 💾 **PWA 支援**：可安裝到桌面，支援離線瀏覽
- 🏷️ **標籤系統**：透過標籤快速分類與檢索內容

## 🎯 設計理念

**UIKI** 取日文「雪」（YUKI）的諧音，象徵知識如雪花般純淨、結晶化。每個技術主題都是一片獨特的雪花，在這個平台上凝聚成完整的知識體系。

## 📋 目前主題

### PHP-FPM
深入理解 FPM 的運作原理、常見問題、診斷方法與解決方案

**包含內容：**
- 基礎概念：什麼是 PHP-FPM、進程池模式、Socket 通訊、Process vs Thread
- 問題診斷：症狀識別、資源耗盡、死鎖分析、實際案例
- 解決方案：隔離 FPM Pool、Queue 非同步架構、程式碼重構
- 架構演進：單主機 vs 多主機、localhost 呼叫、Queue 架構、全面非同步化
- 監控與調優：FPM Slow Log、FPM Status Page、APM 工具

**共 15 篇文章，涵蓋 5 大分類**

## 🚀 快速開始

### 環境需求

- Node.js 22+
- pnpm 9+

### 安裝步驟

1. Clone 專案
```bash
git clone https://github.com/AppantasyArthurLai/fpm-wiki.git
cd fpm-wiki
```

2. 安裝依賴
```bash
pnpm install
```

3. 啟動開發伺服器
```bash
pnpm dev
```

4. 在瀏覽器開啟 http://localhost:3000

### 建置生產版本

```bash
pnpm build
```

建置完成的檔案會在 `client/dist` 目錄中。

## 🛠️ 技術架構

### 前端框架
- **React 19**：最新版本的 React，提供更好的效能與開發體驗
- **TypeScript**：型別安全的 JavaScript 超集
- **Vite**：快速的建置工具

### UI 框架
- **Tailwind CSS 4**：實用優先的 CSS 框架
- **shadcn/ui**：高品質的 React 組件庫
- **Lucide React**：美觀的圖標庫

### 路由與狀態
- **Wouter**：輕量級的 React 路由解決方案
- **React Context**：主題管理

### Markdown 渲染
- **Streamdown**：高效能的 Markdown 渲染引擎

### PWA
- **Service Worker**：離線快取與資源管理
- **Web App Manifest**：應用程式安裝配置

## 📁 專案結構

```
fpm-wiki/
├── client/                 # 前端應用程式
│   ├── public/            # 靜態資源
│   │   ├── icon-192.png   # PWA 圖標 (192x192)
│   │   ├── icon-512.png   # PWA 圖標 (512x512)
│   │   ├── manifest.json  # PWA manifest
│   │   └── sw.js          # Service Worker
│   ├── src/
│   │   ├── components/    # React 組件
│   │   │   ├── ui/        # shadcn/ui 組件
│   │   │   ├── WikiLayout.tsx    # Wiki 主佈局
│   │   │   ├── WikiPage.tsx      # Wiki 文章頁面
│   │   │   └── CodeBlock.tsx     # 程式碼區塊
│   │   ├── contexts/      # React Context
│   │   │   └── ThemeContext.tsx  # 主題管理
│   │   ├── data/          # 資料檔案
│   │   │   ├── types.ts          # 型別定義
│   │   │   ├── topics.ts         # 主題索引
│   │   │   └── topics/           # 各主題內容
│   │   │       └── php-fpm.ts    # PHP-FPM 主題
│   │   ├── pages/         # 頁面組件
│   │   │   ├── AllTopicsHome.tsx # 全站首頁
│   │   │   ├── TopicHome.tsx     # 主題首頁
│   │   │   ├── WikiArticle.tsx   # 文章頁面
│   │   │   └── NotFound.tsx      # 404 頁面
│   │   ├── lib/           # 工具函式
│   │   │   └── registerSW.ts     # Service Worker 註冊
│   │   ├── App.tsx        # 應用程式根組件
│   │   ├── main.tsx       # 應用程式入口
│   │   ├── const.ts       # 應用程式常數
│   │   └── index.css      # 全域樣式
│   └── index.html         # HTML 模板
├── shared/                # 共享型別與常數
│   └── const.ts          # 共享常數
├── UIKI-ARCHITECTURE.md  # 架構設計文件
├── package.json          # 專案配置
├── tsconfig.json         # TypeScript 配置
├── tailwind.config.ts    # Tailwind 配置
├── vite.config.ts        # Vite 配置
└── README.md             # 專案說明文件
```

## 🎨 設計系統

### 配色方案
- **主色**：冰藍色 (#60a5fa)
- **背景色**：雪白色 (#f8fafc)
- **文字色**：深灰色 (#0f172a)
- **邊框色**：淺灰色 (#e2e8f0)

### 字體
- **內文**：Inter（Google Fonts）
- **程式碼**：JetBrains Mono

### 佈局
- **響應式設計**：
  - 手機：< 768px
  - 平板：768px - 1024px
  - 桌面：> 1024px

## 🔧 開發指南

### 新增主題

1. 在 `client/src/data/topics/` 建立新的主題檔案（如 `new-topic.ts`）

2. 定義主題結構：

```typescript
import { Topic } from "../types";

export const newTopic: Topic = {
  id: "new-topic",
  title: "新主題",
  description: "主題描述",
  icon: "BookOpen",  // Lucide icon 名稱
  color: "#3b82f6",  // 主題代表色
  categories: [
    {
      id: "category-1",
      title: "分類一",
      description: "分類描述",
      icon: "BookOpen",
      topicId: "new-topic",
      pages: [
        {
          id: "article-1",
          title: "文章標題",
          category: "category-1",
          topicId: "new-topic",
          content: `# 文章標題\n\n文章內容...`,
          relatedPages: ["article-2"],
          tags: ["標籤1", "標籤2"]
        }
      ]
    }
  ]
};
```

3. 在 `client/src/data/topics.ts` 中匯入並加入主題列表：

```typescript
import { newTopic } from "./topics/new-topic";

export const topics: Topic[] = [
  phpFpmTopic,
  newTopic,  // 加入新主題
];
```

### 新增文章

在對應主題的 `categories` 中新增 `page` 物件：

```typescript
{
  id: "article-id",
  title: "文章標題",
  category: "category-id",
  topicId: "topic-id",
  content: `# 文章標題\n\n使用 Markdown 格式撰寫內容...`,
  relatedPages: ["related-1", "related-2"],
  tags: ["標籤1", "標籤2"]
}
```

### 自訂主題色彩

編輯 `client/src/index.css` 中的 CSS 變數：

```css
:root {
  --primary: oklch(0.68 0.15 240);  /* 主色調 */
  --accent: oklch(0.68 0.15 240);   /* 強調色 */
  /* ... 其他顏色變數 */
}
```

### 修改 PWA 設定

編輯 `client/public/manifest.json`：

```json
{
  "name": "您的應用程式名稱",
  "short_name": "短名稱",
  "theme_color": "#60a5fa",
  /* ... 其他設定 */
}
```

## 📖 路由結構

```
/                           # 全站首頁（顯示所有主題）
/topics/:topicId            # 主題首頁（如 /topics/php-fpm）
/topics/:topicId/wiki/:id   # 文章頁面（如 /topics/php-fpm/wiki/what-is-fpm）
```

## 🌟 未來計劃

- [ ] 新增更多技術主題（Docker、Kubernetes、Redis 等）
- [ ] 實現跨主題全站搜尋
- [ ] 支援深色/淺色主題切換
- [ ] 實現文章內目錄（TOC）功能
- [ ] 加入閱讀進度追蹤
- [ ] 支援多語言（英文、簡體中文）
- [ ] 實現評論與討論功能
- [ ] 加入文章版本歷史

## 📝 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

### 貢獻指南

1. Fork 本專案
2. 建立您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📧 聯絡方式

如有任何問題或建議，歡迎透過 GitHub Issues 與我們聯繫。

---

**由 [Manus](https://manus.im) 建立** 🚀

**UIKI - 讓知識如雪花般純淨、結晶** ❄️
