# dsh-readme-writer

> 自适应 GitHub README 撰写与**截图**技能：先判断目标类型与截图能力——网页走浏览器截图，无网页的控制台/CLI 走终端截屏（.NET System.Drawing 自绘 / HTML 终端 + 无头浏览器 / termtosvg），能则询问并自动配图，不能则走无截图模板。

![type](https://img.shields.io/badge/type-skill-blue)
![category](https://img.shields.io/badge/category-content--creation-orange)
![License](https://img.shields.io/badge/License-MIT-green)

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

发布到 npm 后，或用一个可解析的地址装进目标 profile：

~~~bash
# 已发布到 npm 后
dsh plugin --profile <profile> add dsh-readme-writer

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

## 目录结构

~~~
dsh-readme-writer/
├── package.json            # name/version + main/exports + dsh.bundle.patch
├── README.md
├── LICENSE
├── cordis.patch.yml        # 把本插件挂进 profile bundle 的 patch 层
├── lib/
│   └── index.js            # cordis 插件：apply(ctx) 向 ctx.skills 注册 readme-writer 技能
├── scripts/
│   └── verify-provider.mjs # 独立校验：skill 能通过 provider 加载（npm run verify）
└── skills/
    └── readme-writer/
        └── SKILL.md        # 含可搜索元数据（name/description/keywords/category/version）
~~~

> 本仓库**不含 images/ 目录**：配图由技能在写 README 时为具体目标项目按需截图生成（见 3.0~3.4），
> 不随技能包内置示例图，因此也就无需上传任何图片文件夹。

## 发布与投稿

想通过 `dsh plugin add` 安装、并进入 dsh 插件商城（SkillHub）搜索到本技能：

1. 把本仓库推到 GitHub（公开）。
2. 发布到 npm（`npm publish`），`dsh plugin add dsh-readme-writer` 才能从 registry 装到；
   或在 `awesome-dsh-plugin` 等精选列表里给 git / npm 地址。
3. 搜索可命中字段已备好：`name=readme-writer`、`description`、`keywords`、`category`、`version`。
   搜索用 `keyword`（分词）+ `category` 筛选；关键词命中权重高于正文。

投稿时突出差异化：README 配图 + 截图自适应（探测 → 有图/无图 → 相对路径 + caption），
与 docgen 等「文本生成」区分开。

> 仓库内 `npm run verify` 会独立校验：模拟 host 的 `ctx.skills`，调用插件的
> provider `list()`/`get()`，确认 `readme-writer` 能被正确发现并加载 —— 供评审对照源码核验。

## 许可证

MIT