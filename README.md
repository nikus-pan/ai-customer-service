# 靈機 AI 客服｜AI 客服整合展示頁（作品集範例 #3）

以純 HTML / CSS / JavaScript 打造的 AI 客服產品展示頁，主打「一眼看到效果」：可互動的模擬對話、功能說明與定價方案，全部一頁呈現。

- 展示重點：**可互動的 AI 客服對話**、**痛點對比**、**功能矩陣**、**導入流程**、**三階定價**、**FAQ**、**預約表單驗證**、**RWD**
- 技術：純靜態（HTML5 + CSS3 + 原生 JS），零依賴、零建置
- 設計調性：深色科技感 + 紫藍漸層，與作品集 #1（餐廳）、#2（選物店）刻意區隔，適合展示 AI / SaaS 產品

---

## 1. 檔案結構

```
ai-customer-service/
├── index.html          # 單頁式展示頁（語意化標籤、SEO / Open Graph meta）
├── css/
│   └── style.css       # 全部樣式（CSS 變數、Grid/Flex、三段 RWD 斷點）
├── js/
│   └── main.js         # 互動邏輯（選單、捲動動畫、模擬對話、表單驗證）
├── preview/            # 實機渲染截圖
└── README.md           # 本說明文件
```

---

## 2. 本機預覽

```bash
cd ai-customer-service
python3 -m http.server 8080
# 開啟 http://localhost:8080
```

---

## 3. 部署到 GitHub Pages

1. 建立新的 GitHub repository，例如 `spark-ai-desk`。
2. 把 `ai-customer-service/` **裡面的內容**上傳到 repo 根目錄（`index.html` 必須在根目錄）。
3. repo → **Settings → Pages** → Source 選 `Deploy from a branch`，Branch 選 `main`、資料夾 `/ (root)` → Save。
4. 網址：`https://<你的帳號>.github.io/spark-ai-desk/`

## 4. 部署到 Netlify

把整個 `ai-customer-service` 資料夾拖到 <https://app.netlify.com/drop> 即可；或連結 GitHub repo，Publish directory 填 `.`。

---

## 5. 對話展示怎麼運作

- `js/main.js` 的 `KB` 陣列是「意圖 → 關鍵字 → 回覆 → 延伸選項」的規則表，前端用關鍵字比對決定回覆，並有打字動畫與建議問題。
- 這是**展示用的規則式對話**，不是真的 LLM，目的是讓潛在客戶秒懂互動效果、且離線也能跑。
- **要接真實 AI**：把 `findIntent()` 之後的取答案邏輯改成呼叫後端 API，例如：

  ```js
  // 前端
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText, sessionId }),
  });
  const { reply } = await res.json();
  addBot(reply);
  ```

  後端可用 OpenAI / Anthropic / 本地 Ollama，並把知識庫做 RAG 檢索後再回答。

---

## 6. 內容替換指南

| 想改的東西 | 到哪裡改 |
| --- | --- |
| 產品名稱 / 標語 | `index.html`（搜尋 `靈機 AI 客服`） |
| 對話知識庫（問答與延伸選項） | `js/main.js` 最上方的 `KB` 陣列 |
| 定價方案 | `index.html` 的 `#pricing` 區塊 |
| FAQ | `index.html` 的 `#faq` 區塊 |
| 品牌漸層色 | `css/style.css` 的 `:root` 變數（`--indigo`、`--violet`、`--cyan`、`--grad`） |
| 表單串接 | `js/main.js` 的送出處理（見 README 第 5 節） |

---

## 7. 相容性與無障礙

- 支援現代瀏覽器（Chrome / Edge / Safari / Firefox 最新版）。
- 對話區使用 `aria-live="polite"`，FAQ 用原生 `<details>`，鍵盤可操作。
- 尊重 `prefers-reduced-motion`。

---

*本頁為作品集示範用途，產品名稱、數據與定價皆為虛構。靈機工作室 Spark Studio · nikus9612@gmail.com*
