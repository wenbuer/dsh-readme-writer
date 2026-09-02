# dsh-readme-writer

> 自适应 GitHub README 撰写与**截图**技能：先探测截图能力，支持则询问并自动截图配图，不支持则走无截图模板。

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

- **先探测，再决定**：写 README 前先检查当前 agent 环境能否无头截图。
  - 能截图 → 询问用户是否要图，要就自动截图配图；
  - 不能截图 → 直接走无截图模板（表格 + 文字描述界面），README 照样完整。
- **防丢图的相对路径**：截图统一放目标项目内 images/，按项目命名带编号，用相对路径引用。
- **截图说明规范**：每张图配一句「主体 + 动作 + 重点」。
- **踩坑降级**：headless 浏览器在受限沙箱可能因禁进程间通信（mojo / named pipe）崩溃，
  技能会据此降级到无截图模板，而不是硬试。

同类里已有 docgen（README 文本生成）、dsh-technical-writer 等，但都不含「截图自适应」这一条线。

## 安装

**方式一：放进用户级技能目录（立即生效）**

~~~bash
# 把 skills/ 下的 readme-writer 拷到 ~/.dsh/skills/
mkdir -p ~/.dsh/skills/readme-writer
cp skills/readme-writer/SKILL.md ~/.dsh/skills/readme-writer/
~~~

**方式二：作为 dsh 插件 / npm 包**

~~~bash
git clone https://github.com/wenbuer/dsh-readme-writer.git
# 或 npm install dsh-readme-writer（发布后）
~~~

> 安装后重启 dsh，即可在可用技能里看到 `readme-writer`。

## 使用

直接说「帮我写这个项目的 README」即可。技能会：自动探测截图能力 →（支持）询问是否要图
→ 按「有截图」或「无截图」模板生成，并遵循相对路径 + 配图说明约定。

## 目录结构

~~~
dsh-readme-writer/
├── package.json
├── README.md
├── LICENSE
└── skills/
    └── readme-writer/
        └── SKILL.md        # 含可搜索元数据（name/description/keywords/category/version）
~~~

> 本仓库**不含 images/ 目录**：配图由技能在写 README 时为具体目标项目按需截图生成（见 3.0~3.4），
> 不随技能包内置示例图，因此也就无需上传任何图片文件夹。

## 发布与投稿

想在 dsh 插件商城（SkillHub）搜索到本技能：

1. 把本仓库推到 GitHub（公开）。
2. 在 SkillHub / dsh 商城按分类 `content-creation`（内容创作）提交 SKILL.md 的 zip 包；
   或提 PR 到 `awesome-dsh-plugin` 等精选列表。
3. 搜索可命中字段已备好：`name=readme-writer`、`description`、`keywords`、`category`、`version`。
   搜索用 `keyword`（分词）+ `category` 筛选；关键词命中权重高于正文。

投稿时突出差异化：README 配图 + 截图自适应（探测 → 有图/无图 → 相对路径 + caption），
与 docgen 等「文本生成」区分开。

## 许可证

MIT