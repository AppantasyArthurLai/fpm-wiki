import { Topic } from "../types";

export const phpFpmTopic: Topic = {
  id: "php-fpm",
  title: "PHP-FPM",
  description: "深入理解 FPM 的運作原理、常見問題、診斷方法與解決方案",
  icon: "Code",
  color: "#1e40af",
  categories: [
  {
    id: "concepts",
    title: "基礎概念",
    icon: "BookOpen",
    description: "了解 PHP-FPM 的核心概念與運作原理",
    topicId: "php-fpm",
    pages: [
      {
        id: "what-is-fpm",
        title: "什麼是 PHP-FPM",
        category: "concepts",
        topicId: "php-fpm",
        content: `# 什麼是 PHP-FPM

**PHP-FPM (FastCGI Process Manager)** 是一個 PHP 的 **FastCGI 實作**。它的核心工作是**管理 PHP 的進程池 (process pool)**,以非常高效、穩定且安全的方式來處理來自網頁伺服器（最常見的是 Nginx）的請求。

## 為什麼我們需要 FPM？

要理解 FPM，要先知道 PHP 網站的「古早」運作方式：

### CGI (Common Gateway Interface)

最早的方式。每當有 .php 請求進來，網頁伺服器（如 Apache）就會啟動一個全新的 PHP 解譯器進程來處理它，處理完畢後該進程就結束。**這非常慢且消耗資源**。

### mod_php (Apache 模組)

為了效能，PHP 被做成一個 Apache 模組。PHP 解譯器直接內嵌在 Apache 的工作進程 (worker process) 中。

**優點：** 速度快，因為 PHP 隨時待命。

**缺點：**
- PHP 與網頁伺服器緊密綁定，Apache 崩潰 PHP 也跟著崩
- 資源消耗大，即使是請求 .jpg 圖片的 Apache 進程也載入了整個 PHP 模組
- 安全性較差

**FastCGI 協議的出現就是為了解決這個問題。** 它允許網頁伺服器與 PHP 解譯器**分離**成兩個獨立的服務。

而 **PHP-FPM** 就是 PHP 官方提供的、功能最完善的 FastCGI *管理器*。

## FPM 如何處理一個請求？

這是在「Nginx + PHP-FPM」這個經典架構下的標準流程：

1. **用戶請求：** 使用者在瀏覽器輸入 \`http://example.com/index.php\`
2. **網頁伺服器 (Nginx)：** Nginx 接收到請求。它會根據設定（例如 \`location ~ \\.php$\`），知道這不是一個靜態檔案，而是需要 PHP 處理的動態請求
3. **轉發請求：** Nginx 不會自己執行 PHP。它會透過 FastCGI 協議，將請求的相關資訊（如 URL、GET/POST 參數、HTTP 標頭）打包，然後轉發給 PHP-FPM 服務
4. **FPM 接手：** PHP-FPM 有一個「主進程 (master process)」負責監聽這個 socket
5. **分配工作：** 當 FPM 主進程收到 Nginx 的請求後，它會從自己管理的「工作進程池 (worker pool)」中，找一個**空閒的 PHP-FPM 工作進程 (worker process)** 來處理這個請求
6. **執行 PHP：** 該工作進程（它就是一個 PHP 解譯器）開始執行 \`index.php\` 腳本。它可能會連接資料庫、處理邏輯、產生 HTML
7. **返回結果：** PHP 腳本執行完畢，將產生的 HTML 內容返回給 FPM 主進程，FPM 再透過 socket 傳回給 Nginx
8. **Nginx 響應：** Nginx 收到 FPM 傳來的 HTML 內容，最後再將這個內容作為 HTTP 響應發送回給使用者的瀏覽器
9. **釋放進程：** 該 PHP-FPM 工作進程處理完請求後，不會結束，而是回到進程池中，**等待下一個請求**

> **關鍵優勢：** 這種方式讓 Nginx 專心處理高併發的網路連線和靜態檔案，而 PHP-FPM 專心管理 PHP 的執行。兩者分離，資源分配合理，且非常高效。

## PHP-FPM 的主要特性

### 1. 進程池管理 (Process Pool Management)

這是 FPM 最核心的功能。它會預先啟動並維護一定數量的 PHP 工作進程 (worker)，隨時準備處理請求，省去了 CGI 模式那樣反覆啟動和銷毀進程的開銷。

### 2. 多個進程池 (Multiple Pools)

FPM 允許你設定**多個**進程池，每個池可以有**完全不同**的設定。這在共享主機環境或需要嚴格隔離不同應用程式時非常有用。

### 3. 穩健性與平滑重啟 (Graceful Reload)

一個 FPM 工作進程如果因為 bug 崩潰了，主進程會偵測到，並自動重新啟動一個新的工作進程來替補，整個服務不會中斷。

### 4. 監控與日誌

FPM 可以提供慢日誌 (Slow Log) 和狀態頁 (Status Page)，讓你即時監控目前有多少個進程、有多少個是空閒的、有多少個正在處理請求等關鍵指標。
`,
        relatedPages: ["fpm-process-modes", "socket-communication"],
        tags: ["基礎", "FPM", "FastCGI"]
      },
      {
        id: "fpm-process-modes",
        title: "FPM 進程池模式",
        category: "concepts",
        topicId: "php-fpm",
        content: `# FPM 進程池模式

PHP-FPM 主要有三種進程池管理模式（由 \`pm\` 參數設定）：

## Dynamic (動態模式)

這是最常見的模式。FPM 會維持一定數量的「閒置」進程（\`pm.min_spare_servers\`），當請求增多時，它會動態增加新的進程，直到達到上限（\`pm.max_children\`）。請求減少後，它會慢慢關閉多餘的閒置進程。

**適用情境：** 這是效能和資源佔用之間最好的平衡，適合大多數情況。

**設定範例：**
\`\`\`ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 10
\`\`\`

## Static (靜態模式)

從一開始就啟動固定數量（\`pm.max_children\`）的進程，永不增減。

**適用情境：** 適合記憶體非常充足、且流量非常穩定的高負載伺服器。

**優點：** 效能最好。因為**完全省去了**動態模式中「建立(fork)新進程」和「銷毀(kill)閒置進程」的系統開銷。所有 worker 隨時待命。

**缺點：** 非常消耗記憶體。因為即使在凌晨 3 點的低峰期，它依然佔用著所有 worker 的記憶體。

**設定範例：**
\`\`\`ini
pm = static
pm.max_children = 20
\`\`\`

## Ondemand (按需模式)

平常不啟動任何進程。只有當請求進來時，才啟動 (fork) 一個新進程來處理。處理完後如果閒置一段時間（\`pm.process_idle_timeout\`）就會被關閉。

**適用情境：** 適合記憶體極小、流量非常低的網站（例如開發環境）。

**設定範例：**
\`\`\`ini
pm = ondemand
pm.max_children = 10
pm.process_idle_timeout = 10s
\`\`\`

## 模式比較

| 模式 | 記憶體使用 | 效能 | 適用情境 |
|------|-----------|------|----------|
| Dynamic | 中等 | 良好 | 一般網站（推薦） |
| Static | 高 | 最佳 | 高流量、記憶體充足 |
| Ondemand | 最低 | 較低 | 低流量、開發環境 |
`,
        relatedPages: ["what-is-fpm", "monitoring"],
        tags: ["設定", "進程池", "效能"]
      },
      {
        id: "socket-communication",
        title: "Socket 通訊",
        category: "concepts",
        topicId: "php-fpm",
        content: `# Socket 通訊

在 Nginx 與 PHP-FPM 的架構中，**Socket** 扮演著關鍵的通訊角色。

## Socket 是什麼？

您可以把 **Socket** 想像成一個**專線電話**。

Nginx（Web 伺服器）和 PHP-FPM（應用程式伺服器）是兩個獨立運作的程式 (Process)。Nginx 收到一個 .php 請求，它必須把這個請求的「所有資訊」（網址、POST 內容、標頭...）**安全且快速**地交給 PHP-FPM 去處理。

Socket 就是這兩個獨立程式之間建立的「通訊管道」。

## 為什麼叫 Socket (插座)？

這個詞很形象。就像您把電器的「插頭」插到牆上的「插座」來獲取電力一樣，Nginx (客戶端) 會「插上」PHP-FPM (伺服器端) 預先開好的「插座」，建立一條連線。

## Socket 的兩種形式

### 1. TCP Socket (例如 \`127.0.0.1:9000\`)

**比喻：** 像是 Nginx 打電話給 PHP-FPM，撥打的號碼是 \`127.0.0.1\` (本機地址) 的 \`9000\` 號分機。

**運作：** 透過作業系統的網路層 (TCP/IP) 進行通訊。

**優缺點：** 彈性高（Nginx 和 FPM 甚至可以不在同一台主機上），但效能略低（因為要經過網路層的封裝和檢查）。

**Nginx 設定範例：**
\`\`\`nginx
location ~ \\.php$ {
    fastcgi_pass 127.0.0.1:9000;
    # ... 其他設定
}
\`\`\`

### 2. Unix Domain Socket (例如 \`/var/run/php-fpm.sock\`)

**比喻：** 像是在**同一棟大樓**裡的 Nginx 和 FPM 之間拉了一條**內部專線**，連電話號碼都不用撥，拿起話筒就通了。

**運作：** 透過檔案系統的一個特殊檔案 (\`.sock\` 檔) 進行通訊，**不經過網路層**。

**優缺點：** 僅限於 Nginx 和 FPM 在**同一台主機**上時使用。但因為它繞過了網路層，**效能更高、延遲更低**。在單機部署中，這是**首選**的方式。

**Nginx 設定範例：**
\`\`\`nginx
location ~ \\.php$ {
    fastcgi_pass unix:/var/run/php-fpm.sock;
    # ... 其他設定
}
\`\`\`

## 總結

Socket 就是 Nginx 和 PHP-FPM 之間用來傳遞請求和回應的、高效的**雙向通訊管道**。在單機環境中，優先使用 Unix Domain Socket 以獲得最佳效能。
`,
        relatedPages: ["what-is-fpm"],
        tags: ["Socket", "通訊", "Nginx"]
      },
      {
        id: "process-vs-thread",
        title: "Process vs Thread",
        category: "concepts",
        topicId: "php-fpm",
        content: `# Process vs Thread

在 PHP-FPM 的架構中，worker 是 **Process (進程)**，不是 Thread (執行緒)。

## 什麼是 Process？

每個 FPM worker 都是一個**獨立的 OS 進程** (\`php-fpm\` 程序)。它們擁有**各自獨立的記憶體空間**。

**優點：**
- **穩定性高：** 一個 worker 崩潰（例如記憶體溢位或致命錯誤）**不會**影響到其他 worker
- **隔離性好：** 每個請求的資料完全獨立，不會互相干擾
- **易於管理：** FPM master process 可以輕易地管理 worker process 的生命週期（殺掉、重啟）

**缺點：**
- **記憶體消耗較大：** 每個進程都有獨立的記憶體空間
- **啟動成本較高：** 建立新進程比建立執行緒慢

## 什麼是 Thread？

Thread 存在於同一個 Process 之下，共享記憶體空間。

**優點：**
- **記憶體效率高：** 多個執行緒共享記憶體
- **切換快速：** 執行緒間的切換比進程快

**缺點：**
- **風險較高：** 一個 Thread 崩潰可能導致整個 Process (包含所有其他 Thread) 一起崩潰
- **複雜度高：** 需要處理同步、鎖等問題

## 為什麼 PHP-FPM 選擇 Process？

PHP 從一開始就被設計為「無共享」 (Share-nothing) 架構。每個請求都是（相對）獨立的。這種設計哲學與 Process 的隔離特性完美契合，使得 PHP-FPM 非常**穩定**。

## 實際影響

這也是為什麼 FPM master process 可以輕易地管理 worker process 的生命週期（殺掉、重啟）而不會影響到其他正在處理的請求。

當您在 FPM 設定中看到 \`pm.max_children = 20\`，這代表最多會有 20 個**獨立的 PHP 進程**在運行，而不是 20 個執行緒。
`,
        relatedPages: ["what-is-fpm", "fpm-process-modes"],
        tags: ["進程", "執行緒", "架構"]
      }
    ]
  },
  {
    id: "problems",
    title: "問題診斷",
    icon: "AlertTriangle",
    description: "識別與診斷 FPM 常見問題",
    topicId: "php-fpm",
    pages: [
      {
        id: "symptoms",
        title: "症狀：服務中斷與 502/504 錯誤",
        category: "problems",
        topicId: "php-fpm",
        content: `# 症狀：服務中斷與 502/504 錯誤

## 常見症狀

當 PHP-FPM 出現問題時，使用者通常會遇到以下症狀：

### 502 Bad Gateway

**含義：** Nginx 無法從 PHP-FPM 獲得有效回應。

**可能原因：**
- PHP-FPM 服務完全停止
- Socket 檔案不存在或權限錯誤
- PHP-FPM 崩潰或重啟中

### 504 Gateway Timeout

**含義：** Nginx 等待 PHP-FPM 回應超時。

**可能原因：**
- 所有 FPM worker 都在忙碌中，沒有空閒 worker 可以處理新請求
- PHP 腳本執行時間過長
- FPM worker 被「卡住」（例如等待外部 API 回應）

### 網站完全無回應

**含義：** 連 Nginx 的錯誤頁面都看不到。

**可能原因：**
- Nginx 本身也掛了
- 伺服器資源耗盡（CPU 100%、記憶體滿）
- 網路問題

## 重啟後恢復

**現象：** 執行 \`systemctl restart php-fpm\` 後，網站立刻恢復正常。

**這代表什麼？**

這 99% 的機率是 FPM 的 **worker process 被卡住了**，導致 \`pm.max_children\` 被佔滿，沒有新的 worker 可以處理新的請求。

重啟 FPM 會：
1. 殺掉所有卡住的 worker
2. 重新啟動新的、乾淨的 worker pool
3. 系統恢復正常

但這只是**暫時解決**，如果不找出根本原因，問題會再次發生。

## 診斷步驟

1. **檢查 FPM 狀態：** \`systemctl status php-fpm\`
2. **查看 FPM 錯誤日誌：** \`/var/log/php-fpm/error.log\`
3. **查看 Nginx 錯誤日誌：** \`/var/log/nginx/error.log\`
4. **檢查 FPM 慢日誌：** 看看哪些請求執行很慢
5. **查看 FPM 狀態頁：** 確認 worker 使用情況
`,
        relatedPages: ["resource-exhaustion", "monitoring"],
        tags: ["診斷", "錯誤", "502", "504"]
      },
      {
        id: "resource-exhaustion",
        title: "前因：同步等待造成的資源耗盡",
        category: "problems",
        topicId: "php-fpm",
        content: `# 前因：同步等待造成的資源耗盡

## 核心問題

**資源耗盡 (Resource Exhaustion)** 是 FPM 最常見的問題之一。它的核心原因是：**FPM worker 長時間被佔用，無法釋放回進程池**。

## 典型情境

假設您的 FPM 設定是：
\`\`\`ini
pm.max_children = 10
\`\`\`

這代表最多只能有 10 個 worker 同時工作。

### 正常情況

1. 使用者 A 請求進來，FPM 派出 Worker 1
2. Worker 1 執行 PHP 腳本，耗時 100ms
3. Worker 1 完成，回到進程池
4. 使用者 B 請求進來，Worker 1 再次被派出

在這個情況下，10 個 worker 可以處理非常高的併發量。

### 問題情況：同步等待

1. 使用者 A-J (10 個使用者) 同時請求進來
2. FPM 派出所有 10 個 worker
3. 這 10 個 worker 的 PHP 程式碼中，都需要**呼叫外部 API**（例如透過 Guzzle/cURL）
4. 外部 API 很慢，需要 3 秒才回應
5. **在這 3 秒內，10 個 worker 都在「等待」**，什麼都沒做
6. 使用者 K 的請求進來，但**沒有空閒的 worker**
7. Nginx 等待，直到 \`fastcgi_read_timeout\` 超時
8. Nginx 回傳 **504 Gateway Timeout** 給使用者 K

## 為什麼會「同步等待」？

當 PHP 程式碼執行以下操作時，worker 會被「卡住」：

### 1. HTTP 請求

\`\`\`php
// 這會讓 worker 等待 3 秒
$response = Http::get('https://slow-api.com/data');
\`\`\`

### 2. 資料庫查詢

\`\`\`php
// 如果這個查詢很慢（例如沒有索引），worker 會一直等
$users = DB::table('users')->where('complex_condition', '...')->get();
\`\`\`

### 3. 檔案操作

\`\`\`php
// 如果檔案很大，或在網路磁碟上
$content = file_get_contents('/path/to/large/file.txt');
\`\`\`

### 4. 外部服務

\`\`\`php
// 呼叫第三方支付、簡訊、Email 服務
$result = $paymentGateway->charge($amount);
\`\`\`

## 連鎖反應

最危險的情況是：**Project A 呼叫 Project B**

如果 Project A 和 Project B 共用同一個 FPM Pool，就會發生：

1. 10 個請求打到 Project A
2. FPM 派出 Worker 1-10 處理 Project A
3. 這 10 個 worker 都呼叫 Project B（透過 HTTP）
4. 這 10 個 HTTP 請求進到 Nginx，Nginx 又轉回給 FPM
5. 但 FPM 的 10 個 worker 已經全部被佔用了！
6. **死鎖 (Deadlock)：** Worker 1-10 在等待 Project B 回應，但 Project B 沒有 worker 可以處理請求

## 後果

- 網站完全無法回應
- 所有新請求都會 504 超時
- 必須重啟 FPM 才能恢復

## 解決方向

要解決這個問題，有兩個方向：

1. **讓 worker 不要等待**（非同步化）
2. **增加 worker 數量**（治標不治本）

詳細解決方案請參考「解決方案」章節。
`,
        relatedPages: ["symptoms", "deadlock", "queue-solution"],
        tags: ["資源耗盡", "同步等待", "瓶頸"]
      },
      {
        id: "deadlock",
        title: "後果：死鎖與系統崩潰",
        category: "problems",
        topicId: "php-fpm",
        content: `# 後果：死鎖與系統崩潰

## 什麼是死鎖 (Deadlock)？

在 FPM 的情境中，**死鎖**指的是：所有 worker 都在等待某個資源，但這個資源永遠不會到來，導致整個系統完全卡死。

## 典型死鎖情境

### 情境：單一 FPM Pool

假設您有兩個 Laravel 專案（Project A 和 Project B）共用同一個 FPM Pool：

\`\`\`ini
pm.max_children = 20
\`\`\`

**流程：**

1. 10 個請求同時打到 Project A
2. FPM 派出 **Worker 1-10** 處理 Project A
3. 這 10 個 worker 全部呼叫 Project B（透過 HTTP）
4. 這些 HTTP 請求進到 Nginx，Nginx 轉發給 FPM
5. FPM 派出**剩下的 Worker 11-20** 處理 Project B
6. **FPM 池已滿 (20/20)**
7. 這時，如果 Project B 的邏輯又需要呼叫 Project A...
8. Worker 11-20 會嘗試呼叫 Project A，但 Project A **沒有 worker 可用了**

**結果：**
- Worker 1-10 在等待 Worker 11-20
- Worker 11-20 在等待新的 worker（但已經沒有了）
- **系統 100% 死鎖**

所有新請求（無論是 Project A 還是 Project B）都會卡住，直到 Nginx 超時並回傳 \`504\` 或 \`502\`。

## 死鎖的特徵

### 1. 完全無回應

網站完全無法處理任何新請求，即使是簡單的首頁也打不開。

### 2. FPM 狀態頁顯示

\`\`\`
active processes: 20
idle processes: 0
\`\`\`

所有 worker 都在「active」狀態，但實際上都在等待，沒有真正在工作。

### 3. 重啟立即恢復

執行 \`systemctl restart php-fpm\` 後，系統立刻恢復正常。

### 4. 問題會重複發生

如果不解決根本原因，一段時間後問題會再次出現。

## 與資源耗盡的區別

| 問題類型 | 資源耗盡 | 死鎖 |
|---------|---------|------|
| 原因 | Worker 被慢操作佔用 | Worker 互相等待 |
| 恢復可能 | 可能自動恢復（當慢操作完成） | 永遠不會自動恢復 |
| 嚴重程度 | 中等 | 嚴重 |
| 典型情境 | 呼叫慢 API | A 呼叫 B，B 又呼叫 A |

## 如何避免死鎖？

### 1. 隔離 FPM Pool（短期方案）

將 Project A 和 Project B 拆分成**兩個獨立的 FPM Pool**。

\`\`\`ini
[project_a]
pm.max_children = 10

[project_b]
pm.max_children = 10
\`\`\`

這樣 Project A 的 worker 永遠不會佔用 Project B 的 worker，打破了死鎖的可能。

### 2. 非同步化（長期方案）

使用 Queue (隊列) 讓 worker 不需要等待，立刻釋放。

### 3. 程式碼重構（最佳方案）

讓 Project A 不要透過 HTTP 呼叫 Project B，而是直接在 PHP 層面呼叫共用的程式碼。

詳細解決方案請參考「解決方案」章節。
`,
        relatedPages: ["resource-exhaustion", "isolate-pools", "queue-solution"],
        tags: ["死鎖", "Deadlock", "系統崩潰"]
      },
      {
        id: "case-study",
        title: "案例：A 專案呼叫 B 專案",
        category: "problems",
        topicId: "php-fpm",
        content: `# 案例：A 專案呼叫 B 專案

## 情境描述

公司有兩個 Laravel 專案運行在同一台主機上：

- **Project A：** 主要的對外網站
- **Project B：** 內部 API 服務

Project A 的某些功能需要呼叫 Project B 的 API 來獲取資料。

## 架構設定

### Nginx 設定

\`\`\`nginx
server {
    server_name project-a.com;
    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php-fpm.sock;
    }
}

server {
    server_name project-b.com;
    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php-fpm.sock;
    }
}
\`\`\`

### FPM 設定

\`\`\`ini
[www]
pm = dynamic
pm.max_children = 20
\`\`\`

**問題：** 兩個專案共用同一個 FPM Pool (\`www\`)

## 問題發生

### 正常流量時

系統運作正常，沒有明顯問題。

### 高峰時段

1. 50 個使用者同時訪問 Project A
2. FPM 派出 20 個 worker（已達上限）
3. 這 20 個 worker 的程式碼中，有 15 個需要呼叫 Project B
4. 這 15 個 HTTP 請求打到 Project B
5. 但 FPM Pool 已經滿了，沒有空閒 worker 可以處理 Project B 的請求
6. 這 15 個 worker 一直等待 Project B 回應
7. 剩下 5 個 worker 也很快被其他請求佔用
8. **所有 20 個 worker 都被卡住**
9. 新的請求進來，全部 504 超時

### 症狀

- 使用者看到 504 Gateway Timeout
- 網站完全無法訪問
- 重啟 FPM 後立即恢復
- 過一段時間又再次發生

## 問題分析

### 1. localhost 呼叫的迷思

開發者可能認為：「我用 \`localhost\` 呼叫，應該很快吧？」

**事實：** 即使使用 \`localhost\` 或 \`127.0.0.1\`，仍然會經過完整的網路層呼叫：

\`\`\`
Project A Worker
  → cURL/Guzzle
  → OS TCP Stack
  → Nginx
  → FPM Pool
  → Project B Worker
\`\`\`

這個流程中，Nginx 和 FPM 的所有開銷一個都沒少。

### 2. 資源競爭

Project A 和 Project B 在競爭同一個有限的資源：FPM worker pool。

當 Project A 的流量增加時，它會佔用大部分 worker，導致 Project B 沒有 worker 可用。

但 Project A 又需要 Project B 的回應才能完成，形成了**連鎖瓶頸**。

## 解決方案

### 短期方案：隔離 FPM Pool

建立兩個獨立的 FPM Pool：

\`\`\`ini
[project_a]
listen = /var/run/php-fpm-a.sock
pm.max_children = 15

[project_b]
listen = /var/run/php-fpm-b.sock
pm.max_children = 10
\`\`\`

更新 Nginx 設定：

\`\`\`nginx
server {
    server_name project-a.com;
    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php-fpm-a.sock;
    }
}

server {
    server_name project-b.com;
    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php-fpm-b.sock;
    }
}
\`\`\`

**效果：** Project A 的 worker 不會佔用 Project B 的資源，大幅提高穩定性。

### 長期方案：非同步化

使用 Queue 讓 Project A 不需要同步等待 Project B：

\`\`\`php
// Project A 的程式碼
// 舊的方式（會卡住 worker）
$result = Http::post('http://project-b.com/api/process', $data);

// 新的方式（立即釋放 worker）
ProcessDataJob::dispatch($data);
return response()->json(['status' => 'processing']);
\`\`\`

詳細實作請參考「Queue 非同步架構」章節。
`,
        relatedPages: ["resource-exhaustion", "deadlock", "isolate-pools", "queue-solution"],
        tags: ["案例", "實戰", "診斷"]
      }
    ]
  },
  {
    id: "solutions",
    title: "解決方案",
    icon: "Wrench",
    description: "實用的解決方案與最佳實踐",
    topicId: "php-fpm",
    pages: [
      {
        id: "isolate-pools",
        title: "方案一：隔離 FPM Pool",
        category: "solutions",
        topicId: "php-fpm",
        content: `# 方案一：隔離 FPM Pool

## 概述

將不同的專案或應用程式分配到**獨立的 FPM Pool**，是解決 FPM 資源競爭問題的**短期有效方案**。

## 為什麼需要隔離？

### 問題：共用 Pool 的風險

當多個專案共用同一個 FPM Pool 時：

- Project A 的流量暴增會佔用所有 worker
- Project B 沒有 worker 可用，即使它本身流量很低
- 如果 A 呼叫 B，可能導致死鎖

### 解決：獨立 Pool

每個專案有自己的 worker pool，資源完全隔離。

## 實作步驟

### 1. 建立 FPM Pool 設定檔

在 \`/etc/php-fpm.d/\` 目錄下建立兩個設定檔：

**project-a.conf:**
\`\`\`ini
[project_a]
user = www-data
group = www-data
listen = /var/run/php-fpm-a.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 15
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 5
pm.max_requests = 500

; 慢日誌
slowlog = /var/log/php-fpm/project-a-slow.log
request_slowlog_timeout = 5s

; 狀態頁
pm.status_path = /fpm-status
\`\`\`

**project-b.conf:**
\`\`\`ini
[project_b]
user = www-data
group = www-data
listen = /var/run/php-fpm-b.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 10
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
pm.max_requests = 500

slowlog = /var/log/php-fpm/project-b-slow.log
request_slowlog_timeout = 5s

pm.status_path = /fpm-status
\`\`\`

### 2. 更新 Nginx 設定

**project-a.conf:**
\`\`\`nginx
server {
    listen 80;
    server_name project-a.com;
    root /var/www/project-a/public;
    index index.php;

    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php-fpm-a.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
\`\`\`

**project-b.conf:**
\`\`\`nginx
server {
    listen 80;
    server_name project-b.com;
    root /var/www/project-b/public;
    index index.php;

    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php-fpm-b.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
\`\`\`

### 3. 重新載入服務

\`\`\`bash
# 測試 FPM 設定
sudo php-fpm -t

# 重新載入 FPM
sudo systemctl reload php-fpm

# 測試 Nginx 設定
sudo nginx -t

# 重新載入 Nginx
sudo systemctl reload nginx
\`\`\`

## 優點

### 1. 徹底避免死鎖

Project A 和 Project B 有各自獨立的 worker pool，**絕對不可能**發生 FPM 層級的死鎖。

### 2. 資源隔離

即使 Project A 的流量暴增，佔滿了自己的 15 個 worker，Project B 的 10 個 worker 依然可以正常服務。

### 3. 獨立監控

每個 Pool 有自己的慢日誌和狀態頁，可以獨立監控效能。

### 4. 彈性設定

可以根據每個專案的特性，設定不同的 \`pm\` 模式和 worker 數量。

## 缺點

### 1. 沒有解決根本問題

這只是「防止最壞情況（死鎖）」，但沒有解決「FPM worker 被長時間佔用」的核心問題。

如果 Project A 的 15 個 worker 都在等待外部 API 回應，Project A **仍然會**遇到 504 錯誤。

### 2. 記憶體消耗增加

原本 20 個 worker，現在變成 25 個（15 + 10），記憶體消耗會增加。

### 3. 需要調整 worker 數量

需要根據實際流量，調整每個 Pool 的 \`pm.max_children\`，這需要一些經驗和監控。

## 適用情境

- **短期緊急修復：** 網站頻繁出現 502/504，需要立即提高穩定性
- **多專案共存：** 一台主機上運行多個獨立的 PHP 專案
- **配合長期方案：** 在實施非同步化之前的過渡方案

## 下一步

隔離 FPM Pool 可以大幅提高系統穩定性，但要**徹底解決**問題，仍需要：

1. **非同步化：** 使用 Queue 讓 worker 不需要等待
2. **程式碼重構：** 讓專案間的呼叫不經過 HTTP

詳細請參考「Queue 非同步架構」和「程式碼重構」章節。
`,
        relatedPages: ["queue-solution", "refactor-solution", "monitoring"],
        tags: ["解決方案", "FPM Pool", "隔離"]
      },
      {
        id: "queue-solution",
        title: "方案二：Queue 非同步架構",
        category: "solutions",
        topicId: "php-fpm",
        content: `# 方案二：Queue 非同步架構

## 概述

使用 **Queue (隊列)** 是解決 FPM worker 同步等待問題的**最佳長期方案**。它能讓 FPM worker 立即釋放，不需要等待耗時操作完成。

## 核心概念

### 傳統同步架構

\`\`\`
使用者 → FPM Worker → 呼叫 API (等待 3 秒) → 回應使用者
                      ↑
                   Worker 被佔用 3 秒
\`\`\`

### 非同步 Queue 架構

\`\`\`
使用者 → FPM Worker → 丟 Job 到 Queue (< 1ms) → 立即回應「處理中」
                      ↑
                   Worker 立即釋放

背景 → Queue Worker → 從 Queue 取 Job → 執行耗時操作 → 完成
\`\`\`

## 為什麼 Queue 能解決問題？

### 1. FPM Worker 極速釋放

FPM worker 的工作變成：
1. 驗證請求參數
2. 將 Job 丟進 Redis 隊列（< 1ms）
3. 回傳「202 Accepted (已受理)」給使用者
4. **立即釋放**，回到 FPM pool

整個過程可能只需要 10-50ms，FPM worker 幾乎瞬間完成。

### 2. 背景處理

真正的耗時操作（呼叫 API、處理資料、生成報表）由**獨立的 Queue Worker** 在背景執行。

Queue Worker 是獨立的 PHP 進程（\`php artisan queue:work\`），**不屬於 FPM**，因此不會佔用 FPM 的 worker。

### 3. 穩定性提升

**舊架構：** A 等 B，B 很慢 → A 被卡死 → **網站掛了 (穩定性問題)**

**新架構：** A 丟 Job，B 的 Queue Worker 處理很慢 → Job 處理延遲 → **網站依然順暢，只是使用者晚一點收到通知 (效能問題)**

「網站掛了」是 P0 級的災難；「Job 延遲」是可以排程優化的 P2 級問題。

## 實作步驟 (Laravel)

### 1. 安裝 Redis

\`\`\`bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
\`\`\`

### 2. 設定 Laravel Queue

**\`.env\`:**
\`\`\`env
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
\`\`\`

### 3. 建立 Job

\`\`\`bash
php artisan make:job ProcessDataJob
\`\`\`

**\`app/Jobs/ProcessDataJob.php\`:**
\`\`\`php
<?php

namespace App\\Jobs;

use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Bus\\Dispatchable;
use Illuminate\\Queue\\InteractsWithQueue;
use Illuminate\\Queue\\SerializesModels;
use Illuminate\\Support\\Facades\\Http;

class ProcessDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public array $data
    ) {}

    public function handle(): void
    {
        // 這裡執行耗時操作
        // 即使這裡花 3 秒,也不會佔用 FPM worker
        $response = Http::post('https://api.example.com/process', $this->data);
        
        // 處理回應、更新資料庫等
        // ...
    }
}
\`\`\`

### 4. 在 Controller 中派發 Job

**舊的方式（會卡住 FPM worker）:**
\`\`\`php
public function process(Request $request)
{
    // 這會讓 worker 等待 3 秒
    $result = Http::post('https://api.example.com/process', $request->all());
    
    return response()->json(['result' => $result]);
}
\`\`\`

**新的方式（立即釋放 worker）:**
\`\`\`php
public function process(Request $request)
{
    // 將任務丟進隊列（< 1ms）
    ProcessDataJob::dispatch($request->all());
    
    // 立即回應使用者
    return response()->json([
        'status' => 'processing',
        'message' => '您的請求正在處理中，完成後會通知您'
    ], 202);
}
\`\`\`

### 5. 啟動 Queue Worker

\`\`\`bash
# 開發環境
php artisan queue:work

# 生產環境（使用 Supervisor 管理）
sudo apt install supervisor
\`\`\`

**Supervisor 設定 (\`/etc/supervisor/conf.d/laravel-worker.conf\`):**
\`\`\`ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/project-a/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/project-a/storage/logs/worker.log
stopwaitsecs=3600
\`\`\`

\`\`\`bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
\`\`\`

## 重要注意事項

### ⚠️ 避免「通知」陷阱

**錯誤的作法：**
\`\`\`php
public function handle(): void
{
    // 處理完任務後
    $result = $this->processData();
    
    // ❌ 又發起 HTTP 請求去通知
    // 這會讓 Queue Worker 卡住
    Http::post('http://project-c.com/notify', ['result' => $result]);
}
\`\`\`

**正確的作法：**
\`\`\`php
public function handle(): void
{
    // 處理完任務後
    $result = $this->processData();
    
    // ✅ 方案 1: 發送另一個 Job
    SendNotificationJob::dispatch($result);
    
    // ✅ 方案 2: 更新資料庫狀態
    DB::table('tasks')->where('id', $this->taskId)
        ->update(['status' => 'completed', 'result' => $result]);
}
\`\`\`

## 監控 Queue

### 1. Laravel Horizon (推薦)

\`\`\`bash
composer require laravel/horizon
php artisan horizon:install
php artisan horizon
\`\`\`

訪問 \`http://your-site.com/horizon\` 查看即時監控。

### 2. 手動監控

\`\`\`bash
# 查看 Queue 長度
redis-cli LLEN queues:default

# 查看失敗的 Job
php artisan queue:failed
\`\`\`

## 優點

- **FPM 穩定性大幅提升：** Worker 幾乎瞬間完成，不會被卡住
- **使用者體驗改善：** 網站回應速度快
- **可擴展性強：** 可以增加 Queue Worker 數量來處理更多背景任務
- **錯誤處理：** Job 失敗可以自動重試

## 缺點

- **需要額外服務：** 需要 Redis 或其他 Queue 服務
- **複雜度增加：** 需要管理 Queue Worker 進程
- **非即時回應：** 使用者無法立即得到處理結果

## 適用情境

- 呼叫外部 API
- 發送 Email/SMS
- 生成報表
- 圖片/影片處理
- 資料匯入/匯出
- 任何耗時超過 1 秒的操作

## 下一步

Queue 架構解決了 FPM 的穩定性問題，但如果需要**即時回應**，可以考慮「程式碼重構」方案。
`,
        relatedPages: ["refactor-solution", "monitoring", "resource-exhaustion"],
        tags: ["Queue", "非同步", "Laravel", "Redis"]
      },
      {
        id: "refactor-solution",
        title: "方案三：程式碼重構",
        category: "solutions",
        topicId: "php-fpm",
        content: `# 方案三：程式碼重構

## 概述

**程式碼重構**是指：讓 Project A 不要透過 HTTP 呼叫 Project B，而是**直接在 PHP 層面呼叫共用的程式碼**。

這是**效能最好**的方式，完全消除了 HTTP 請求的開銷。

## 為什麼重構能解決問題？

### 問題：HTTP 呼叫的開銷

當 Project A 透過 HTTP 呼叫 Project B 時：

\`\`\`
Project A Worker
  → Guzzle/cURL (PHP 層)
  → OS TCP Stack (系統層)
  → Nginx (Web 伺服器層)
  → FPM Pool B (進程管理層)
  → Project B Worker (PHP 層)
  → Laravel 啟動 (框架層)
  → Controller → Service → 業務邏輯
\`\`\`

這個流程中，每一層都有開銷：
- **網路延遲：** 即使是 localhost，也有 1-5ms
- **Nginx 處理：** 解析 HTTP、轉發請求
- **FPM 分配：** 找空閒 worker、啟動進程
- **Laravel 啟動：** 載入框架、Service Provider、Middleware

### 解決：直接呼叫

\`\`\`
Project A Worker
  → 直接呼叫 PHP 函式
  → 業務邏輯
\`\`\`

完全在同一個 PHP 進程內完成，沒有任何網路或框架啟動開銷。

## 實作步驟

### 1. 識別共用邏輯

找出 Project B 中被 Project A 呼叫的邏輯。

**範例：** Project B 有一個 API 用來計算訂單總價：

\`\`\`php
// Project B: app/Http/Controllers/OrderController.php
public function calculateTotal(Request $request)
{
    $items = $request->input('items');
    $total = 0;
    
    foreach ($items as $item) {
        $product = Product::find($item['id']);
        $total += $product->price * $item['quantity'];
    }
    
    return response()->json(['total' => $total]);
}
\`\`\`

### 2. 抽離成 Service Class

將業務邏輯從 Controller 抽離到獨立的 Service：

\`\`\`php
// Project B: app/Services/OrderService.php
namespace App\\Services;

use App\\Models\\Product;

class OrderService
{
    public function calculateTotal(array $items): float
    {
        $total = 0;
        
        foreach ($items as $item) {
            $product = Product::find($item['id']);
            $total += $product->price * $item['quantity'];
        }
        
        return $total;
    }
}
\`\`\`

更新 Controller：

\`\`\`php
// Project B: app/Http/Controllers/OrderController.php
use App\\Services\\OrderService;

public function calculateTotal(Request $request, OrderService $service)
{
    $items = $request->input('items');
    $total = $service->calculateTotal($items);
    
    return response()->json(['total' => $total]);
}
\`\`\`

### 3. 共用 Service

有兩種方式讓 Project A 使用這個 Service：

#### 方案 A：Composer 套件（推薦）

將 \`OrderService\` 打包成獨立的 Composer 套件：

\`\`\`bash
# 建立套件
mkdir -p packages/order-service
cd packages/order-service
composer init
\`\`\`

**\`packages/order-service/composer.json\`:**
\`\`\`json
{
    "name": "company/order-service",
    "autoload": {
        "psr-4": {
            "Company\\\\OrderService\\\\": "src/"
        }
    }
}
\`\`\`

將 Service 移到套件中：

\`\`\`
packages/order-service/
  src/
    OrderService.php
  composer.json
\`\`\`

在 Project A 和 Project B 中安裝：

\`\`\`json
// composer.json
{
    "repositories": [
        {
            "type": "path",
            "url": "../packages/order-service"
        }
    ],
    "require": {
        "company/order-service": "@dev"
    }
}
\`\`\`

\`\`\`bash
composer update
\`\`\`

#### 方案 B：直接 require（簡單但不推薦）

在 Project A 中直接 require Project B 的檔案：

\`\`\`php
// Project A
require_once '/var/www/project-b/app/Services/OrderService.php';

use App\\Services\\OrderService;

$service = new OrderService();
$total = $service->calculateTotal($items);
\`\`\`

**缺點：** 路徑硬編碼、不易維護、違反依賴管理原則。

### 4. 在 Project A 中使用

**舊的方式（HTTP 呼叫）:**
\`\`\`php
// Project A
use Illuminate\\Support\\Facades\\Http;

$response = Http::post('http://project-b.com/api/calculate-total', [
    'items' => $items
]);

$total = $response->json()['total'];
\`\`\`

**新的方式（直接呼叫）:**
\`\`\`php
// Project A
use Company\\OrderService\\OrderService;

$service = new OrderService();
$total = $service->calculateTotal($items);
\`\`\`

## Queue Worker 中的應用

這個方案在 Queue 架構中特別有用：

**錯誤的作法（Queue Worker 仍會卡住）:**
\`\`\`php
// Queue Job
public function handle()
{
    // ❌ Queue Worker 會等待 HTTP 回應
    Http::post('http://project-b.com/api/process', $this->data);
}
\`\`\`

**正確的作法（完全不經過 FPM）:**
\`\`\`php
// Queue Job
use Company\\OrderService\\OrderService;

public function handle()
{
    // ✅ 直接在 Queue Worker 進程中執行
    $service = new OrderService();
    $service->process($this->data);
}
\`\`\`

## 優點

- **效能最好：** 完全消除 HTTP 請求開銷
- **不佔用 FPM：** 不需要 Project B 的 FPM worker
- **即時回應：** 可以立即得到結果，不需要非同步
- **程式碼重用：** 業務邏輯可以在多個專案間共用

## 缺點

- **耦合度較高：** Project A 和 Project B 需要共用程式碼
- **需要重構：** 需要花時間將業務邏輯抽離
- **資料庫連線：** 需要確保兩個專案可以連接到相同的資料庫

## 注意事項

### 1. 資料庫連線

確保 Project A 可以連接到 Project B 的資料庫：

\`\`\`php
// Project A 的 .env
DB_CONNECTION_B=mysql
DB_HOST_B=localhost
DB_DATABASE_B=project_b
DB_USERNAME_B=root
DB_PASSWORD_B=secret
\`\`\`

\`\`\`php
// config/database.php
'connections' => [
    'mysql' => [...],
    'project_b' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST_B'),
        'database' => env('DB_DATABASE_B'),
        'username' => env('DB_USERNAME_B'),
        'password' => env('DB_PASSWORD_B'),
    ],
],
\`\`\`

在 Service 中指定連線：

\`\`\`php
$product = Product::on('project_b')->find($item['id']);
\`\`\`

### 2. 依賴注入

使用 Laravel 的 Service Container 來管理依賴：

\`\`\`php
// Project A: AppServiceProvider
public function register()
{
    $this->app->bind(OrderService::class, function ($app) {
        return new OrderService();
    });
}
\`\`\`

## 適用情境

- Project A 和 Project B 在同一台主機上
- 需要即時回應（不能使用 Queue）
- 業務邏輯相對獨立，容易抽離
- 兩個專案可以共用資料庫連線

## 與其他方案的比較

| 方案 | 效能 | 穩定性 | 複雜度 | 即時性 |
|------|------|--------|--------|--------|
| 隔離 FPM Pool | 中 | 中 | 低 | 是 |
| Queue 非同步 | 高 | 高 | 中 | 否 |
| 程式碼重構 | 最高 | 高 | 高 | 是 |

## 建議

- **短期：** 先實施「隔離 FPM Pool」提高穩定性
- **中期：** 對不需要即時回應的操作，改用 Queue
- **長期：** 逐步重構，將核心業務邏輯抽離成共用套件
`,
        relatedPages: ["isolate-pools", "queue-solution"],
        tags: ["重構", "效能優化", "程式碼共用"]
      }
    ]
  },
  {
    id: "architecture",
    title: "架構演進",
    icon: "Network",
    description: "理解不同架構方案的優缺點",
    topicId: "php-fpm",
    pages: [
      {
        id: "single-vs-multi-host",
        title: "單主機 vs 多主機",
        category: "architecture",
        topicId: "php-fpm",
        content: `# 單主機 vs 多主機

## 問題

將 Project A 和 Project B 拆分到不同台主機，能否解決 FPM worker 同步等待的問題？

## 答案：不能

**核心問題從未改變：** Project A 的 FPM worker 發起了一個 HTTP 呼叫，**它就必須停在原地，直到 Project B 回應為止。**

## 情境分析

### 架構

- **Server 1 (A):** Nginx + FPM Pool A
- **Server 2 (B):** Nginx + FPM Pool B

### 流程

1. 使用者請求 Server 1 (Project A)
2. Server 1 上的 \`FPM Worker A\` 啟動
3. \`FPM Worker A\` 透過 Guzzle/cURL 呼叫 \`http://project-b.com/api\`
4. 這個請求**透過「外部網路」**（或內網）傳送到 Server 2
5. Server 2 上的 Nginx 收到請求，轉發給 \`FPM Pool B\`
6. Server 2 上的 \`FPM Worker B\` 啟動，開始處理邏輯
7. ... (Worker B 可能要花 3 秒鐘)...
8. **在這 3 秒鐘內，\`FPM Worker A\` (在 Server 1 上) 什麼都沒做，就是在「等待」。** 它仍然佔用著 FPM Pool A 的一個 \`max_children\` 名額

### 結果

#### A 專案的 FPM 瓶頸（依然存在）

如果有 10 個使用者同時請求 Project A，Server 1 上的 FPM Pool A 就會派出 10 個 worker。如果這 10 個 worker 都在等待 Server 2 回應，那麼 **Pool A 就被佔滿了**。第 11 個使用者來訪時，Pool A 沒有空閒 worker，Nginx 同樣會回傳 \`504 Gateway Timeout\`。

#### B 專案的 FPM 瓶頸（依然存在）

這 10 個來自 A 的請求，會同時佔用 Server 2 上 Pool B 的 10 個 worker。如果此時有真實使用者想「直接瀏覽」Project B，Pool B 也可能因為被 A 的請求塞滿而無法回應。

## 拆分到不同主機的影響

### 好處（您解決了什麼）

#### 1. 資源隔離 (CPU / Memory)

這是最大的好處。

如果 Project B 是一個吃 CPU/記憶體的怪物（例如報表生成、圖片處理），在單一主機上，它會拖垮整台伺服器，連 Project A 也會跟著變慢。

拆分後，Project B (Server 2) 就算 CPU 100%，也**不會**影響到 Project A (Server 1) 的 CPU 和記憶體。

#### 2. 徹底避免死鎖 (Deadlock)

在單一主機上，如果 A、B 共用 FPM Pool，A 呼叫 B、B 又呼叫 A，就會「死鎖」。

在不同主機上，它們有各自獨立的 FPM Pool，**絕對不可能**發生 FPM 層級的死鎖。

### 壞處（您引入了什麼）

#### 1. 網路延遲 (Latency)

- **單一主機：** A 呼叫 B (走 \`127.0.0.1\`) 可能 < 1 毫秒
- **不同主機：** A 呼叫 B 必須走實體網路卡、交換器。即使在同一個機房，延遲也可能變成 1-5 毫秒；如果跨機房或跨雲，延遲可能高達 30-100 毫秒

這代表 \`FPM Worker A\` **需要「等待」更久的時間**，反而加劇了 Pool A 的 FPM worker 佔用問題。

#### 2. 網路失敗 (Failure)

您引入了一個全新的、不可靠的故障點：**網路**。

Server 1 和 Server 2 之間的網路可能瞬斷、可能抖動、可能防火牆設定錯誤。

這會導致 \`FPM Worker A\` 遇到 cURL timeout，這類 timeout 通常很長（例如 30 秒），會**更嚴重地**卡住您的 FPM Pool A。

## 結論

拆分主機是一種「**隔離資源**」的手段，**但不是**「**優化通訊**」的手段。

對於「A 同步等待 B」所造成的 FPM 瓶頸：
- **拆分主機：沒有解決**
- **拆分 FPM Pool：沒有解決**

這兩個作法都只是「防止最壞情況（死鎖、資源拖垮）」，但沒有解決「FPM worker 被長時間佔用」的核心問題。

**因此，在多主機架構下，Queue (非同步) 方案變得更加重要。** 它是唯一能讓 \`FPM Worker A\` 不用等待、立刻釋放的解決方案。

## 建議

### 何時應該拆分主機？

- Project B 是資源密集型應用（CPU/記憶體消耗大）
- 需要物理隔離（安全性、合規要求）
- 流量規模大，單一主機無法承載

### 何時不需要拆分主機？

- 兩個專案都是輕量級應用
- 預算有限，無法負擔多台主機
- 可以透過 Queue 或重構解決問題

### 最佳實踐

1. **優先嘗試軟體層面的解決方案：**
   - 隔離 FPM Pool
   - Queue 非同步化
   - 程式碼重構

2. **在軟體方案無法滿足需求時，才考慮拆分主機**

3. **如果已經拆分主機，務必配合 Queue 使用**，否則網路延遲會讓問題更嚴重
`,
        relatedPages: ["localhost-myth", "queue-solution"],
        tags: ["架構", "多主機", "網路"]
      },
      {
        id: "localhost-myth",
        title: "localhost 呼叫的迷思",
        category: "architecture",
        topicId: "php-fpm",
        content: `# localhost 呼叫的迷思

## 常見誤解

「我用 \`localhost\` 或 \`127.0.0.1\` 呼叫 Project B，應該很快吧？不會經過 FPM 吧？」

## 事實

**是的，絕對會經過 FPM。**

\`localhost\` 或 \`127.0.0.1\` **並不是** PHP 函式呼叫的捷徑，它仍然是**完整的網路層呼叫**。

## 完整流程

當 Project A (在一個 FPM worker 中) 執行 Guzzle/cURL 去呼叫 \`http://project-b.test/api/some-endpoint\`（假設 \`project-b.test\` 在 \`/etc/hosts\` 中被指向 \`127.0.0.1\`），會發生以下完整的流程：

### 1. Project A (FPM Worker A)

透過 PHP (cURL) 向作業系統發起一個 TCP 連線請求，目的地是 \`127.0.0.1\` 的 80 埠 (或 443 埠)。

### 2. OS (作業系統)

收到請求，將這個 TCP 封包轉發到本機的 Loopback 網路介面。

### 3. Nginx

Nginx 正在監聽 80 埠。它收到這個**「來自 127.0.0.1」的 HTTP 請求**，就跟收到外部使用者的請求一模一樣。

### 4. Nginx (路由)

Nginx 查看 HTTP 標頭中的 \`Host: project-b.test\`，找到了 Project B 的 \`server\` 區塊設定。

### 5. Nginx (轉發)

Nginx 發現這個請求符合 \`location ~ \\.php$\`，於是透過 Project B 的 socket (例如 \`php-fpm-B.sock\`) 將請求**轉發給 Project B 的 FPM Pool**。

### 6. Project B (FPM Pool B)

FPM Master 從 B 池中挑一個空閒的 worker。

### 7. Project B (FPM Worker B)

這個 worker 啟動 Laravel，執行 Project B 的邏輯。

### 8. 回傳 (1)

Worker B 執行完畢，將結果透過 socket 還給 Nginx。

### 9. 回傳 (2)

Nginx 收到 FPM 的回應，再將其作為一個 HTTP 回應，透過 \`127.0.0.1\` 的 TCP 連線傳回。

### 10. Project A (FPM Worker A)

cURL 函式（它從步驟 1 開始就一直在**等待**）終於收到了 HTTP 回應，Project A 繼續執行。

## 結論

使用 \`localhost\` **完全沒有**繞過 FPM。它只是省去了「外部網路」的延遲，但伺服器內部的：

- **Nginx 處理開銷**
- **FPM 轉發開銷**
- **Project B 的 FPM worker 啟動整個 Laravel 框架的開銷**

一個都沒少。

## 為什麼會有這個誤解？

### 1. 名稱誤導

「localhost」聽起來像是「本地」、「內部」，讓人誤以為是某種「快捷方式」。

### 2. 速度較快

相比外部網路，\`127.0.0.1\` 確實快很多（< 1ms vs 10-100ms），但這只是**相對快**，不代表沒有開銷。

### 3. 與函式呼叫混淆

在同一個 PHP 檔案中呼叫函式（\`function_a()\` 呼叫 \`function_b()\`）確實是「直接呼叫」，沒有網路開銷。

但 HTTP 請求（即使是 \`localhost\`）**永遠不是**函式呼叫，它是**網路通訊**。

## 實際影響

### 單次呼叫

如果只是偶爾呼叫一次，影響不大。

### 高頻呼叫

如果每個請求都要呼叫 Project B，即使使用 \`localhost\`，仍然會：

1. **佔用 FPM Worker A**（等待回應）
2. **佔用 FPM Worker B**（處理請求）
3. **消耗 Nginx 資源**（解析、轉發）
4. **啟動 Laravel 框架**（每次都要重新載入）

這些開銷累積起來，會嚴重影響效能和穩定性。

## 如何真正「繞過」FPM？

只有一個方法：**直接在 PHP 層面呼叫**。

### 錯誤（經過 FPM）

\`\`\`php
// Project A
$response = Http::get('http://localhost/project-b/api/calculate');
\`\`\`

### 正確（不經過 FPM）

\`\`\`php
// Project A
use Company\\OrderService\\OrderService;

$service = new OrderService();
$result = $service->calculate();
\`\`\`

詳細請參考「程式碼重構」章節。

## 總結

- \`localhost\` 呼叫**仍然是 HTTP 請求**
- 它**仍然會經過 Nginx 和 FPM**
- 它**仍然會佔用 FPM worker**
- 要真正繞過 FPM，必須**直接呼叫 PHP 程式碼**
`,
        relatedPages: ["single-vs-multi-host", "refactor-solution"],
        tags: ["localhost", "迷思", "HTTP"]
      },
      {
        id: "queue-pitfall",
        title: "Queue 架構的陷阱",
        category: "architecture",
        topicId: "php-fpm",
        content: `# Queue 架構的陷阱

## 問題

如果 Queue Job 的內容**仍然是**「發起一個 HTTP 請求去呼叫 Project B」，那麼是否真的解決了問題？

## 答案：沒有完全解決

您只是把壓力從 FPM 轉移到了 Queue Worker，Project B 的 FPM 負擔依然存在。

## Queue 方案解決了什麼？

### 1. Project A 的 FPM 瓶頸

**流程：**

1. 使用者請求 Project A
2. Project A 的 FPM worker (Worker A) 接收請求
3. Worker A **只做一件事**：把任務（Job）丟進 Redis 隊列。這個動作**快如閃電**（可能不到 1 毫秒）
4. Worker A **立刻**回傳「OK, 處理中」給使用者
5. **Worker A 被釋放，回到 FPM Pool A，可以去服務下一個使用者了**

在這個流程中，Project A 的 FPM worker **完全沒有「等待」**。因此，Project A 的 FPM Pool 會非常健康，**使用者再也不會**因為 A 等待 B 而看到 \`504\` 錯誤。

### 2. 使用者的即時體驗

使用者不需要等待 3 秒才得到回應，網站回應速度大幅提升。

## Queue 方案沒解決什麼？

### 壓力被轉移了

**流程 (續)：**

6. 在背景，一個**獨立的 Queue Worker** (例如 \`php artisan queue:work\` 程序，**它不屬於 FPM**) 從 Redis 拿到這個 Job
7. 這個 Job 的內容是：「請呼叫 Project B 的 API」
8. Queue Worker 於是發起一個 HTTP 請求到 \`127.0.0.1/project-b-api\`
9. 這個請求，**依然會經過 Nginx，並佔用 Project B 的 FPM Pool (Pool B) 中的一個 worker** (Worker B)

**結果：**

- **舊問題：** FPM Pool A 的 worker **等待** FPM Pool B 的 worker
- **新問題：** Queue Worker **等待** FPM Pool B 的 worker

您只是把「等待者」從 \`FPM Worker A\` 換成了 \`Queue Worker\`。

### 連鎖瓶頸

如果您的背景任務非常多（例如 1 分鐘內有 100 個 Job），而您又開了 20 個 Queue Worker 去執行...

這 20 個 Queue Worker 會**同時**發起 HTTP 請求，**瞬間佔滿** Project B 的 FPM Pool。

**結論：** 如果 Project B 的 API 是瓶頸，那麼採用「Queue + HTTP 呼叫」的方案，**仍然會塞住 FPM Pool B**，導致**直接瀏覽** Project B 網站的真實使用者，會遇到 \`504\` 錯誤。

## 真正的解決方案

真正的長解是**讓 Queue Worker「根本不要」經過 FPM**。

### 正確的作法：程式碼共用

Queue Worker 本身就是一個**純粹的 PHP 執行環境**。它不需要透過 HTTP 協定來「繞一圈」才能執行 Project B 的程式碼。

#### 1. 重構

將 Project B 的「那段被呼叫的商業邏輯」（例如，一個 \`UserService\` 或 \`OrderService\`）從 Controller 中抽離出來，放到一個可以被共用的地方（例如 \`app/Services/\`，或者一個獨立的 Composer 套件）。

#### 2. 修改 Job

修改您的 Queue Job (那個被 Project A 丟進隊列的任務)，讓它的 \`handle()\` 方法**不再是** Guzzle/cURL 呼叫。

#### 3. 直接呼叫

讓這個 \`handle()\` 方法**直接 new 一個 Project B 的 Service Class，並呼叫它的 public method**。

### 範例

**舊的 Job (會塞住 FPM B):**

\`\`\`php
public function handle()
{
    // 透過 HTTP 呼叫，會佔用 FPM B
    Http::post('http://project-b.test/api/process', $this->data);
}
\`\`\`

**新的 Job (最佳解):**

\`\`\`php
use App\\Services\\ProjectB\\OrderService;

public function handle()
{
    // 直接在 PHP 內部呼叫
    // 這不經過 Nginx，不經過 FPM，
    // 只是同一個 Queue Worker 進程內部的函式呼叫
    $service = new OrderService();
    $service->process($this->data);
}
\`\`\`

### 優勢

- **完全繞過 FPM B：** Queue Worker 執行任務時，是在自己的 Process 中執行 PHP 程式碼。它**完全不需要** Nginx 或 FPM B 的介入
- **FPM 職責單一：** FPM Pool A 和 FPM Pool B 現在**只**負責處理「來自真實使用者的即時 Web 請求」
- **壓力隔離：** 所有耗時的、內部的、A 呼叫 B 的任務，全部丟給了 Queue Worker 在背景慢慢跑。即使 Queue Worker 跑到 CPU 100%，也**不會**影響到 FPM Pool，您的網站（A 和 B）對外服務**依然順暢**

## 總結

單純「FPM A -> Queue -> HTTP -> FPM B」的架構，只是把 A 的瓶頸轉移成了 B 的瓶頸。

最穩健、最高效的架構是：

**「FPM A -> Queue -> Queue Worker (直接執行 B 的程式碼)」**

## 實作建議

1. **第一階段：** 先實施 Queue，讓 FPM A 的穩定性提升
2. **第二階段：** 重構 Project B 的業務邏輯，抽離成 Service
3. **第三階段：** 修改 Queue Job，直接呼叫 Service，完全繞過 FPM B

這樣可以循序漸進，每個階段都有明顯的改善。
`,
        relatedPages: ["queue-solution", "refactor-solution"],
        tags: ["Queue", "陷阱", "架構"]
      },
      {
        id: "full-async",
        title: "全面非同步化",
        category: "architecture",
        topicId: "php-fpm",
        content: `# 全面非同步化

## 問題

如果將所有耗時操作都改成非同步（使用 Queue），能否根絕 FPM 問題？

## 答案：能

**...但前提是，您要根絕的是「FPM worker 因同步等待而耗盡」的這個問題。**

## 新架構

\`\`\`
[使用者] -> [FPM A] -> [Queue] -> [Worker A]
[使用者] -> [FPM B] -> [Queue] -> [Worker B]
\`\`\`

### 在這個架構下

#### 1. FPM 的職責極小化

使用者的請求打到 \`FPM A\`。\`FPM A\` 的 worker **唯一**的工作就是：
1. 驗證請求參數
2. 將 Job 丟進 Queue (例如 Redis)

#### 2. 極速回應

這個「丟進 Queue」的動作可能只需要 10 毫秒 (ms)。

#### 3. FPM 立刻釋放

\`FPM A\` 的 worker 在 10ms 後就完成了任務，**立刻回傳「202 Accepted (已受理)」**給使用者，然後**立刻**回到 FPM pool 中等待下一個請求。

### 結果

您的 FPM worker **永遠不會**因為「等待 B 處理 3 秒鐘」而被佔用。您的 FPM Pool 會變得極度健康、可用性極高。

從這個角度看，您**確實**根絕了我們之前討論的所有 FPM 瓶頸問題。

## ⚠️ 注意「通知」這個新陷阱！

### 錯誤的作法（會引發新問題）

\`Worker A\` (背景的 \`queue:work\` 程序) 處理完 3 秒鐘的任務後，為了通知「處理完畢」，它又發起了一個 **HTTP 請求** 去呼叫 Project C 的 API (例如 \`http://project-c.com/notify\`)。

**問題：** 如果 Project C 的 FPM pool (FPM C) 很忙或很慢，\`Worker A\` 就會**卡住並等待** FPM C 回應。

**結果：** 您只是把瓶頸從「FPM A 等 FPM B」變成了「Worker A 等 FPM C」。如果大量 Job 同時卡住，您的 Queue Worker 會全部被佔滿，導致隊列 (Queue) 大量積壓。

### 正確的作法（保持全非同步）

\`Worker A\` 處理完任務後，**不應該**發起同步的 HTTP 呼叫。它應該：

#### 1. 發送另一個 Job

將「通知任務」丟進**另一個**隊列 (例如 \`notifications\` 隊列)，讓專門的通知 worker 去處理（例如發 Email、發 SMS、推播 WebSocket）。

\`\`\`php
public function handle()
{
    // 處理主要任務
    $result = $this->processData();
    
    // ✅ 發送另一個 Job 來處理通知
    SendNotificationJob::dispatch($result);
}
\`\`\`

#### 2. 更新資料庫狀態

直接將 Job 狀態寫入資料庫，讓前端或其他服務自己來查詢。

\`\`\`php
public function handle()
{
    // 處理主要任務
    $result = $this->processData();
    
    // ✅ 更新資料庫
    DB::table('tasks')->where('id', $this->taskId)
        ->update(['status' => 'completed', 'result' => $result]);
}
\`\`\`

## 小結

只要您確保**整個鏈路**都是非同步的（連「通知」也是），那麼是的，您的 FPM (Web 伺服器) 層會變得非常穩定。

## 架構的真正價值

這個架構的真正價值是：**它將「穩定性問題」降級為「效能問題」。**

### 舊架構

A 等 B，B 很慢 → A 被卡死 → **網站掛了 (穩定性問題)**

### 新架構

A 丟 Job，B 的 Queue Worker 處理很慢 → Job 處理延遲 → **網站依然順暢，只是使用者晚一點收到通知 (效能問題)**

「網站掛了」是 P0 級的災難；「Job 延遲」是可以排程優化的 P2 級問題。

## 監控需求

在全面非同步化之後，監控的重點也會改變：

### 1. FPM Slow Log（監控「入口」）

**位置：** \`php-fpm.conf\` 中的 \`request_slowlog_timeout\`

**用途：** 在新架構下，FPM worker 應該 *永遠* 都是 10ms 就完成

**價值：** 這個 FPM slow log **仍然非常重要！** 如果它**居然**記錄到了慢請求，這代表發生了**嚴重問題**，例如：
- 您的 Redis (Queue 伺服器) 掛了或超時了
- FPM worker 在「丟進 Queue 之前」的資料庫查詢就卡住了

**結論：** FPM Slow Log 從「監控業務邏輯」變成了「**監控非同步架構的健康度**」

### 2. 應用程式/Job Slow Log（監控「背景」）

**事實：** 真正的「慢」 (例如 3 秒鐘的業務邏輯) 現在發生在 **Queue Worker** (\`php artisan queue:work\`) 裡面

**FPM Slow Log 看不到這裡！** 因為 Queue Worker **不是** FPM process

**您需要的是：**

- **Laravel Telescope：** 在開發環境中，Telescope 可以完美監控所有 Job 的執行時間
- **APM 工具（推薦）：** 在生產環境中，您需要 New Relic, Datadog 或 Sentry APM 這類工具。它們能幫您監控**每一個**背景 Job 花了多少時間、慢在哪一行程式碼、哪個 SQL 查詢
- **手動日誌：** 在 Job 的 \`handle()\` 方法開頭和結尾手動記錄時間戳，並計算耗時

## 總結

「非同步 + 監控」組合，**確實**是解決 99.99% 這類效能與穩定性問題的最佳實踐。

### 關鍵要點

1. **FPM 只負責接收請求和丟 Job**，不做任何耗時操作
2. **整個鏈路都要非同步**，包括通知
3. **監控重點轉移**，從 FPM 轉到 Queue Worker
4. **穩定性問題降級為效能問題**

### 實施步驟

1. 識別所有耗時操作（> 100ms）
2. 將它們改成 Queue Job
3. 確保 Job 內部也不發起同步 HTTP 請求
4. 建立完善的監控系統
5. 持續優化 Job 的執行效能
`,
        relatedPages: ["queue-solution", "monitoring"],
        tags: ["非同步", "架構", "最佳實踐"]
      }
    ]
  },
  {
    id: "monitoring",
    title: "監控與調優",
    icon: "Activity",
    description: "監控 FPM 效能與診斷問題",
    topicId: "php-fpm",
    pages: [
      {
        id: "fpm-slow-log",
        title: "FPM Slow Log",
        category: "monitoring",
        topicId: "php-fpm",
        content: `# FPM Slow Log

## 什麼是 Slow Log？

FPM Slow Log 是 PHP-FPM 提供的一個強大的診斷工具。它會自動記錄所有執行超過指定時間的 PHP 腳本，並提供詳細的堆疊追蹤 (backtrace)。

## 為什麼需要 Slow Log？

### 問題診斷

當網站出現 504 超時或回應緩慢時，Slow Log 可以幫您找出：

- 哪個 PHP 檔案執行太慢
- 慢在哪一行程式碼
- 當時的函式呼叫堆疊
- 是否在等待資料庫、API 或其他資源

### 效能優化

即使網站沒有明顯問題，Slow Log 也能幫您發現潛在的效能瓶頸。

## 設定 Slow Log

### 1. 編輯 FPM Pool 設定

\`\`\`ini
; /etc/php-fpm.d/www.conf

[www]
; ... 其他設定 ...

; 啟用 slow log
slowlog = /var/log/php-fpm/www-slow.log

; 設定閾值：超過 5 秒的請求會被記錄
request_slowlog_timeout = 5s

; (可選) 設定最大執行時間
request_terminate_timeout = 30s
\`\`\`

### 2. 建立日誌目錄

\`\`\`bash
sudo mkdir -p /var/log/php-fpm
sudo chown www-data:www-data /var/log/php-fpm
\`\`\`

### 3. 重新載入 FPM

\`\`\`bash
sudo systemctl reload php-fpm
\`\`\`

## 日誌格式

### 範例日誌

\`\`\`
[18-Nov-2025 14:23:45]  [pool www] pid 12345
script_filename = /var/www/project-a/public/index.php
[0x00007f8b9c0e1234] curl_exec() /var/www/project-a/vendor/guzzlehttp/guzzle/src/Handler/CurlHandler.php:43
[0x00007f8b9c0e5678] transfer() /var/www/project-a/vendor/guzzlehttp/guzzle/src/Handler/CurlHandler.php:28
[0x00007f8b9c0e9abc] __invoke() /var/www/project-a/vendor/guzzlehttp/guzzle/src/Client.php:87
[0x00007f8b9c0edef0] sendRequest() /var/www/project-a/app/Http/Controllers/OrderController.php:45
[0x00007f8b9c0f1234] processOrder() /var/www/project-a/app/Http/Controllers/OrderController.php:23
\`\`\`

### 解讀

- **時間戳：** \`[18-Nov-2025 14:23:45]\` - 何時發生
- **Pool：** \`[pool www]\` - 哪個 FPM pool
- **PID：** \`pid 12345\` - 哪個 worker 進程
- **腳本：** \`script_filename\` - 執行的 PHP 檔案
- **堆疊追蹤：** 從下往上看，顯示函式呼叫順序

### 分析

從這個日誌可以看出：

1. 慢在 \`curl_exec()\` - 正在等待 HTTP 請求回應
2. 是在 \`OrderController.php\` 的第 45 行發起的
3. 使用的是 Guzzle HTTP 客戶端

**診斷結果：** 這個請求卡在等待外部 API 回應，這正是需要改用 Queue 的典型情境。

## 常見的 Slow Log 模式

### 1. 資料庫查詢

\`\`\`
[0x...] PDOStatement->execute() /var/www/app/Models/User.php:123
[0x...] Illuminate\\Database\\Query\\Builder->get()
\`\`\`

**解決方案：**
- 檢查是否缺少索引
- 優化 SQL 查詢
- 使用快取

### 2. HTTP 請求

\`\`\`
[0x...] curl_exec() /vendor/guzzlehttp/guzzle/...
[0x...] Http::post() /app/Http/Controllers/...
\`\`\`

**解決方案：**
- 改用 Queue 非同步處理
- 增加 timeout 設定
- 檢查外部 API 效能

### 3. 檔案操作

\`\`\`
[0x...] file_get_contents() /app/Services/FileService.php:67
\`\`\`

**解決方案：**
- 檢查檔案大小
- 使用串流讀取
- 改用非同步處理

### 4. 複雜運算

\`\`\`
[0x...] array_map() /app/Services/ReportService.php:234
[0x...] generateReport() /app/Http/Controllers/...
\`\`\`

**解決方案：**
- 優化演算法
- 改用 Queue 背景處理
- 分批處理資料

## 監控建議

### 開發環境

\`\`\`ini
request_slowlog_timeout = 1s
\`\`\`

設定較短的閾值（1 秒），可以更早發現效能問題。

### 生產環境

\`\`\`ini
request_slowlog_timeout = 5s
\`\`\`

設定較長的閾值（5 秒），避免產生過多日誌。

### 定期檢查

\`\`\`bash
# 查看最近的 slow log
tail -f /var/log/php-fpm/www-slow.log

# 統計最常出現的慢請求
grep "script_filename" /var/log/php-fpm/www-slow.log | sort | uniq -c | sort -rn | head -10
\`\`\`

## 與 request_terminate_timeout 的區別

### request_slowlog_timeout

- **作用：** 記錄慢請求到日誌
- **不會終止請求：** 請求會繼續執行
- **用途：** 診斷和監控

### request_terminate_timeout

- **作用：** 強制終止超時的請求
- **會殺掉 worker：** 超過時間的 worker 會被終止
- **用途：** 防止失控的腳本佔用資源

### 建議設定

\`\`\`ini
; 5 秒記錄到 slow log
request_slowlog_timeout = 5s

; 30 秒強制終止
request_terminate_timeout = 30s
\`\`\`

## 注意事項

### 1. 日誌輪轉

Slow log 會持續增長，需要設定日誌輪轉：

\`\`\`bash
# /etc/logrotate.d/php-fpm
/var/log/php-fpm/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        /usr/bin/killall -SIGUSR1 php-fpm > /dev/null 2>&1 || true
    endscript
}
\`\`\`

### 2. 效能影響

記錄堆疊追蹤會有輕微的效能影響，但通常可以忽略不計。

### 3. 隱私問題

Slow log 可能包含敏感資訊（如 SQL 查詢中的資料），需要妥善保管。

## 總結

FPM Slow Log 是診斷效能問題的利器。配合 FPM Status Page 和 APM 工具，可以建立完整的監控體系。
`,
        relatedPages: ["fpm-status-page", "apm-tools"],
        tags: ["監控", "Slow Log", "診斷"]
      },
      {
        id: "fpm-status-page",
        title: "FPM Status Page",
        category: "monitoring",
        topicId: "php-fpm",
        content: `# FPM Status Page

## 什麼是 Status Page？

FPM Status Page 是 PHP-FPM 提供的即時監控頁面，可以查看 FPM Pool 的運行狀態、worker 使用情況、請求統計等關鍵指標。

## 設定 Status Page

### 1. 在 FPM Pool 設定中啟用

\`\`\`ini
; /etc/php-fpm.d/www.conf

[www]
; ... 其他設定 ...

; 啟用 status 頁面
pm.status_path = /fpm-status
\`\`\`

### 2. 重新載入 FPM

\`\`\`bash
sudo systemctl reload php-fpm
\`\`\`

### 3. 在 Nginx 中設定 location

\`\`\`nginx
server {
    listen 80;
    server_name your-site.com;
    
    # ... 其他設定 ...

    # FPM Status Page
    location /fpm-status {
        # 安全性設定: 只允許本機或特定 IP 存取
        allow 127.0.0.1;
        allow YOUR_OFFICE_IP;
        deny all;

        # 轉發給 FPM
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/var/run/php-fpm.sock;
    }
}
\`\`\`

### 4. 重新載入 Nginx

\`\`\`bash
sudo systemctl reload nginx
\`\`\`

## 訪問 Status Page

### 基本格式（純文字）

\`\`\`bash
curl http://your-site.com/fpm-status
\`\`\`

### JSON 格式

\`\`\`bash
curl http://your-site.com/fpm-status?json
\`\`\`

### XML 格式

\`\`\`bash
curl http://your-site.com/fpm-status?xml
\`\`\`

### HTML 格式（完整資訊）

\`\`\`bash
curl http://your-site.com/fpm-status?full
\`\`\`

## 輸出範例

### 基本輸出

\`\`\`
pool:                 www
process manager:      dynamic
start time:           18/Nov/2025:10:00:00 +0800
start since:          12345
accepted conn:        1500
listen queue:         0
max listen queue:     0
listen queue len:     0
idle processes:       3
active processes:     2
total processes:      5
max active processes: 10
max children reached: 1
slow requests:        3
\`\`\`

### 完整輸出（包含每個 worker 的詳細資訊）

\`\`\`bash
curl http://your-site.com/fpm-status?full
\`\`\`

\`\`\`
pool:                 www
process manager:      dynamic
...

************************
pid:                  12345
state:                Running
start time:           18/Nov/2025:14:23:45
start since:          120
requests:             45
request duration:     3500
request method:       POST
request URI:          /api/orders
content length:       256
user:                 www-data
script:               /var/www/public/index.php
last request cpu:     25.50
last request memory:  2097152

************************
pid:                  12346
state:                Idle
start time:           18/Nov/2025:14:20:00
start since:          345
requests:             23
...
\`\`\`

## 關鍵指標解讀

### Pool 資訊

| 欄位 | 說明 | 注意事項 |
|------|------|----------|
| pool | Pool 名稱 | 如果有多個 pool，確認正在查看正確的 pool |
| process manager | 進程管理模式 | dynamic / static / ondemand |
| start time | 啟動時間 | FPM 最後一次啟動的時間 |
| start since | 運行時間（秒） | 距離啟動已經過了多久 |

### 連線統計

| 欄位 | 說明 | 注意事項 |
|------|------|----------|
| accepted conn | 已接受的連線總數 | 累計值，重啟後歸零 |
| listen queue | 當前等待中的請求 | **應該接近 0** |
| max listen queue | 歷史最大等待數 | 如果 > 0，代表曾經有請求等待 |
| listen queue len | 等待佇列長度 | socket backlog 設定值 |

### Worker 狀態

| 欄位 | 說明 | 注意事項 |
|------|------|----------|
| idle processes | 空閒的 worker | 應該 > 0，否則 pool 已滿 |
| active processes | 正在工作的 worker | 正在處理請求的數量 |
| total processes | 總 worker 數 | idle + active |
| max active processes | 歷史最大活躍數 | 曾經同時工作的最大 worker 數 |
| max children reached | 達到上限次數 | **如果 > 0，需要增加 max_children** |

### 效能指標

| 欄位 | 說明 | 注意事項 |
|------|------|----------|
| slow requests | 慢請求總數 | 配合 slow log 使用 |

### Worker 詳細資訊（full 模式）

| 欄位 | 說明 | 注意事項 |
|------|------|----------|
| pid | 進程 ID | 可用於追蹤特定 worker |
| state | 狀態 | Idle / Running / Finishing |
| start since | 處理當前請求的時間（秒） | 如果很大，可能卡住了 |
| requests | 該 worker 處理的總請求數 | 達到 max_requests 會重啟 |
| request duration | 當前請求執行時間（微秒） | 1000000 = 1 秒 |
| request method | HTTP 方法 | GET / POST / ... |
| request URI | 請求的 URI | 正在處理的頁面 |
| last request cpu | CPU 使用率（%） | 上一個請求的 CPU 消耗 |
| last request memory | 記憶體使用（bytes） | 上一個請求的記憶體消耗 |

## 診斷案例

### 案例 1：Pool 已滿

\`\`\`
idle processes:       0
active processes:     20
total processes:      20
max children reached: 15
\`\`\`

**診斷：**
- 所有 worker 都在忙碌（idle = 0）
- 已經達到 \`max_children\` 上限 20 次
- 新的請求會等待或超時

**解決方案：**
1. 檢查 slow log，找出慢請求
2. 增加 \`pm.max_children\`（如果記憶體允許）
3. 實施 Queue 非同步化

### 案例 2：請求等待

\`\`\`
listen queue:         5
max listen queue:     12
\`\`\`

**診斷：**
- 當前有 5 個請求在等待
- 歷史最高等待 12 個
- Worker 處理速度跟不上請求速度

**解決方案：**
1. 增加 worker 數量
2. 優化慢請求
3. 考慮增加伺服器資源

### 案例 3：Worker 卡住

使用 \`?full\` 查看詳細資訊：

\`\`\`
pid:                  12345
state:                Running
start since:          300
request duration:     300000000
request URI:          /api/process-order
\`\`\`

**診斷：**
- 這個 worker 已經執行了 300 秒（5 分鐘）
- 正在處理 \`/api/process-order\`
- 明顯卡住了

**解決方案：**
1. 檢查該 API 的程式碼
2. 查看是否在等待外部資源
3. 考慮設定 \`request_terminate_timeout\`

## 監控腳本

### 簡單的監控腳本

\`\`\`bash
#!/bin/bash
# /usr/local/bin/check-fpm-status.sh

STATUS=\$(curl -s http://localhost/fpm-status)

IDLE=\$(echo "\$STATUS" | grep "idle processes" | awk '{print \$3}')
ACTIVE=\$(echo "\$STATUS" | grep "active processes" | awk '{print \$3}')
MAX_REACHED=\$(echo "\$STATUS" | grep "max children reached" | awk '{print \$4}')

echo "FPM Status:"
echo "  Idle: \$IDLE"
echo "  Active: \$ACTIVE"
echo "  Max Children Reached: \$MAX_REACHED"

if [ "\$IDLE" -eq 0 ]; then
    echo "WARNING: No idle workers available!"
fi

if [ "\$MAX_REACHED" -gt 0 ]; then
    echo "WARNING: Max children limit has been reached \$MAX_REACHED times!"
fi
\`\`\`

### 定期執行

\`\`\`bash
# 加入 crontab
*/5 * * * * /usr/local/bin/check-fpm-status.sh >> /var/log/fpm-monitor.log
\`\`\`

## 安全性注意事項

### 1. 限制訪問

**務必**限制 status page 的訪問，不要對外公開：

\`\`\`nginx
location /fpm-status {
    allow 127.0.0.1;        # 本機
    allow 10.0.0.0/8;       # 內網
    deny all;               # 拒絕其他所有
    
    # ...
}
\`\`\`

### 2. 使用 HTTP 認證

\`\`\`nginx
location /fpm-status {
    auth_basic "FPM Status";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # ...
}
\`\`\`

### 3. 更改路徑

不要使用預設的 \`/fpm-status\`，改用不易猜測的路徑：

\`\`\`ini
pm.status_path = /secret-fpm-monitoring-endpoint-xyz123
\`\`\`

## 與其他監控工具整合

### Prometheus

使用 \`php-fpm_exporter\` 將 FPM 指標匯出到 Prometheus：

\`\`\`bash
docker run -d \\
  -p 9253:9253 \\
  hipages/php-fpm_exporter \\
  --phpfpm.scrape-uri tcp://127.0.0.1:9000/status
\`\`\`

### Grafana

建立 Dashboard 視覺化 FPM 指標。

### Zabbix

使用 Zabbix Agent 定期抓取 status page 並發送告警。

## 總結

FPM Status Page 是即時監控 FPM 健康狀態的最佳工具。配合 Slow Log 和 APM 工具，可以快速診斷和解決 FPM 相關問題。
`,
        relatedPages: ["fpm-slow-log", "apm-tools"],
        tags: ["監控", "Status Page", "即時監控"]
      },
      {
        id: "apm-tools",
        title: "APM 工具",
        category: "monitoring",
        topicId: "php-fpm",
        content: `# APM 工具

## 什麼是 APM？

**APM (Application Performance Monitoring)** 是應用程式效能監控工具，可以深入追蹤應用程式的效能、錯誤、資料庫查詢、外部 API 呼叫等，提供比 FPM Slow Log 更詳細的資訊。

## 為什麼需要 APM？

### FPM Slow Log 的限制

- 只能監控 FPM worker 的請求
- 無法監控 Queue Worker
- 缺少詳細的程式碼層級追蹤
- 沒有視覺化介面

### APM 的優勢

- **全面監控：** Web 請求、Queue Job、CLI 命令
- **程式碼層級追蹤：** 精確到每一行程式碼的執行時間
- **資料庫查詢分析：** 慢查詢、N+1 問題
- **外部服務監控：** HTTP 請求、Redis、Memcached
- **錯誤追蹤：** 自動捕捉異常和錯誤
- **視覺化介面：** 圖表、Dashboard、告警

## 主流 APM 工具

### 1. New Relic

**特點：**
- 功能最完整
- 支援多種語言和框架
- 強大的分析和告警功能

**價格：** 付費（有免費方案）

**Laravel 整合：**

\`\`\`bash
composer require newrelic/newrelic-php-agent
\`\`\`

\`\`\`.env
NEWRELIC_LICENSE_KEY=your-license-key
NEWRELIC_APP_NAME=project-a
\`\`\`

### 2. Datadog

**特點：**
- 基礎設施 + 應用程式監控
- 強大的日誌聚合功能
- 支援分散式追蹤

**價格：** 付費

**Laravel 整合：**

\`\`\`bash
composer require datadog/dd-trace
\`\`\`

### 3. Sentry

**特點：**
- 專注於錯誤追蹤
- 開源（可自架）
- 優秀的錯誤分組和通知

**價格：** 免費 + 付費方案

**Laravel 整合：**

\`\`\`bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=your-dsn
\`\`\`

### 4. Laravel Telescope（開發環境）

**特點：**
- Laravel 官方工具
- 完全免費
- 僅適合開發環境

**安裝：**

\`\`\`bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
\`\`\`

訪問 \`http://your-site.test/telescope\`

### 5. Laravel Horizon（Queue 監控）

**特點：**
- Laravel 官方 Queue 監控工具
- 即時監控 Queue Worker
- 完全免費

**安裝：**

\`\`\`bash
composer require laravel/horizon
php artisan horizon:install
php artisan horizon
\`\`\`

訪問 \`http://your-site.com/horizon\`

## 監控 Queue Worker

在全面非同步化的架構中，監控 Queue Worker 變得非常重要。

### 使用 Horizon

Horizon 提供：

- **即時監控：** 查看正在執行的 Job
- **失敗 Job 管理：** 重試、刪除
- **吞吐量統計：** 每分鐘處理的 Job 數量
- **等待時間：** Job 在 Queue 中等待的時間
- **記憶體使用：** Worker 的記憶體消耗

### 使用 APM 工具

New Relic、Datadog 等工具可以自動追蹤 Queue Job：

\`\`\`php
// Job 會自動被 APM 追蹤
class ProcessOrderJob implements ShouldQueue
{
    public function handle()
    {
        // APM 會記錄這裡的所有操作
        $order = Order::find($this->orderId);
        $order->process();
    }
}
\`\`\`

## 監控指標

### Web 請求

- **回應時間：** 平均、P95、P99
- **吞吐量：** 每分鐘請求數（RPM）
- **錯誤率：** 5xx、4xx 錯誤比例
- **最慢的端點：** 哪些 API 最慢

### Queue Job

- **執行時間：** 每個 Job 的平均執行時間
- **失敗率：** Job 失敗的比例
- **等待時間：** Job 在 Queue 中等待多久
- **積壓數量：** Queue 中未處理的 Job 數量

### 資料庫

- **慢查詢：** 執行時間 > 1 秒的查詢
- **N+1 問題：** 重複的查詢
- **查詢數量：** 每個請求執行了多少個查詢

### 外部服務

- **HTTP 請求：** 呼叫外部 API 的時間
- **Redis 操作：** 快取讀寫時間
- **第三方服務：** 支付、簡訊、Email

## 告警設定

### 關鍵告警

#### 1. FPM Pool 滿載

\`\`\`
當 idle processes = 0 持續 > 1 分鐘
→ 發送告警
\`\`\`

#### 2. 回應時間過長

\`\`\`
當 P95 回應時間 > 3 秒
→ 發送告警
\`\`\`

#### 3. 錯誤率過高

\`\`\`
當 5xx 錯誤率 > 1%
→ 發送告警
\`\`\`

#### 4. Queue 積壓

\`\`\`
當 Queue 長度 > 1000
→ 發送告警
\`\`\`

#### 5. Job 失敗率

\`\`\`
當 Job 失敗率 > 5%
→ 發送告警
\`\`\`

## 最佳實踐

### 1. 分層監控

- **基礎層：** FPM Status Page、Slow Log
- **應用層：** Telescope (開發)、Horizon (Queue)
- **深度層：** APM 工具（生產環境）

### 2. 合理設定閾值

- **開發環境：** 嚴格（1 秒）
- **測試環境：** 中等（3 秒）
- **生產環境：** 寬鬆（5 秒）

### 3. 定期審查

每週審查：
- 最慢的 10 個端點
- 最慢的 10 個 Job
- 最慢的 10 個資料庫查詢

### 4. 持續優化

- 優化慢查詢（加索引）
- 重構慢端點（改用 Queue）
- 快取常用資料

## 監控 Dashboard 範例

### FPM 健康度

\`\`\`
- Idle Workers: 3 / 10
- Active Workers: 7 / 10
- Max Children Reached: 0 (今日)
- Slow Requests: 12 (今日)
\`\`\`

### 效能指標

\`\`\`
- 平均回應時間: 250ms
- P95 回應時間: 800ms
- P99 回應時間: 1.5s
- 吞吐量: 120 RPM
\`\`\`

### Queue 狀態

\`\`\`
- 待處理 Job: 45
- 處理中 Job: 8
- 失敗 Job: 2 (今日)
- 平均等待時間: 3 秒
\`\`\`

## 總結

APM 工具是監控現代 PHP 應用程式的必備工具，特別是在實施 Queue 非同步架構後。配合 FPM Slow Log 和 Status Page，可以建立完整的監控體系，快速發現和解決效能問題。

### 推薦組合

**開發環境：**
- Laravel Telescope
- Laravel Horizon
- FPM Slow Log

**生產環境：**
- New Relic / Datadog / Sentry
- Laravel Horizon
- FPM Status Page
- FPM Slow Log
`,
        relatedPages: ["fpm-slow-log", "fpm-status-page"],
        tags: ["APM", "監控", "工具"]
      }
    ]
  }

  ]
};
