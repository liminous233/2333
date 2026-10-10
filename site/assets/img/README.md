# 图片素材清单

第一版所有画面都是代码画的（SVG），**没有图片也能完整运行**。
下面是以后可以替换 / 增加的素材。生成或找到后放进这个文件夹，告诉克文件名，克来接进网站。

> 参考图（p1–p5）是别人的作品，只作风格参考，不要放进来。
> 公版图库可直接用：Wikimedia Commons、The Met Open Access、Rijksmuseum。

## 统一风格（给 GPT 的提示词前缀）

> 黑白蓝配色，冷灰蓝雾气，骨白大理石，克莱因蓝点缀，颗粒噪点，复古版画 / 黑白照片质感，大量留白，不要红色，不要文字。

## 清单

| 优先 | 文件名 | 内容 | 建议 | 用在哪 |
|---|---|---|---|---|
| ★★★ | `statue.png` | 共生双月神像：白色大理石人像，两弯月亮在身后相互环抱 | 透明背景，竖构图，≥1600px 高 | 首页中央 |
| ★★★ | `veil-*.png` | 白色半透明帷幔（2–4 张不同形状） | 透明背景 | 首页柱廊间，会单独做飘动 |
| ★★ | `column.png` | 一根白色大理石柱 | 透明背景 | 首页柱廊 |
| ★★ | `cathedral.png` | 卡塔西斯圣堂外观（p5 那种雾蓝尖塔） | 横构图 | 地图页 / 日志头图 |
| ★★ | `corridor.png` | 圣堂内部拱廊（p4 那种过曝长廊） | 横构图 | 同化高时出现 |
| ★ | `ev-candle.png` 等 | 证物照片：香烛、唱诗袍、银莲花、手枪、风铃草胸针…… | 透明背景或黑底，方形 | 证物柜详情（替换线稿图标） |
| ★ | `day-1.png` … `day-8.png` | 每天一张日志头图 | 横构图 | 日志 |
| 可选 | `wei.png` `ryan.png` `anka.png` | 三人剪影 / 立绘 | 方形 | 工作证、人员档案（现在是代码剪影） |

## 和画页编辑器配合

用 GPT 生成单个透明素材 → 在你的画页编辑器里拼成画面 → 把**导出的项目文件 + 素材**一起给克。
如果导出的是每层的位置 / 缩放 / 旋转，克可以把它还原成网页里一层一层的图片，并给每层单独加动效。

## gate/ · 门禁页（维的桌面档案夹）

全部由 `docs/tools/process_gate.py` 从 `docs/source-images/gate/` 生成，改了原图重跑即可：
`python3 -I docs/tools/process_gate.py docs/source-images/gate site/assets/img/gate`（需要 numpy、Pillow、opencv-python-headless）

| 文件 | 来源 | 处理 |
|---|---|---|
| `collage.webp` | 用户给的拼贴参考图 | 去地板；夹住的纸 → #8F6D5F；米黄纸 → 黑色金属板（`metal.jpg` 压暗）；荧光绿 → 克莱因蓝；抹掉红线和图钉；白纸位置垫成底下那张纸 |
| `note.webp` | 同上 | 单独抠出的蓝便签 + 相框，压在网页白纸上面 |
| `pin.png` | 同上 | 图钉 |
| `seal-compass.webp` / `seal-sunmoon.webp` | 用户给的徽章参考 | 罗盘转透明；日月盘外圈红 → #1B2CC1、光芒 → 黑、双月 → 白（两月之间改黑） |
| `clue.webp` | 用户给的毛边纸 + 长尾夹 | 去黑底、去水印 |
| `pen.webp` | 用户给的蘸水笔照片 | 抠出木杆斜口笔，笔杆改拉丝银，笔尖带一点蓝黑残墨 |
| `kraft.webp` | 用户给的旧手写纸 | 下半撕掉（程序生成撕口） |
| `gun.webp` | Wikimedia Commons「Ruger GP100 .357 Stainless.jpg」，**CC BY-SA**（上线前在致谢里署名原作者） | 抠图、去影子、去弹壳、去色 |

翻转卡和揉纸团的交互改写自 React Bits（reactbits.dev，MIT + Commons Clause），源码头部有注明。

## map/ · 地图页（方块地图）

由 `docs/tools/process_map.py` 从 `docs/source-images/map/` 生成：
`python3 -I docs/tools/process_map.py docs/source-images/map site/assets/img/map`

| 文件 | 用在哪 |
|---|---|
| `anemone.webp` | 圆圈里的银莲花格子（每格露出整张图的一块） |
| `moon.webp` | 正中 3×3 的圣堂格子（去了水印） |
| `eye-1..4.webp` | 深色格子里的眼睛（裁到眼睛、去色） |
| `belltower.webp` / `dining.webp` / `dining-girl.webp` / `cathedral.webp` | 点钟楼 / 餐厅 / 圣堂时右下角翻出的图 |
| `gate.webp` / `dorm.webp` / `chapel.webp` | 大门 / 居室 / 祈祷室（地图页补充，原图来自 `docs/specs/2b.地图页的补充.pdf`） |
| `chapel-wall.webp` | 祈祷室「四处走走」：**小红书作者 Jyuemim 的照片，页面上必须标注来源** |

## journal/ · 八日日志 / 证物柜 / 守则 / 失踪档案（方案 3）

由 `docs/tools/process_journal.py` 从 `docs/source-images/journal/` 生成（原图大多从 `docs/specs/3.八日日志修改.pdf` 抽出，手提箱是用户发的图）：
`python3 -I docs/tools/process_journal.py docs/source-images/journal site/assets/img/journal`

| 文件 | 用在哪 |
|---|---|
| `moons.webp` | 八日日志整页背景：森林月相，去掉上下黑边，最左满月叠成双月 |
| `briefcase.webp` | 证物柜的手提箱（背景压成纯白） |
| `notebook.webp` | 游客守则笔记本（抠掉黑底） |
| `envelope-closed.webp` / `envelope-open.webp` / `paper.webp` / `photo.webp` | 失踪档案：纸袋、抽出的旧纸、贴在纸上的照片 |
| `anemone.webp` | 箱子里的一朵银莲花（从首页去色花束里截出最上面那朵） |
| `candle.webp` | 香烛：用户用 GPT 生成的照片，抠掉白底（火苗是代码叠的） |

颂歌谱子是代码画的（`js/items.js`），没有图片。
`gate/forever.webp`：和 `kraft.webp`（WE）同一条撕口的下半截，`process_gate.py kraft` 一起生成。

## d4/ · DAY4 日志（方案 4）

由 `docs/tools/process_d4.py` 从 `docs/source-images/d4/` 生成：莫比乌斯环月亮、高 / 低饱和十字架、纸、银莲花（用户给的 anemone-assets-v2，四朵花两种叶子）。

## church/ · 教堂 / 结局后首页（方案 5）

由 `docs/tools/process_church.py` 从 `docs/source-images/church/` 生成：白 / 红 / 更红三张教堂底图、双月神像（左缘树根渗透烘进 alpha）、
`black-sun.webp`（**小红书作者 無山 的作品，页面上必须署名**）、`red-figure.webp`。
