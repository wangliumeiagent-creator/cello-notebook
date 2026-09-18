# 指板探索进度

- 目标：在保留练习曲功能和记录草稿的前提下，加入首页双入口与四把位指板探索。
- 顺序：核验基线 → 审核指法数据 → 核心/谱面能力 → 路由与界面 → 浏览器验收与构建。
- 2026-09-18 基线：HEAD `eae16c5`，工作区干净；`npm.cmd test` 为 29 通过、0 失败。
- 已读：`AGENTS.md`、`docs/HANDOFF.md`、`docs/DEVELOPMENT.md`；构建命令为 `npm.cmd run build`。
- 浏览器测试条件：`PLAYWRIGHT_PATH`、`BROWSER_PATH`；将在运行前检查其可用性。
- 最大风险：第二、第三把位的标准手型名称与具体映射需要可追溯的教学依据，不能用未核对资料冒充已审核。
- 数据：下第二、下第三、下第四把位的名称已按来源细分；手型与音高已分离并有独立错误拒绝测试。
- 已完成：首页/深链接路由、指板联动、复用音频、低音谱号单音渲染；`npm.cmd test` 32/32、构建通过。
- 浏览器：使用 `PLAYWRIGHT_PATH=C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright` 与 `BROWSER_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` 运行 `node tests\fingerboard-browser.cjs` 通过。
- 追加完成：首页/指板隐藏侧栏；四指改用等距、放大且分层的“数字 / 指·音名”示意按钮，桌面与 390px 浏览器回归再次通过。老师审核与真机 iPhone 验收详见 `BLOCKED.md`。
