// UIKI 資料結構型別定義

export interface WikiPage {
  id: string;
  title: string;
  category: string;
  topicId: string;
  content: string;
  relatedPages?: string[];
  tags?: string[];
}

export interface WikiCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  topicId: string;
  pages: WikiPage[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  categories: WikiCategory[];
}

// 索引型別
export type PageIndex = Map<string, WikiPage>;
export type CategoryIndex = Map<string, WikiCategory>;
export type TopicIndex = Map<string, Topic>;
