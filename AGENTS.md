# AGENTS.md

本專案的完整規則寫在 **[CLAUDE.md](./CLAUDE.md)**，所有 AI 工具（Codex、Cursor、Copilot、Claude Code…）都以那份為準。

最重要的五件事：

1. 純靜態網站（HTML/CSS/原生 JS），不用框架、不用建置工具，路徑一律相對路徑。
2. `data/catalog.json` 是唯一真相來源：標題、日期、標籤、摘要都寫在這裡，頁面不重複手寫。
3. 新增頁面用 `python3 scripts/new.py <lecture|code|note> <週次> <slug> "<標題>"`，從 `templates/` 產生。
4. 三種頁面各有固定的 `<h2>` 段落與順序（見 CLAUDE.md 第 6 節）。
5. 完成後執行 `python3 scripts/check.py`，必須顯示「✓ 全部通過」。
