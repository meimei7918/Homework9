"""在老師的 demo 原檔中插入【說明】中文註解，不更動任何原有程式行（CLAUDE.md 9.2）。
用法：python3 scripts/annotate.py code/demos/wNN-slug <spec.py>
spec.py 定義 ANN = { "相對檔名": [(行號, "註解文字（可多行）"), ...] }
註解插在該行「上方」，縮排與該行相同，語法依所在位置自動決定。
"""
import sys, re, runpy
from pathlib import Path

base = Path(sys.argv[1])
ANN = runpy.run_path(sys.argv[2])["ANN"]
TAG = "【說明】"
import os
FORCE = os.environ.get("FORCE") == "1"

def ctx(text_before: str, suffix: str) -> str:
    if suffix == ".js": return "js"
    if suffix == ".css": return "css"
    low = text_before.lower()
    if low.rfind("<script") > low.rfind("</script>"): return "js"
    if low.rfind("<style") > low.rfind("</style>"): return "css"
    return "html"

def wrap(kind, indent, text):
    lines = text.strip("\n").split("\n")
    if kind == "js":
        return [f"{indent}// {TAG if i == 0 else '  '}{l}" for i, l in enumerate(lines)]
    if kind == "css":
        body = [f"{indent}/* {TAG}{lines[0]}"] + [f"{indent}   {l}" for l in lines[1:]]
        body[-1] += " */"
        return body
    if "--" in text:
        raise SystemExit(f"HTML 註解內不可出現 --：{text[:40]}")
    body = [f"{indent}<!-- {TAG}{lines[0]}"] + [f"{indent}     {l}" for l in lines[1:]]
    body[-1] += " -->"
    return body

for rel, items in ANN.items():
    f = base / rel
    src = f.read_text(encoding="utf-8")
    if TAG in src and not FORCE:
        print("略過（已有註解，要追加請設 FORCE=1）：", rel); continue
    nl = "\r\n" if "\r\n" in src else "\n"
    lines = src.split(nl)
    for ln, text in sorted(items, key=lambda x: -x[0]):
        idx = ln - 1
        assert 0 <= idx < len(lines), (rel, ln)
        before = nl.join(lines[:idx])
        target = lines[idx]
        indent = re.match(r"[ \t]*", target).group(0)
        lines[idx:idx] = wrap(ctx(before, f.suffix), indent, text)
    f.write_text(nl.join(lines), encoding="utf-8")
    print("annotated", rel, len(items))
