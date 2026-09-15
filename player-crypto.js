// AES-256-CBC for the public MegaPlay response format; no remote script execution.
function decodePlayerSources(encoded) {
  var alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', raw=String(encoded).replace(/-/g,'+').replace(/_/g,'/').replace(/=+$/,''), bytes=[],bits=0,value=0;
  for(var i=0;i<raw.length;i++){var n=alphabet.indexOf(raw[i]);if(n<0)throw new Error('Invalid encrypted source');value=(value<<6)|n;bits+=6;if(bits>=8){bits-=8;bytes.push((value>>bits)&255);}}
  if(!bytes.length||bytes.length%16)throw new Error('Invalid encrypted source length');
  function mul(a,b){var r=0;while(b){if(b&1)r^=a;a=((a<<1)^((a&128)?283:0))&255;b>>=1;}return r;}
  function pow(a,n){var r=1;while(n){if(n&1)r=mul(r,a);a=mul(a,a);n>>=1;}return r;}
  function rot(a,n){return ((a<<n)|(a>>(8-n)))&255;}
  var s=[],inv=[];for(i=0;i<256;i++){var v=i?pow(i,254):0;s[i]=v^rot(v,1)^rot(v,2)^rot(v,3)^rot(v,4)^99;inv[s[i]]=i;}
  var key=utf8('i?LMTAx0Q6,:}50U');while(key.length<32)key.push(0);var rc=1;
  for(i=32;i<240;i+=4){var t=key.slice(i-4,i);if(i%32===0){t.push(t.shift());t=t.map(function(x){return s[x];});t[0]^=rc;rc=mul(rc,2);}else if(i%32===16)t=t.map(function(x){return s[x];});for(var j=0;j<4;j++)key[i+j]=key[i-32+j]^t[j];}
  var prev=utf8("W0;27ToaUpl_P%'c"),out=[];
  for(var off=0;off<bytes.length;off+=16){var a=bytes.slice(off,off+16);function add(round){for(var k=0;k<16;k++)a[k]^=key[round*16+k];}add(14);
    for(var round=13;round>=0;round--){var shifted=a.slice();for(var row=0;row<4;row++)for(var col=0;col<4;col++)a[col*4+row]=inv[shifted[((col-row+4)%4)*4+row]];add(round);if(round){for(col=0;col<4;col++){var q=a.slice(col*4,col*4+4);a[col*4]=mul(q[0],14)^mul(q[1],11)^mul(q[2],13)^mul(q[3],9);a[col*4+1]=mul(q[0],9)^mul(q[1],14)^mul(q[2],11)^mul(q[3],13);a[col*4+2]=mul(q[0],13)^mul(q[1],9)^mul(q[2],14)^mul(q[3],11);a[col*4+3]=mul(q[0],11)^mul(q[1],13)^mul(q[2],9)^mul(q[3],14);}}}
    for(j=0;j<16;j++)out.push(a[j]^prev[j]);prev=bytes.slice(off,off+16);
  }
  var pad=out[out.length-1];if(pad<1||pad>16||out.slice(-pad).some(function(x){return x!==pad;}))throw new Error('Invalid source encryption padding');out.length-=pad;
  return JSON.parse(decodeURIComponent(out.map(function(x){return '%'+('0'+x.toString(16)).slice(-2);}).join('')));
}
function sourceFiles(data){var v=data.sources;if(!v&&data.enc)v=decodePlayerSources(data.enc);if(!Array.isArray(v))v=[v];return v.map(function(x){return typeof x==='string'?x:x&&x.file;}).filter(function(x){return typeof x==='string'&&/^https?:\/\//i.test(x);});}
// SHA-256 operates on bytes, including HMAC's non-UTF8 pads.
function sha256Bytes(input){
 var primes=[],constants=[],initial=[];for(var n=2;primes.length<64;n++){if(primes.every(function(p){return n%p!==0;})){primes.push(n);constants.push((Math.pow(n,1/3)*4294967296)|0);if(initial.length<8)initial.push((Math.sqrt(n)*4294967296)|0);}}
 var bytes=input.slice(),length=bytes.length*8;bytes.push(128);while(bytes.length%64!==56)bytes.push(0);for(var i=7;i>=0;i--)bytes.push(i>=4?0:(length>>>(i*8))&255);
 function rotate(x,n){return(x>>>n)|(x<<(32-n));}var h=initial;
 for(var offset=0;offset<bytes.length;offset+=64){var w=[];for(i=0;i<16;i++)w[i]=(bytes[offset+4*i]<<24)|(bytes[offset+4*i+1]<<16)|(bytes[offset+4*i+2]<<8)|bytes[offset+4*i+3];for(i=16;i<64;i++){var x=w[i-15],y=w[i-2];w[i]=(w[i-16]+(rotate(x,7)^rotate(x,18)^(x>>>3))+w[i-7]+(rotate(y,17)^rotate(y,19)^(y>>>10)))|0;}var a=h.slice();for(i=0;i<64;i++){var t1=(a[7]+(rotate(a[4],6)^rotate(a[4],11)^rotate(a[4],25))+((a[4]&a[5])^(~a[4]&a[6]))+constants[i]+w[i])|0;var t2=((rotate(a[0],2)^rotate(a[0],13)^rotate(a[0],22))+((a[0]&a[1])^(a[0]&a[2])^(a[1]&a[2])))|0;a=[(t1+t2)|0,a[0],a[1],a[2],(a[3]+t1)|0,a[4],a[5],a[6]];}h=h.map(function(v,j){return(v+a[j])|0;});}
 var out=[];h.forEach(function(v){for(var j=3;j>=0;j--)out.push((v>>>(j*8))&255);});return out;
}
function signPlayerUrl(url,now){
 if(/[?&]token=/.test(url))return url;var match=url.match(/\/([a-f0-9]{32})\/([a-f0-9]{32})\//i);if(!match)return url;
 var message=String(Math.floor((now==null?Date.now():now)/1000)+90)+'|'+match[1].toLowerCase()+'/'+match[2].toLowerCase();
 var key=utf8('MpCdnT0k3n!9f2K#xQ7vL5mR8wN1pY4s');while(key.length<64)key.push(0);
 var inner=key.map(function(b){return b^54;}),outer=key.map(function(b){return b^92;});var signature=sha256Bytes(outer.concat(sha256Bytes(inner.concat(utf8(message)))));
 return url+(url.indexOf('?')<0?'?':'&')+'token='+b64(utf8(message)).replace(/=+$/,'')+'.'+b64(signature).replace(/=+$/,'');
}

