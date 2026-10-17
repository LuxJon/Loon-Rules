# Loon 工具集

> 个人自用的 Loon工具集。

集中收纳个人使用的 Loon 插件、配套脚本和分流规则。插件按功能分别维护，分流规则按服务独立订阅。

## 目录

- [`Plugins/node-diagnostics`](./Plugins/node-diagnostics/)：Loon 节点检测整合。
- [`Plugins/bilibili-enhance`](./Plugins/bilibili-enhance/)：B 站竖屏优化：移除「上滑观看」提示、关闭直播预览倒计时自动进入。
- [`Rules`](./Rules/)：Binance、Emby 分流规则。

## Loon 插件

| 插件 | 功能 | 远程订阅 |
| --- | --- | --- |
| [节点检测整合](./Plugins/node-diagnostics/) | 节点 IP 质量、入口落地、地理位置三个独立查询入口 | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/node-diagnostics/node-diagnostics.lpx) |
| [Bilibili 竖屏优化](./Plugins/bilibili-enhance/) | 移除竖屏「上滑观看」提示、关闭直播预览倒计时自动进入 | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/bilibili-enhance/Bilibili_Enhance.lpx) |

在 Loon 的插件页面添加对应 Raw 地址。Bilibili 插件使用 JSON 复写，无需 JS；节点检测插件自动加载远程脚本，其中 IP 质量功能引用原作者脚本。

## Loon 分流规则

| 服务 | 规则文件 | 远程订阅 |
| --- | --- | --- |
| Binance | [Binance.list](./Rules/Binance.list) | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Rules/Binance.list) |
| Emby | [Emby.list](./Rules/Emby.list) | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Rules/Emby.list) |

在 Loon 中添加远程规则时使用对应 Raw 地址，并按需要选择策略。各服务保持独立文件。
