// Temporary trigger diagnostics. Logs RPC names and runtime types only.
// Response rewriting below is the unchanged, phone-tested Space Link script.
(function () {
  if (typeof $argument === 'string' && $argument === 'phase=request') {
    var url = typeof $request !== 'undefined' ? String($request.url || '') : '';
    var rpc = /\/bilibili\.app\.viewunite\.v1\.View\/([A-Za-z0-9_]+)/.exec(url);
    console.log('[SpaceDiag] REQUEST rpc=' + (rpc ? rpc[1] : 'unknown'));
    $done({});
    return;
  }
  if (typeof $response === 'undefined' || !$response) {
    console.log('[SpaceDiag] No HTTP response. Open a video to trigger RESPONSE; manual/CRON execution cannot rewrite it.');
    $done({});
    return;
  }
  var body = $response.body;
  console.log('[SpaceDiag] RESPONSE entered; body=' + Object.prototype.toString.call(body) +
    '; bytes=' + (body && (body.byteLength || body.length) || 0) +
    '; ungzip=' + (typeof $utils !== 'undefined' && typeof $utils.ungzip === 'function'));
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
