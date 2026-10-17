// Experimental: change ONLY the two source fields of a recommendation ViewReq.
// This tests server behavior. It does not change the app's local controller or tap UI.
// No network calls, storage, account/header/body logging, or automatic clicking.
(function () {
  function join(parts) {
    var size = 0; parts.forEach(function (b) { size += b.length; });
    var out = new Uint8Array(size), pos = 0;
    parts.forEach(function (b) { out.set(b, pos); pos += b.length; }); return out;
  }
  function varint(b, pos) {
    var value = 0, scale = 1;
    for (var i = 0; i < 8; i++) {
      if (pos >= b.length) throw Error('Truncated varint');
      var x = b[pos++]; value += (x & 127) * scale;
      if (!Number.isSafeInteger(value)) throw Error('Invalid tag or length');
      if (x < 128) return { value: value, pos: pos }; scale *= 128;
    }
    throw Error('Oversized varint');
  }
  function encode(value) {
    var out = [];
    do { var x = value % 128; value = Math.floor(value / 128); out.push(x + (value ? 128 : 0)); } while (value);
    return new Uint8Array(out);
  }
  function fields(b) {
    var out = [], pos = 0;
    while (pos < b.length) {
      var start = pos, tag = varint(b, pos); pos = tag.pos;
      var number = Math.floor(tag.value / 8), wire = tag.value % 8, keyEnd = pos, dataStart = pos, end;
      if (!number || number > 536870911) throw Error('Invalid field');
      if (wire === 2) { var len = varint(b, pos); dataStart = len.pos; end = dataStart + len.value; }
      else if (wire === 0) {
        end = pos;
        for (var i = 0; i < 10; i++) {
          if (end >= b.length) throw Error('Truncated scalar');
          var x = b[end++];
          if (i === 9 && x > 1) throw Error('Invalid scalar');
          if (x < 128) break;
          if (i === 9) throw Error('Invalid scalar');
        }
      } else if (wire === 1) end = pos + 8;
      else if (wire === 5) end = pos + 4;
      else throw Error('Unsupported wire type');
      if (end > b.length) throw Error('Truncated field');
      out.push({ number: number, wire: wire, key: b.slice(start, keyEnd), data: b.slice(dataStart, end), raw: b.slice(start, end) });
      pos = end;
    }
    return out;
  }
  function text(b) { var out = ''; for (var i = 0; i < b.length; i++) out += String.fromCharCode(b[i]); return out; }
  function ascii(s) { var out = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; }
  function frame(b) {
    var head = new Uint8Array(5), size = b.length;
    head[1] = (size >>> 24) & 255; head[2] = (size >>> 16) & 255;
    head[3] = (size >>> 8) & 255; head[4] = size & 255; return join([head, b]);
  }
  function frames(input) {
    var out = [], pos = 0;
    while (pos < input.length) {
      if (input.length - pos < 5) throw Error('Truncated frame header');
      var flag = input[pos], size = input[pos + 1] * 16777216 + input[pos + 2] * 65536 + input[pos + 3] * 256 + input[pos + 4], end = pos + 5 + size;
      if (flag !== 0 && flag !== 1) throw Error('Unsupported frame flag');
      if (end > input.length) throw Error('Truncated frame');
      var data = input.slice(pos + 5, end);
      if (flag === 1) {
        if (typeof $utils === 'undefined' || typeof $utils.ungzip !== 'function') throw Error('ungzip unavailable');
        data = $utils.ungzip(data);
      }
      if (!(data instanceof Uint8Array)) throw Error('Invalid binary payload');
      out.push({ plain: data, raw: input.slice(pos, end) }); pos = end;
    }
    return out;
  }
  function targetUrl() {
    return typeof $request !== 'undefined' && /^https:\/\/grpc\.biliapi\.net\/bilibili\.app\.viewunite\.v1\.View\/View(?:\?|$)/.test(String($request.url || ''));
  }
  function changeRequest() {
    try {
      if (!targetUrl()) { console.log('[SpaceSource] REQUEST skipped: other URL'); $done({}); return; }
      var input = $request.body;
      if (!(input instanceof Uint8Array)) throw Error('Enable request binary Body mode');
      var items = frames(input);
      // View is unary. Refuse ambiguous/unsupported request framing.
      if (items.length !== 1) throw Error('Expected one unary frame');
      var all = fields(items[0].plain);
      var from = all.filter(function (f) { return f.number === 3; });
      var origin = all.filter(function (f) { return f.number === 5; });
      if (from.length !== 1 || origin.length !== 1 || from[0].wire !== 2 || origin[0].wire !== 2) {
        console.log('[SpaceSource] REQUEST skipped: missing/ambiguous source'); $done({}); return;
      }
      if (text(from[0].data) !== '7' || text(origin[0].data) !== 'tm.recommend.0.0') {
        console.log('[SpaceSource] REQUEST skipped: not recommendation source'); $done({}); return;
      }
      var body = frame(join(all.map(function (f) {
        if (f !== from[0] && f !== origin[0]) return f.raw;
        var data = ascii(f === from[0] ? '66' : 'main.space-contribution.0.0');
        return join([f.key, encode(data.length), data]);
      })));
      var headers = Object.assign({}, $request.headers);
      Object.keys(headers).forEach(function (k) { if (k.toLowerCase() === 'content-length') delete headers[k]; });
      console.log('[SpaceSource] REQUEST changed 2 source fields: recommendation -> space-contribution');
      $done({ body: body, headers: headers });
    } catch (e) {
      console.log('[SpaceSource] REQUEST unchanged: ' + e.message); $done({});
    }
  }
  if (typeof $argument === 'string' && $argument === 'phase=request') { changeRequest(); return; }
  if (typeof $argument !== 'string' || $argument !== 'phase=response' || typeof $response === 'undefined' || !$response) {
    console.log('[SpaceSource] No HTTP response. Trigger from a real video request.'); $done({}); return;
  }
  if (!targetUrl()) { console.log('[SpaceSource] RESPONSE skipped: other URL'); $done({}); return; }
  console.log('[SpaceSource] RESPONSE entered: native link rewrite; UI result needs phone testing');
  // Report only whether the server's Owner URLs contain the requested source value.
  try {
    var count = 0;
    frames($response.body).forEach(function (item) {
      fields(item.plain).forEach(function (f) {
        if (f.number !== 4 || f.wire !== 2) return;
        fields(f.data).forEach(function (owner) {
          if (owner.wire === 2 && (owner.number === 2 || owner.number === 10) && /[?&]from=66(?:&|$)/.test(text(owner.data))) count++;
        });
      });
    });
    console.log('[SpaceSource] RESPONSE Owner URLs with from=66: ' + count);
  } catch (e) { console.log('[SpaceSource] RESPONSE source inspection unavailable'); }
// Experimental: rewrite ONLY ViewReply.owner.url/title_url to bilibili://space/MID.
// Preserves unknown protobuf fields and all original field bytes outside those URLs.
(function () {
  function join(a){var n=0;a.forEach(function(x){n+=x.length;});var r=new Uint8Array(n),o=0;a.forEach(function(x){r.set(x,o);o+=x.length;});return r;}
  function variable(a,p){var n=0,m=1;for(var k=0;k<8;k++){if(p>=a.length)throw Error('Truncated varint');var b=a[p++];n+=(b&127)*m;if(!Number.isSafeInteger(n))throw Error('Invalid length/tag');if(b<128)return {n:n,p:p};m*=128;}throw Error('Oversized varint');}
  function encode(n){var a=[];do{var b=n%128;n=Math.floor(n/128);a.push(b+(n?128:0));}while(n);return new Uint8Array(a);}
  function fields(a){var out=[],p=0;while(p<a.length){var start=p,t=variable(a,p);p=t.p;var no=Math.floor(t.n/8),wire=t.n%8;if(!no)throw Error('Invalid field');var keyEnd=p,bodyStart=p,end;
    if(wire===2){var l=variable(a,p);bodyStart=l.p;end=bodyStart+l.n;}
    else if(wire===0){end=p;for(var i=0;i<10;i++){if(end>=a.length)throw Error('Truncated scalar');if(a[end++]<128)break;if(i===9)throw Error('Invalid scalar');}}
    else if(wire===1)end=p+8;else if(wire===5)end=p+4;else throw Error('Unsupported wire type');
    if(end>a.length)throw Error('Truncated field');out.push({no:no,wire:wire,key:a.slice(start,keyEnd),body:a.slice(bodyStart,end),raw:a.slice(start,end)});p=end;}return out;}
  function replaceField(f,b){return join([f.key,encode(b.length),b]);}
  function latin(a){var s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return s;}
  function ascii(s){var a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;}
  var hits=0;
  function owner(a){return join(fields(a).map(function(f){if(f.wire!==2||(f.no!==2&&f.no!==10))return f.raw;var s=latin(f.body),m=/^bilibili:\/\/space\/(\d+)(?:\?|$)/.exec(s);if(!m)return f.raw;var target='bilibili://space/'+m[1];if(target===s)return f.raw;hits++;return replaceField(f,ascii(target));}));}
  function view(a){return join(fields(a).map(function(f){if(f.no!==4||f.wire!==2)return f.raw;var before=hits,b=owner(f.body);return hits===before?f.raw:replaceField(f,b);}));}
  try{
    var input=$response.body;if(!(input instanceof Uint8Array))throw Error('Enable binary Body mode');
    var parts=[],p=0;
    while(p<input.length){if(input.length-p<5)throw Error('Truncated frame header');var flag=input[p],n=input[p+1]*16777216+input[p+2]*65536+input[p+3]*256+input[p+4],end=p+5+n;if(end>input.length)throw Error('Truncated frame');if(flag!==0&&flag!==1)throw Error('Unsupported frame flag');
      var data=input.slice(p+5,end),plain=flag===1?$utils.ungzip(data):data,before=hits,b=view(plain);
      if(hits!==before){var h=new Uint8Array(5),size=b.length;h[1]=(size>>>24)&255;h[2]=(size>>>16)&255;h[3]=(size>>>8)&255;h[4]=size&255;parts.push(h,b);}else parts.push(input.slice(p,end));p=end;
    }
    console.log('Bilibili Space Link TEST: changed '+hits+' URL(s)');
    if(!hits){$done({});return;}
    var headers=Object.assign({},$response.headers);Object.keys(headers).forEach(function(k){if(k.toLowerCase()==='content-length')delete headers[k];});$done({body:join(parts),headers:headers});
  }catch(e){console.log('Bilibili Space Link TEST: unchanged; '+e.message);$done({});}
})();

})();
