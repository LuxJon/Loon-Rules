# Loon 节点检测整合

本插件托管在 `LuxJon/Loon-Rules` 的 `main` 分支。

文件位于：

```text
loon/node-diagnostics/node-diagnostics.js
loon/node-diagnostics/node-diagnostics.lpx
```

在 Loon 的插件页面导入第二个 Raw 链接：

```text
https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/loon/node-diagnostics/node-diagnostics.js
https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/loon/node-diagnostics/node-diagnostics.lpx
```

插件中的 IP 质量脚本仍引用 `MaYIHEI/paperclip` 原地址。入口落地与地理位置共用本目录的 JS，不再依赖 `kelee.one`。脚本使用 `htmlMessage` 恢复加粗标签、分段、旗帜与蓝色节点名；HTTPS 查询失败后会尝试 `ip-api.com` 免费 HTTP 接口，弹窗不会显示底层 TLS 错误。此 JS 仍是精简重写版，不包含原入口落地脚本的 IPv6、多接口选择、SSID、事件通知等扩展功能。

