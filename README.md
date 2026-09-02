# dsh-readme-writer

> 自适应 GitHub README 撰写与**截图**技能：先判断目标类型与截图能力——网页走浏览器截图，无网页的控制台/CLI 走终端截屏（.NET System.Drawing 自绘 / HTML 终端 + 无头浏览器 / termtosvg），能则询问并自动配图，不能则走无截图模板。

![type](https://img.shields.io/badge/type-skill-blue)
![category](https://img.shields.io/badge/category-content--creation-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![verify](https://github.com/wenbuer/dsh-readme-writer/actions/workflows/verify.yml/badge.svg)

## 这是什么

一个给 DeepSeek Harness（dsh）用的 Agent Skill，负责写 / 优化 GitHub 项目 README.md。
它与普通「README 文本生成」技能的关键差异是：**配图 + 截图自适应**。

> 包内已按 dsh 插件商城（SkillHub）的可搜索规范写好 SKILL.md 元数据：
> `name`（标题）、`description`（摘要）、`keywords`（关键词）、`category`、`version`。
> 搜索命中后按 title > summary/keywords 加权，关键词塞得越准越好搜到。

## 为什么不一样

- **先判断类型，再探测，再决定**：写 README 前先确认目标是网页还是控制台/CLI，再检查当前 agent 环境能否出图。
  - 网页 → 能否无头截图（chrome / playwright / puppeteer）？能 → 询问截图；不能 → 无截图模板。
  - 控制台/CLI（无网页）→ 把运行输出渲染成**终端截屏**：.NET System.Drawing 自绘（Windows 原生，无需安装）/ HTML 终端 + 无头浏览器（跨平台统一）/ termtosvg、asciinema；都不行 → 无截图模板。
  - 两者都做不了 → 直接走无截图模板（表格 + 文字描述界面），README 照样完整。
- **防丢图的相对路径**：截图统一放目标项目内 images/，按项目命名带编号，用相对路径引用。
- **截图说明规范**：每张图配一句「主体 + 动作 + 重点」。
- **踩坑降级**：headless 浏览器在受限沙箱可能因禁进程间通信（mojo / named pipe）崩溃，
  技能会据此降级到无截图模板，而不是硬试。

同类里已有 docgen（README 文本生成）、dsh-technical-writer 等，但都不含「截图自适应」这一条线。

## 安装

**方式一：`dsh plugin add`（推荐，装完即用）**


~~~bash
# dsh plugin add
dsh plugin --profile <profile> add wenbuer/dsh-readme-writer

# 或从 git / 本地目录
dsh plugin --profile <profile> add github:wenbuer/dsh-readme-writer
dsh plugin --profile <profile> add file:../dsh-readme-writer
~~~

> 本包是 cordis skill-bundle：`package.json` 里 `dsh.bundle.patch` 指向 `cordis.patch.yml`。
> `dsh plugin add` 会把它加进 profile 的 `dsh.profile.bundles`，并在 host 层用
> `lib/index.js` 的 `apply(ctx)` 向 `ctx.skills` 注册 `readme-writer` 技能。
> 装完重启 dsh，即可在可用技能里看到 `readme-writer`。

**方式二：放进用户级技能目录（手动，立即生效）**

~~~bash
mkdir -p ~/.dsh/skills/readme-writer
cp skills/readme-writer/SKILL.md ~/.dsh/skills/readme-writer/
~~~

## 使用

直接说「帮我写这个项目的 README」即可。技能会：自动探测截图能力 →（支持）询问是否要图
→ 按「有截图」或「无截图」模板生成，并遵循相对路径 + 配图说明约定。

## 截图 / Screenshots

插件自身的展示截图（供 dsh-market 详情页 / 本 README 使用；由 `screenshots.json` 声明）：

![verify](assets/readme-writer-verify.png)
*图 1：`npm run verify` —— 真实校验输出，证明 `readme-writer` 能经插件 provider 正确发现并加载。*

![terminal](assets/readme-writer-terminal.png)
*图 2：终端截屏 —— 对「无网页的控制台 / CLI」项目，技能把运行输出渲染成终端样式截图。*

> 这两张是**插件自身**的展示截图；技能为**每个目标项目**写 README 时按需生成的配图
> 仍遵循「图存 images/、相对路径、每张一句说明」的约定（见 SKILL.md 3.0~3.4），二者不是一回事。

## 目录结构

~~~
dsh-readme-writer/
├── package.json            # name/version + main/exports + dsh.bundle.patch
├── README.md
├── LICENSE
├── CHANGELOG.md
├── screenshots.json        # 声明 1-8 张展示截图（dsh-market 详情页用）
├── cordis.patch.yml        # 把本插件挂进 profile bundle 的 patch 层
├── assets/                 # 插件自身展示截图（readme-writer-*.png）
├── lib/
│   └── index.js            # cordis 插件：apply(ctx) 向 ctx.skills 注册 readme-writer 技能
├── scripts/
│   └── verify-provider.mjs # 独立校验：skill 能通过 provider 加载（npm run verify）
├── .github/
│   └── workflows/
│       └── verify.yml      # CI：每次 push 跑 npm run verify
├── submission/
│   └── wenbuer__dsh-readme-writer.yml  # awesome-dsh-plugin 投稿条目（data/plugins 用）
└── skills/
    └── readme-writer/
        └── SKILL.md        # 含可搜索元数据（name/description/keywords/category/version）
~~~

> 技能**不随包内置 README 示例截图**——配图由技能在写 README 时为具体目标项目按需截图生成（见 SKILL.md 3.0~3.4）。
> 上文 `assets/` 里是**插件自身**的展示截图（只用于本 README / dsh-market 详情页，经 `screenshots.json` 声明），
> 与「技能为每个项目现场生成的那类配图」是两回事，请勿混用。

## 发布与投稿

想通过 `dsh plugin add` 安装、并进入 dsh 插件商城（SkillHub）搜索到本技能：

1. 把本仓库推到 GitHub（公开）——已完成。
2. 进英文列表以 **GitHub 仓库地址** 提交即可：`dsh plugin add github:wenbuer/dsh-readme-writer` 能装，
   **不需要 npm 包**（发布与否不影响收录）。投稿条目见 `submission/wenbuer__dsh-readme-writer.yml`，
   `category: skill`，`description.en` 必填、已含句号。
   - 前提（CI 自动检查，需你先满足）：仓库**满 1 天**、**提交数 ≥ 10**、给仓库加 **`dsh-plugin` topic**。
3. 若日后发布到 npm，`dsh plugin add dsh-readme-writer` 才能从 registry 装到；商城也会按下载量展示。

投稿时突出差异化：README 配图 + 截图自适应（探测 → 有图/无图/终端截屏 → 相对路径 + caption），
与 docgen 等「文本生成」区分开。

> 仓库内 `npm run verify` 会独立校验：模拟 host 的 `ctx.skills`，调用插件的
> provider `list()`/`get()`，确认 `readme-writer` 能被正确发现并加载 —— 供评审对照源码核验。

## 许可证

MIT
