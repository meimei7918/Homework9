"""在老師的 demo 原檔中插入【說明】中文註解，不更動任何原有程式行（CLAUDE.md 9.2）。
用法：python3 scripts/annotate.py code/demos/wNN-slug <spec.py>
spec.py 定義 ANN = { "相對檔名": [(行號, "註解文字（可多行）"), ...] }
註解插在該行「上方」，縮排與該行相同，語法依所在位置自動決定：
HTML 區 <!-- -->、<script> 與 .js 用 //、<style> 與 .css 用 /* */、
.php 檔在 <?php … ?> 之內用 //（之外當 HTML）、Dockerfile 用 #、.ini 用 ;。
行號可以寫成字串：會找「第一個包含這段文字的行」，例如 ("let map =", "…")；
寫成 ("let map =", 2) 這種 tuple 則找第 2 個符合的行。
"""
import sys, re, runpy
from pathlib import Path

base = Path(sys.argv[1])
ANN = runpy.run_path(sys.argv[2])["ANN"]
TAG = "【說明】"
import os
FORCE = os.environ.get("FORCE") == "1"

def ctx(text_before: str, suffix: str, name: str = "") -> str:
    if suffix == ".js": return "js"
    if suffix == ".css": return "css"
    if suffix == ".ini": return "ini"
    if name == "Dockerfile": return "hash"
    low = text_before.lower()
    if suffix == ".php" and low.rfind("<?") > low.rfind("?>"):
        return "js"  # PHP 區塊內：用 // 註解
    if low.rfind("<script") > low.rfind("</script>"): return "js"
    if low.rfind("<style") > low.rfind("</style>"): return "css"
    return "html"

def wrap(kind, indent, text, suffix=""):
    if suffix == ".php" and ("<?" in text or "?>" in text):
        # PHP 不管 HTML 註解：<? 會被當成 PHP 開頭；// 註解裡的 ?> 會直接結束 PHP 區塊
        raise SystemExit(f".php 的註解內不可出現 <? 或 ?>：{text[:40]}")
    lines = text.strip("\n").split("\n")
    if kind == "js":
        return [f"{indent}// {TAG if i == 0 else '  '}{l}" for i, l in enumerate(lines)]
    if kind in ("hash", "ini"):
        mark = "#" if kind == "hash" else ";"
        return [f"{indent}{mark} {TAG if i == 0 else '  '}{l}" for i, l in enumerate(lines)]
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
    src = f.read_bytes().decode("utf-8")  # 保留原本的換行字元（CRLF / LF）
    if TAG in src and not FORCE:
        print("略過（已有註解，要追加請設 FORCE=1）：", rel); continue
    nl = "\r\n" if "\r\n" in src else "\n"
    lines = src.split(nl)
    def resolve(ln):
        if isinstance(ln, int): return ln
        pat, nth = (ln, 1) if isinstance(ln, str) else ln
        hits = [i + 1 for i, l in enumerate(lines) if pat in l]
        if len(hits) < nth: raise SystemExit(f"{rel}: 找不到包含 {pat!r} 的第 {nth} 行")
        return hits[nth - 1]
    items = [(resolve(ln), text) for ln, text in items]
    for ln, text in sorted(items, key=lambda x: -x[0]):
        idx = ln - 1
        assert 0 <= idx < len(lines), (rel, ln)
        before = nl.join(lines[:idx])
        target = lines[idx]
        indent = re.match(r"[ \t]*", target).group(0)
        lines[idx:idx] = wrap(ctx(before, f.suffix, f.name), indent, text, f.suffix)
    f.write_bytes(nl.join(lines).encode("utf-8"))
    print("annotated", rel, len(items))
