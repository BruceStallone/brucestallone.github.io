# 项目记忆

## 项目概况
图南工作室（TunanStudio）官方网站，纯 HTML/CSS/JS 单文件架构（非框架），含 SPA 路由 + 静态多页混合模式。

## 2026-07-03 P0/P1 修复记录
- 配色从通用蓝紫改为民俗风：墨黑 #1C1C1E / 朱砂红 #C8463C / 青瓷绿 #5B8C7A
- 字体改为自托管：移除 Google Fonts，用系统字体栈 + 自托管 cuan.woff（展示字体）
- 导航统一为扁平结构（首页/作品/关于我们/关注我们），全站一致 + 当前页高亮
- 静态页内容与 lang.json 对齐：补全甲马牌卡片、替换占位成员名、修复失效社媒链接
- 清理所有 console.log，debugMode 设为 false
- 实现完整暗色模式（prefers-color-scheme: dark 全语义变量映射）

## 关键约定
- 颜色用 CSS 变量 + `--color-accent-rgb` 供 rgba() 半透明背景使用
- 静态 HTML 文本应与 lang.json 保持一致（SEO/无JS降级）
- 社媒真实链接在 lang.json social.*.link 中
