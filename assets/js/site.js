/* =========================================================
   WebGIS 課程資料庫 — 全站唯一共用腳本
   每頁只載入：<script src="{root}/assets/js/site.js" data-root="{root}" defer></script>
   依 data/catalog.json 產生：頁首頁尾、首頁路線圖、標題區、相關連結、
   資源清單、範例程式檢視器、測驗互動、目錄、上下篇。
   ========================================================= */
(() => {
  const ROOT = document.currentScript?.dataset.root || ".";
  const url = (p) => `${ROOT}/${p}`;

  const TYPES = {
    lecture: { label: "講義筆記", short: "講義", folder: "lectures" },
    code: { label: "範例程式", short: "程式", folder: "code" },
    practice: { label: "課後練習", short: "練習", folder: "practice" },
    note: { label: "我的筆記", short: "筆記", folder: "notes" },
  };
  const ORDER = Object.keys(TYPES);
  const RES_KIND = {
    mentioned: "講義中提到的",
    practice: "練習用",
    reference: "延伸參考",
  };
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
  const badge = (type, short) => `<span class="badge" data-type="${type}">${short ? TYPES[type].short : TYPES[type].label}</span>`;

  /* ---------- 頁首／頁尾 ---------- */
  const LOGO = `<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M4 22 L13 13 L26 13" fill="none" stroke="#1f6f78" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 4 L13 13 L13 26" fill="none" stroke="#b8651b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="13" r="4.2" fill="#fff" stroke="#1d2a2a" stroke-width="2.4"/></svg>`;

  function renderChrome(page) {
    const header = document.createElement("header");
    header.className = "site-header";
    const navItem = (href, label, type, key) => `<a href="${href}"${type ? ` data-type="${type}"` : ""}${page === key ? ' aria-current="page"' : ""}>${label}</a>`;
    header.innerHTML = `<div class="inner">
      <a class="brand" href="${url("index.html")}">${LOGO}WebGIS 課程資料庫</a>
      <nav class="site-nav" aria-label="主選單">
        ${ORDER.map((k) => navItem(`${url("index.html")}?type=${k}`, TYPES[k].short, k, k)).join("")}
        ${navItem(url("resources.html"), "資源", "resource", "resources")}
      </nav></div>`;
    document.body.prepend(header);
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `<div class="inner"><span>臺大地理系 WebGIS 課程的個人筆記。講義筆記與練習由 AI 依課堂講義整理，原始講義請見 NTU COOL。</span>
      <a href="https://github.com/meimei7918/Homework9">GitHub 原始碼</a></div>`;
    document.body.append(footer);
  }

  async function loadCatalog() {
    const res = await fetch(url("data/catalog.json"), { cache: "no-cache" });
    if (!res.ok) throw new Error("catalog");
    const cat = await res.json();
    cat.items.sort((a, b) => a.week - b.week || ORDER.indexOf(a.type) - ORDER.indexOf(b.type) || (a.order ?? 0) - (b.order ?? 0));
    return cat;
  }

  /* ---------- 首頁：週次路線圖 ---------- */
  function renderHome(cat) {
    const params = new URLSearchParams(location.search);
    const state = { type: params.get("type") || "all", tag: params.get("tag") || "", q: "" };
    const chips = document.querySelectorAll(".chip");
    const search = document.querySelector(".search");
    const tagBox = document.querySelector(".active-tag");
    const list = document.querySelector("#line-map");

    const card = (i) => `<a class="card" data-type="${i.type}" href="${url(i.path)}">
        <div class="meta">${badge(i.type)}<time>${i.date}</time></div>
        <h3>${esc(i.title)}</h3>
        <p>${esc(i.summary)}</p>
        <div class="tags">${i.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}</div></a>`;

    function draw() {
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === state.type)));
      tagBox.innerHTML = state.tag ? `標籤「${esc(state.tag)}」<button type="button">清除</button>` : "";
      const q = state.q.trim().toLowerCase();
      const items = cat.items.filter((i) =>
        (state.type === "all" || i.type === state.type) &&
        (!state.tag || i.tags.includes(state.tag)) &&
        (!q || [i.title, i.summary, ...i.tags].join(" ").toLowerCase().includes(q)));
      if (!items.length) {
        list.innerHTML = state.type === "note" && !q && !state.tag
          ? `<p class="empty">還沒有筆記。把上課筆記（PDF、網址或文字）交給 AI，照 CLAUDE.md 的流程新增。</p>`
          : `<p class="empty">沒有符合的內容，換個關鍵字或清除篩選試試。</p>`;
        return;
      }
      const weeks = Object.keys(cat.weeks).map(Number).filter((w) => items.some((i) => i.week === w));
      list.innerHTML = weeks.map((w) => {
        const wk = cat.weeks[pad(w)];
        return `<section class="week" id="w${pad(w)}">
          <div class="week-label"><div class="num">W${pad(w)}</div><div class="topic">${esc(wk.topic)}</div><div class="date">${esc(wk.date.slice(5).replace("-", "/"))}</div></div>
          <div class="cards">${items.filter((i) => i.week === w).map(card).join("")}</div>
        </section>`;
      }).join("");
    }
    chips.forEach((c) => c.addEventListener("click", () => { state.type = c.dataset.filter; sync(); draw(); }));
    search.addEventListener("input", () => { state.q = search.value; draw(); });
    tagBox.addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") { state.tag = ""; sync(); draw(); } });
    function sync() {
      const p = new URLSearchParams();
      if (state.type !== "all") p.set("type", state.type);
      if (state.tag) p.set("tag", state.tag);
      history.replaceState(null, "", p.toString() ? `?${p}` : location.pathname);
      document.querySelectorAll(".site-nav a").forEach((a) => a.toggleAttribute("aria-current", a.dataset.type === state.type));
    }
    draw();
  }

  /* ---------- 資源總表 ---------- */
  function resourceList(list, withWeek) {
    return `<ul class="res">${list.map((r) => `<li>
      ${withWeek ? `<span class="week">W${pad(r.week)}</span>` : ""}<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a><span class="host">${esc(host(r.url))}</span>
      ${r.desc ? `<p>${esc(r.desc)}</p>` : ""}</li>`).join("")}</ul>`;
  }

  function renderResources(cat) {
    const all = [];
    const seen = new Set();
    for (const i of cat.items) for (const r of i.resources || []) {
      const key = r.url + "|" + r.kind;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ ...r, week: i.week, from: i });
    }
    const box = document.querySelector("#resource-list");
    const chips = document.querySelectorAll(".chip");
    const search = document.querySelector(".search");
    const state = { kind: "all", q: "" };
    function draw() {
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === state.kind)));
      const q = state.q.trim().toLowerCase();
      const shown = all.filter((r) => (state.kind === "all" || r.kind === state.kind) &&
        (!q || [r.title, r.desc, r.url].join(" ").toLowerCase().includes(q)));
      box.innerHTML = Object.entries(RES_KIND).map(([k, label]) => {
        const g = shown.filter((r) => r.kind === k);
        return g.length ? `<section class="res-group"><h2>${label}（${g.length}）</h2>${resourceList(g, true)}</section>` : "";
      }).join("") || `<p class="empty">沒有符合的資源。</p>`;
    }
    chips.forEach((c) => c.addEventListener("click", () => { state.kind = c.dataset.filter; draw(); }));
    search.addEventListener("input", () => { state.q = search.value; draw(); });
    draw();
  }

  /* ---------- 內容頁 ---------- */
  async function renderPage(cat) {
    const id = document.body.dataset.id;
    const item = cat.items.find((i) => i.id === id);
    if (!item) {
      const warn = document.createElement("div");
      warn.className = "catalog-warning";
      warn.textContent = `此頁 data-id="${id}" 尚未登錄在 data/catalog.json。`;
      document.querySelector(".site-header").after(warn);
      return;
    }
    document.body.dataset.type = item.type;
    document.querySelector(`.site-nav a[data-type="${item.type}"]`)?.setAttribute("aria-current", "page");
    const t = TYPES[item.type];
    const wk = cat.weeks[pad(item.week)];

    // 相關內容：雙向（我列出的＋列出我的）
    const relIds = new Set(item.related || []);
    cat.items.forEach((o) => { if ((o.related || []).includes(item.id)) relIds.add(o.id); });
    const rel = cat.items.filter((o) => relIds.has(o.id));

    const head = document.querySelector("#page-head");
    head.className = "page-head";
    head.innerHTML = `
      <div class="crumbs"><a href="${url("index.html")}">首頁</a> / <a href="${url("index.html")}?type=${item.type}">${t.label}</a> / <a href="${url("index.html")}#w${pad(item.week)}">W${pad(item.week)} ${esc(wk.topic)}</a></div>
      <h1>${esc(item.title)}</h1>
      <div class="meta">${badge(item.type)}<time>${item.date}</time>
        <span class="tags">${item.tags.map((g) => `<a class="tag" href="${url("index.html")}?tag=${encodeURIComponent(g)}">${esc(g)}</a>`).join("")}</span></div>
      <p class="summary">${esc(item.summary)}</p>
      ${rel.length ? `<div class="related"><span>相關：</span>${rel.map((o) => `<a href="${url(o.path)}" data-type="${o.type}">${badge(o.type, true)}${esc(o.title)}</a>`).join("")}</div>` : ""}
      ${item.type === "lecture" || item.type === "practice" ? `<p class="ai-note">這份${t.label}由 AI 依老師講義${item.source ? `〈${esc(item.source)}〉` : ""}整理改寫，不是老師的原文；若有出入以課堂講義為準。</p>` : ""}`;

    // 講義的外部資源
    const resBox = document.querySelector("#resources");
    if (resBox) {
      const list = item.resources || [];
      resBox.innerHTML = Object.entries(RES_KIND).map(([k, label]) => {
        const g = list.filter((r) => r.kind === k);
        return g.length ? `<div class="res-group"><h3>${label}</h3>${resourceList(g, false)}</div>` : "";
      }).join("");
    }

    // 範例程式檢視器
    const demoBox = document.querySelector("#demo");
    if (demoBox && item.demo) renderDemo(demoBox, item.demo);

    // 上下篇（同類型）
    const same = cat.items.filter((i) => i.type === item.type);
    const idx = same.findIndex((i) => i.id === item.id);
    const pager = document.querySelector("#pager");
    if (pager) {
      pager.className = "pager";
      const prev = same[idx - 1], next = same[idx + 1];
      pager.innerHTML =
        (prev ? `<a class="prev" href="${url(prev.path)}"><small>上一篇${t.label}</small>${esc(prev.title)}</a>` : "") +
        (next ? `<a class="next" href="${url(next.path)}"><small>下一篇${t.label}</small>${esc(next.title)}</a>` : "");
    }
  }

  function renderDemo(box, demo) {
    box.innerHTML = `
      <div class="demo">
        <ul class="demo-files">${demo.files.map((f, n) => `<li><button type="button" data-n="${n}">${esc(f.title)}<small>${esc(f.file)}</small></button></li>`).join("")}</ul>
        <div class="demo-view">
          <div class="demo-bar"><span class="name"></span>
            <button type="button" data-mode="run">執行</button>
            <button type="button" data-mode="src">原始碼</button>
            <button type="button" data-mode="edit">編輯練習</button>
            <a class="open" target="_blank" rel="noopener">新分頁開啟</a></div>
          <p class="demo-desc"></p>
          <div class="demo-stage"></div>
        </div>
      </div>
      ${demo.zip ? `<p class="demo-zip">整包下載：<a href="${url(demo.zip)}" download>${esc(demo.zip.split("/").pop())}</a></p>` : ""}`;
    const stage = box.querySelector(".demo-stage");
    const runBtn = box.querySelector('[data-mode="run"]');
    const srcBtn = box.querySelector('[data-mode="src"]');
    const editBtn = box.querySelector('[data-mode="edit"]');
    let cur = 0, mode = "run";

    // 編輯練習：草稿存在使用者自己的瀏覽器（localStorage），讀寫失敗時就只存在記憶體
    const store = {
      get(k) { try { return localStorage.getItem(k); } catch { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch { /* 忽略 */ } },
      del(k) { try { localStorage.removeItem(k); } catch { /* 忽略 */ } },
    };
    // ── 編輯練習：可改 HTML、JS、CSS；執行時用「載入這支檔案的 HTML」當入口，把改過的檔案換進去 ──
    const draftKey = (file) => `webgis-draft:${demo.dir}/${file}`;
    const fileUrl = (file) => new URL(url(`${demo.dir}/${file}`), location.href).href;
    const textCache = {};
    const getText = async (file) => (textCache[file] ??= await (await fetch(url(`${demo.dir}/${file}`), { cache: "no-cache" })).text());
    const isHtml = (file) => /\.html?$/.test(file);
    const markEdited = () => box.querySelectorAll(".demo-files button").forEach((b) =>
      b.classList.toggle("edited", store.get(draftKey(demo.files[+b.dataset.n].file)) != null));
    const isEditable = (f) => f.run !== false && /\.(html?|js|css)$/.test(f.file);

    async function findEntry(file) {
      if (isHtml(file)) return file;
      const name = file.split("/").pop();
      for (const g of demo.files) {
        if (!isHtml(g.file)) continue;
        if ((store.get(draftKey(g.file)) ?? (await getText(g.file))).includes(name)) return g.file;
      }
      return null;
    }

    async function buildPage(entry, liveFile, liveText) {
      let html = liveFile === entry ? liveText : (store.get(draftKey(entry)) ?? (await getText(entry)));
      const entryUrl = fileUrl(entry);
      const blobs = [];
      // 把 <script src> / <link href> 指向「有草稿的檔案」的地方換成草稿內容
      for (const g of demo.files) {
        if (g.file === entry || !/\.(js|css)$/.test(g.file)) continue;
        const text = g.file === liveFile ? liveText : store.get(draftKey(g.file));
        if (text == null) continue;
        const blobUrl = URL.createObjectURL(new Blob([text], { type: g.file.endsWith(".css") ? "text/css" : "text/javascript" }));
        blobs.push(blobUrl);
        const target = fileUrl(g.file);
        html = html.replace(/(\s(?:src|href)\s*=\s*)(["'])([^"']+)\2/gi, (m, pre, q, val) => {
          try { return new URL(val, entryUrl).href === target ? `${pre}${q}${blobUrl}${q}` : m; } catch { return m; }
        });
      }
      // 加上 <base>，讓其他相對路徑（資料檔、沒改過的 js）仍指向範例資料夾
      const tag = `<base href="${entryUrl}">`;
      html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + tag) : tag + html;
      return { html, blobs };
    }

    async function showEditor(f) {
      const key = draftKey(f.file);
      let original = "";
      try { original = await getText(f.file); }
      catch (e) { stage.innerHTML = `<p class="empty">讀取失敗：${esc(e.message)}</p>`; return; }
      const entry = await findEntry(f.file);
      const note = entry && entry !== f.file
        ? `執行時會用 ${esc(entry)} 當入口，載入你修改後的 ${esc(f.file)}（同一包其他有修改的檔案也會一起套用）。`
        : entry ? "同一包裡有修改過的 JS／CSS 也會一起套用。" : "找不到載入這支檔案的 HTML，只能編輯與下載。";
      stage.innerHTML = `
        <div class="editor">
          <div class="editor-bar">
            <button type="button" class="run-edit"${entry ? "" : " hidden"}>執行修改（Ctrl＋Enter）</button>
            <button type="button" class="reset-edit">還原成原始碼</button>
            <button type="button" class="dl-edit">下載我的版本</button>
            <span class="editor-status"></span>
          </div>
          <p class="editor-note">${note}</p>
          <textarea class="editor-code" spellcheck="false" autocomplete="off" aria-label="編輯 ${esc(f.file)}"></textarea>
          <iframe class="editor-preview" title="執行結果" allow="geolocation"></iframe>
        </div>`;
      const ta = stage.querySelector(".editor-code");
      const frame = stage.querySelector(".editor-preview");
      const status = stage.querySelector(".editor-status");
      ta.value = store.get(key) ?? original;
      let oldBlobs = [];
      const setStatus = () => { status.textContent = ta.value === original ? "與原始碼相同" : "已修改，草稿自動存在這台電腦的瀏覽器"; };
      const save = () => { ta.value === original ? store.del(key) : store.set(key, ta.value); markEdited(); };
      const run = async () => {
        if (!entry) return;
        save();
        const { html, blobs } = await buildPage(entry, f.file, ta.value);
        frame.srcdoc = html;
        setTimeout(() => oldBlobs.forEach((b) => URL.revokeObjectURL(b)), 5000);
        oldBlobs = blobs;
      };
      let timer;
      ta.addEventListener("input", () => { setStatus(); clearTimeout(timer); timer = setTimeout(save, 400); });
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {           // Tab 插入兩個空白，而不是跳到下一個欄位
          e.preventDefault();
          ta.setRangeText("  ", ta.selectionStart, ta.selectionEnd, "end");
          ta.dispatchEvent(new Event("input"));
        }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
      });
      stage.querySelector(".run-edit").addEventListener("click", run);
      stage.querySelector(".reset-edit").addEventListener("click", () => {
        if (ta.value !== original && !confirm("確定要放棄修改，還原成原始碼嗎？")) return;
        ta.value = original; store.del(key); markEdited(); setStatus(); run();
      });
      stage.querySelector(".dl-edit").addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ta.value], { type: "text/plain" }));
        a.download = f.file.split("/").pop();
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
      setStatus();
      run();
    }

    async function show() {
      const f = demo.files[cur];
      const path = url(`${demo.dir}/${f.file}`);
      const canRun = f.run !== false && /\.html?$/.test(f.file);
      if (mode === "edit" && !isEditable(f)) mode = "src";
      if (mode === "run" && !canRun) mode = "src";
      box.querySelectorAll(".demo-files button").forEach((b) => b.setAttribute("aria-current", String(+b.dataset.n === cur)));
      markEdited();
      box.querySelector(".name").textContent = f.file;
      box.querySelector(".open").href = path;
      box.querySelector(".demo-desc").textContent = f.desc || "";
      runBtn.hidden = !canRun;
      editBtn.hidden = !isEditable(f);
      runBtn.setAttribute("aria-pressed", String(mode === "run"));
      srcBtn.setAttribute("aria-pressed", String(mode === "src"));
      editBtn.setAttribute("aria-pressed", String(mode === "edit"));
      if (mode === "edit") {
        await showEditor(f);
      } else if (mode === "run") {
        stage.innerHTML = `<iframe src="${path}" title="${esc(f.title)}" allow="geolocation" loading="lazy"></iframe>`;
      } else {
        stage.innerHTML = `<pre><code>讀取中…</code></pre>`;
        try {
          const r = await fetch(path, { cache: "no-cache" });
          const buf = await r.arrayBuffer();
          let text;
          try { text = new TextDecoder("utf-8", { fatal: true }).decode(buf); }
          catch (e) { text = new TextDecoder("big5").decode(buf); } // 老師的中文 CSV 常是 Big5
          if (text.length > 60000) text = text.slice(0, 60000) + "\n\n…（檔案太大，只顯示前 60,000 字；完整內容請按「新分頁開啟」）";
          const ext = f.file.split(".").pop();
          const lang = { html: "xml", htm: "xml", js: "javascript", css: "css", json: "json", geojson: "json", php: "php", md: "markdown", ini: "ini" }[ext] || "plaintext";
          stage.innerHTML = `<pre><code class="language-${lang}">${esc(text)}</code></pre>`;
          if (window.hljs && text.length < 60000) window.hljs.highlightElement(stage.querySelector("code"));
          addCopy(stage.querySelector("pre"));
        } catch (e) { stage.innerHTML = `<p class="empty">讀取失敗：${esc(e.message)}</p>`; }
      }
    }
    box.querySelectorAll(".demo-files button").forEach((b) => b.addEventListener("click", () => { cur = +b.dataset.n; show(); }));
    runBtn.addEventListener("click", () => { mode = "run"; show(); });
    srcBtn.addEventListener("click", () => { mode = "src"; show(); });
    editBtn.addEventListener("click", () => { mode = "edit"; show(); });
    show();
  }

  /* ---------- 課後練習：選擇題 ---------- */
  function setupQuizzes() {
    const quizzes = [...document.querySelectorAll(".quiz")];
    if (!quizzes.length) return;
    const score = document.createElement("div");
    score.className = "quiz-score";
    quizzes[0].before(score);
    const update = () => {
      const done = quizzes.filter((q) => q.classList.contains("done"));
      const right = done.filter((q) => q.dataset.result === "right").length;
      score.innerHTML = `已作答 <b>${done.length}</b> / ${quizzes.length} 題，答對 <b>${right}</b> 題`;
    };
    quizzes.forEach((q) => {
      const answer = Number(q.dataset.answer);
      const opts = [...q.querySelectorAll("ol.opts li")];
      opts.forEach((li) => { li.innerHTML = `<button type="button">${li.innerHTML}</button>`; });
      const explain = q.querySelector(".explain");
      const btns = opts.map((li) => li.querySelector("button"));
      btns.forEach((b, n) => b.addEventListener("click", () => {
        const ok = n + 1 === answer;
        btns.forEach((x) => (x.disabled = true));
        b.classList.add(ok ? "right" : "wrong");
        btns[answer - 1].classList.add("right");
        q.classList.add("done");
        q.dataset.result = ok ? "right" : "wrong";
        if (explain) explain.innerHTML = `<span class="verdict" style="color:var(--${ok ? "ok" : "bad"})">${ok ? "答對了。" : `答案是 (${"ABCDEFG"[answer - 1]})。`}</span>${explain.dataset.text}<button type="button" class="retry">重答</button>`;
        explain?.querySelector(".retry").addEventListener("click", () => {
          btns.forEach((x) => { x.disabled = false; x.classList.remove("right", "wrong"); });
          q.classList.remove("done"); delete q.dataset.result; update();
        });
        update();
      }));
      if (explain) explain.dataset.text = explain.innerHTML;
    });
    update();
  }

  /* ---------- 目錄、複製按鈕、語法高亮 ---------- */
  function addCopy(pre) {
    if (!pre || pre.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.className = "copy-btn"; btn.type = "button"; btn.textContent = "複製";
    btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(pre.querySelector("code")?.innerText ?? pre.innerText); btn.textContent = "已複製"; }
      catch { btn.textContent = "無法複製"; }
      setTimeout(() => (btn.textContent = "複製"), 1500);
    });
    pre.append(btn);
  }
  function enhance() {
    const toc = document.querySelector("#toc");
    const hs = [...document.querySelectorAll("article h2")];
    if (toc && hs.length) {
      hs.forEach((h, n) => { if (!h.id) h.id = `s${n + 1}`; });
      toc.className = "toc";
      toc.innerHTML = `<h4>本頁目錄</h4><ol>${hs.map((h) => `<li><a href="#${h.id}">${esc(h.textContent)}</a></li>`).join("")}</ol>`;
    }
    document.querySelectorAll("article pre").forEach((pre) => {
      if (window.hljs && pre.querySelector("code")) window.hljs.highlightElement(pre.querySelector("code"));
      addCopy(pre);
    });
    setupQuizzes();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const page = document.body.classList.contains("home") ? "home" : document.body.classList.contains("resources") ? "resources" : "content";
    renderChrome(page);
    try {
      const cat = await loadCatalog();
      if (page === "home") renderHome(cat);
      else if (page === "resources") renderResources(cat);
      else await renderPage(cat);
    } catch (e) {
      console.error(e);
      const warn = document.createElement("div");
      warn.className = "catalog-warning";
      warn.textContent = "讀不到 data/catalog.json。本機預覽請在專案根目錄執行 python3 -m http.server 8000。";
      document.querySelector(".site-header").after(warn);
    }
    enhance();
  });
})();
