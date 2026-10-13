# CASE 0110 · 远程 MCP

《圣献唱诗院》的匿名文字探索入口。原网页仍独立运行；MCP 不提供模型，不调用 OpenAI、Anthropic 或任何付费模型。连接者使用自己宿主的模型额度；运营者只承担 Worker / D1 的请求与存储用量。

内容预警：**微恐 / 宗教意象 / 精神污染表现 / 无突脸**。

## 状态与边界

- 网页同步基线：`liminous233/2333` 的 `45f6eb5dd711055665491e18a0d75bc31521794c`，含香烛后蘸水笔提示与 DAY4 借走时点。
- 隔离目录：本目录、`docs/MCP使用说明.md`。没有改动网页、原有统计接口或根目录部署配置。
- 已通过：28 项自动测试、TypeScript 检查、Worker 打包、本地及独立远程预览 D1 四种结局完整流程、官方 SDK v1/v2 客户端协议测试。
- **2026-10-13 经作者授权正式上线：<https://case0110-mcp.2965999739.workers.dev/mcp>**。正式环境通过官方 SDK 连接、工具列表及简介只读检查；未创建测试局或写入测试结局。完整记录与仍待验证的实际 AI 宿主范围见 [validation/验收.md](validation/验收.md)。

## 本地启动

需要 Node.js 24 或更新版本（测试用 `node:sqlite`），npm。所有命令在本目录运行。

```sh
npm ci
npm test
npm run typecheck
npm run build
# 仅本地数据库：创建原统计表，再应用独立游戏存档迁移。
npx wrangler d1 execute ENDING_DB --local --file ../docs/tools/ending-stats-schema.sql
npx wrangler d1 migrations apply ENDING_DB --local
npm run dev -- --ip 127.0.0.1 --port 8787
```

本地地址 `http://127.0.0.1:8787/mcp`，健康检查 `/health`。另一个终端：

```sh
node --import tsx scripts/live-smoke.ts http://127.0.0.1:8787/mcp
npx @modelcontextprotocol/inspector@2.10.1 --cli http://127.0.0.1:8787/mcp --transport http --method tools/list
```

`live-smoke.ts` 只接受本机地址，防止合成测试结局写进生产统计。传入第三个参数可保存完整重连局记录；导出会遮去临时 `run_id`。

## 协议与工具

使用官方 `@modelcontextprotocol/server` **2.3.1**，精确依赖及传递依赖在 `package-lock.json`。使用 SDK 原生 `createMcpHandler`，2026-07-28 协议与旧版无会话 Streamable HTTP 由 SDK 处理；没有自制 JSON-RPC 协议，也没有 legacy SSE 端点。不提供 stdio 子进程、采样、订阅、任意代码、URL 或 SQL 工具。

| 工具 | 用途 |
| --- | --- |
| `about_case` | 无剧透简介和预警，不创建存档 |
| `start_game` | 新建匿名局，返回 `run_id` 和 revision 0 |
| `observe` | 只读当前公开场景与动作 |
| `act` | `run_id` + `expected_revision` + 当前 `action_id` |
| `get_run_record` | 已公开的回望；结束后显示原作回望、可复制的 `share_text` 与全站次数 |

每次成功动作返回下一场景，因此不必在每次动作后再调用 observe。工具成功和业务错误均提供 `structuredContent` 与 JSON 文本 fallback；协议层无效参数由官方 SDK 返回标准 MCP 错误。

完结后的 `share_text` 是统一的分享文本，包含 CASE 标题和网页同款本局回望，不含 `run_id`，可直接交给玩家复制发帖或回传作者。它不是可导入存档；继续或接力一局仍须私下保管并传递 `run_id`。全站次数单独位于 `global_counts`，不会混入分享文本。

`run_id` 是游戏的随机 bearer handle：拿到它的人可以阅读和继续该局，不应公开。它不是宿主会话 ID，没有账号或 cookie。无法找回丢失的 handle。每局 seed 独立生成；旧证件姓名在同一局保持不变。`en` 是实验性模式：只使用已有英文，无英文的段落保留中文；`bilingual` 展示已有双语。没有自动翻译服务。

## 引擎与原作一致性

- 纯函数 `createRun / observe / transition / buildRecap` 不访问数据库或网络，也不依赖 DOM；错误不修改输入。observe 不改变 seen 或计分。
- `scripts/sync-content.mjs` 在构建准备阶段从公开仓库生成静态文案与原作 `story.js`、`recapText` 适配模块。线上不执行 eval、VM 或无头浏览器。原作文件保持不动。
- `check-content` 校验文案和全部关键判定来源的哈希。原作更新后，先审查动作适配与测试，再显式 `npm run sync-content`，不可只更新哈希绕过审查。
- 计分动作来自 `items.js`、`pages/map.js`、`story-map.js`、`pages/d4.js`、`pages/church.js`。保留一次性选择、低同化会议厅、夜祷、肖像阶段、重连链、原证件与旧 ID、牛皮纸拼合。
- 悬停/揉纸/翻面变成独立动作；计时演出在相应动作后展示已写好的文本。红色大颂礼连续字幕合并为一段，仍需玩家明确点“前往明天”。不续写角色对白。
- D4 第一次展开锁线；重连设置明晰 70、当前同化 -20；C2 达 99 后不再降同化。到 100 不自动结局，肖像入口仍先到圣堂确认与大颂礼。
- `∞` 要求两件证物、拿出证物、商讨对策、破局和送信；进行中不暴露隐藏数值、条件或路线名。结局后的回望直接使用网页同款函数，届时才出现原作允许显示的数值。
- 有意收紧：任何结局都须完成大颂礼；完结后整个 MCP 存档冻结。原网页个别入口可回到已读页，MCP 改为只读回望，符合本次交接要求。

## 持久化、并发与统计

`mcp_runs` 独立表存状态，不存聊天、提示词、用户账号、IP 或 User-Agent。`revision` 在每个合法动作后递增；SQL `UPDATE ... WHERE revision = ? RETURNING id` 原子比较并更新。过期请求返回 `STALE_REVISION` 和当前公开状态；不会重复结算。无效动作不会写入。

结局先保存，再 `INSERT OR IGNORE ending_events(id,kind)`，复用现有 `count_ending` 触发器增加 `ending_totals`。随机 run_id 作为事件 ID，一局只计一次。统计故障时结局保持已完成，返回“全站次数暂不可用”；`stats_recorded=0` 是持久待补记标记，回望读取或每日维护会重试。全库不可用时无法保存动作，会返回服务暂不可用，不伪称保存成功。

未完成局按最近动作保留 7 天，完成局按完成时间保留 30 天；纯读取不延长保留期。生产 cron 每日 UTC 03:17 运行，先补记至多 100 条统计，再清理过期状态。未成功补记的已完结局暂不删除，排障后再清理；这可能延长其存档保留时间。全站聚合及匿名事件 ID 沿用原站的保留规则，不随局内状态删除。

手动清理（需要已获准的生产维护权限）：

```sh
npx wrangler d1 execute ENDING_DB --env production --remote --command "DELETE FROM mcp_runs WHERE (finished_at IS NULL AND updated_at < unixepoch()-604800) OR (finished_at IS NOT NULL AND finished_at < unixepoch()-2592000 AND stats_recorded=1)"
```

## Cloudflare 预览部署

**使用作者现有 Cloudflare 账号；不要使用临时预览账号或将测试绑定到生产数据库。** 当前配置中的预览 database_id 是占位符，必须先替换。

```sh
npx wrangler login
npx wrangler d1 create case0110-mcp-preview
# 将返回的 database_id 写入 wrangler.jsonc 的 env.preview.d1_databases。
npx wrangler d1 execute ENDING_DB --env preview --remote --file ../docs/tools/ending-stats-schema.sql
npx wrangler d1 migrations apply ENDING_DB --env preview --remote
npm run deploy:preview
```

预览地址格式：`https://case0110-mcp-preview.<账户子域>.workers.dev/mcp`。这是格式示例，不是已发布地址。预览 Worker 和 D1 都与生产隔离。设置预览到期清理或在验收后删除预览资源。

2026-10-13 的临时预览已完成验收并删除 Worker / D1，配置恢复占位 ID。再次验证需重新创建预览数据库、填入新 ID、部署后运行 `node --import tsx scripts/preview-smoke.ts`；此脚本固定为预览地址，不接受生产地址。

正式上线前，将预览 URL、完整调用记录、四种结局结果、资源估算和待手动配置项交给翎确认。

## 生产部署（确认之后）

`env.production` 的 `ENDING_DB` 指向现有 `choir-ending-stats`：`3347f608-afd0-4c01-8314-55a51948698b`。此 ID 是原公开配置，不是密钥。部署身份确认拥有它后，检查原统计表和触发器存在。

```sh
npx wrangler d1 execute ENDING_DB --env production --remote --command "SELECT name FROM sqlite_master WHERE name IN ('ending_events','ending_totals','count_ending')"
npx wrangler d1 migrations apply ENDING_DB --env production --remote
npm run deploy
```

只新增 `mcp_runs` 及索引，不改现有统计结构。正式地址为 `https://case0110-mcp.2965999739.workers.dev/mcp`。Worker 只有 D1 绑定，不提供 GitHub、Cloudflare 管理 API 或模型密钥。后续只读上线检查可运行 `node --import tsx scripts/production-health.ts`，不会创建存档或触发结局。

## 用量、限制和回滚

- 请求体上限 32 KiB，SDK 在读取流时实施；严格输入 schema 拒绝额外字段、无效 UUID、过长动作 ID、负数 revision。只执行服务端当前公开列表的动作。
- 无登录公共端点使用宽 CORS，不使用 cookie、凭据型跨域请求或作者身份。不需要将客户端 Origin 限制为原网页。
- 默认关闭 Worker observability，不输出参数、run_id、state、SQL、异常堆栈。不要在部署平台另开请求体日志；按需要只记录时间、工具名、状态码与短错误码。
- 公共部署建议在 Cloudflare WAF / Rate Limiting 配置 `/mcp` POST 的速率阈值、异常流量规则与账号用量告警。可从每来源每分钟 60 次、全站每分钟 600 次作为待调试起点；共享出口需放宽。这些规则不由代码自动创建，功能和计费取决于套餐及域名。不要用浏览器挑战拦正常 MCP 客户端。
- workers.dev 无合适边缘限流能力时，可绑定受管理域名配置 WAF；上线前验证生效。应用内没有拿进程 Map 冒充持久限流。
- 用量：Dashboard → Workers & Pages → 该 Worker 的 Metrics；D1 → 数据库的用量。关注 Worker 请求/CPU、D1 读写与存储；价格以 Cloudflare 当期页面为准。
- 本地最短验收路径 11–46 次动作；存档 JSON 约 0.9–1.9 KiB，探索较多时更大。普通 act 通常一条按主键读、一条 CAS 更新。以每局 50–200 次工具调用估算，1,000 局约 5万–20万 Worker 请求和同数量级至两倍的 SQL 语句。此为请求/语句估计，不是 D1 计费行数或费用承诺；索引更新也计入实际行数。
- 不含模型推理请求，作者模型 token 消耗为零；玩家使用自己的模型账号额度。

```sh
npx wrangler deployments list --env production
npx wrangler rollback <此前部署的版本ID> --env production
```

回滚只回滚 Worker 代码，不回滚 D1 数据。v1 状态有 schemaVersion；未来改变结构应加兼容迁移。初次发布无旧版本时可在控制台停用 Worker 路由，不必删除统计表。原 Pages 网站始终使用原有部署。

## 官方资料（实现时核对）

- [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
- [官方 TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)
- [Cloudflare MCP](https://developers.cloudflare.com/agents/model-context-protocol/)
- [官方 Inspector](https://github.com/modelcontextprotocol/inspector)
- [Workers 定价](https://developers.cloudflare.com/workers/platform/pricing/)
- [D1 定价](https://developers.cloudflare.com/d1/platform/pricing/)

宿主连接细节见 [MCP使用说明](../docs/MCP使用说明.md)。
