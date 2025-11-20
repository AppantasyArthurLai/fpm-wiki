import { Link, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { topicIndex } from "@/data/topics";
import { BookOpen, AlertTriangle, Wrench, Network, Activity, ArrowRight, Code, Sparkles } from "lucide-react";

const iconMap: Record<string, any> = {
  BookOpen,
  AlertTriangle,
  Wrench,
  Network,
  Activity,
  Code,
  Sparkles,
};

export default function TopicHome() {
  const [, params] = useRoute("/topics/:topicId");
  
  if (!params?.topicId) {
    return null;
  }

  const topic = topicIndex.get(params.topicId);

  if (!topic) {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>主題不存在</CardTitle>
            <CardDescription>找不到您要查看的主題</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <a className="text-primary hover:underline">返回首頁</a>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TopicIcon = iconMap[topic.icon] || BookOpen;
  const totalArticles = topic.categories.reduce((sum, cat) => sum + cat.pages.length, 0);

  return (
    <div className="container max-w-6xl py-12">
      {/* Topic Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${topic.color}15` }}
          >
            <TopicIcon className="h-10 w-10" style={{ color: topic.color }} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{topic.title}</h1>
            <p className="text-xl text-muted-foreground mt-2">{topic.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary">{topic.categories.length} 個分類</Badge>
          <Badge variant="secondary">{totalArticles} 篇文章</Badge>
        </div>
      </div>

      {/* Quick Start */}
      {topic.categories.length > 0 && topic.categories[0].pages.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">快速開始</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {topic.categories.slice(0, 3).map((category, idx) => {
              const firstPage = category.pages[0];
              if (!firstPage) return null;

              const Icon = iconMap[category.icon] || BookOpen;
              const quickStartTitles = ["什麼是", "遇到問題", "立即解決"];
              
              return (
                <Link key={category.id} href={`/topics/${topic.id}/wiki/${firstPage.id}`}>
                  <a>
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                      <CardHeader>
                        <Icon className="h-8 w-8 mb-2" style={{ color: topic.color }} />
                        <CardTitle>{quickStartTitles[idx] || firstPage.title}</CardTitle>
                        <CardDescription>
                          {idx === 0 && `了解 ${topic.title} 的基本概念與運作原理`}
                          {idx === 1 && `診斷常見問題與錯誤`}
                          {idx === 2 && `學習最佳實踐與解決方案`}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* All Categories */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">所有分類</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {topic.categories.map((category) => {
            const Icon = iconMap[category.icon] || BookOpen;
            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {category.pages.slice(0, 4).map((page) => (
                      <li key={page.id}>
                        <Link href={`/topics/${topic.id}/wiki/${page.id}`}>
                          <a className="flex items-center justify-between group py-1 hover:text-primary transition-colors">
                            <span className="group-hover:translate-x-1 transition-transform">
                              {page.title}
                            </span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {category.pages.length > 4 && (
                    <div className="mt-4 pt-4 border-t">
                      <Badge variant="secondary">
                        +{category.pages.length - 4} 篇文章
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
