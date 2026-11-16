#!/usr/bin/env python3
"""
新增一個內容頁（講義／程式碼／筆記），自動完成：
  1. 從 templates/ 複製對應模板並填入 ID、標題
  2. 程式碼頁另外建立 code/src/<檔名>.js
  3. 在 data/catalog.json 加入一筆項目（若該週還沒有主題，也一併加入 weeks）

用法：
  python3 scripts/new.py <type> <week> <slug> "<標題>" [--tags a,b] [--summary "..."] [--date YYYY-MM-DD] [--topic "週主題"]

例：
  python3 scripts/new.py code 4 leaflet-heatmap "熱區圖：用 Leaflet.heat 畫 YouBike 站點密度" --tags Leaflet,熱區圖 --topic "點資料分析"
"""
import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = {"lecture": "lectures", "code": "code", "note": "notes"}
SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def main() -> int:
    ap = argparse.ArgumentParser(description="新增內容頁")
    ap.add_argument("type", choices=FOLDERS.keys())
    ap.add_argument("week", type=int)
    ap.add_argument("slug", help="英文小寫、數字、連字號，例如 leaflet-heatmap")
    ap.add_argument("title")
    ap.add_argument("--tags", default="", help="逗號分隔")
    ap.add_argument("--summary", default="（待補：一到兩句摘要）")
    ap.add_argument("--date", default=dt.date.today().isoformat())
    ap.add_argument("--topic", default=None, help="該週主題（weeks 裡還沒有時必填）")
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
            sys.exit(f"weeks 裡沒有第 {ww} 週的主題，請加 --topic \"…\"")
        cat["weeks"][ww] = a.topic
        cat["weeks"] = dict(sorted(cat["weeks"].items()))

    tpl = (ROOT / "templates" / f"{a.type}.html").read_text(encoding="utf-8")
    html = tpl.replace("{{ID}}", item_id).replace("{{TITLE}}", a.title).replace("{{SLUG}}", base)
    page.write_text(html, encoding="utf-8")
    print(f"建立 {rel_path}")

    item = {
        "id": item_id,
        "type": a.type,
        "week": a.week,
        "title": a.title,
        "date": a.date,
        "tags": [t.strip() for t in a.tags.split(",") if t.strip()] or ["待補"],
        "summary": a.summary,
        "path": rel_path,
    }
    if a.type == "code":
        src_rel = f"code/src/{base}.js"
        (ROOT / src_rel).write_text(
            f"// W{ww}｜{a.title}\n// 執行環境：Leaflet 1.9.4，地圖容器 #map\n\n"
            "const map = L.map(\"map\").setView([25.04, 121.54], 13);\n"
            "L.tileLayer(\"https://tile.openstreetmap.org/{z}/{x}/{y}.png\", {\n"
            "  attribution: \"&copy; OpenStreetMap contributors\",\n  maxZoom: 19,\n}).addTo(map);\n",
            encoding="utf-8",
        )
        item["src"] = src_rel
        print(f"建立 {src_rel}")
    if a.type == "lecture":
        item["files"] = []

    cat["items"].append(item)
    catalog_path.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"catalog.json 已加入 {item_id}")
    print("下一步：填寫頁面內容 → 執行 python3 scripts/check.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
