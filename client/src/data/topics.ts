import { Topic, TopicIndex, CategoryIndex, PageIndex } from "./types";
import { phpFpmTopic } from "./topics/php-fpm";

// 所有主題列表
export const topics: Topic[] = [
  phpFpmTopic,
  // 未來可在此新增其他主題
];

// 建立主題索引
export const topicIndex: TopicIndex = new Map();
topics.forEach(topic => {
  topicIndex.set(topic.id, topic);
});

// 建立分類索引
export const categoryIndex: CategoryIndex = new Map();
topics.forEach(topic => {
  topic.categories.forEach(category => {
    categoryIndex.set(category.id, category);
  });
});

// 建立頁面索引
export const pageIndex: PageIndex = new Map();
topics.forEach(topic => {
  topic.categories.forEach(category => {
    category.pages.forEach(page => {
      pageIndex.set(page.id, page);
    });
  });
});
