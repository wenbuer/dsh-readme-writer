# Changelog

本项目所有显著变更均记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/)，
版本号遵循 [语义化版本](https://semver.org/)。

## [1.2.0] - 2026-09-02

### Added
- 改为 **cordis skill-bundle**:可由 `dsh plugin add` 安装并被 dsh 运行时注册为 `readme-writer` 技能
  (`dsh.bundle.patch`、`cordis.patch.yml`、`lib/index.js`)。
- **终端截屏检测层**:目标为「无网页的控制台/CLI」时,可把运行输出渲染成终端样式截图
  (.NET System.Drawing 自绘 / HTML 终端 + 无头浏览器 / termtosvg、asciinema)。
- SKILL.md 新增章节:0.0(先判断目标类型)、0.4(终端截屏检测)、3.5(终端截屏成稿方法)。
- `screenshots.json` + `assets/` 截图声明(供 dsh-market 详情页展示)。
- `scripts/verify-provider.mjs` 独立校验 + `prepublishOnly`(发布前自动跑校验)。

## [1.1.0] - 2026-09-02

### Added
- 新增 cordis 插件入口 `lib/index.js` 与 `cordis.patch.yml`、`dsh.bundle.patch` manifest,
  使其成为可通过 `dsh plugin add` 安装的插件。

## [1.0.0] - 2026-09-02

### Added
- 自适应 GitHub README 撰写技能:截图能力探测(有截图 / 无截图分支)、相对路径配图、
  README 标准章节结构、截图说明(caption)与完成前检查清单。
