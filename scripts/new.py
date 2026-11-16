#!/usr/bin/env python3
"""
新增一個內容頁，自動完成：
  1. 從 templates/ 複製對應模板並填入 ID、標題
  2. 在 data/catalog.json 加入一筆項目（該週不存在時一併建立 weeks）
  3. code 類型另外建立 code/demos/<檔名>/ 資料夾

用法：
  python3 scripts/new.py <lecture|code|practice|note> <週次> <slug> "<標題>" \
      [--tags A,B] [--summary "..."] [--date YYYY-MM-DD] [--topic "週主題"] \
      [--source 講義檔名.pdf] [--related id1,id2]

例：
  python3 scripts/new.py lecture 7 php "PHP：伺服器端程式入門" --tags PHP --source PHP.pdf --date 2026-11-19 --topic "PHP 後端入門"
"""
import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = {"lecture": "lectures", "code": "code", "practice": "practice", "note": "notes"}
SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def main() -> int:
    ap = argparse.ArgumentParser(description="新增內容頁")
    ap.add_argument("type", choices=FOLDERS.keys())
    ap.add_argument("week", type=int)
    ap.add_argument("slug", help="英文小寫、數字、連字號，例如 php-basics")
    ap.add_argument("title")
    ap.add_argument("--tags", default="")
    ap.add_argument("--summary", default="（待補：一到兩句摘要）")
    ap.add_argument("--date", default=dt.date.today().isoformat())
    ap.add_argument("--topic", default=None, help="該週主題（weeks 裡還沒有這週時必填）")
    ap.add_argument("--source", default=None, help="lecture / practice 依據的老師講義檔名")
    ap.add_argument("--related", default="", help="相關項目 id，逗號分隔")
    a = ap.parse_args()

    if not SLUG_RE.match(a.slug):
        sys.exit(f"slug 格式錯誤：{a.slug}（只能用英文小寫、數字、連字號）")
    if not 1 <= a.week <= 18:
        sys.exit("week 必須在 1–18 之間")

    ww = f"{a.week:02d}"
    base = f"w{ww}-{a.slug}"
    item_id = f"w{ww}-{a.type}-{a.slug}"
    rel_path = f"{FOLDERS[a.type]}/{base}.html"
    page = ROOT / rel_path

    catalog_path = ROOT / "data" / "catalog.json"
    cat = json.loads(catalog_path.read_text(encoding="utf-8"))
    if any(i["id"] == item_id for i in cat["items"]):
        sys.exit(f"catalog 已有 {item_id}")
    if page.exists():
        sys.exit(f"檔案已存在：{rel_path}")
    if ww not in cat["weeks"]:
        if not a.topic:
            sys.exit(f"weeks 裡沒有第 {ww} 週，請加 --topic \"…\"（日期會用 --date）")
        cat["weeks"][ww] = {"date": a.date, "topic": a.topic}
        cat["weeks"] = dict(sorted(cat["weeks"].items()))

    tpl = (ROOT / "templates" / f"{a.type}.html").read_text(encoding="utf-8")
    page.write_text(tpl.replace("{{ID}}", item_id).replace("{{TITLE}}", a.title), encoding="utf-8")
    print(f"建立 {rel_path}")

    item = {
        "id": item_id, "type": a.type, "week": a.week, "title": a.title, "date": a.date,
        "tags": [t.strip() for t in a.tags.split(",") if t.strip()] or ["待補"],
        "summary": a.summary, "path": rel_path,
    }
    if a.source:
        item["source"] = a.source
    if a.related:
        item["related"] = [r.strip() for r in a.related.split(",") if r.strip()]
    if a.type == "lecture":
        item["resources"] = []
    if a.type == "code":
        ddir = f"code/demos/{base}"
        (ROOT / ddir).mkdir(parents=True, exist_ok=True)
        item["demo"] = {"dir": ddir, "zip": f"{ddir}.zip", "files": []}
        print(f"建立 {ddir}/（把範例檔放進去，並在 catalog 的 demo.files 逐一登錄）")

    cat["items"].append(item)
    catalog_path.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"catalog.json 已加入 {item_id}")
    print("下一步：填完所有「（待補：…）」→ python3 scripts/check.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
