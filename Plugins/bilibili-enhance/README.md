# Bilibili 增强

适用于 Loon 3.5.1（983）及以上版本，包含以下三项功能。本地版本曾经实测有效；最新反馈中空间链接已成功改写，但部分场景仍弹出半屏页，因此当前不能保证空间直达的界面效果。

- 移除竖屏 Story 视频底部的「上滑观看」提示。
- 关闭直播预览倒计时自动进入直播间，保留直播内容及手动进入。
- 点击视频详情页 UP 头像、名称直接进入空间，跳过半屏预览。

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

已出现 `changed 2 URL(s)` 但界面仍弹半屏时，可用 [HTTPS 跳转试验版](https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/bilibili-enhance/Bilibili_Enhance_HTTPS_Test.lpx) 做一次定位测试。它仅把两处目标从 `bilibili://space/UID` 换成 `https://space.bilibili.com/UID`，沿用诊断版的请求探测、响应入口记录与两项 Story 优化。

这是未经手机验证的路线试验，可能打开网页空间，不能保证原生完整主页。若仍弹同样的半屏，需要继续检查当前页面是否使用这两处链接；若去向改变，则说明换路由能够影响该入口，但原生完整主页目标仍需继续验证。

测试时仅启用这一份三合一版本，停用正式版、诊断版及重复手动空间脚本。彻底退出 Bilibili 后打开新视频，点击头像或名称，记录是否直接进入原生主页、打开网页、仍弹半屏或点击无反应。测试后停用本试验版。
