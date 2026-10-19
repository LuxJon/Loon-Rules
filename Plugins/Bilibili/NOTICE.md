# 来源与适配说明

本目录自用插件由 LuxJon / Codex 维护，日期 2026-10-19。

高置信度广告类型条件参考 Biliverse/ADBlock v0.7.5：
- https://github.com/Biliverse/ADBlock/blob/v0.7.5/src/class/ADBlock.mjs
- https://github.com/Biliverse/ADBlock/blob/v0.7.5/src/process/Response.mjs

上游插件作者：ClydeTime、VirgilClyne、app2smile、RuCu6、Maasea。
上游许可证：Apache-2.0，副本见 LICENSE.Biliverse.txt。

本适配以独立 Loon 原生 JQ 规则表达所需条件，增加首页直播、显式广告标记、Story 整条过滤和界面优化；没有复制、拼接、动态下载或执行上游 JavaScript bundle，没有替换上游插件订阅链接。不是 Biliverse 官方发布。

启用正文接管会跳过相同响应上的原 Response Script；完整功能和后续更新的边界见 README.md。本版本作为手机适配测试版发布。
