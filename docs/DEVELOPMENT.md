# Windows / Mac 开发与发布

## 首次准备

安装 Git、Node.js（代码要求 >=18，可使用仍受支持的 LTS 版本）。基本构建和核心测试无 npm 依赖；不需要复制原电脑的 Python、Node 或 Codex 缓存目录。

在准备存放项目的目录打开 PowerShell（Windows）或终端（Mac）：

```sh
git clone https://github.com/wangliumeiagent-creator/cello-notebook.git
cd cello-notebook
git branch --show-current
node --version
npm test
npm run build
npm start
```

分支应为 main。访问 http://127.0.0.1:4317 。服务占用该终端，另开终端编辑或测试；Ctrl+C 停止。无自动热更新，修改 src 后重新构建并刷新网页。端口已被本项目占用时使用已启动的服务，不要重复启动。

Windows 如果 PowerShell 的脚本策略阻止 npm.ps1，可将上述 npm 写成 `npm.cmd`，无需修改系统执行策略。

在 Codex/编辑器中打开当前 `cello-notebook` 目录，不能只下载网页或克隆 gh-pages 作为开发目录。

## 登录与两台电脑接力

公开仓库读取不需要登录；推送需要仓库写权限。每台电脑安装 GitHub CLI 后执行：

```sh
gh auth login
gh auth setup-git
gh auth status
```

使用有写权限的账号，按提示完成浏览器登录；不要把凭据写进项目。若 Git 提示缺少提交作者，使用 `git config user.name` / `git config user.email` 设置本仓库作者（填写自己的姓名和邮箱）。

每次开始：

```sh
git status
git pull --ff-only
```

仅在工作区干净且处于预期分支时拉取。如果已有未提交内容，先检查并提交应保留的改动；不要通过覆盖、删除或强制同步解决。若 fast-forward 失败，表示两台电脑已有不同提交，先 `git fetch origin`，检查 `git log --oneline --graph --all -12`，再合并并逐处处理冲突。

每次离开这台电脑：检查 `git diff`，按实际修改的文件执行 `git add <文件路径>`，再 `git commit -m "说明本次修改"` 和 `git push origin main`。在另一台电脑开始前先拉取。未跟踪文件也要检查，但不要提交个人备份、原始教材或 token。尽量不要让两台电脑同时编辑同一批文件。

纯文档交接只推 main；改网站内容还需要下面的发布步骤。

## 验证和 PDF

```sh
npm test
npm run build
```

构建会更新同名 HTML/XML，不生成 PDF。谱面改动需同步相应 PDF；仅文档修改无需重建谱子。已有 PDF 先备份，再使用网页“打印 / PDF”或对应浏览器脚本重新生成。

可选浏览器测试工具放在被忽略的 qa 目录，不改变应用依赖：

```sh
npm install --prefix qa/tooling playwright
node qa/tooling/node_modules/playwright/cli.js install chromium
```

Windows PowerShell 配置：

```powershell
$env:PLAYWRIGHT_PATH = (Resolve-Path 'qa/tooling/node_modules/playwright').Path
$env:BROWSER_PATH = node -e "console.log(require(process.env.PLAYWRIGHT_PATH).chromium.executablePath())"
```

Mac 终端配置：

```sh
export PLAYWRIGHT_PATH="$PWD/qa/tooling/node_modules/playwright"
export BROWSER_PATH="$(node -e 'console.log(require(process.env.PLAYWRIGHT_PATH).chromium.executablePath())')"
```

这两个变量只对当前终端及其子进程生效；测试脚本的默认路径属于原开发电脑，新电脑必须配置。先在另一终端运行 `npm start`，再运行：

```sh
node tests/browser.cjs
node tests/audio.cjs
node tests/laputa-browser.cjs
node tests/advanced-browser.cjs
```

进阶谱改动后用 `node tests/advanced-browser.cjs --pdf` 更新该课 PDF；主旋律对应 `tests/laputa-browser.cjs --pdf`。`node tests/release.cjs` 会更新所有课的 PDF 并保留 QA 备份，只在确需全量重导出时执行。生成后打开 PDF 检查版式、每页标题和页脚，不能只看文件存在。

可选 XML 校验需 Python 3 和 lxml。以下虚拟环境保存在 qa 内：

Windows：

```powershell
py -3 -m venv qa/xml-venv
qa/xml-venv/Scripts/python.exe -m pip install lxml
qa/xml-venv/Scripts/python.exe scripts/validate_xml.py
```

Mac：

```sh
python3 -m venv qa/xml-venv
qa/xml-venv/bin/python -m pip install lxml
qa/xml-venv/bin/python scripts/validate_xml.py
```

校验使用仓库内的官方 Schema；生成 XML 后无须访问外网。MuseScore 实际导入仍需要人工打开检查。

## 发布 GitHub Pages

main 是完整项目；gh-pages 的根目录是 main 中的 dist 内容。Pages 使用 gh-pages / root，GitHub 自动生成部署任务；不依赖仓库自定义 Actions workflow。

1. 在 main 上完成修改、测试、构建；需要时更新 PDF。
2. 检查 `git diff`、`git status`，提交所有应发布的源码和 dist 产物。
3. 执行：

```sh
npm run publish
```

脚本要求 main 和已跟踪文件无未提交修改，运行核心测试，获取远端 gh-pages 父提交，用已提交的 `HEAD:dist` 创建网站提交，再依次推 main 和 gh-pages。**不会替你运行构建或生成 PDF**；也不会替你提交未跟踪文件。推送保留历史，不需要 force。

4. 查看部署状态：

```sh
gh run list --repo wangliumeiagent-creator/cello-notebook --limit 3
```

找到此次部署的运行编号，再执行 `gh run view <运行编号> --repo wangliumeiagent-creator/cello-notebook`。状态 success 后打开网站，刷新并检查改动、播放和 PDF。必要时网址添加新的 `?release=提交短号` 再接 `#曲目ID`，避免使用旧页面。

## 发布失败处理

- 鉴权失败：检查 `gh auth status`、仓库写权限与 `gh auth setup-git`；不要在日志或对话输出 token。
- Git 503/网络失败：先看远端 main、gh-pages 与运行记录，确认哪一步已成功；网络恢复后可再次运行 publish。不要强制推送。
- main 已推送不代表网页已更新；必须确认 gh-pages 部署成功。
- 部署任务失败：用 `gh run view <编号> --log-failed` 查看原因。GitHub 服务临时错误可 `gh run rerun <编号> --failed`，随后重新确认状态。检查 Pages 设置仍指向 gh-pages 根目录。
- 原电脑曾通过 GitHub Git API 创建网站提交并非强制更新 gh-pages，故本地跟踪引用可能滞后；正常 publish 会先 fetch，不依赖旧引用。
- Git 冲突：保留双方源码，按意图合并；生成文件在源码合并后重新构建。不要用 reset/clean/整目录覆盖。

## 便携包

`python scripts/package_release.py` 打包已有 dist 为版本 ZIP，不会重新构建或生成 PDF。已有同名 ZIP 时脚本拒绝覆盖；先确认版本和输出路径，不删除旧包。版本变化时同步 package.json、dist/package.json、使用说明与打包脚本；dist/使用说明.txt 要与根说明一致。
