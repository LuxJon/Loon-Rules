# Bilibili 增强

适用于 Loon 3.5.1（983）及以上版本，包含三项已由用户实测有效的功能：

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
