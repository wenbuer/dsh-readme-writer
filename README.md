# dsh-readme-writer

> 自适应 GitHub README 撰写与**截图**技能：先探测截图能力，支持则询问并自动截图配图，不支持则走无截图模板。

![GitHub](https://img.shields.io/badge/type-skill-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 这是什么

一个给 DeepSeek Harness（dsh）用的 Agent Skill，负责写 / 优化 GitHub 项目 README.md。
它与普通「README 文本生成」技能的关键差异是：**配图 + 截图自适应**。

## 为什么不一样

- **先探测，再决定**：写 README 前先检查当前 agent 环境能否无头截图。
  - 能截图 → 询问用户是否要图，要就自动截图配图；
  - 不能截图 → 直接走无截图模板（表格 + 文字描述界面），README 照样完整。
- **防丢图的相对路径**：图统一放项目内 images/，按项目命名带编号，用相对路径引用。
- **截图说明规范**：每张图配一句「主体 + 动作 + 重点」。
- **踩坑降级**：headless 浏览器在受限沙箱可能因禁进程间通信（mojo / named pipe）崩溃，
  技能会据此降级到无截图模板，而不是硬试。

同类里已有 docgen（README 文本生成）、dsh-technical-writer 等，但都不含「截图自适应」这一条线。

## 安装

**方式一：放进用户级技能目录（立即生效）**

~~~bash
# 把 skills/ 下的 readme-writer 拷到 ~/.dsh/skills/
mkdir -p ~/.dsh/skills/readme-writer/images
cp -r skills/readme-writer/SKILL.md ~/.dsh/skills/readme-writer/
cp -r skills/readme-writer/images/* ~/.dsh/skills/readme-writer/images/
~~~

**方式二：作为 dsh 插件 / npm 包**

~~~bash
git clone https://github.com/<your-user>/dsh-readme-writer.git
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
        ├── SKILL.md
        └── images/
            └── opc-command-center-01.png   # 示例图（相对路径引用示范）
~~~

## 发布与投稿

想上到 Awesome DSH Plugin 精选列表：

1. 把本仓库推到 GitHub（公开）。
2. Fork / 提交 PR 到 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)，
   在其 README（README.zh.md / README.md）对应分类加一行：

   `- [dsh-readme-writer](https://github.com/<your-user>/dsh-readme-writer) - 自适应 GitHub README 撰写与截图技能`

3. 投稿时突出差异化：README 配图 + 截图自适应（探测 → 有图/无图 → 相对路径 + caption），
   与 docgen 等「文本生成」区分开。

## 许可证

MIT