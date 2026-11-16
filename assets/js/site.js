/* =========================================================
   WebGIS 課程資料庫 — 全站共用腳本
   - 每一頁都只載入這支腳本：<script src="{root}/assets/js/site.js" data-root="{root}" defer></script>
   - 頁首、頁尾、標題區、目錄、上下篇、原始碼區都由這裡依 data/catalog.json 產生
   - 內容頁只需要寫 <article> 內的正文
   ========================================================= */
(() => {
  const script = document.currentScript;
  const ROOT = (script && script.dataset.root) || ".";
  const url = (p) => `${ROOT}/${p}`.replace(/^\.\//, "./");

  const TYPES = {
    lecture: { label: "講義", folder: "lectures" },
    code: { label: "程式碼", folder: "code" },
    note: { label: "筆記", folder: "notes" },
  };
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 頁首／頁尾 ---------- */
  const LOGO = `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="12.5" fill="none" stroke="#1d2a2a" stroke-width="1.5"/><path d="M3 15c4-3 7 2 11-1s6-5 11-2" fill="none" stroke="#1f6f78" stroke-width="1.5"/><path d="M5 20c4-2 7 1 10-1s5-3 9-1" fill="none" stroke="#b8651b" stroke-width="1.5"/><path d="M14 4.5c-2.6 0-4.5 2-4.5 4.4 0 3.2 4.5 7.6 4.5 7.6s4.5-4.4 4.5-7.6c0-2.4-1.9-4.4-4.5-4.4z" fill="#c2412d"/><circle cx="14" cy="9" r="1.6" fill="#fffdf8"/></svg>`;

  function renderChrome() {
    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `<div class="inner">
      <a class="brand" href="${url("index.html")}">${LOGO}WebGIS 課程資料庫</a>
      <nav class="site-nav">
        <a href="${url("index.html")}">全部</a>
        ${Object.entries(TYPES).map(([k, t]) => `<a data-type="${k}" href="${url("index.html")}?type=${k}">${t.label}</a>`).join("")}
      </nav></div>`;
    document.body.prepend(header);

    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `<div class="inner">
      <span>WebGIS 課程資料庫 · 個人課程筆記與程式碼整理</span>
      <span>規則文件：<a href="https://github.com/meimei7918/Homework9/blob/main/CLAUDE.md">CLAUDE.md</a></span></div>`;
    document.body.append(footer);
  }

  async function loadCatalog() {
    const res = await fetch(url("data/catalog.json"), { cache: "no-cache" });
    if (!res.ok) throw new Error("無法讀取 data/catalog.json");
    const cat = await res.json();
    cat.items.sort((a, b) => a.week - b.week || ["lecture", "code", "note"].indexOf(a.type) - ["lecture", "code", "note"].indexOf(b.type) || a.date.localeCompare(b.date));
    return cat;
  }

  /* ---------- 首頁 ---------- */
  function renderHome(cat) {
    const params = new URLSearchParams(location.search);
    const state = { type: params.get("type") || "all", tag: params.get("tag") || "", q: "" };

    for (const k of Object.keys(TYPES)) {
      const el = document.querySelector(`#stat-${k}`);
      if (el) el.textContent = cat.items.filter((i) => i.type === k).length;
    }
    const weeksEl = document.querySelector("#stat-weeks");
    if (weeksEl) weeksEl.textContent = new Set(cat.items.map((i) => i.week)).size;

    const chips = document.querySelectorAll(".chip");
    const search = document.querySelector(".search");
    const tagBox = document.querySelector(".active-tag");
    const list = document.querySelector("#catalog");

    function draw() {
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.type === state.type)));
      tagBox.innerHTML = state.tag ? `標籤：<code>${esc(state.tag)}</code> <button type="button">✕ 清除</button>` : "";
      const q = state.q.trim().toLowerCase();
      const items = cat.items.filter((i) =>
        (state.type === "all" || i.type === state.type) &&
        (!state.tag || i.tags.includes(state.tag)) &&
        (!q || [i.title, i.summary, ...i.tags].join(" ").toLowerCase().includes(q)));

      if (!items.length) { list.innerHTML = `<p class="empty">找不到符合的內容。</p>`; return; }
      const weeks = [...new Set(items.map((i) => i.week))];
      list.innerHTML = weeks.map((w) => `
        <section class="week" id="w${pad(w)}">
          <div class="week-label"><div class="num">W${pad(w)}</div><div class="topic">${esc(cat.weeks[pad(w)] || "")}</div></div>
          <div class="cards">${items.filter((i) => i.week === w).map(card).join("")}</div>
        </section>`).join("");
    }
    const card = (i) => `
      <a class="card" data-type="${i.type}" href="${url(i.path)}">
        <div class="meta"><span class="badge">${TYPES[i.type].label}</span><time>${i.date}</time></div>
        <h3>${esc(i.title)}</h3>
        <p>${esc(i.summary)}</p>
        <div class="tags">${i.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}</div>
      </a>`;

    chips.forEach((c) => c.addEventListener("click", () => { state.type = c.dataset.type; sync(); draw(); }));
    search.addEventListener("input", () => { state.q = search.value; draw(); });
    tagBox.addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") { state.tag = ""; sync(); draw(); } });
    function sync() {
      const p = new URLSearchParams();
      if (state.type !== "all") p.set("type", state.type);
      if (state.tag) p.set("tag", state.tag);
      history.replaceState(null, "", p.toString() ? `?${p}` : location.pathname);
    }
    draw();
  }

  /* ---------- 內容頁 ---------- */
  async function renderPage(cat) {
    const id = document.body.dataset.id;
    const item = cat.items.find((i) => i.id === id);
    if (!item) {
      const warn = document.createElement("div");
      warn.className = "catalog-warning";
      warn.textContent = `此頁 data-id="${id}" 尚未登錄在 data/catalog.json，請補上。`;
      document.querySelector(".site-header").after(warn);
      return;
    }
    document.body.dataset.type = item.type;
    const t = TYPES[item.type];

    const head = document.querySelector("#page-head");
    if (head) {
      head.className = "page-head";
      head.innerHTML = `
        <div class="crumbs"><a href="${url("index.html")}">首頁</a> / <a href="${url("index.html")}?type=${item.type}">${t.label}</a> / <a href="${url("index.html")}#w${pad(item.week)}">W${pad(item.week)} ${esc(cat.weeks[pad(item.week)] || "")}</a></div>
        <h1>${esc(item.title)}</h1>
        <div class="meta"><span class="badge">${t.label}</span><time>${item.date}</time>
          <span class="tags">${item.tags.map((g) => `<a class="tag" href="${url("index.html")}?tag=${encodeURIComponent(g)}">#${esc(g)}</a>`).join("")}</span></div>
        <p class="summary">${esc(item.summary)}</p>`;
    }

    // 講義附件
    const filesBox = document.querySelector("#files");
    if (filesBox && item.files && item.files.length) {
      filesBox.innerHTML = `<ul class="files">${item.files.map((f) => `<li><a href="${url(f.path)}" download>${esc(f.label)}</a></li>`).join("")}</ul>`;
    } else if (filesBox) {
      filesBox.innerHTML = `<p class="empty" style="padding:8px 0;text-align:left">本週沒有附件。</p>`;
    }

    // 程式碼頁：從 src 讀入原始碼並顯示（原始碼只維護一份）
    const src = document.querySelector("#source");
    if (src && item.src) {
      try {
        const code = await (await fetch(url(item.src), { cache: "no-cache" })).text();
        const lang = item.src.split(".").pop();
        src.innerHTML = `<div class="source-bar"><span>${esc(item.src)}</span><a href="${url(item.src)}" download>下載原始碼 ↓</a></div><pre><code class="language-${lang === "js" ? "javascript" : lang}">${esc(code)}</code></pre>`;
      } catch (e) {
        src.textContent = "原始碼讀取失敗：" + e.message;
      }
    }

    // 上一篇／下一篇（同類型）
    const same = cat.items.filter((i) => i.type === item.type);
    const idx = same.findIndex((i) => i.id === item.id);
    const pager = document.querySelector("#pager");
    if (pager) {
      pager.className = "pager";
      const prev = same[idx - 1], next = same[idx + 1];
      pager.innerHTML =
        (prev ? `<a class="prev" href="${url(prev.path)}"><small>← 上一篇${t.label}</small>${esc(prev.title)}</a>` : "") +
        (next ? `<a class="next" href="${url(next.path)}"><small>下一篇${t.label} →</small>${esc(next.title)}</a>` : "");
    }
  }

  /* ---------- 目錄、複製按鈕、語法高亮 ---------- */
  function enhance() {
    const toc = document.querySelector("#toc");
    const hs = [...document.querySelectorAll("article h2")];
    if (toc && hs.length) {
      hs.forEach((h, n) => { if (!h.id) h.id = `s${n + 1}`; });
      toc.className = "toc";
      toc.innerHTML = `<h4>本頁目錄</h4><ol>${hs.map((h) => `<li><a href="#${h.id}">${esc(h.textContent)}</a></li>`).join("")}</ol>`;
    }
    document.querySelectorAll("article pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.className = "copy-btn"; btn.type = "button"; btn.textContent = "複製";
      btn.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(pre.querySelector("code")?.innerText ?? pre.innerText); btn.textContent = "已複製"; }
        catch { btn.textContent = "無法複製"; }
        setTimeout(() => (btn.textContent = "複製"), 1500);
      });
      pre.append(btn);
    });
    if (window.hljs) document.querySelectorAll("pre code").forEach((el) => window.hljs.highlightElement(el));
  }

  document.addEventListener("DOMContentLoaded", async () => {
    renderChrome();
    try {
      const cat = await loadCatalog();
      if (document.body.classList.contains("home")) renderHome(cat);
      else await renderPage(cat);
    } catch (e) {
      console.error(e);
      const warn = document.createElement("div");
      warn.className = "catalog-warning";
      warn.textContent = "讀取 catalog.json 失敗。本機預覽請用 python3 -m http.server，不要直接雙擊開檔。";
      document.querySelector(".site-header").after(warn);
    }
    enhance();
  });
})();
