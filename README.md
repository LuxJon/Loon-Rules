# Loon 工具集

> 个人自用的 Loon工具集。

收纳个人使用的 Loon 插件、配套脚本和分流规则。目录和插件文件使用中文名称，订阅统一使用固定英文地址。点击插件名称查看说明，点击订阅导入 Loon。

## Loon 插件

| 图标 | 插件 | 功能与状态 | 远程订阅 |
| --- | --- | --- | --- |
| <img src="./Plugins/%E8%8A%82%E7%82%B9%E6%A3%80%E6%B5%8B%E6%95%B4%E5%90%88/icon.png" width="40" alt="节点检测整合"> | [节点检测整合](./Plugins/%E8%8A%82%E7%82%B9%E6%A3%80%E6%B5%8B%E6%95%B4%E5%90%88/) | 节点 IP 质量、入口落地、地理位置三个独立查询入口。 | [订阅](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Subscriptions/node-diagnostics.lpx) |
| <img src="./Plugins/%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%AB%96%E5%B1%8F%E4%BC%98%E5%8C%96/icon.png" width="40" alt="Bilibili 竖屏优化"> | [Bilibili 竖屏优化](./Plugins/%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%AB%96%E5%B1%8F%E4%BC%98%E5%8C%96/) | 移除竖屏「上滑观看」提示，关闭直播预览倒计时自动进入。 | [订阅](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Subscriptions/bilibili.lpx) |
| <img src="./Plugins/%E8%B1%86%E7%93%A3%E5%8E%BB%E5%BC%80%E5%B1%8F%E5%B9%BF%E5%91%8A/icon.png" width="40" alt="豆瓣去开屏广告"> | [豆瓣去开屏广告](./Plugins/%E8%B1%86%E7%93%A3%E5%8E%BB%E5%BC%80%E5%B1%8F%E5%B9%BF%E5%91%8A/) | 拦截开屏广告决策、竞价和预加载，提供可关闭的广告 SDK 兜底防护。 | [订阅](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Subscriptions/douban.plugin) |
| <img src="./Plugins/%E8%A5%BF%E7%AA%97%E7%83%9B%E4%BC%9A%E5%91%98%E8%A7%A3%E9%94%81/icon.png" width="40" alt="西窗烛会员解锁"> | [西窗烛会员解锁](./Plugins/%E8%A5%BF%E7%AA%97%E7%83%9B%E4%BC%9A%E5%91%98%E8%A7%A3%E9%94%81/) | 收录本地会员解锁配置；其原第三方脚本地址当前返回 404，暂不可用。 | [订阅](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Subscriptions/xichuangzhu.plugin) |
| <img src="./Plugins/QQ%E9%9F%B3%E4%B9%90%E5%90%AF%E5%8A%A8%E5%8A%A8%E7%94%BB%E5%B1%8F%E8%94%BD/icon.png" width="40" alt="QQ 音乐 SVIP 启动动画屏蔽"> | [QQ 音乐 SVIP 启动动画屏蔽](./Plugins/QQ%E9%9F%B3%E4%B9%90%E5%90%AF%E5%8A%A8%E5%8A%A8%E7%94%BB%E5%B1%8F%E8%94%BD/) | 屏蔽指定 CDN 下的 SVIP／钻石启动动画素材。 | [订阅](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Subscriptions/qqmusic.plugin) |

在 Loon 的插件页面添加对应订阅地址。豆瓣、Bilibili、QQ 音乐使用复写；节点检测和西窗烛依赖脚本，具体要求见各插件说明。

## Loon 分流规则

| 服务 | 规则文件 | 远程订阅 |
| --- | --- | --- |
| Binance | [Binance.list](./Rules/Binance.list) | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Rules/Binance.list) |
| Emby | [Emby.list](./Rules/Emby.list) | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Rules/Emby.list) |

在 Loon 中添加远程规则时使用对应 Raw 地址，并按需要选择策略。
