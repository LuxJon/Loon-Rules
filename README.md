# Loon 工具集

> 个人自用的 Loon工具集。

集中收纳个人使用的 Loon 插件、配套脚本和分流规则。插件按功能分别维护，分流规则按服务独立订阅。

## 目录

- [`Plugins/node-diagnostics`](./Plugins/node-diagnostics/)：Loon 节点检测整合。
- [`Plugins/bilibili-enhance`](./Plugins/bilibili-enhance/)：B 站增强，包含移除上滑提示、关闭直播自动进入、空间链接简化（首页推荐入口仍弹半屏）。
- [`Rules`](./Rules/)：Binance、Emby 分流规则。

## Loon 插件

| 插件 | 功能 | 远程订阅 |
| --- | --- | --- |
| [节点检测整合](./Plugins/node-diagnostics/) | 节点 IP 质量、入口落地、地理位置三个独立查询入口 | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/node-diagnostics/node-diagnostics.lpx) |
| [Bilibili 增强](./Plugins/bilibili-enhance/) | 移除上滑观看提示、关闭直播倒计时自动进入、空间链接简化（直达效果有入口限制） | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/bilibili-enhance/Bilibili_Enhance.lpx) |

在 Loon 的插件页面添加对应 Raw 地址。配套脚本由插件远程加载，无需手动保存为本地 JS。节点检测的 IP 质量功能仍引用其原作者的远程脚本。

## Loon 分流规则

| 服务 | 规则文件 | 远程订阅 |
| --- | --- | --- |
| Binance | [Binance.list](./Rules/Binance.list) | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Rules/Binance.list) |
| Emby | [Emby.list](./Rules/Emby.list) | [Raw](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Rules/Emby.list) |

在 Loon 中添加远程规则时使用对应 Raw 地址，并按需要选择策略。各服务保持独立文件。

## 目录调整与订阅迁移

此次调整将根目录的 `Binance.list`、`Emby.list` 移至 `Rules/`，将原 `loon/node-diagnostics/` 移至 `Plugins/node-diagnostics/`。原规则内容和节点检测脚本逻辑保持不变，插件内的自托管脚本地址已更新。

**原路径不再提供文件，请将已有订阅更新为上表的新地址。** 已安装的节点检测插件也需要更换订阅地址，以加载迁移后的配套脚本。

B 站增强远程版生效后，请停用原本地三合一版及重复手动脚本；确认正常后可删除旧本地 JS。

## 维护约定

- 插件放在 `Plugins/功能目录/`，说明、配置和配套脚本放在一起。
- 分流规则放在 `Rules/`，每个服务独立维护。
- 后续尽量保持这些订阅路径稳定；如需迁移，应同时更新文档和插件引用。
- 上传前检查脚本语法、订阅链接及修改范围。
- 不在仓库保存抓包日志、账号凭据或个人截图。
