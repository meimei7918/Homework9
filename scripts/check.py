#!/usr/bin/env python3
"""
檢查專案是否符合 CLAUDE.md 的規則。每次新增或修改內容後執行：
  python3 scripts/check.py
全部通過會印出「✓ 全部通過」並回傳 0；否則列出每一條錯誤並回傳 1。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = {"lecture": "lectures", "code": "code", "note": "notes"}
REQUIRED = ["id", "type", "week", "title", "date", "tags", "summary", "path"]
# 每種類型必須有的 h2 段落（順序也要一致）
SECTIONS = {
    "lecture": ["學習目標", "小結", "附件與延伸閱讀"],
    "code": ["這段程式在做什麼", "Demo", "原始碼", "逐段解說", "練習"],
    "note": ["今日重點", "課堂筆記", "疑問與解答", "待辦"],
}
FILE_RE = re.compile(r"^w(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.html$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

errors: list[str] = []
err = errors.append


def main() -> int:
    cat = json.loads((ROOT / "data/catalog.json").read_text(encoding="utf-8"))
    weeks = cat.get("weeks", {})
    seen: set[str] = set()
    listed_paths: set[str] = set()

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
            err(f"{tag}: type 必須是 lecture / code / note")
            continue
        ww = f"{it['week']:02d}"
        if ww not in weeks:
            err(f"{tag}: weeks 裡沒有第 {ww} 週的主題")
        if not DATE_RE.match(it["date"]):
            err(f"{tag}: date 必須是 YYYY-MM-DD")
        if not it["tags"]:
            err(f"{tag}: tags 至少一個")

        p = it["path"]
        folder, _, fname = p.partition("/")
        m = FILE_RE.match(fname)
        if folder != FOLDERS[t] or not m:
            err(f"{tag}: path 應為 {FOLDERS[t]}/wNN-slug.html，目前是 {p}")
            continue
        if m.group(1) != ww:
            err(f"{tag}: 檔名週次 w{m.group(1)} 與 week={it['week']} 不符")
        expect_id = f"w{ww}-{t}-{m.group(2)}"
        if it["id"] != expect_id:
            err(f"{tag}: id 應為 {expect_id}")
        listed_paths.add(p)

        page = ROOT / p
        if not page.exists():
            err(f"{tag}: 找不到 {p}")
            continue
        html = page.read_text(encoding="utf-8")
        if f'data-id="{it["id"]}"' not in html:
            err(f"{p}: <body data-id> 與 catalog id 不一致")
        if f"<title>{it['title']} · WebGIS 課程資料庫</title>" not in html:
            err(f"{p}: <title> 應為「{it['title']} · WebGIS 課程資料庫」")
        for needed in ['id="page-head"', 'id="pager"', 'id="toc"', 'assets/js/site.js']:
            if needed not in html:
                err(f"{p}: 缺少 {needed}（請保留模板骨架）")
        if "{{" in html or "（待補" in html:
            err(f"{p}: 還有模板佔位文字沒填")
        h2s = re.findall(r"<h2[^>]*>(.*?)</h2>", html)
        pos = [h2s.index(s) if s in h2s else -1 for s in SECTIONS[t]]
        for s, i in zip(SECTIONS[t], pos):
            if i < 0:
                err(f"{p}: 缺少必要段落 <h2>{s}</h2>")
        found = [i for i in pos if i >= 0]
        if found != sorted(found):
            err(f"{p}: 必要段落順序應為 {SECTIONS[t]}")

        if t == "code":
            src = it.get("src")
            if not src or not (ROOT / src).exists():
                err(f"{tag}: code 類型需要 src，且檔案要存在")
            elif f'src="src/{Path(src).name}"' not in html:
                err(f"{p}: 沒有載入自己的 {src}")
            for needed in ['id="map"', 'id="source"', "leaflet@1.9.4"]:
                if needed not in html:
                    err(f"{p}: 程式碼頁缺少 {needed}")
        if t == "lecture":
            if 'id="files"' not in html:
                err(f"{p}: 講義頁缺少 id=\"files\"")
            for f in it.get("files", []):
                if not (ROOT / f.get("path", "")).exists():
                    err(f"{tag}: 附件不存在 {f.get('path')}")

    # 孤兒頁：資料夾裡有、catalog 沒登錄
    for t, folder in FOLDERS.items():
        for f in sorted((ROOT / folder).glob("*.html")):
            rel = f"{folder}/{f.name}"
            if rel not in listed_paths:
                err(f"{rel}: 沒有登錄在 data/catalog.json")

    if errors:
        print(f"✗ 發現 {len(errors)} 個問題：")
        for e in errors:
            print("  -", e)
        return 1
    print(f"✓ 全部通過（{len(cat['items'])} 個項目，{len(weeks)} 週）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
