// Loon generic：入口落地 / 地理位置。保留原版弹窗风格，避免直接展示底层网络错误。
// 优先使用原脚本的数据接口与字段；接口不可用时回退至其他 IP 数据源。

const params = typeof $environment !== "undefined" && $environment.params || {};
const node = params.node || params.policyGroup || "";
const nodeInfo = params.nodeInfo || {};
const mode = typeof $argument === "string" && $argument.indexOf("mode=geo") >= 0 ? "geo" : "entry";
const title = mode === "geo" ? "地理位置查询" : "入口落地查询";

if (!node) {
  $done({ title, htmlMessage: wrap("请从 Loon 的节点或策略组菜单运行此脚本。") });
} else {
  run().then(
    html => $done({ title, htmlMessage: html }),
    error => {
      console.log("[节点诊断] " + errorText(error));
      $done({ title, htmlMessage: wrap("查询失败，请检查所选节点连通性后重试。") });
    }
  );
}

async function run() {
  if (mode === "geo") {
    const exit = await lookupIpApi(node, "", "en").catch(() => lookupFallback(node, "", "en"));
    return renderGeo(exit);
  }

  const entranceTask = resolveEntrance(nodeInfo.address);
  const [direct, landing, entranceIp] = await Promise.all([
    capture(lookupDirect()),
    capture(lookupIpApi(node, "", "zh-CN").catch(() => lookupFallback(node, "", "zh-CN"))),
    entranceTask
  ]);
  const entrance = entranceIp && (!landing.ok || entranceIp !== landing.data.ip) ?
    await capture(lookupIpApi("DIRECT", entranceIp, "zh-CN").catch(() => lookupFallback("DIRECT", entranceIp, "zh-CN"))) : { ok: false };
  return renderEntry(direct, entrance, landing, entranceIp);
}

async function lookupDirect() {
  try {
    const result = await requestJson("https://rmb.pingan.com.cn/itam/mas/linden/ip/request", "DIRECT", 7000);
    if (!result || !result.data || !result.data.ip) throw new Error("直连接口未返回 IP");
    const data = result.data;
    return {
      ip: data.ip, countryCode: data.countryIsoCode, country: data.country,
      region: data.region, city: data.city, isp: data.isp
    };
  } catch (error) {
    console.log("[节点诊断] 直连接口失败：" + errorText(error));
    return lookupIpApi("DIRECT", "", "zh-CN").catch(() => lookupFallback("DIRECT", "", "zh-CN"));
  }
}

function lookupIpApi(route, ip, lang) {
  const suffix = ip ? encodeURIComponent(ip) : "";
  const apiUrl = "http://ip-api.com/json/" + suffix +
    "?fields=status,message,query,as,org,isp,country,countryCode,regionName,city,lon,lat&lang=" +
    encodeURIComponent(lang);
  return requestJson(apiUrl, route, 7000).then(fromIpApi);
}

function lookupFallback(route, ip, lang) {
  const suffix = ip ? encodeURIComponent(ip) : "";
  const ipwhoUrl = "https://ipwho.is/" + suffix + "?lang=" + encodeURIComponent(lang);
  const ipinfoUrl = ip ? "https://ipinfo.io/" + suffix + "/json" : "https://ipinfo.io/json";
  return firstSuccessful([
    requestJson(ipwhoUrl, route, 6500).then(fromIpwho),
    requestJson(ipinfoUrl, route, 6500).then(fromIpinfo)
  ]);
}

function requestJson(url, route, timeout, headers) {
  return new Promise((resolve, reject) => {
    $httpClient.get({
      url,
      node: route,
      timeout,
      insecure: false,
      headers: headers || { Accept: "application/json" }
    }, (error, response, body) => {
      if (error) return reject(new Error(errorText(error)));
      const status = Number(response && (response.status || response.statusCode));
      if (!status || status < 200 || status >= 300) return reject(new Error("HTTP " + (status || "?")));
      try {
        resolve(JSON.parse(String(body || "")));
      } catch (_) {
        reject(new Error("JSON 解析失败"));
      }
    });
  });
}

function fromIpwho(data) {
  if (!data || data.success !== true || !data.ip) throw new Error("ipwho.is 未返回 IP");
  const connection = data.connection || {};
  return {
    ip: data.ip, asn: connection.asn, org: connection.org, isp: connection.isp,
    countryCode: data.country_code, country: data.country, region: data.region,
    city: data.city, longitude: data.longitude, latitude: data.latitude
  };
}

function fromIpinfo(data) {
  if (!data || !data.ip) throw new Error("ipinfo.io 未返回 IP");
  const orgText = String(data.org || "");
  const orgMatch = orgText.match(/^AS(\d+)\s*(.*)$/i);
  const coordinates = String(data.loc || "").split(",");
  return {
    ip: data.ip, asn: orgMatch && orgMatch[1], org: orgMatch ? orgMatch[2] : orgText,
    isp: orgMatch ? orgMatch[2] : orgText, countryCode: data.country,
    country: data.country, region: data.region, city: data.city,
    latitude: coordinates[0], longitude: coordinates[1]
  };
}

function fromIpApi(data) {
  if (!data || data.status !== "success" || !data.query) throw new Error("ip-api.com 未返回 IP");
  const orgMatch = String(data.as || "").match(/^AS(\d+)\s*(.*)$/i);
  return {
    ip: data.query, asn: orgMatch && orgMatch[1], asText: data.as,
    org: data.org || (orgMatch && orgMatch[2]),
    isp: data.isp, countryCode: data.countryCode, country: data.country,
    region: data.regionName, city: data.city, longitude: data.lon, latitude: data.lat
  };
}

function firstSuccessful(promises) {
  return new Promise((resolve, reject) => {
    let remaining = promises.length;
    const errors = [];
    promises.forEach((promise, index) => promise.then(resolve, error => {
      errors[index] = errorText(error);
      remaining -= 1;
      if (remaining === 0) reject(new Error(errors.join("；")));
    }));
  });
}

function capture(promise) {
  return promise.then(data => ({ ok: true, data }), error => {
    console.log("[节点诊断] " + errorText(error));
    return { ok: false };
  });
}

async function resolveEntrance(address) {
  const host = String(address || "").replace(/^\[|\]$/g, "");
  if (!host) return "";
  if (isIp(host)) return host;
  if (typeof $dns !== "undefined" && $dns && typeof $dns.query === "function") {
    try {
      const result = await new Promise((resolve, reject) => {
        $dns.query({ domain: host, timeout: 4000 }, (error, response) =>
          error ? reject(new Error(errorText(error))) : resolve(response));
      });
      const answer = (result.answers || []).find(item => item.type === "A") ||
        (result.answers || []).find(item => item.type === "AAAA");
      if (answer && isIp(answer.value)) return answer.value;
    } catch (error) {
      console.log("[节点诊断] Loon DNS 查询失败：" + errorText(error));
    }
  }
  const query = "?name=" + encodeURIComponent(host) + "&type=A";
  const resolvers = ["https://dns.alidns.com/resolve", "https://cloudflare-dns.com/dns-query"];
  for (const resolver of resolvers) {
    try {
      const result = await requestJson(resolver + query, "DIRECT", 5000, { Accept: "application/dns-json" });
      const answer = (result.Answer || []).find(item => item.type === 1 && isIp(item.data));
      if (answer) return answer.data;
    } catch (error) {
      console.log("[节点诊断] DoH 查询失败（" + resolver + "）：" + errorText(error));
    }
  }
  return "";
}

function renderEntry(direct, entrance, landing, entranceIp) {
  const directData = direct.ok ? direct.data : null;
  const landingData = landing.ok ? landing.data : null;
  const entranceData = entrance.ok ? entrance.data : null;
  const sections = [
    group([
      row("IP", directData && directData.ip),
      row("位置", place(directData)),
      row("运营商", directData && (directData.isp || directData.org))
    ])
  ];
  if (entranceIp && (!landingData || entranceIp !== landingData.ip)) {
    sections.push(group([
      row("入口", entranceIp),
      row("位置", place(entranceData)),
      row("运营商", entranceData && (entranceData.isp || entranceData.org))
    ]));
  }
  sections.push(
    group([
      row("落地 IP", landingData && landingData.ip),
      row("位置", place(landingData)),
      row("运营商", landingData && (landingData.isp || landingData.org))
    ]),
    '<b>节点：</b> <span style="color:#467fcf">' + escapeHtml(node) + "</span>"
  );
  if (!direct.ok || !landing.ok) {
    sections.push('<span style="color:#777">未取到的结果请检查节点连通性后重试。</span>');
  }
  return wrap(sections.join("<br/><br/>"));
}

function renderGeo(data) {
  const rows = [
    row("远端IP地址", data.ip),
    row("远端IP ASN", data.asText || (asn(data.asn) + (data.org ? " " + data.org : ""))),
    row("ASN所属机构", data.org),
    row("远端ISP", data.isp),
    row("远端IP地区", [data.countryCode, flag(data.countryCode)].filter(Boolean).join(" ⟦") + (flag(data.countryCode) ? "⟧" : "")),
    row("远端IP城市", data.city),
    row("远端经度", data.longitude),
    row("远端纬度", data.latitude)
  ];
  return wrap(
    '--------------------------------<br/>' +
    rows.join("<br/><br/>") +
    '<br/>--------------------------------<br/>' +
    '<span style="color:#6959CD"><b>节点 ➟</b> ' + escapeHtml(node) + "</span>"
  );
}

function row(label, value) {
  return "<b>" + escapeHtml(label) + "：</b> " + escapeHtml(valueText(value));
}

function group(rows) {
  return rows.join("<br/>");
}

function wrap(html) {
  return '<div style="font-family:-apple-system,Helvetica,sans-serif;font-size:16px;line-height:1.35;color:#111;text-align:left">' + html + "</div>";
}

function place(data) {
  if (!data) return "";
  const country = String(data.country || "").replace(/\s*中国\s*/, "");
  return [flag(data.countryCode), country, data.region, data.city].filter(Boolean).join(" ");
}

function flag(code) {
  const text = String(code || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(text)) return "";
  return String.fromCodePoint(text.charCodeAt(0) + 127397, text.charCodeAt(1) + 127397);
}

function asn(value) {
  return valueText(value) === "—" ? "—" : "AS" + String(value).replace(/^AS/i, "");
}

function valueText(value) {
  return value === null || typeof value === "undefined" || value === "" ? "—" : String(value);
}

function isIp(value) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(String(value)) || String(value).indexOf(":") >= 0;
}

function escapeHtml(value) {
  return String(value === null || typeof value === "undefined" ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function errorText(error) {
  return error && error.message ? String(error.message) : String(error);
}

