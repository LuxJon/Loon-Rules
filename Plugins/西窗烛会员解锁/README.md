<img src="./icon.png" width="64" alt="西窗烛会员解锁图标">

# 西窗烛会员解锁

收录本地会员解锁配置；其原第三方脚本地址当前返回 404，暂不可用。

**当前状态：原配置引用的第三方 JS 返回 HTTP 404（2026-10-18 核对）。新安装或重新下载脚本时无法取得文件；已有本地缓存是否仍可运行需在设备上确认。**

本目录仅收录用户提供的原插件并添加图标，没有替换会员处理逻辑，也不将其标为已验证可用。

## 安装

在 Loon 的插件页面添加远程订阅：

```text
https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Plugins/%E8%A5%BF%E7%AA%97%E7%83%9B%E4%BC%9A%E5%91%98%E8%A7%A3%E9%94%81/%E8%A5%BF%E7%AA%97%E7%83%9B.plugin
```

启用插件及所需的复写／MitM，安装并信任 Loon 证书。替换原本地版本时，停用同功能旧插件，避免重复处理。

## 脚本依赖

原作者标注：转换。插件匹配 `lchttpapi.xczim.com` 的响应，依赖以下第三方远程脚本：

```text
https://raw.githubusercontent.com/deezertidal/private/master/js-backup/Crack/xcz.js
```

需启用脚本、MitM，并安装和信任 Loon 证书。仓库中没有该 JS 的副本，后续需取得可用源文件或有效链接才能恢复远程加载。
