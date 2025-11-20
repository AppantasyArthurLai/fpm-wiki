import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, BookOpen, AlertTriangle, Wrench, Network, Activity, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { topics, topicIndex } from "@/data/topics";
import { APP_TITLE } from "@/const";

interface WikiLayoutProps {
  children: ReactNode;
}

const iconMap: Record<string, any> = {
  BookOpen,
  AlertTriangle,
  Wrench,
  Network,
  Activity,
};

export default function WikiLayout({ children }: WikiLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 獲取當前主題
  const currentTopicId = location.split('/')[2]; // /topics/:topicId/...
  const currentTopic = currentTopicId ? topicIndex.get(currentTopicId) : null;
  
  // 搜尋功能：在當前主題內搜尋
  const filteredCategories = currentTopic && searchQuery
    ? currentTopic.categories.map(category => ({
        ...category,
        pages: category.pages.filter(page =>
          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(category => category.pages.length > 0)
    : currentTopic
    ? currentTopic.categories
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 頂部導航欄 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/">
              <a className="flex items-center gap-2 font-semibold text-lg">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="hidden sm:inline">{APP_TITLE}</span>
              </a>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜尋文章..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* 側邊導航欄 */}
        <aside
          className={`
            fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
            w-64 border-r bg-background/95 backdrop-blur
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="h-full overflow-y-auto p-4">
            {/* 手機版搜尋 */}
            <div className="md:hidden mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜尋文章..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* 首頁連結 */}
            <Link href="/">
              <a
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md mb-4
                  transition-colors
                  ${location === '/' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">首頁</span>
              </a>
            </Link>

            {/* 主題列表 */}
            {!currentTopic && (
              <div className="mb-6">
                <div className="text-sm font-semibold text-muted-foreground mb-2">主題</div>
                <ul className="space-y-1">
                  {topics.map((topic) => (
                    <li key={topic.id}>
                      <Link href={`/topics/${topic.id}`}>
                        <a
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span>{topic.title}</span>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 當前主題的分類與文章 */}
            {currentTopic && (
              <>
                <div className="mb-4">
                  <Link href={`/topics/${currentTopicId}`}>
                    <a className="text-sm font-semibold text-primary hover:underline">
                      ← 返回 {currentTopic.title} 首頁
                    </a>
                  </Link>
                </div>
                <nav className="space-y-6">
                  {filteredCategories.map((category) => {
                    const Icon = iconMap[category.icon] || BookOpen;
                    return (
                      <div key={category.id}>
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                          <Icon className="h-4 w-4" />
                          <span>{category.title}</span>
                        </div>
                        <ul className="space-y-1 ml-6">
                          {category.pages.map((page) => (
                            <li key={page.id}>
                              <Link href={`/topics/${currentTopicId}/wiki/${page.id}`}>
                                <a
                                  className={`
                                    block px-3 py-1.5 rounded-md text-sm
                                    transition-colors
                                    ${location === `/topics/${currentTopicId}/wiki/${page.id}`
                                      ? 'bg-accent text-accent-foreground font-medium'
                                      : 'text-foreground hover:bg-accent/50'
                                    }
                                  `}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  {page.title}
                                </a>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </nav>
              </>
            )}
          </div>
        </aside>

        {/* 遮罩層（手機版） */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 主內容區 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
