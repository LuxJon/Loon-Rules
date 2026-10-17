# Bilibili 增强

适用于 Loon 3.5.1（983）及以上版本，包含以下三项处理。两项 Story 优化已有手机反馈正常；空间链接改写在不同入口的表现不同，首页推荐入口仍会弹出半屏页，尚未实现通用的原生空间直达。

- 移除竖屏 Story 视频底部的「上滑观看」提示。
- 关闭直播预览倒计时自动进入直播间，保留直播内容及手动进入。
- 简化视频详情页 UP 头像、名称的空间链接，尝试跳过半屏预览（部分入口无效）。

## 安装

在 Loon 的插件页面添加以下远程订阅地址：

```text
https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/bilibili-enhance/Bilibili_Enhance.lpx
```

插件会自动加载同目录的 `Bilibili_Space_Link.js`，无需手动添加脚本或保存本地 JS。

开启脚本、复写及 MitM，安装并信任 Loon 证书。插件包含 `app.bilibili.com`、`grpc.biliapi.net` 两个解密域名。安装或更新后，彻底退出 Bilibili 并重新打开。

## 从本地三合一版迁移

1. 导入并启用本远程插件。
2. 停用原本地三合一插件、旧的三个独立插件和手动添加的重复空间直达脚本。
3. 确认三项功能均正常后，可以删除旧本地 `Bilibili_Space_Link.js`。

## 修改范围与兼容性

Story 接口只删除 `data.items[*].scroll_guide`，并将已有的 `data.config.live_auto_enter.enable` 改为 `false`。

空间直达脚本只简化视频详情 `ViewReply.owner.url` 和 `owner.title_url` 为 `bilibili://space/用户ID`，保留其他 Protobuf 字段。不会修改启动实验 `view_up_space`。

Loon 对同一响应只选择一条响应脚本。若其他 B 站插件也匹配 `/bilibili.app.viewunite.v1.View/View`，顺序可能影响生效；请将本插件置于相应插件之前，并检查其他插件功能。正文 Rewrite 命中时也可能阻止该响应的脚本执行。

Loon 的「脚本任务」页面显示执行记录，远程和本地脚本都可能出现在这里。

本插件未加入账号数据、抓包记录或截图。后续 Bilibili 接口变更可能需要更新。

## 空间直达触发诊断

没有空间直达响应执行记录时，可临时添加 [触发诊断版](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/bilibili-enhance/Bilibili_Enhance_Diagnostics.lpx)。该版本保留两项 Story 优化与原空间直达逻辑，使用只限定 RPC 路径的匹配条件，并增加请求探测和响应入口日志；尚需手机验证，不代表已修复触发问题。

1. 停用正式版三合一插件及重复的手动空间脚本，启用诊断版。
2. 彻底退出 Bilibili，重新打开一个新视频详情页，通过真实请求触发；不要手动运行脚本。
3. 在脚本任务中检查 `SpaceDiag 请求探测` 和 `SpaceDiag 响应改写`，打开记录查看日志。

| 日志 | 含义 |
| --- | --- |
| `REQUEST rpc=View` | 已观察到目标详情请求，诊断请求脚本已执行 |
| 只有其他 RPC 名称 | 已观察到其他详情服务请求，尚未观察到目标 `View` 请求 |
| `RESPONSE entered` | 已进入空间直达响应脚本，后续日志记录改写结果或异常 |
| `changed 2 URL(s)` | 本次响应的两处空间链接已简化，手机界面效果仍需实际确认 |
| `No HTTP response` | 本次运行没有响应对象，不能用手动运行或 CRON 验证响应改写 |

若有 `REQUEST rpc=View` 而没有对应的响应记录，需要继续检查响应处理流程；仅凭此现象不能确定是哪一条配置拦截。诊断日志只记录 RPC 名、Body 类型与长度及解压 API 是否存在，不记录请求头、账号信息或正文。请求探测原样放行，脚本不发起额外网络请求。测试完成后停用诊断版，换回正式版。

## HTTPS 空间链接试验

已完成 [HTTPS 跳转试验版](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/bilibili-enhance/Bilibili_Enhance_HTTPS_Test.lpx) 的首页推荐入口测试：仍弹出半屏。该试验仅把两处目标从 `bilibili://space/UID` 换成 `https://space.bilibili.com/UID`，沿用诊断版的请求探测、响应入口记录与两项 Story 优化。保留订阅文件供回溯，不建议继续用它解决本次问题。

最新抓包的最终替换响应中，`owner.url` 和 `owner.title_url` 都已是 HTTPS 空间地址；因此本次失败不能归因于远程 JS 未下载或这两处字段未改写。成功执行脚本不代表客户端会按链接打开完整主页。

测试结束后停用 HTTPS 试验版；若换回正式版或诊断版，仅启用其中一份三合一版本，避免重复手动空间脚本。

## 当前定位结论（2026-10-17）

| 样本入口 | View 请求来源 | 结果 |
| --- | --- | --- |
| 从 UP 空间投稿打开视频（此前反馈成功） | `from=66`，`from_spmid=main.space-contribution.0.0` | 最终响应为简化原生空间链接，之后出现完整空间请求 |
| 首页推荐打开视频（最新反馈失败） | `from=7`，`from_spmid=tm.recommend.0.0` | 最终响应为 HTTPS 空间链接，仍需半屏内二次点击 |

最新样本中，详情请求后约 1.68 秒出现带视频 `aid` 的 `/x/v2/space/archive/cursor`；约 5.68 秒才出现 `/x/v2/space`，随后是无 `aid` 的空间投稿列表请求。这与用户反馈的“先半屏、再进入空间”相符。两轮来源和作者不同，尚不能仅凭对比证明是哪一个条件控制半屏，也不能据此认定此前成功由链接改写造成。

启动实验 `view_up_space` 在这两轮原响应中均为 `"2"`；此前已验证改为 `"0"` 仍然半屏。首页配置 `data.config.space_enlarge_exp` 两轮也均为 `1`，目前没有证据证明它是本问题的开关。正式版不修改这些未知配置，也不屏蔽半屏接口或清空作者 ID。

现有证据支持：该入口可能还受客户端页面状态或其他控制逻辑影响，仅改这两处链接不足以解决。Loon 可以修改网络内容，但不能直接调用 Bilibili 的原生页面跳转或代替用户点击。目前没有经验证可取消首页推荐入口二次点击的 Loon 方案；后续应以明确的控制字段或客户端实现证据为依据，再制作实验。

## 请求来源试验（手机反馈仍然半屏）

[请求来源试验版订阅](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/bilibili-enhance/Bilibili_Enhance_Source_Test.lpx)

本轮手机日志已出现 `REQUEST changed 2 source fields`，响应日志也出现 `Owner URLs with from=66: 2` 和 `changed 2 URL(s)`；用户反馈仍然半屏。来源改写没有解决问题，应停用该试验版。以下保留试验设计和日志说明供回溯。

这次实验检验一个具体假设：成功与失败样本的详情请求来源不同，服务端是否会按来源下发不同的空间处理数据。它不把服务端来源当成客户端页面状态，也不代表已找到半屏开关。两轮作者、入口不同，目前只有相关性证据。

仅在 `/bilibili.app.viewunite.v1.View/View` 的请求中，且同时满足 `from="7"`、`from_spmid="tm.recommend.0.0"` 时，改写以下两个字符串字段：

| ViewReq 字段 | 原值 | 试验值 |
| --- | --- | --- |
| `from`（3） | `7` | `66` |
| `from_spmid`（5） | `tm.recommend.0.0` | `main.space-contribution.0.0` |

其他请求字段逐字节保留，包括视频 ID、播放参数及未知字段；其他来源原样放行。响应继续使用原生 `bilibili://space/UID` 链接简化逻辑，两项 Story 优化与正式版相同。无自动点击、额外联网或持久存储，不修改启动实验，不记录 UID、请求头或正文。会改变被改写详情请求的来源统计，因此只做短期测试。

离线已用 205、206、207 的真实请求与响应核对改动范围、gRPC 压缩及帧长度、异常放行和重复执行行为。离线通过只证明请求改写正确，不证明服务端接受请求或原生跳转有效。

测试步骤：

1. 停用正式版、诊断版、HTTPS 试验版及重复手动空间脚本，只启用请求来源试验版；其余去广告配置按当前状态保留。
2. 彻底退出 Bilibili 并重开，在首页刷新后打开一个新视频，点击视频详情中的 UP 头像或名称。
3. 查看 `SpaceSource 请求来源` 的日志：`REQUEST changed 2 source fields` 说明已改写；`skipped` 说明未满足该试验的来源条件；`unchanged` 后有原因说明本次未改写。
4. 查看 `SpaceSource 原生链接` 的日志：`Owner URLs with from=66: 2` 表示响应中两处原始 Owner 链接都包含该来源值，仅作为服务端返回线索；后续 `changed 2 URL(s)` 表示原生链接已简化，两者均不代表界面直达成功。
5. 分别试头像和名称。若视频加载正常但仍然半屏，记录此结果并停用试验版，不长期保留来源改写；若视频加载异常，也立即停用。

如需进一步核对，只抓这一次“重开 → 首页新视频 → 点击 UP”的过程。主要核对最终替换的请求、响应和半屏/完整空间请求顺序；无需再次手动运行脚本。

## 实验组 1 试验（手机反馈仍然半屏）

[空间实验组 1 试验版订阅](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/bilibili-enhance/Bilibili_Enhance_Cohort1_Test.lpx)

用户更新 App 后再次测试，启动脚本截图显示 `Changed 1 view_up_space value(s): 2 -> 1`，但用户明确反馈仍先弹半屏、需要二次点击。因此本轮没有解决问题，应停用本试验版。截图只证明脚本进行了替换，不证明客户端采用了配置；本轮完整抓包附件暂无法读取，尚未核对最终响应、更新后的版本号或后续配置覆盖。以下保留试验设计供回溯，不建议继续更换任意分组数字。

这是针对已观察到的 `view_up_space` 字段做的有限分组试验，不是已找到的半屏关闭开关。此前 `"2" → "0"` 已失败；本次仅在该字段为成功返回的字符串 `"2"` 时，替换成尚未测试的字符串 `"1"`。没有找到各分组语义的公开实现，因此本次把握较低；失败后不能把任意其他数字当作下一步修复。

同时覆盖启动 `GetColdStartDeferredData` 打包响应和独立 `/x/resource/abtest/batch` JSON 接口。旧的组 0 实验也覆盖了这两个入口，本次没有证据证明此前漏拦。启动脚本只定位抓包已确认的 Protobuf 路径 `1.2.2.1`，校验其中 JSON 的 `data.ab_result.view_up_space.success` 和 `data` 后，仅改一个 ASCII 数字，不重序列化其他 JSON 或 Protobuf 数据。

本版撤掉请求来源改写；View 请求探测原样放行，响应沿用原生空间链接简化，两项 Story 规则保持一致。不会自动点击界面，不额外请求 B 站接口，不改账号数据，也不记录启动正文。离线已核对三份真实启动响应：每份只改一个数字，压缩、帧长度、异常放行及重复执行检查通过。配置是否被客户端采用、组 1 是否改变跳转均需手机验证。

测试步骤：

1. 停用来源试验版及其他三合一/手动空间脚本，只启用本试验版；去广告配置保持当前状态。
2. 彻底退出并重新打开 Bilibili，等待首页加载完成，然后打开首页新视频并点击 UP 头像或名称。
3. 查看 `SpaceCohort1 启动配置`：`Changed 1 view_up_space value(s): 2 -> 1` 表示启动响应目标值已改写，不能单凭此日志判定客户端已采用。`Changed 0`、无记录或 `Unchanged` 均不能认定本次组 1 实验已覆盖，应先检查这条记录，无需手动运行脚本。
4. 若已出现 `Changed 1` 但依然半屏，记录为本轮失败并停用；若直接进入原生完整主页，再分别复测头像、名称及多个首页视频。
5. 测试结束后停用本试验版，彻底退出并重开 Bilibili，让服务端原始启动配置重新下发。无需清空 App 数据或重新安装。
