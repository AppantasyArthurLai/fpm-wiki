import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { topics } from "@/data/topics";
import { Code, BookOpen, Sparkles } from "lucide-react";
import { APP_TITLE } from "@/const";

const iconMap: Record<string, any> = {
  Code,
  BookOpen,
  Sparkles,
};

export default function AllTopicsHome() {
  return (
    <div className="container max-w-6xl py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold tracking-tight">
            {APP_TITLE}
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          一個結構化的技術知識庫平台，整理各種技術主題的核心概念、問題診斷與最佳實踐
        </p>
      </div>

      {/* Topics Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">探索主題</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const Icon = iconMap[topic.icon] || BookOpen;
            const totalArticles = topic.categories.reduce((sum, cat) => sum + cat.pages.length, 0);
            
            return (
              <Link key={topic.id} href={`/topics/${topic.id}`}>
                <a>
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div 
                          className="p-3 rounded-lg transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${topic.color}15` }}
                        >
                          <Icon className="h-8 w-8" style={{ color: topic.color }} />
                        </div>
                        <Badge variant="secondary">{totalArticles} 篇文章</Badge>
                      </div>
                      <CardTitle className="text-2xl">{topic.title}</CardTitle>
                      <CardDescription className="text-base">
                        {topic.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">主要分類：</p>
                        <div className="flex flex-wrap gap-2">
                          {topic.categories.slice(0, 3).map((category) => (
                            <Badge key={category.id} variant="outline">
                              {category.title}
                            </Badge>
                          ))}
                          {topic.categories.length > 3 && (
                            <Badge variant="outline">
                              +{topic.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <div className="inline-block p-8 rounded-lg bg-muted/50">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">持續更新中</h3>
          <p className="text-muted-foreground">
            更多技術主題正在整理中，敬請期待
          </p>
        </div>
      </div>
    </div>
  );
}
