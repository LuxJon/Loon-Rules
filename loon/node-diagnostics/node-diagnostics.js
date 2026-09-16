// Loon generic 脚本：入口落地查询 / 地理位置查询的简化自托管版本。
// 参考用户提供的入口落地脚本（源头 xream）和地理位置脚本（源头 XIAO_KOP）的功能思路。
// 查询接口：https://ipwho.is/ （HTTPS）。
// 通过 script(..., "mode=entry") 或 script(..., "mode=geo") 选择功能。

const params = typeof $environment !== "undefined" && $environment.params || {};
const node = params.node || params.policyGroup || "";
const nodeInfo = params.nodeInfo || {};
const mode = typeof $argument === "string" && $argument.indexOf("mode=geo") >= 0 ? "geo" : "entry";
const title = mode === "geo" ? "地理位置查询" : "入口落地查询";

if (!node) {
  $done({ title, content: "请从 Loon 的节点或策略组菜单运行此脚本。" });
} else {
  run().then(
    content => $done({ title, content }),
    error => $done({ title, content: "查询失败：" + errorText(error) })
  );
}

async function run() {
  if (mode === "geo") {
    const exit = await lookup(node);
    return [
      "节点：" + node,
      "出口 IP：" + exit.ip,
      "ASN：" + formatAsn(exit.connection && exit.connection.asn),
      "ASN 所属机构：" + value(exit.connection && exit.connection.org),
      "ISP：" + value(exit.connection && exit.connection.isp),
      "地区：" + [value(exit.flag && exit.flag.emoji, ""), exit.country, exit.region].filter(Boolean).join(" ") || "—",
      "城市：" + value(exit.city),
      "经度：" + value(exit.longitude),
      "纬度：" + value(exit.latitude),
      "位置来自 IP 数据库估算，并非设备 GPS。"
    ].join("\n");
  }

  const results = await Promise.all([capture(lookup("DIRECT")), capture(lookup(node))]);
  const direct = results[0];
  const landing = results[1];
  const address = value(nodeInfo.address);
  const port = nodeInfo.port ? ":" + nodeInfo.port : "";
  const lines = [
    "节点：" + node,
    "入口服务器：" + address + (address === "—" ? "" : port),
    "直连 IP：" + (direct.ok ? direct.data.ip : "查询失败（" + direct.error + "）"),
    "落地 IP：" + (landing.ok ? landing.data.ip : "查询失败（" + landing.error + "）")
  ];
  if (landing.ok) {
    lines.push("落地位置：" + [landing.data.country, landing.data.region, landing.data.city].filter(Boolean).join(" "));
    lines.push("落地 ASN：" + formatAsn(landing.data.connection && landing.data.connection.asn));
  }
  if (direct.ok && landing.ok && direct.data.ip === landing.data.ip) {
    lines.push("提示：直连与所选节点返回同一公网 IP，请检查节点或路由。");
  }
  lines.push("入口服务器地址来自 Loon 节点配置；若为域名，此处不代表实际连接到的 IP。");
  return lines.join("\n");
}

function lookup(route) {
  return new Promise((resolve, reject) => {
    $httpClient.get({
      url: "https://ipwho.is/?lang=zh-CN",
      node: route,
      timeout: 10000,
      insecure: false,
      headers: { Accept: "application/json" }
    }, (error, response, body) => {
      if (error) return reject(new Error(String(error)));
      const status = Number(response && (response.status || response.statusCode));
      if (status < 200 || status >= 300) return reject(new Error("HTTP " + (status || "?")));
      try {
        const data = JSON.parse(String(body || ""));
        if (!data || data.success !== true || !data.ip) {
          return reject(new Error(value(data && data.message, "接口未返回有效 IP")));
        }
        resolve(data);
      } catch (parseError) {
        reject(new Error("接口返回的 JSON 无法解析"));
      }
    });
  });
}

function capture(promise) {
  return promise.then(
    data => ({ ok: true, data }),
    error => ({ ok: false, error: errorText(error) })
  );
}

function value(item, fallback) {
  return item === null || typeof item === "undefined" || item === "" ? (fallback === undefined ? "—" : fallback) : String(item);
}

function formatAsn(item) {
  return item === null || typeof item === "undefined" || item === "" ? "—" : "AS" + String(item).replace(/^AS/i, "");
}

function errorText(error) {
  return error && error.message ? String(error.message) : String(error);
}

