# UIKI 多主題 Wiki 平台架構設計

## 概念

UIKI（雪，取日文 YUKI 諧音）是一個支援多技術主題的架構式 wiki 平台。每個主題都是一個獨立的知識庫，包含自己的分類、文章、標籤系統。

## 資料結構

### Topic（主題）
```typescript
interface Topic {
  id: string;              // 主題唯一識別碼，如 "php-fpm"
  title: string;           // 主題標題，如 "PHP-FPM"
  description: string;     // 主題簡介
  icon: string;           // 主題圖標名稱（Lucide icon）
  color: string;          // 主題代表色
  categories: Category[]; // 該主題下的分類列表
}
```

### Category（分類）
```typescript
interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  topicId: string;        // 所屬主題
  pages: Page[];
}
```

### Page（文章）
```typescript
interface Page {
  id: string;
  title: string;
  category: string;       // 所屬分類 ID
  topicId: string;        // 所屬主題 ID
  content: string;        // Markdown 內容
  relatedPages?: string[];
  tags?: string[];
}
```

## 路由架構

```
/                           # 全站首頁（顯示所有主題）
/topics/:topicId            # 主題首頁（如 /topics/php-fpm）
/topics/:topicId/wiki/:id   # 文章頁面（如 /topics/php-fpm/wiki/what-is-fpm）
```

## 導航層級

1. **頂層導航**：顯示所有主題，可快速切換
2. **主題導航**：在主題內顯示該主題的分類與文章
3. **麵包屑**：首頁 > 主題 > 分類 > 文章

## 搜尋功能

- **全站搜尋**：在首頁可搜尋所有主題的文章
- **主題內搜尋**：在主題頁面只搜尋該主題的文章

## 視覺設計

### 品牌識別
- **名稱**：UIKI（雪）
- **主題**：雪花、純淨、知識結晶
- **配色**：
  - 主色：冰藍色（#60a5fa）
  - 輔色：雪白色（#f8fafc）
  - 強調色：根據主題動態變化

### 主題色彩
每個主題有自己的代表色：
- PHP-FPM：深藍色（#1e40af）
- 未來主題可自訂

## 擴展性

### 新增主題流程
1. 在 `topics.ts` 中定義新主題
2. 建立主題內容檔案（如 `topics/new-topic.ts`）
3. 定義分類與文章
4. 自動整合到系統中

### 主題模板
提供標準模板，包含：
- 基礎概念分類
- 問題診斷分類
- 解決方案分類
- 最佳實踐分類

## 技術實現

### 檔案結構
```
client/src/
├── data/
│   ├── topics.ts           # 主題索引
│   ├── topics/
│   │   ├── php-fpm.ts      # PHP-FPM 主題內容
│   │   └── ...             # 其他主題
│   └── types.ts            # 型別定義
├── components/
│   ├── TopicNav.tsx        # 主題導航
│   ├── TopicHome.tsx       # 主題首頁
│   └── ...
└── pages/
    ├── Home.tsx            # 全站首頁
    ├── TopicPage.tsx       # 主題頁面
    └── ArticlePage.tsx     # 文章頁面
```

## 優勢

1. **可擴展**：輕鬆新增新主題，不影響現有內容
2. **獨立性**：每個主題獨立管理，互不干擾
3. **一致性**：統一的導航、搜尋、視覺體驗
4. **靈活性**：每個主題可自訂配色、圖標
5. **效能**：靜態資料結構，快速載入
