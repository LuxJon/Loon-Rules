// Low-confidence experiment: view_up_space cohort "2" -> "1" only.
// Cohort meanings are unknown. Cohort "0" was already ineffective on the phone.
// No requests, storage, source spoofing, UI automation, or account/body logging.
(function () {
  function text(b) { var s = ''; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return s; }
  function join(parts) {
    var n = 0; parts.forEach(function (b) { n += b.length; });
    var out = new Uint8Array(n), pos = 0;
    parts.forEach(function (b) { out.set(b, pos); pos += b.length; }); return out;
  }
  function number(b, p) {
    var n = 0, scale = 1;
    for (var i = 0; i < 8; i++) {
      if (p >= b.length) throw Error('Truncated varint');
      var x = b[p++]; n += (x & 127) * scale;
      if (!Number.isSafeInteger(n)) throw Error('Invalid field or length');
      if (x < 128) return { value: n, pos: p }; scale *= 128;
    }
    throw Error('Oversized varint');
  }
  function fields(b) {
    var out = [], p = 0;
    while (p < b.length) {
      var tag = number(b, p); p = tag.pos;
      var no = Math.floor(tag.value / 8), wire = tag.value % 8, start = p, end;
      if (!no || no > 536870911) throw Error('Invalid field');
      if (wire === 2) { var len = number(b, p); start = len.pos; end = start + len.value; }
      else if (wire === 0) {
        end = p;
        for (var i = 0; i < 10; i++) {
          if (end >= b.length) throw Error('Truncated scalar');
          var x = b[end++];
          if (i === 9 && x > 1) throw Error('Invalid scalar');
          if (x < 128) break;
          if (i === 9) throw Error('Invalid scalar');
        }
      } else if (wire === 1) end = p + 8;
      else if (wire === 5) end = p + 4;
      else throw Error('Unsupported wire type');
      if (end > b.length) throw Error('Truncated field');
      out.push({ no: no, wire: wire, start: start, end: end }); p = end;
    }
    return out;
  }
  function patchJson(b) {
    var source = text(b), json;
    try { json = JSON.parse(source); } catch (e) { return null; }
    var item = json && json.data && json.data.ab_result && json.data.ab_result.view_up_space;
    if (!item || item.success !== true || item.data !== '2') return null;
    // Keep every byte except one ASCII digit. Do not reserialize the JSON.
    // Refuse duplicate/ambiguous textual occurrences or unexpected object shapes.
    var re = /("view_up_space"\s*:\s*\{[^{}]*?"data"\s*:\s*")2(")/g;
    var match, at = -1, count = 0;
    while ((match = re.exec(source)) !== null) { at = match.index + match[1].length; count++; }
    if (count !== 1 || (source.match(/"view_up_space"\s*:/g) || []).length !== 1) return null;
    var out = b.slice(); out[at] = 49; return out;
  }
  var hits = 0;
  // Observed ColdStart wire path to the embedded HTTP JSON body: 1.2.2.1.
  // Only validated JSON objects on this path are eligible; other bytes survive.
  function patchColdstart(b, level) {
    var route = [1, 2, 2, 1], out = b.slice();
    fields(b).forEach(function (f) {
      if (f.no !== route[level] || f.wire !== 2) return;
      var value = b.slice(f.start, f.end), changed;
      if (level === route.length - 1) { changed = patchJson(value); if (changed) hits++; }
      else changed = patchColdstart(value, level + 1);
      if (changed) out.set(changed, f.start);
    });
    return out;
  }
  function outputHeaders() {
    var out = Object.assign({}, $response.headers);
    Object.keys(out).forEach(function (k) { if (k.toLowerCase() === 'content-length') delete out[k]; }); return out;
  }
  try {
    if (typeof $request === 'undefined' || typeof $response === 'undefined' || !$response) {
      console.log('[SpaceCohort1] No HTTP response; reopen Bilibili to trigger startup.'); $done({}); return;
    }
    var url = String($request.url || ''), input = $response.body;
    if (!(input instanceof Uint8Array)) throw Error('Enable binary Body mode');
    if (!/^https:\/\/grpc\.biliapi\.net\/bilibili\.app\.coldstart\.v1\.ColdStart\/GetColdStartDeferredData(?:\?|$)/.test(url)) {
      console.log('[SpaceCohort1] Skipped: other URL'); $done({}); return;
    }
    var parts = [], p = 0;
    while (p < input.length) {
      if (input.length - p < 5) throw Error('Truncated frame header');
      var flag = input[p], size = input[p + 1] * 16777216 + input[p + 2] * 65536 + input[p + 3] * 256 + input[p + 4], end = p + 5 + size;
      if (flag !== 0 && flag !== 1) throw Error('Unsupported frame flag');
      if (end > input.length) throw Error('Truncated frame');
      var plain = input.slice(p + 5, end);
      if (flag === 1) {
        if (typeof $utils === 'undefined' || typeof $utils.ungzip !== 'function') throw Error('ungzip unavailable');
        plain = $utils.ungzip(plain);
      }
      if (!(plain instanceof Uint8Array)) throw Error('Invalid binary payload');
      var before = hits, changed = patchColdstart(plain, 0);
      if (hits === before) parts.push(input.slice(p, end));
      else {
        var head = new Uint8Array(5), length = changed.length;
        head[1] = (length >>> 24) & 255; head[2] = (length >>> 16) & 255;
        head[3] = (length >>> 8) & 255; head[4] = length & 255; parts.push(head, changed);
      }
      p = end;
    }
    console.log('[SpaceCohort1] Changed ' + hits + ' view_up_space value(s): 2 -> 1; UI unverified');
    if (!hits) { $done({}); return; }
    $done({ body: join(parts), headers: outputHeaders() });
  } catch (e) {
    console.log('[SpaceCohort1] Unchanged: ' + e.message); $done({});
  }
})();
