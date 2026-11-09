/* =========================================================
   靈機 AI 客服 — 互動腳本（作品集示範 #3）
   作者：工程
   功能：行動選單、捲動效果、模擬 AI 客服對話、預約表單驗證
   說明：對話回覆由前端規則比對驅動，用於展示互動效果；
        正式版可改接真實 LLM API（見 README）。
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 1. 行動選單 ---------- */
  const navToggle = $("#navToggle");
  const mainNav = $("#mainNav");
  const backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  document.body.appendChild(backdrop);

  function setNav(open) {
    if (!navToggle || !mainNav) return;
    navToggle.classList.toggle("is-open", open);
    mainNav.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
  }
  navToggle?.addEventListener("click", () => setNav(!mainNav.classList.contains("is-open")));
  backdrop.addEventListener("click", () => setNav(false));
  $$("#mainNav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* ---------- 2. Header + 回頂端 ---------- */
  const header = $("#siteHeader");
  const toTop = $("#toTop");
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 20);
    toTop?.classList.toggle("is-visible", y > 800);
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- 3. 捲動進場 ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 4. 模擬 AI 客服對話 ---------- */
  const KB = [
    {
      id: "q_shipping",
      keywords: ["運費", "運送", "寄送", "免運", "多久到", "物流"],
      answer: "我們全館滿 NT$1,200 免運，未達門檻運費為 NT$80。出貨時間為每週三與週六，宅配約 1–2 個工作日、超商取貨約 2–3 天到貨喔 🙂",
      chips: [
        { q: "可以指定到貨日嗎？", a: "可以的，結帳時在備註欄寫下希望的到貨日，我們會盡量配合；若遇連假會提前告知。" },
        { q: "有超商取貨嗎？", a: "有，提供 7-11 與全家取貨，運費 NT$60，滿免運門檻一樣免運。" },
      ],
    },
    {
      id: "q_return",
      keywords: ["退貨", "換貨", "退換", "鑑賞", "不喜歡", "瑕疵"],
      answer: "沒問題！我們提供 7 天鑑賞期，商品保持完整即可退換。若是運送破損，拍照回傳給我們，會直接為你補寄新品，運費由我們負擔 🙌",
      chips: [
        { q: "怎麼申請退貨？", a: "回覆這則對話並提供訂單編號即可，我們會安排黑貓到府收件，退款約 3–5 個工作日入帳。" },
      ],
    },
    {
      id: "q_hours",
      keywords: ["門市", "營業", "幾點", "開店", "時間", "地址", "在哪"],
      answer: "門市在台北市大同區赤峰街 41 巷 6 號 1 樓（捷運雙連站 1 號出口步行 5 分鐘）。營業時間為週二至週日 12:00–20:00，週一公休。線上下單也可選門市自取喔！",
      chips: [
        { q: "今天有開嗎？", a: "今天是週一，門市公休喔！線上客服 24 小時都在，可以聊聊選品 🤗" },
      ],
    },
    {
      id: "q_order",
      keywords: ["訂單", "到哪", "出貨", "進度", "查詢", "還沒收到"],
      answer: "想幫你查訂單～請提供訂單編號（例如 DZ20261109），我就立即為你確認出貨進度。若已出貨，也會附上物流單號方便你追蹤。",
      chips: [
        { q: "DZ20261109", a: "查到了！這筆訂單已於今天出貨，黑貓單號 1234-567-890，預計明天下午前送達 🚚" },
        { q: "我忘記訂單編號了", a: "沒關係，請提供下單時使用的手機號碼，我用電話號碼幫你查。" },
      ],
    },
    {
      id: "q_human",
      keywords: ["真人", "人工", "客服人員", "電話", "找人"],
      answer: "好的，正在為你轉接真人客服 🙋 我們的服務時間是週二至週日 12:00–20:00，非營業時間也可以留言，我們會於上班後第一時間回覆。",
      chips: [
        { q: "留下我的電話", a: "請留下方便聯絡的電話與時段，真人客服會盡快與你聯繫。" },
      ],
    },
    {
      id: "q_product",
      keywords: ["推薦", "商品", "買什麼", "選品", "禮物", "伴手禮"],
      answer: "本季最受歡迎的是「窯變釉馬克杯」和「炭焙凍頂烏龍」，當作禮物很有質感 🎁 方便告訴我是要送人還是自用嗎？我可以再幫你挑。",
      chips: [
        { q: "要送人的", a: "送人的話推薦「東方美人茶罐」搭配「相思木托盤」，我們可免費附上手寫卡片與禮盒包裝 🎀" },
        { q: "自己用的", a: "自用推薦馬克杯或大豆蠟燭，都是每天會用到、越看越順眼的小物 ☕" },
      ],
    },
  ];

  const GREETING = {
    keywords: ["你好", "哈囉", "嗨", "hi", "hello", "在嗎"],
    answer: "您好呀！😊 我是島作選物的 AI 客服，運費、退換貨、門市資訊或訂單查詢都可以問我。",
  };
  const THANKS = { keywords: ["謝謝", "感謝", "thanks", "thank"], answer: "不客氣！有其他問題隨時找我 🌿" };
  const FALLBACK = "這個問題我需要再確認一下，正在幫你轉接真人客服 🙋 也可以先點下面的問題，或留下聯絡方式，我們會盡快回覆。";

  function findIntent(text) {
    const t = text.toLowerCase();
    for (const item of KB) {
      if (item.keywords.some((k) => t.includes(k.toLowerCase()))) return item;
    }
    if (GREETING.keywords.some((k) => t.includes(k)) ) return GREETING;
    if (THANKS.keywords.some((k) => t.includes(k))) return THANKS;
    return null;
  }

  const chatLog = $("#chatLog");
  const chatForm = $("#chatForm");
  const chatText = $("#chatText");
  const chipsWrap = $("#chatChips");
  const chatWindow = $(".chat-window");
  let busy = false;

  function scrollLog() { if (chatLog) chatLog.scrollTop = chatLog.scrollHeight; }

  function addBot(text) {
    const el = document.createElement("div");
    el.className = "msg msg-bot";
    el.innerHTML = `<p>${text}</p>`;
    chatLog.appendChild(el);
    scrollLog();
  }
  function addUser(text) {
    const el = document.createElement("div");
    el.className = "msg msg-user";
    el.innerHTML = `<p>${text}</p>`;
    chatLog.appendChild(el);
    scrollLog();
  }
  function addTyping() {
    const el = document.createElement("div");
    el.className = "msg msg-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    chatLog.appendChild(el);
    scrollLog();
    return el;
  }

  function renderChips(chips) {
    if (!chipsWrap || !chips) return;
    chipsWrap.innerHTML = chips
      .map((c) => `<button type="button" data-q="${encodeURIComponent(c.q)}" data-a="${encodeURIComponent(c.a)}">${c.q}</button>`)
      .join("");
  }

  function handle(text, presetAnswer) {
    if (!chatLog || busy) return;
    const q = text.trim();
    if (!q) return;
    busy = true;
    addUser(q);

    const typing = addTyping();
    const delay = 500 + Math.min(q.length * 30, 900);

    setTimeout(() => {
      typing.remove();
      const intent = findIntent(q);
      const answer = presetAnswer || (intent ? intent.answer : FALLBACK);
      addBot(answer);
      if (intent && intent.chips && !presetAnswer) {
        renderChips(intent.chips);
      } else if (!presetAnswer) {
        renderChips([
          { q: "運費怎麼算？", a: KB[0].answer },
          { q: "門市幾點開？", a: KB[2].answer },
          { q: "我要找真人", a: KB[4].answer },
        ]);
      }
      busy = false;
    }, delay);
  }

  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = chatText.value;
    chatText.value = "";
    handle(v);
  });

  chipsWrap?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-q]");
    if (!btn) return;
    const rawQ = btn.dataset.q;
    // 靜態按鈕用知識庫 id（q_xxx）：以按鈕文字為問題、知識庫回覆為答案
    const byId = KB.find((k) => k.id === rawQ);
    if (byId) { handle(btn.textContent.trim(), byId.answer); return; }
    const q = decodeURIComponent(rawQ);
    const a = btn.dataset.a ? decodeURIComponent(btn.dataset.a) : "";
    handle(q, a || undefined);
  });

  // 進入畫面時主動招呼一次
  if (chatWindow && "IntersectionObserver" in window) {
    const once = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => { if (!busy) addBot("要不要先試試下面的問題？👇"); }, 900);
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 });
    once.observe(chatWindow);
  }

  /* ---------- 5. 預約表單驗證 ---------- */
  const form = $("#leadForm");
  const success = $("#formSuccess");

  const rules = {
    "l-name": (v) => (v.trim().length >= 2 ? "" : "請輸入姓名（至少 2 個字）"),
    "l-email": (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "請輸入有效的 Email"),
    "l-phone": (v) => (/^0\d{8,9}$/.test(v.trim().replace(/\D/g, "")) ? "" : "請輸入有效的市話或手機號碼"),
    "l-industry": (v) => (v ? "" : "請選擇產業別"),
  };

  function validateField(id) {
    const input = $("#" + id);
    if (!input) return true;
    const field = input.closest(".field");
    const errEl = $(`.error[data-for="${id}"]`);
    const msg = rules[id] ? rules[id](input.value) : "";
    field?.classList.toggle("has-error", !!msg);
    if (errEl) errEl.textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach((id) => {
    const input = $("#" + id);
    input?.addEventListener("blur", () => validateField(id));
    input?.addEventListener("input", () => { if (input.closest(".field")?.classList.contains("has-error")) validateField(id); });
    input?.addEventListener("change", () => { if (input.closest(".field")?.classList.contains("has-error")) validateField(id); });
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map((id) => validateField(id)); // 逐一驗證，讓所有欄位都顯示錯誤
    if (!results.every(Boolean)) {
      $(".field.has-error input, .field.has-error select")?.focus();
      return;
    }
    // 示範：僅前端顯示成功。實際串接時改為 fetch() 送出 API 或 Netlify Forms。
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  $("#resetForm")?.addEventListener("click", () => {
    form.reset();
    $$(".field").forEach((f) => f.classList.remove("has-error"));
    $$(".error").forEach((el) => (el.textContent = ""));
    form.hidden = false;
    success.hidden = true;
    $("#l-name")?.focus();
  });

  /* ---------- 6. 頁尾年份 ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
