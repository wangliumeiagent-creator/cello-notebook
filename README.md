# 大提琴练习册

铃木大提琴第一册与拓展曲目的个人学习伴侣。纯静态网站，不需要账号或后端。

网站：https://wangliumeiagent-creator.github.io/cello-notebook/

## 内容

共 15 个练习条目，统一低音谱号。原有练习为 D 大调、D / A 弦第一把位；拓展曲目另含 D 大调《时之伤痕》、D 小调改编与 E 小调进阶谱：

| 内容 | 拍号 / 小节 |
| --- | --- |
| 风之歌 | 2/4，14 小节，末尾反复 |
| 小星星主题及 A–D 四种变奏 | 4/4，各 12 小节 |
| 快来，小伙伴（O Come, Little Children） | 2/4，半拍弱起 + 16 小节；末小节 1.5 拍，首尾互补；反复 |
| 告诉罗娣阿姨 | 4/4，12 小节 |
| 轻舟荡漾 | 4/4，16 小节 |
| D 大调上行、下行、往返 | 4/4，各 4 小节 |
| 天空之城主旋律 | D 小调，4/4，一拍弱起 + 51 小节，末小节三拍 |
| 天空之城进阶版 | 原调 E 小调，4/4，73 小节；三连音、一二房反复、高把位 |
| 时之伤痕 | D 大调，4/4，32 小节；Intro、A、B、C、D 段；D 段一二房 |

铃木曲目按用户所用教材印刷第 4–8 页核对、重新排版。小星星 B、C、D 按教材给出的节奏型和主题音列展开全曲，原页的后续部分标为 etc.。保留原曲拍号；四小节限制只用于原创音阶。教材 PDF 和扫描图不包含在仓库或网站中。未增加空弦练习。

《天空之城主旋律》按用户上传的三张谱图逐音转录，G 小调移为 D 小调；第 49 小节第 2 音至结尾整体提高八度，其余音程和全部时值保留。第 15、48 小节 C♯3 为 G 弦 4 指前伸，第 23 小节 B♭3 为 A 弦低 1 指后伸，已分别标为“4伸”“1低”，需跟老师学后练习。简谱采用 1=F、6=D。新增延音线合并播放、全音符、附点十六分音符和三十二分休止符。

《天空之城进阶版》依据用户提供的单页低音谱号图片，保留原调、音区与 73 小节。第 1 小节为高音三连音，第 2–7 小节整小节休止；第 59、63 小节也有三连音。完整反复路线是 1–65 → 34–56 → 66–73，共 96 个演奏小节、384 拍；未选反复时为 292 拍，分段播放不跳转。原谱速度 116 BPM，默认练习速度 60 BPM。辅助指法为编辑参考，含第四把位和伸张；不是原谱指法，需老师确认。打印版与辅助版共 26 页。

- 音名、弦名、指法、简谱分别开关；“显示辅助”一次打开前三项。
- 两首《天空之城》桌面谱面每行 4 小节，手机端每行 1 小节；打印版同步采用 4 小节一行。
- 20、30、40、50、60、70、80、90、100、110、116、120 BPM，指定小节、循环、谱面反复和预备拍。
- 弱起按拍内位置对齐预备拍；不以休止补成完整小节。十六分音符、附点四分音符、短奏、保持音、已录入的弓法提示。
- 点击音符听单音，配套乐理卡片；打印 / PDF 输出练习版与辅助版。
- `dist/scores` 包含 30 份 MusicXML（可导入 MuseScore）与打印 PDF；页面不显示 MusicXML 下载按钮。
- 本地练习记录，JSON 导出 / 导入；重复跳过，冲突保留两份。

## 使用与跨设备

Windows、Mac、iPhone 在浏览器打开同一个网站地址。iPhone 可在 Safari 分享菜单中选择“添加到主屏幕”；播放需手动点击。首次在线加载后不要假设无网仍能打开，网站没有离线缓存服务。

记录只保存在当前设备和当前浏览器，不自动跨设备同步。换电脑时，在“练习记录”导出 JSON，再在另一台电脑导入。从本地文件 / localhost 改到 GitHub 网址，也需要先导出再导入。保留原备份；关闭隐私浏览或清除网站数据可能使本地记录不可用。

## 跨电脑继续编辑

从新电脑接手请先读 [项目交接](docs/HANDOFF.md)，再按 [Windows / Mac 开发与发布](docs/DEVELOPMENT.md) 配置。AI 协作约定放在 [AGENTS.md](AGENTS.md)，随 Git 一起同步。

## 本地开发

Node.js 18 或以上，无 npm 依赖：

```sh
npm test
npm run build
npm start
```

打开 `http://127.0.0.1:4317`。也可直接打开 `dist/index.html`，但本地文件的存储行为取决于浏览器。

- `src/library.js`：音符、时值、第一把位指法和课程说明。
- `src/laputa.js`：天空之城原谱转录、移调和尾声音区调整。
- `src/advanced.js`：天空之城进阶版 73 小节、三连音、连弓与一二房路线。
- `src/scars.js`：时之伤痕 32 小节、Intro/A/B/C/D 段与 D 段一二房。
- `src/core.js`：拍数校验、音高、播放时间线、备份合并。
- `src/notation.js`：SVG 和 MusicXML 4.0 生成器。
- `src/app.js`：播放、辅助、打印、记录交互。
- `scripts/build.cjs`：生成独立 HTML 与 MusicXML，不联网。会更新同名生成文件，不删除额外文件。
- `scripts/serve.cjs`：本地服务器，仅绑定 127.0.0.1。

修改源文件后重新构建。GitHub Pages 从 gh-pages 分支发布，main 保存完整源码。项目未启用自定义 Actions 工作流；Pages 使用 GitHub 自动生成的部署任务。修改后先构建并提交，再运行 `npm run publish`；该命令检查测试和工作区状态，推送 main，并把 dist 推送到 gh-pages。GitHub 会自动部署 gh-pages 的更新。新电脑需先配置 GitHub 的 Git 登录凭据（例如 `gh auth setup-git`）。

PDF 为预生成文件；修改谱面后用页面“打印 / PDF”更新相应 PDF，或运行下面的浏览器发布检查。构建本身不会重新生成 PDF。

## 验证

`npm test`：音列、时值、弱起 / 末小节互补、反复、20 / 30 BPM、十六分音符和备份冲突。

可选扩展检查（开发环境另需 Python lxml、Playwright 和浏览器）：

```sh
python scripts/validate_xml.py
node tests/browser.cjs
node tests/smoke_extra.cjs
node tests/laputa-browser.cjs --pdf
node tests/advanced-browser.cjs --pdf
node tests/scars-browser.cjs --pdf
node tests/release.cjs
```

浏览器脚本通过 `PLAYWRIGHT_PATH` 指向 Playwright 模块，`BROWSER_PATH` 指向 Chrome / Edge 可执行文件；默认值对应原开发电脑。先启动本地服务器。release 检查会更新 dist/scores 中每课 PDF；已有文件先保存一份 QA 备份。QA 输出和测试用记录不提交到仓库。

已经进行桌面 Edge、390px 手机视口、播放和打印检查，30 份 MusicXML 通过官方 4.0 Schema 校验。没有进行真实 Mac 或 MuseScore 界面验收；用户曾在真实 iPhone 上确认关闭静音后发声，后续 audioSession 兼容逻辑已做模拟测试，但没有完整真机回归。参考音为 Web Audio 合成音，只核对音高、时值和短奏间隔，不模拟真实运弓、渐强渐弱或固定换气时间；网页进入后台会停止播放。

## 素材与范围

Bravura 字体遵循 SIL Open Font License，见 `assets/Bravura-LICENSE.txt`。MusicXML Schema 保留原文件的 W3C 版权与协议声明。教材相关曲目和编辑提示为用户提供资料的转录，未对它们另行授予开源许可。本项目不是铃木教材官方产品。

现有微信小程序未改动，本阶段交付网页。
