# 给 AI 助手的说明（Codex / Claude 通用）

这是「圣献唱诗院」OC 副本展示 + 互动网站，从调查警员维西娅·卡鲁（Vicia Karu）的视角讲述。
作者是翎（liminous），用中文交流。

**开始任何工作前，先读 `docs/交接.md`**：所有设计决定、每一页的做法、待办、测试脚本用法都在里面。
方案 PDF（`docs/specs/`）、原图（`docs/source-images/`）、背景设定原文（`docs/背景设定-圣献唱诗院.txt`）**不在这个公开仓库里**，留在作者的私密仓库 `liminous233/-`（分支 `claude/vibrant-ptolemy-vwrrhr`），需要时从那里取。

这个仓库是**公开**的，不要提交任何私人内容。

## 必须遵守

- 网站全部在 `site/`，**纯静态**：HTML + CSS + 普通 `<script>`，不用模块、不用构建工具、不需要后端。
  双击 `site/index.html` 用 `file://` 打开也要能跑。
- 所有文字在 `site/data/content.js`（`window.CONTENT`），页面逻辑在 `site/js/pages/*.js`，样式在 `site/css/`。
- 进度存在 localStorage（`CC.state`：同化值 assim、隐藏的明晰 clarity、flags 等），见 `site/js/state.js`。
- 字体：
  - Fontshare 的字体（Boska、Aktura、Stardom、Neco、Bonny）**只能用官方 API 链接加载，不能把字体文件放进仓库**。
  - 谷歌字体已经放在本地 `site/assets/fonts/google/`，因为国内打不开谷歌。要加新的谷歌字体，用 `docs/tools/self_host_google_fonts.py`。
  - `site/assets/fonts/zusttora.woff2` 是作者买的字体，只在网站上用，不要拿去别处。
- 配色：黑 / 骨白 / 雾灰蓝，克莱因蓝 `#002FA7` 做主色；一般不用红色；要留白，不要堆满。
- 作者发的示意图主要看**位置**。
- 改完截图给作者看时，**只截改动的部分**。
- 测试：Playwright 截图脚本在 `docs/tools/test_*.js`，用法见 `docs/交接.md`。
  手机宽度（390px）不能出现横向滚动。

## 改代码时特别注意（之前踩过的坑）

- **加新剧情 = 加分支，不是替换**：后期内容（DAY 5–7 等）一律用 flag 判断（如 `CC.state.flag('d4Report')`、`CC.state.seen('day:5')`），
  没满足条件时**原来的场景、文案、图片、样式必须原样保留**。删任何现有场景前先问作者。
- 改别人刚改过的地方前，先 `git pull`，再看 `docs/交接.md` 末尾的最新记录，**不要用旧版本覆盖新改动**（融化文字就被覆盖回旧版过一次）。
- 推送前至少跑一遍：从首页 Game Start 进地图，把每个房间点一遍；再在有 `d4Report` 的存档下点一遍。确认没有报错、手机宽度没有横向滚动。
- git 提交邮箱用 `283220105+liminous233@users.noreply.github.com`，不要用作者的私人邮箱（仓库是公开的）。

## 上线

Cloudflare Pages：连接这个 Git 仓库，构建命令留空，输出目录填 `site`。
