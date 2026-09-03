---
name: readme-writer
description: >
  撰写/优化 GitHub 项目 README.md 的自适应技能：先判断目标类型与 agent 环境
  能否出图——网页走浏览器截图，无网页的控制台/CLI 走终端截屏（System.Drawing /
  HTML 终端 / termtosvg），能则询问并自动配图（有截图模板），不能则自动走
  无截图模板（文字/表格描述界面）。覆盖 README 标准章节结构、截图能力探测与
  分支决策、Markdown 与 HTML 图片语法、相对路径引用与 GitHub 图片缓存坑、
  截图说明（caption）写法、正反例与完成前检查清单。
version: 1.3.0
keywords: >
  readme, github, github readme, readme.md, documentation, 文档, 写作,
  markdown, 项目简介, 徽章, badges, template, 模板, screenshot, 截图, 配图,
  相对路径, github 文档, readme-writer, dsh, skill, dsh-plugin,
  content-creation, 内容创作
category: content-creation
argument-hint: "可选：目标仓库路径；无参数时自动探测截图能力并按能力分支"
---

# GitHub README.md 撰写与截图指南（自适应版）

本技能是**写作规范 + 流程决策**：写 GitHub README 前先判断「能不能有配图」，
再选模板。核心思想：**截图是增强项不是必选项；先探测能力，有图走有图的
写法，没图走没图的写法，README 都要完整专业。**

## 0. 先定路径：探测截图能力（第一步，必做）

不要默认有截图、也不要默认没有——**先探测**。用一套跨环境的检查确认能否
出图，再决定走哪条分支。

### 0.0 先判断：要截的是什么？

截图不是只有「网页」一种。**先分清目标类型**，再选对应的探测分支：

| 目标 | 截图产物 | 走哪条探测 |
|---|---|---|
| 网页 / SPA / dev server | 浏览器截图 PNG | 0.1（无头浏览器） |
| 控制台 / CLI / 终端脚本（无网页） | 终端截屏 PNG / SVG / GIF | 0.4（终端截屏） |
| 两者都不是（纯文档 / 说明） | 无 | 直接走「2. 无截图模板」 |

> 判断依据：目标是否暴露一个可访问的 URL / dev server 端口？有 → 网页；
> 没有、只有命令行的 stdout/stderr → 控制台/CLI。

### 0.1 探测四步

1. **找无头浏览器**：chrome / chromium / msedge / google-chrome 之一
   在 PATH 或常见安装路径：
   - Windows：C:\Program Files\Google\Chrome\Application\chrome.exe、
     Edge 在 C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
   - macOS：/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
   - Linux：which google-chrome / chromium / chromium-browser
2. **找截图工具链**：npx playwright --version、node -e "require('puppeteer')"、
   wkhtmltoimage，或 puppeteer / playwright 已安装。
3. **跑一次最小验证**（别只看有工具，要真出图）：
   - chrome --headless --screenshot=/tmp/t.png --window-size=1440,900 URL
   - 或 node 里用 playwright 截一次；成功且文件非空才算支持
4. **记录结论**：ready（支持）/ not-ready（不支持）。

> 命令因环境而异：PowerShell / bash / 容器 / CI 各不相同，把上面换成你所在
> agent 能执行的等价命令即可——这就是「其他 agent 通用」的写法。
> **本节针对「网页」；控制台 / CLI（无网页）走 0.4。**

### 0.2 分支决策

- ✅ **支持**（探测到浏览器且验证出图）→ **询问用户是否需要截图**：
  截哪些页面（URL / 本地 dev server）、视口尺寸、说明、图存哪。用户要就走
  「3. 有截图」流程 + 有截图模板；用户不要也走无截图模板。
- ❌ **不支持**（无浏览器、无工具、验证失败）→ **不询问，直接走「2. 无截图模板」**，
  用文字 / 表格清晰描述界面与功能，不依赖图片。

### 0.3 截图失败的常见原因（遇到就别硬试）

| 症状 | 原因 | 对策 |
|---|---|---|
| 浏览器进程崩溃、mojo / named pipe / Access denied、crash server failed | agent 沙箱/容器禁止进程间通信 | 放弃截图，降级无截图模板 |
| --screenshot 没生成文件 | 输出路径不可写 / headless 模式限制 | 换输出目录、按环境调参；仍不行则降级 |
| 页面需要登录、动画、滚动、交互 | 裸 headless 无法等待/操作 | 用 playwright（可等待、可操作）或改无截图模板 |
| 无浏览器、无截图库 | 环境缺工具 | 不联网安装就按无截图模板 |

> 底线：**截图是加分项。** 探测失败或环境受限时，保证 README 照样完整、
> 能让人看懂——这时候文字描述和结构与截图一样重要。

### 0.4 终端脚本（无网页）的截屏检测

控制台 / CLI 没有网页可截，但可以把它的**运行输出**渲染成一张「终端截屏」。
三选一，按环境取可用的一层：

1. **统一走浏览器（最省事）**：把 CLI 的 stdout 包进一段终端样式的 HTML
   （深色背景 + 等宽 `<pre>` + 标题栏），再用 0.1 检测到的无头浏览器截这张 HTML。
   这样复用「网页截图」能力，跨平台一致，不需额外工具。
2. **.NET System.Drawing（Windows 原生，无需安装）**：直接拿 CLI 输出画成
   终端样式 PNG（深色底 + 标题栏 + 等宽字体 + 提示行高亮）。
   探测：`Add-Type -AssemblyName System.Drawing` 成功 且
   `New-Object System.Drawing.Bitmap 1,1` 不报错 → 可用。
3. **终端录像 / 转图工具**：`termtosvg`（录 SVG）、`asciinema`（录 GIF）、
   `chafa`（终端转图）。探测：`Get-Command termtosvg / asciinema / chafa`。

**验证**（同 0.1 的原则：别只看有工具，要真出图）：跑一次最小渲染，输出文件
非空才算支持；否则降级到「2. 无截图模板」。

> 命令因环境而异：Windows 优先 System.Drawing；macOS / Linux 优先
> termtosvg / chafa；或都退到「HTML 终端 + 无头浏览器」这条统一路。

## 1. README 的标准章节结构（推荐顺序）

下面按推荐顺序排列，[] 内标注「核心（基本必选）/ 按需」。无论有无截图，
这份骨架都适用。

| # | 章节 | 标注 | 说明 |
|---|---|---|---|
| 1 | **项目标题 + 一句话定位** | 核心 | 说明「项目是什么、解决什么问题」；可加 logo |
| 2 | **徽章（Badges）** | 按需 | CI、版本、license、下载量、coverage 等 |
| 3 | **简介 / 概述** | 核心 | 2~4 句讲清背景、痛点、价值 |
| 4 | **预览 / 截图** | 核心* | 有截图时紧随简介放图；无截图时可省略或用文字描述 |
| 5 | **功能特性（Features）** | 核心 | 要点式列出最亮眼 5~10 条 |
| 6 | **目录（TOC）** | 按需 | 文档较长时加 |
| 7 | **安装 / 快速开始** | 核心 | 从零跑通的最短命令序列 |
| 8 | **使用方法 / 示例** | 核心 | 从最小示例到常见用法递进 |
| 9 | **API / 文档链接** | 按需 | 接口列表或外链 docs |
| 10 | **配置** | 按需 | 环境变量 / 配置项表格 |
| 11 | **开发 / 本地构建** | 按需 | clone、装依赖、跑 dev |
| 12 | **测试** | 按需 | 测试命令、覆盖率 |
| 13 | **贡献（Contributing）** | 按需 | 外链 CONTRIBUTING 或提 PR/issue 规范 |
| 14 | **许可证（License）** | 核心 | 必须有；链接 LICENSE 文件 |
| 15 | **致谢 / 鸣谢** | 按需 | 依赖、灵感、赞助、贡献者 |
| 16 | **FAQ / 支持 / 相关项目** | 按需 | 常见问题、联系方式、同类对比 |

**硬性规则**：
- 标题、一句话定位、简介、功能、安装、用法、许可证是骨架；其余按复杂度取舍。
- **简介用白话**：简介／一句话定位尽量用大白话写，少用术语、不用比喻，让不了解的人一眼看懂「这是什么、解决什么问题」。
- **预览图若不是核心卖点，可省**——尤其在不支持截图的环境，别留空图占位。
- **许可证必填**，否则别人不敢用。

### 1.1 简介 / 一句话定位：用白话写

简介和一句话定位是读者第一眼看到的东西，**尽量用大白话**，别堆术语、别用比喻。
目标：让不了解这个项目的人一眼看懂「这是什么、解决什么问题」。

| 别这么写（术语 / 比喻） | 建议这么写（白话） |
|---|---|
| 「基于事件驱动架构的实时协作引擎」 | 「一个让多人同时编辑、改动实时同步的工具」 |
| 「为开发者打造的声明式配置工作流」 | 「用配置文件就能定义一套自动化流程」 |
| 「一站式解决方案，赋能业务闭环」 | 「把几个步骤合成一个工具，一次做完」 |

> 白话不是啰嗦，是把话说明白。术语可以在后文的「特性 / 用法」里补，简介就让它好懂。

## 2. 无截图模板（探测不支持 / 用户不要图时用）

没有配图时，用**文字 + 表格 + ASCII** 把「界面长什么样、能做什么」讲清楚，
或干脆省略预览、把重点放在特性与快速开始。

~~~markdown
# [项目名]

> 一句话定位：这个项目是做什么的、解决什么问题。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 简介

两三句话讲清背景、痛点与价值。

## 界面一览（无截图说明）

| 模块 | 作用 |
|---|---|
| 作战面板 | 组织架构可视化、角色待办与执行状态 |
| 角色工作区 | 按角色查看任务卡片与产出物 |
| 知识库 | 沉淀团队知识 |

> 说明：当前环境不支持截图，此处以表格代替界面预览；可截图后补图。

## 特性

- 亮点功能 A
- 亮点功能 B

## 快速开始

~~~bash
git clone https://github.com/you/repo.git
cd repo
npm install && npm run dev
~~~

## 许可证

[MIT](LICENSE)
~~~

**无截图时的重点**：
- 用「模块 → 作用」表格描述界面，替代截图。
- 特性、快速开始要写得足够「看见」效果——文字要具体，别抽象。
- 一句话定位务必精准，因为没有图第一时间抓眼球，靠它。

## 3. 有截图：询问 → 截图 → 配图

### 3.0 先向用户询问（探测支持后必做）

用一次结构化询问收集：
1. **要不要截图？**（用户可能只想写字）
2. **截哪些页面**：URL / 本地 dev server 地址 / 多页。
3. **视口与形式**：桌面（1440×900）、移动（390×844）、全页长图、演示 gif。
4. **图存哪 + 说明**：目录（images/ 等）、每张图的说明文案。

> 若目标页面当前不可访问（端口未开 / 需要登录），先解决可达性再截；
> 解决不了就退到无截图模板。

### 3.1 截图方法（按环境选一种）

**A. 裸浏览器 headless（最简，适合静态可访问页）**

~~~bash
# Windows (PowerShell) —— 用 Chrome 无头截一张
chrome --headless --disable-gpu --no-first-run --hide-scrollbars
  --window-size=1440,900 --virtual-time-budget=7000 --run-all-compositor-stages-before-draw
  --screenshot=./images/your-project-01.png http://127.0.0.1:8901/
~~~

**B. Playwright / Puppeteer（更强，可等待、滚动、走交互、多页）**

~~~js
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://127.0.0.1:8901/", { waitUntil: "networkidle" });
  await p.screenshot({ path: "images/your-project-01.png", fullPage: true });
  await b.close();
})();
~~~

**截图易错提醒**：
- 输出目录要已存在且可写；截图文件用**相对路径**给到 README。
- 长截图 / 超宽图**限宽**（width），gif 控制在几 MB 内。
- 若浏览器因沙箱禁进程间通信崩溃（见 0.3），**立即降级无截图模板**。

### 3.2 图存哪、怎么命名（防止上传后找不到）

- **在项目里新建一个 `images/` 目录统一放图**（不要随意散落）；也可沿用项目已有的约定目录（如 docs/images、screenshots、assets）。与 README 同层、随仓库一起提交。
- **按项目命名**：`项目slug-序号.png`（如你的项目-01.png）；
  同项目多图递增编号 -02、-03...
- **一律用相对路径引用**：images/你的项目-01.png。
  **绝不用**绝对根路径（/docs/...）或本地盘符路径（C:/...）——
  上传 / 迁移后绝对路径会失效，图就找不到；相对路径随文件走，哪都能显示。

### 3.3 图片语法与控制

**Markdown 语法**（基础）：`![alt](相对路径)`，如
`![你的界面](images/your-project-01.png)`。alt 必写，加载失败/SEO/无障碍都靠它。

**HTML <img> 控制尺寸与居中**（Markdown 不能设宽高/居中）：

~~~html
<p align="center">
  <img src="images/your-project-01.png" alt="你的界面" width="800">
  <br>
  <em>图 1：你的界面——左侧为…，右侧为…，底部为…。</em>
</p>
~~~

**常用属性**：width/height（宽截图只设 width 防变形）、align="center"、
max-width="100%"。并排多图可用表格或并排 img；演示动作用 gif/webp。

**GitHub 特有坑**：
| 问题 | 解法 |
|---|---|
| 图片被强缓存 | 改名 / 加 ?raw=1 / 加版本号 |
| 绝对根路径解析失败 | 一律用相对路径 |
| 深浅色 logo 可读性 | 用 <picture> + prefers-color-scheme |
| 跨仓库依赖 | 优先本仓库；外链用 raw.githubusercontent.com 完整 URL |
| SVG 动画不渲染 | logo 用 SVG，演示截图用 PNG/jpg/webp |
| 超大/超宽图 | width 限宽，超宽裁剪或拆多张 |

### 3.4 相对路径 + 说明的成稿示例（配图按需生成，本仓库不内置示例图）

本技能**不随包内置示例截图**——图片应由你按第 3.0~3.3 节现场截图、按项目命名
放进目标项目的 images/ 并用相对路径引用。下面是一段「相对路径 + caption」的
**成稿模板**，直接照抄、把 `images/your-project-01.png` 换成你的图即可：

~~~html
<p align="center">
  <img src="images/your-project-01.png" alt="你的界面" width="800">
  <br>
  <em>图 1：你的界面——主体 + 动作 + 重点。</em>
</p>
~~~

> 要点：`src` 用相对路径 `images/xxx.png`，`alt` 必写，说明放图下方用 `<em>` 斜体。
> 把示例图硬塞进技能包反而误导——配图是每个 README 目标项目按需生成的内容。

### 3.5 终端截屏（无网页的控制台 / CLI 项目）

没有网页时，把 CLI **真实运行**的输出渲染成一张终端样式图。用 0.4 里探测到的
其中一种办法；下面给可直接套用的两版。

**A. .NET System.Drawing 自绘（Windows；已实测可用，无需装工具）**

~~~~powershell
Add-Type -AssemblyName System.Drawing
$png = 'images/your-cli-01.png'
# 1) 拿 CLI 真实输出（换成你的命令；stderr 一并捕获）
$output = & .\your-cli.exe --help 2>&1 | Out-String
$lines  = ($output -split "`r?`n") | Where-Object { $_ -ne '' }
# 2) 画一张终端样式图（深色底 + 标题栏 + 等宽字体 + 提示行高亮）
$font = New-Object System.Drawing.Font('Consolas',13,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
$pad=18; $tmp=New-Object System.Drawing.Bitmap 1,1
$g=[System.Drawing.Graphics]::FromImage($tmp)
$g.TextRenderingHint=[System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$mw=0.0; foreach($l in $lines){ $s=$g.MeasureString($l,$font); if($s.Width -gt $mw){$mw=$s.Width} }
$lh=[math]::Ceiling($g.MeasureString('Mg',$font).Height); $g.Dispose(); $tmp.Dispose()
$w=[int]($mw+$pad*2); $h=[int]($lines.Count*$lh+$pad*2+30)
$bmp=New-Object System.Drawing.Bitmap($w,$h)
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint=[System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::FromArgb(255,30,30,46))
$g.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,45,45,65))),0,0,$w,28)
$g.DrawString('your-cli',(New-Object System.Drawing.Font('Segoe UI',9,[System.Drawing.GraphicsUnit]::Pixel)),[System.Drawing.Brushes]::White,6,7)
$text=New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,220,220,230))
$prompt=New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,143,220,143))
$y=$pad+28
foreach($l in $lines){ $g.DrawString($l,$font,$(if($l -match '>'){$prompt}else{$text}),$pad,$y); $y+=$lh }
$bmp.Save($png,[System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
~~~~

**B. HTML 终端 + 无头浏览器（跨平台统一，复用 0.1 的浏览器）**

把 CLI 输出包成终端样式 HTML（深色底 + `<pre>` 等宽 + 标题栏），再用
`chrome --headless` 或 playwright 截这张 HTML —— 不用装任何终端工具。

**C. termtosvg / asciinema（Linux / macOS 常用）**

- `termtosvg`：录成可缩放 SVG，README 中控 `width`。
- `asciinema`：录成 GIF，控制在几 MB 内。

**终端截屏同样遵循**：图存 images/、按项目命名带编号、用**相对路径**引用、
每张配一句「主体 + 动作 + 重点」的说明（见 3.2 / 3.3 / 4）。

## 4. 截图说明（caption）怎么写

**只要放了图，就该有一句说明。** 一条好的说明 = 三要素：这是什么（主体）
+ 展示/演示了什么（动作）+ 读者该关注哪个点（重点）。

| 要素 | 要回答 | 例子 |
|---|---|---|
| 主体 | 这张图是什么界面/对象？ | 「兑换页面」「统计图表」 |
| 动作 | 演示了什么流程/功能？ | 「展示发起兑换的全流程」 |
| 重点 | 读者该看哪个点？ | 「注意右上角的到账状态」 |

写法规范：
- 置于图**正下方**，用 <em> / 斜体区分正文；一条一句。
- **与上下文呼应**：如在「快速开始」下，说明也要围绕「这是哪一步、看到什么结果」。
- **多图有序**：编号（图 1/图 2）或小标题；说明可链接其他章节（详见[使用](#使用)）。
- **演示 gif 要写动作顺序**：*演示：新建 → 编辑 → 导出，3 秒完成。*
- **别写废话**：*这是一个截图* 等于没写。

反例 vs 正例：

~~~markdown
<!-- ❌ 反例 -->
![截图](images/x.png)
*这是一个截图*

<!-- ✅ 正例：主体 + 动作 + 重点 -->
<p align="center">
  <img src="images/task.png" alt="任务面板" width="800">
  <br>
  <em>图 1：任务面板——拖动卡片调整优先级，顶部按状态筛选任务。</em>
</p>
~~~

## 5. 完成前检查清单（按分支勾选）

**通用**：
- [ ] 标题 + 一句话定位精准，读者 3 秒知道「是什么、值不值得点开」。
- [ ] 简介 / 一句话定位用白话：少术语、不用比喻，一眼看懂「是什么、解决什么问题」。
- [ ] 简介在预览之前，2~4 句讲清价值。
- [ ] 安装/快速开始提供最短可跑命令序列；用法示例从最小示例递进。
- [ ] 许可证章节与 LICENSE 文件齐全。

**有截图时**：
- [ ] 先询问过用户是否要截图（不私自截图）。
- [ ] 若是控制台 / CLI 项目，用的是「终端截屏」（System.Drawing / HTML 终端 / termtosvg），不是浏览器截图。
- [ ] 图存 images/，按项目命名带序号，用**相对路径**引用。
- [ ] 每张图有一句说明（主体 + 动作 + 重点），居中并在图下。
- [ ] 横向长截图已限宽（width），gif 几 MB 内，已处理缓存。
- [ ] 确认截图页可访问、非错误页（截图后回看过内容）。

**无截图时**：
- [ ] 无空图占位；用「模块→作用」表格或文字清晰描述界面。
- [ ] 一句话定位 / 特性写得足够具体，弥补无图的「可视化不足」。