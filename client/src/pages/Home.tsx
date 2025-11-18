import { Link } from "wouter";
import { BookOpen, AlertTriangle, Wrench, Network, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { wikiData } from "@/data/wikiContent";

const iconMap: Record<string, any> = {
  BookOpen,
  AlertTriangle,
  Wrench,
  Network,
  Activity,
};

export default function Home() {
  return (
    <div className="container max-w-6xl py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          PHP-FPM 問題診斷與解決方案 Wiki
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          深入理解 FPM 的運作原理、常見問題、診斷方法與解決方案，幫助您建立高效能、高可用性的 PHP 應用程式
        </p>
      </div>

      {/* 快速開始 */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">快速開始</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/wiki/what-is-fpm">
            <a>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>什麼是 FPM？</CardTitle>
                  <CardDescription>
                    了解 PHP-FPM 的基本概念與運作原理
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>
          </Link>

          <Link href="/wiki/symptoms">
            <a>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <AlertTriangle className="h-8 w-8 text-accent mb-2" />
                  <CardTitle>遇到問題？</CardTitle>
                  <CardDescription>
                    診斷 502/504 錯誤與服務中斷問題
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>
          </Link>

          <Link href="/wiki/queue-solution">
            <a>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <Wrench className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>立即解決</CardTitle>
                  <CardDescription>
                    學習最佳實踐與解決方案
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>
          </Link>
        </div>
      </div>

      {/* 所有分類 */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">所有主題</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {wikiData.map((category) => {
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
                        <Link href={`/wiki/${page.id}`}>
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

      {/* Footer */}
      <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>
          本 Wiki 整理了 PHP-FPM 相關的核心知識、常見問題與最佳實踐，幫助開發者快速診斷和解決效能與穩定性問題。
        </p>
      </div>
    </div>
  );
}
