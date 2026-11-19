#!/usr/bin/env python3
"""
檢查專案是否符合 CLAUDE.md 的規則。每次新增或修改內容後執行：
  python3 scripts/check.py
全部通過會印出「✓ 全部通過」並回傳 0；否則列出每一條問題並回傳 1。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = {"lecture": "lectures", "code": "code", "practice": "practice", "note": "notes"}
REQUIRED = ["id", "type", "week", "title", "date", "tags", "summary", "path"]
# 每種類型必須有的 <h2> 段落（順序也要一致；中間可以插入其他 h2）
SECTIONS = {
    "lecture": ["學習目標", "小結", "外部資源"],
    "code": ["這包範例在做什麼", "範例檔案", "重點解說", "為了在網站上執行所做的修改", "動手改改看"],
    "practice": ["觀念測驗", "實作題"],
    "note": ["今日重點", "課堂筆記", "疑問與解答", "待辦"],
}
RES_KINDS = {"mentioned", "practice", "reference"}
FILE_RE = re.compile(r"^w(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.html$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SITE_TITLE = "WebGIS 課程資料庫"

errors: list[str] = []
err = errors.append


def check_practice(p: str, html: str) -> None:
    quizzes = re.findall(r'<div class="quiz" data-answer="(\d+)">(.*?)</div>', html, re.S)
    if len(quizzes) < 5:
        err(f"{p}: 觀念測驗至少 5 題，目前 {len(quizzes)} 題")
    for n, (ans, body) in enumerate(quizzes, 1):
        opts = re.findall(r"<li>", re.search(r'<ol class="opts">(.*?)</ol>', body, re.S).group(1)) if '<ol class="opts">' in body else []
        if len(opts) < 2:
            err(f"{p}: 第 {n} 題選項少於 2 個")
        elif not 1 <= int(ans) <= len(opts):
            err(f"{p}: 第 {n} 題 data-answer={ans} 超出選項範圍 1–{len(opts)}")
        if 'class="explain"' not in body:
            err(f"{p}: 第 {n} 題缺少解析 <p class=\"explain\">")
    tasks = html.count('<div class="task">')
    if tasks < 2:
        err(f"{p}: 實作題至少 2 題，目前 {tasks} 題")
    if html.count('<details class="solution">') < tasks:
        err(f"{p}: 每一題實作題都要有參考解答 <details class=\"solution\">")


def main() -> int:
    cat = json.loads((ROOT / "data/catalog.json").read_text(encoding="utf-8"))
    weeks = cat.get("weeks", {})
    for k, w in weeks.items():
        if not re.fullmatch(r"\d{2}", k) or not isinstance(w, dict) or not DATE_RE.match(w.get("date", "")) or not w.get("topic"):
            err(f"weeks[{k}]: 格式應為 \"NN\": {{\"date\": \"YYYY-MM-DD\", \"topic\": \"…\"}}")
    ids = {i.get("id") for i in cat["items"]}
    seen: set[str] = set()
    listed: set[str] = set()

    for n, it in enumerate(cat["items"]):
        tag = it.get("id", f"items[{n}]")
        missing = [k for k in REQUIRED if k not in it]
        if missing:
            err(f"{tag}: 缺少欄位 {missing}")
            continue
        if it["id"] in seen:
            err(f"{tag}: id 重複")
        seen.add(it["id"])
        t = it["type"]
        if t not in FOLDERS:
            err(f"{tag}: type 必須是 {list(FOLDERS)}")
            continue
        ww = f"{it['week']:02d}"
        if ww not in weeks:
            err(f"{tag}: weeks 裡沒有第 {ww} 週")
        if not DATE_RE.match(it["date"]):
            err(f"{tag}: date 必須是 YYYY-MM-DD")
        if not 1 <= len(it["tags"]) <= 5:
            err(f"{tag}: tags 需 1–5 個")
        for r in it.get("related", []):
            if r not in ids:
                err(f"{tag}: related 指到不存在的 id「{r}」")

        folder, _, fname = it["path"].partition("/")
        m = FILE_RE.match(fname)
        if folder != FOLDERS[t] or not m:
            err(f"{tag}: path 應為 {FOLDERS[t]}/wNN-slug.html，目前是 {it['path']}")
            continue
        if m.group(1) != ww:
            err(f"{tag}: 檔名週次 w{m.group(1)} 與 week={it['week']} 不符")
        if it["id"] != f"w{ww}-{t}-{m.group(2)}":
            err(f"{tag}: id 應為 w{ww}-{t}-{m.group(2)}")
        listed.add(it["path"])

        # 類型專屬欄位
        if t == "lecture":
            if not it.get("source"):
                err(f"{tag}: lecture 需要 source（老師講義的原始檔名）")
            res = it.get("resources", [])
            if not res:
                err(f"{tag}: lecture 至少要有一筆 resources")
            for r in res:
                if r.get("kind") not in RES_KINDS or not r.get("title") or not str(r.get("url", "")).startswith("http"):
                    err(f"{tag}: resources 每筆需有 kind（{'/'.join(sorted(RES_KINDS))}）、title、url")
            if not any(r.get("kind") in ("practice", "reference") for r in res):
                err(f"{tag}: lecture 至少要有一筆 AI 找的 practice 或 reference 資源")
        if t == "code":
            d = it.get("demo") or {}
            ddir = ROOT / d.get("dir", "_none_")
            if not ddir.is_dir():
                err(f"{tag}: demo.dir 不存在")
            else:
                names = {f["file"] for f in d.get("files", [])}
                for f in names:
                    if not (ddir / f).exists():
                        err(f"{tag}: demo 檔案不存在 {d['dir']}/{f}")
                for f in ddir.rglob("*"):
                    rel = f.relative_to(ddir).as_posix()
                    if f.is_file() and rel not in names:
                        err(f"{tag}: {d['dir']}/{rel} 沒有列在 demo.files")
                    if f.is_file() and re.search(r"[\s一-鿿]", rel):
                        err(f"{tag}: 檔名不可有空白或中文：{rel}")
                    if f.is_file() and f.suffix in (".html", ".htm", ".js", ".php"):
                        if "【說明】" not in f.read_bytes().decode("utf-8", "replace"):
                            err(f"{tag}: {d['dir']}/{rel} 沒有【說明】註解（CLAUDE.md 9.2）")
            if d.get("zip") and not (ROOT / d["zip"]).exists():
                err(f"{tag}: demo.zip 不存在")
        if t == "practice" and not it.get("related"):
            err(f"{tag}: practice 需要 related 指向對應的講義或範例")

        page = ROOT / it["path"]
        if not page.exists():
            err(f"{tag}: 找不到 {it['path']}")
            continue
        html = page.read_text(encoding="utf-8")
        if f'data-id="{it["id"]}"' not in html:
            err(f"{it['path']}: <body data-id> 與 catalog id 不一致")
        if f'data-type="{t}"' not in html.split("<body", 1)[-1].split(">", 1)[0]:
            err(f"{it['path']}: <body> 需要 data-type=\"{t}\"（決定頁面底色）")
        if f"<title>{it['title']} · {SITE_TITLE}</title>" not in html:
            err(f"{it['path']}: <title> 應為「{it['title']} · {SITE_TITLE}」")
        for needed in ['id="page-head"', 'id="pager"', 'id="toc"', "assets/js/site.js"]:
            if needed not in html:
                err(f"{it['path']}: 缺少 {needed}（請保留模板骨架）")
        if "{{ID}}" in html or "{{TITLE}}" in html or "（待補" in html:
            err(f"{it['path']}: 還有模板佔位文字沒填")
        prose = re.sub(r"<(pre|code)[^>]*>.*?</\1>", "", html.split("<article>")[-1], flags=re.S)
        if re.search(r'\sstyle="', prose):
            err(f"{it['path']}: 正文不可使用 inline style，請用 style.css 的元件")
        h2s = [re.sub(r"<[^>]+>", "", h) for h in re.findall(r"<h2[^>]*>(.*?)</h2>", html, re.S)]
        pos = [h2s.index(s) if s in h2s else -1 for s in SECTIONS[t]]
        for s, i in zip(SECTIONS[t], pos):
            if i < 0:
                err(f"{it['path']}: 缺少必要段落 <h2>{s}</h2>")
        found = [i for i in pos if i >= 0]
        if found != sorted(found):
            err(f"{it['path']}: 必要段落順序應為 {SECTIONS[t]}")
        if t == "lecture" and 'id="resources"' not in html:
            err(f"{it['path']}: 講義頁缺少 <div id=\"resources\">")
        if t == "code" and 'id="demo"' not in html:
            err(f"{it['path']}: 範例頁缺少 <div id=\"demo\">")
        if t == "practice":
            check_practice(it["path"], html)

    for t, folder in FOLDERS.items():
        for f in sorted((ROOT / folder).glob("*.html")):
            rel = f"{folder}/{f.name}"
            if rel not in listed:
                err(f"{rel}: 沒有登錄在 data/catalog.json")

    if errors:
        print(f"✗ 發現 {len(errors)} 個問題：")
        for e in errors:
            print("  -", e)
        return 1
    counts = {t: sum(1 for i in cat["items"] if i["type"] == t) for t in FOLDERS}
    print(f"✓ 全部通過（{len(weeks)} 週；" + "、".join(f"{t} {c}" for t, c in counts.items()) + "）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
