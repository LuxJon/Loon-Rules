<img src="./icon.png" width="64" alt="哔哩哔哩图标">

# Bilibili 竖屏优化

2026-10-19 适配测试版。仅修改自用插件，不修改、复制或动态加载 Biliverse ADBlock 的脚本，不替换其原订阅和更新地址。

## 安装与测试

需要 Loon 3.5.1（983）及以上版本。自用插件订阅地址保持不变：

```text
https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/Bilibili/Bilibili.lpx
```

1. 保留原 Biliverse ADBlock 插件及其订阅链接，在 Loon 更新已有的「Bilibili 竖屏优化」即可。
2. 开启复写和 MitM，确认 Loon 证书已安装并受信任。自用插件使用内置 JQ；原 Biliverse 若需要脚本，仍应保持脚本开启。
3. 本插件三个接管开关默认开启。停用其他重复的竖屏测试插件和手工旧规则，避免多条正文复写竞争。
4. 完全退出 Bilibili 后重新打开，分别测试首页多次刷新、继续加载、竖屏切换、普通直播预览和手动进入。
5. 若需比较原插件行为，可关闭本插件对应接管开关并重载配置；同时移除该接口的重复旧复写。若仍异常，可停用自用插件恢复原订阅处理。

目前仅通过离线回放，等待手机测试结果。

## 与 Biliverse 共存的实际边界

Loon 官方文档规定：Response Body Rewrite 命中时，该响应的 Response Script 不执行；同一响应最多执行一条 Response Script。调整两个插件的先后顺序不能组成串行处理链。

参考：[Loon Script 匹配与执行规则](https://nsloon.app/docs/Script/script_v2/)。

上版自用插件的首页 JQ 只删除直播，却阻止了原 ADBlock 脚本去广告，因此首页小卡片广告、创作推广和大图广告会重新出现。本测试版在自用插件中补齐这些接口的广告过滤，原 Biliverse 订阅仍然保留，但不能把这种方案称为完全无影响的叠加。

| 接口 | 开关默认值 | 开启后的执行者 |
| --- | --- | --- |
| /x/v2/feed/index | home_filter=true | 自用插件：过滤首页广告和直播 |
| /x/v2/feed/index/story | story_filter=true | 自用插件：整条推广过滤、上滑提示及直播自动进入优化 |
| /x/v2/feed/index/relate/story | story_filter=true | 同上，覆盖关联竖屏流 |
| /x/v2/feed/index/story/cart | cart_filter=true | 自用插件：清理推广浮层 |
| 本插件未匹配的其他接口 | 无接管开关 | 沿用用户现有配置，包括原 Biliverse 订阅 |

**开启接管的首页和 Story 响应不会执行原脚本**，因此不继承 Biliverse 的首页缓存补位、首页及 Story 的隐私跟踪清理、Story 商业按钮清理，以及这些接口的 BoxJS／插件自定义设置。例如原插件的 Feed.Activity、Feed.Vertical、Feed.BlockUpLiveList 和 Privacy.Tracking 不控制本插件。原插件未来对这些接口的响应逻辑更新也不会在接管开启时运行，需要自用插件另行适配。

关闭相应接管开关后，本插件不再对该接口匹配正文复写，原插件可按其配置恢复执行；对应的自用增强功能也会关闭。请求脚本和未匹配接口不由本插件修改，但运行时仍需手机实测。

本测试版采用上述有限接口接管方式发布供手机验证，保留原 Biliverse 订阅；不能视为完全无影响的叠加。

## 自用插件处理内容

只处理以下三个主机的 HTTPS、HTTP 200、JSON 业务 code=0 响应：app.bilibili.com、app.biliapi.net、app.biliapi.com。主机、路径和查询参数边界严格匹配，覆盖初次加载、刷新和后续加载。

首页删除完整广告卡片及直播卡片，保留其他视频的原始顺序和分页数据。广告判据包括 card_type 的 cm_ 前缀、card_goto 的 ad_ 前缀、goto=ad、明确的 is_ad=true/1（含 ad_info.is_ad），以及 small_cover_v10/game 游戏推广。轮播 banner_v8/banner 只移除 type=ad/ad_inline 子项；若子项删空则移除整张轮播，普通活动轮播保留。

直播判据为 goto/card_goto=live、card_goto=ad_live_v2，或 player_args.type=live、player_args.is_live=true/1。使用相同 small_cover 布局的普通视频和直播录播不因布局或标题被删除。

Story 删除完整推广条目，覆盖 vertical_ad_av、vertical_ad_picture、vertical_ad_live 以及上述明确广告标记。保留普通视频、普通直播预览和手动进入；仅删除 retained item 的 scroll_guide，仅将已经存在的 data.config.live_auto_enter.enable 设为 false。没有广告标记的 vertical_pgc 保留，行为与原脚本去除此类条目的默认设置存在差异。

不按“广告”“创作推广”“小火箭”“立即领取”等标题文字猜测条目身份，也不因为对象包含 ad_info 或 is_ad_loc 就删除普通视频。播放签名、播放 URL、UP 信息、索引、游标和 has_more 保留，不使用其他视频补位；全页过滤为空时的客户端继续拉取行为需实测。

cart 接口删除 data.anchor，若 data.ads 为数组则清空。卡片接口的“立即领取”文案不能单独证明另一个接口里某个视频是广告；仅有卡片、没有明确广告身份的视频不能保证整条过滤。画面内植入和没有广告标记的软广同样无法保证识别。

## 离线验证

本地使用构建后的实际插件文件及 jq 1.8.2 回放，共 64 份 JSON 响应，包括原始响应和原有改写后的快照，不能视为 64 次独立请求。

| 原始响应组 | 响应数 | 输入条目 | 输出条目 | 删除条目 |
| --- | --- | --- | --- | --- |
| 首页 212 | 7 | 66 | 48 | 18（广告与直播） |
| Story 210 | 8 | 41 | 29 | 12 |
| Story 211 | 10 | 51 | 35 | 16 |

另有 5 份已有改写后的首页快照、18 份已有改写后的 Story 快照、14 份 cart 快照及 2 份首页历史快照。验证普通保留条目的字段和相对顺序、大整数 ID、分页字段、全广告／全直播列表、混合轮播、异常字段类型、重复执行、主机及路径边界、开关关闭后不匹配。关联 Story 和备用主机仅有构造测试，没有对应真实抓包。

维护工作区通过 tools/build-addon.cjs 构建、tests/validate_addon.py 验证。公开的脱敏统计见本目录 validation-report.json；原始抓包不随插件发布。

离线验证不代表 iPhone 上的 Loon 配置解析、内置 JQ、客户端分页和全部其他插件组合已经通过测试。抓包、请求头和个人标识不上传。

## 来源

广告类型判断参考并核对 Biliverse/ADBlock v0.7.5 的 src/class/ADBlock.mjs 和 src/process/Response.mjs；使用本地已有 JQ 规则扩展，没有打包或运行其 response.bundle.js。原作者及来源见 NOTICE.md。

原订阅请继续使用用户原有的 Biliverse 链接；本测试版沿用自用订阅的路径 Plugins/Bilibili/Bilibili.lpx。
