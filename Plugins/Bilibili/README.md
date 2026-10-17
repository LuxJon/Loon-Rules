<img src="./icon.png" width="64" alt="哔哩哔哩图标">

# Bilibili 竖屏优化

在 Bilibili 原生竖屏 Story 视频流中提供两项功能：

- 移除「上滑观看」提示。
- 关闭直播预览倒计时自动进入直播间，保留直播预览及手动进入。

首页视频入口和横竖屏切换沿用 App 原生逻辑。

## 安装

适用于 Loon 3.5.1（983）及以上版本。在 Loon 插件页面添加远程订阅：

```text
https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/Bilibili/Bilibili.lpx
```

开启复写及 MitM，安装并信任 Loon 证书；插件解密域名为 `app.bilibili.com`。两项功能直接通过 JSON 复写实现，无需下载或添加 JS，也无需开启脚本开关。

请使用本页提供的插件订阅地址。启用后，停用旧版三合一插件、空间直达试验版及同功能重复配置，彻底退出 Bilibili 并重新打开，再进入原生竖屏模式测试。

## 处理范围与兼容性

仅匹配 `https://app.bilibili.com/x/v2/feed/index/story`（含查询参数），且只处理 HTTP 200、`code=0` 的 JSON 响应：

- 删除对象类型视频项中的 `data.items[*].scroll_guide`。
- 将已有的 `data.config.live_auto_enter.enable` 设为 `false`，保留其他直播配置。

缺失字段或不符合结构的字段保持原样，不补写配置。此版本已移除 UP 空间直达及所有相关 JS、诊断和试验版本。

兼容性核对目标为 Bilibili iOS 9.15.0（build 91500100）。当前该版本抓包未包含 Story 接口，因此尚不能确认新版仍下发相同字段。已使用此前真实 Story 响应完成离线回归，并补充缺失字段、异常结构的兼容处理；9.15.0 竖屏内两项功能仍待手机实测。

若其他插件同时改写 Story 响应，需避免同功能重复处理。后续 App 接口发生变化时可能需要更新。
