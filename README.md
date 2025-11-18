# PHP-FPM 問題診斷與解決方案 Wiki

深入理解 FPM 的運作原理、常見問題、診斷方法與解決方案，幫助您建立高效能、高可用性的 PHP 應用程式。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)

## ✨ 特色功能

- 📚 **完整的知識體系**：涵蓋基礎概念、問題診斷、解決方案、架構演進、監控調優等 5 大分類共 15 篇文章
- 🔍 **即時搜尋**：支援全文搜尋，快速找到需要的內容
- 📱 **響應式設計**：完美支援手機、平板、桌面等各種裝置
- 🎨 **專業視覺**：採用深藍色配色方案與 Inter 字體，提供舒適的閱讀體驗
- 🔗 **智慧推薦**：每篇文章底部顯示相關文章，方便深入學習
- 📖 **Markdown 渲染**：支援程式碼高亮、表格、引用等豐富格式
- 💾 **PWA 支援**：可安裝到桌面，支援離線瀏覽
- 🏷️ **標籤系統**：透過標籤快速分類與檢索內容

## 📋 內容概覽

### 基礎概念
- 什麼是 PHP-FPM
- FPM 進程池模式
- Socket 通訊
- Process vs Thread

### 問題診斷
- 症狀：服務中斷與 502/504 錯誤
- 前因：同步等待造成的資源耗盡
- 後果：死鎖與系統崩潰
- 案例：A 專案呼叫 B 專案

### 解決方案
- 方案一：隔離 FPM Pool
- 方案二：Queue 非同步架構
- 方案三：程式碼重構

### 架構演進
- 單主機 vs 多主機
- localhost 呼叫的迷思
- Queue 架構的陷阱
- 全面非同步化

### 監控與調優
- FPM Slow Log
- FPM Status Page
- APM 工具

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
│   │   │   └── wikiContent.ts    # Wiki 內容資料
│   │   ├── pages/         # 頁面組件
│   │   │   ├── Home.tsx          # 首頁
│   │   │   ├── WikiArticle.tsx   # 文章頁面
│   │   │   └── NotFound.tsx      # 404 頁面
│   │   ├── lib/           # 工具函式
│   │   │   └── registerSW.ts     # Service Worker 註冊
│   │   ├── App.tsx        # 應用程式根組件
│   │   ├── main.tsx       # 應用程式入口
│   │   └── index.css      # 全域樣式
│   └── index.html         # HTML 模板
├── shared/                # 共享型別與常數
│   └── const.ts          # 應用程式常數
├── package.json          # 專案配置
├── tsconfig.json         # TypeScript 配置
├── tailwind.config.ts    # Tailwind 配置
├── vite.config.ts        # Vite 配置
└── README.md             # 專案說明文件
```

## 🎨 設計系統

### 配色方案
- **主色**：深藍色 (#1e40af)
- **強調色**：橙色 (#f97316)
- **背景色**：白色 (#ffffff)
- **文字色**：深灰色 (#0f172a)

### 字體
- **內文**：Inter（Google Fonts）
- **程式碼**：JetBrains Mono

### 佈局
- **三欄式設計**：側邊導航 + 主內容區 + 搜尋欄
- **響應式斷點**：
  - 手機：< 768px
  - 平板：768px - 1024px
  - 桌面：> 1024px

## 🔧 開發指南

### 新增文章

編輯 `client/src/data/wikiContent.ts`，在對應的分類中新增頁面物件：

```typescript
{
  id: "your-article-id",
  title: "文章標題",
  category: "category-id",
  content: `
# 文章標題

文章內容使用 Markdown 格式...
  `,
  relatedPages: ["related-article-1", "related-article-2"],
  tags: ["標籤1", "標籤2"]
}
```

### 自訂主題

編輯 `client/src/index.css` 中的 CSS 變數：

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --accent: 24.6 95% 53.1%;
  /* ... 其他顏色變數 */
}
```

### 修改 PWA 設定

編輯 `client/public/manifest.json`：

```json
{
  "name": "您的應用程式名稱",
  "short_name": "短名稱",
  "theme_color": "#3b82f6",
  /* ... 其他設定 */
}
```

## 📝 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📧 聯絡方式

如有任何問題或建議，歡迎透過 GitHub Issues 與我們聯繫。

---

**由 [Manus](https://manus.im) 建立** 🚀
