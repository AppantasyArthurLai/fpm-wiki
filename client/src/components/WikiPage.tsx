import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";
import { ChevronRight, Tag, BookOpen } from "lucide-react";
import { pageIndex, categoryIndex, topicIndex } from "@/data/topics";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface WikiPageProps {
  pageId: string;
  topicId: string;
}

export default function WikiPage({ pageId, topicId }: WikiPageProps) {
  const [page, setPage] = useState<ReturnType<typeof pageIndex.get> | null>(null);

  useEffect(() => {
    const foundPage = pageIndex.get(pageId);
    setPage(foundPage || null);
    
    // 滾動到頂部
    window.scrollTo(0, 0);
  }, [pageId]);

  if (!page) {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>頁面不存在</CardTitle>
            <CardDescription>找不到您要查看的頁面</CardDescription>
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

  const category = categoryIndex.get(page.category);
  const topic = topicIndex.get(topicId);

  return (
    <div className="container max-w-4xl py-8">
      {/* 麵包屑導航 */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/">
          <a className="hover:text-foreground transition-colors">首頁</a>
        </Link>
        <ChevronRight className="h-4 w-4" />
        {topic && (
          <>
            <Link href={`/topics/${topicId}`}>
              <a className="hover:text-foreground transition-colors">{topic.title}</a>
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        {category && (
          <>
            <span>{category.title}</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground font-medium">{page.title}</span>
      </nav>

      {/* 標籤 */}
      {page.tags && page.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {page.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 主要內容 */}
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <Streamdown>{page.content}</Streamdown>
      </article>

      <Separator className="my-8" />

      {/* 相關文章 */}
      {page.relatedPages && page.relatedPages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            相關文章
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {page.relatedPages.map((relatedId) => {
              const relatedPage = pageIndex.get(relatedId);
              if (!relatedPage) return null;

              const relatedCategory = categoryIndex.get(relatedPage.category);

              return (
                <Link key={relatedId} href={`/topics/${topicId}/wiki/${relatedId}`}>
                  <a>
                    <Card className="h-full transition-colors hover:bg-accent">
                      <CardHeader>
                        <CardTitle className="text-base">{relatedPage.title}</CardTitle>
                        {relatedCategory && (
                          <CardDescription>{relatedCategory.title}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
