// SPDX-License-Identifier: Apache-2.0
// Original native adapter for AnimeDex's public catalog and Luna stream protocol.
var dexServers=[
 [
  "vidnest",
  "VidNest Embed",
  "vidnest",
  "aniwave_hls"
 ],
 [
  "pahe",
  "VidNest Pahe Embed",
  "vidnest",
  "hianime/anime"
 ],
 [
  "embed",
  "MegaPlay Embed",
  "embed",
  ""
 ],
 [
  "mf-aniwaves",
  "AniWaves MF",
  "mfapi",
  "aniwaves"
 ],
 [
  "avx-anikoto",
  "Hina AVX",
  "anivexa",
  "anikoto"
 ],
 [
  "avx-animegg",
  "Rem AVX",
  "anivexa",
  "animegg"
 ],
 [
  "anibd",
  "Quasar Luna (sub only)",
  "luna",
  "anibd"
 ],
 [
  "anilink",
  "Pulsar Luna (sub only)",
  "luna",
  "anilink"
 ],
 [
  "megaplay",
  "Nova Luna",
  "luna",
  "megaplay"
 ],
 [
  "aniwaves",
  "Draco Luna",
  "luna",
  "aniwaves"
 ]
];
var dexBaseSettings=getSettings;
getSettings=function(){return dexBaseSettings().filter(function(s){return s.key!=='audioLanguage';}).concat([
 {key:'dexEnableAll',label:'Enable all servers (overrides selection below)',type:'bool',default:true},
 {key:'dexSelected',label:'Servers — AnimeDex website order',type:'multiEnum',default:dexServers.map(function(s){return s[0];}),options:dexServers.map(function(s,i){return {value:s[0],label:(i+1)+'. '+s[1]};})}
]);};
function b64(bytes){var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',out='';for(var i=0;i<bytes.length;i+=3){var a=bytes[i],b=bytes[i+1],c=bytes[i+2];out+=chars[a>>2]+chars[((a&3)<<4)|((b||0)>>4)]+(b==null?'=':chars[((b&15)<<2)|((c||0)>>6)])+(c==null?'=':chars[c&63]);}return out;}
function utf8(s){return unescape(encodeURIComponent(s)).split('').map(function(c){return c.charCodeAt(0);});}
function dexCipher(d){if(!d.encrypted)return d;var abc='RB0fpH8ZEyVLkv7c2i6MAJ5u3IKFDxlS1NTsnGaqmXYdUrtzjwObCgQP94hoeW+/',bits=0,v=0,out=[];for(var i=0;i<d.data.length;i++){var n=abc.indexOf(d.data[i]);if(n<0)continue;v=(v<<6)|n;bits+=6;if(bits>=8){bits-=8;out.push('%'+('0'+((v>>bits)&255).toString(16)).slice(-2));}}return JSON.parse(decodeURIComponent(out.join('')));}
function dexHeaders(){return {Referer:SITE+'/',Origin:SITE,'User-Agent':'Mozilla/5.0','Content-Type':'application/json'};}
async function dexApi(path,body){var options={headers:dexHeaders(),timeoutMs:Number(setting('timeout'))||12000};if(body){options.method='POST';options.body=JSON.stringify(body);}var r=await fetch(SITE+'/api/'+path,options),raw=r.body!=null?r.body:await r.text(),d;try{d=JSON.parse(raw);}catch(e){throw Error('AnimeDex: invalid server response');}if(r.status<200||r.status>=300||d.error)throw Error('AnimeDex: '+(d.error||'HTTP '+r.status));return d;}
function dexItem(a){if(!a||!a.id||!a.name)return null;var x=item(SITE+'/anime/'+encodeURIComponent(a.id),a.name,a.poster);x.anilistId=Number(a.anilistId)||null;x.malId=Number(a.malId)||null;return x;}
function dexItems(rows){return (rows||[]).map(dexItem).filter(Boolean);}
async function search(query,page){var d=await dexApi('anime/search?q='+encodeURIComponent(query)+'&page='+pageNum(page));return dexItems(d.animes);}
async function popular(page){return dexItems((await dexApi('anime/category/most-popular?page='+pageNum(page))).animes);}
async function getHome(){var d=await dexApi('anime/home');return homeOrder([{title:'Trending',items:dexItems(d.trendingAnimes)},{title:'Latest episodes',items:dexItems(d.latestEpisodeAnimes)}]);}
function dexSlug(url){var m=String(url).match(/\/anime\/([^/#?]+)(?:[?#].*)?$/);if(!m)throw Error('AnimeDex: reopen the title from search');return decodeURIComponent(m[1]);}
async function dexEpisodes(slug,id){var d=await dexApi('anime/episodes/'+encodeURIComponent(slug));return unique((d.episodes||[]).filter(function(e){return Number(e.number)>0&&Number.isInteger(Number(e.number));}).map(function(e){var n=Number(e.number);return {id:slug+':'+n,title:e.title?'Episode '+n+' · '+e.title:'Episode '+n,number:n,date:e.airDate||null,url:SITE+'/watch/'+encodeURIComponent(slug)+'/ep-'+n+'#dex='+encodeURIComponent(JSON.stringify({id:Number(id),ep:n}))};}),function(e){return e.id;}).sort(function(a,b){return a.number-b.number;});}
async function getDetail(url){var slug=dexSlug(url),d=await dexApi('anime/info/'+encodeURIComponent(slug)),a=d.anime&&d.anime.info;if(!a)throw Error('AnimeDex: title not found');var x=dexItem(a);x.description=text(a.description);x.genres=a.genres||[];x.status=a.status==='FINISHED'?'completed':a.status==='RELEASING'?'ongoing':'unknown';x.episodes=await dexEpisodes(slug,a.anilistId);return x;}
async function getEpisodes(url){return (await getDetail(url)).episodes;}
function dexStreams(d,server,kind){
 var captions=setting('subtitles')?unique((d.subtitles&&d.subtitles.length?d.subtitles:d.tracks||[]).filter(function(s){return /^https?:\/\//i.test(s.url||s.file||'')&&(!s.kind||/captions|subtitles/.test(s.kind));}).map(function(s){var u=s.url||s.file;return {url:u,lang:languageCode(s.label)||languageCode(s.language)||'und',label:s.label||s.language||'Subtitles',format:/\.ass(?:[?#]|$)/i.test(u)?'ass':/\.srt(?:[?#]|$)/i.test(u)?'srt':'vtt'};}),function(s){return s.url;}):[];
 return unique((d.sources||[]).filter(function(s){var u=s.url||s.file||'';return /^https?:\/\//i.test(u)&&(s.isHLS||s.isMP4||s.type==='hls'||/\.(m3u8|mp4)(?:[?#]|$)/i.test(u))&&!/url=%2Fapi%2Finternal%2F/i.test(u);}).map(function(s){var u=s.url||s.file,h=s.headers||d.headers||{};if(s.referer)h={Referer:s.referer};if(server[0]==='avx-anikoto')u=signPlayerUrl(u);if(server[0]==='aniwaves'){var wrapped=u.match(/[?&]url=([^&]+)/);if(wrapped){u=decodeURIComponent(wrapped[1]);h={Referer:'https://play.echovideo.ru/'};}}return {url:u,label:'AnimeDex · '+server[1]+' · '+kind,quality:s.quality||null,container:s.isHLS||s.type==='hls'||/\.m3u8(?:[?#]|$)/i.test(u)?'hls':'mp4',kind:kind,audioLang:kind==='dub'?'en':null,headers:h,subtitles:captions};}),function(s){return s.url;});
}
async function dexEmbed(url,kind){
 var body=await request(url,SITE+'/'),m=body.match(/data-id=["']([^"']+)/i);if(!m)throw Error('Native embed stream unavailable');
 var host=origin(url),id=encodeURIComponent(m[1]),d=await request(host+'/stream/getSources?id='+id+'&id='+id+'&type='+kind+'&type='+kind,url,true);
 return {sources:sourceFiles(d).map(function(u){return {url:signPlayerUrl(u),isHLS:true};}),tracks:d.tracks,headers:{Referer:host+'/',Origin:host,'User-Agent':'Mozilla/5.0'}};
}
async function dexResolve(server,ep,kind){
 var group=server[2],provider=server[3],body={anilistId:ep.id,ep:ep.ep},d;
 if(group==='embed')return dexEmbed('https://megaplay.buzz/stream/ani/'+ep.id+'/'+ep.ep+'/'+kind,kind);
 if(group==='vidnest'){
  // Pahe currently tries Anitaku, AniWave, MegaPlay in the website's order.
  // The Anitaku proxy fails natively; use its next actual fallback, AniWave.
  var route=server[0]==='pahe'?'aniwave_hls':provider;
  var r=await fetch('https://new.vidnest.fun/'+route+'/'+ep.id+'/'+ep.ep+'/'+kind,{headers:{Referer:'https://vidnest.fun/','User-Agent':'Mozilla/5.0'},timeoutMs:Number(setting('timeout'))||12000});
  d=dexCipher(JSON.parse(r.body!=null?r.body:await r.text()));if(r.status!==200)throw Error('VidNest HTTP '+r.status);return d;
 }
 if(group==='luna'){body.provider=provider;body.subType=kind;}
 else {body.lang=kind;if(group==='mfapi')body.action=provider;else body.provider=provider;}
 d=await dexApi('stream/'+group,body);
 // Hina omits MegaPlay's caption list; recover the matching episode's tracks.
 if(server[0]==='avx-anikoto'&&setting('subtitles')&&!(d.subtitles||[]).length){try{var extra=await dexEmbed('https://megaplay.buzz/stream/ani/'+ep.id+'/'+ep.ep+'/'+kind,kind);d.tracks=extra.tracks;}catch(e){}}
 return d;
}
async function dexPlayable(s){
 // Check manifests before advertising links. Never download a whole MP4 here.
 if(s.container!=='hls'){try{var head=await fetch(s.url,{method:'HEAD',headers:s.headers,timeoutMs:5000}),hs=head.headers||{},len,ct='';Object.keys(hs).forEach(function(k){if(k.toLowerCase()==='content-length')len=String(hs[k]);if(k.toLowerCase()==='content-type')ct=String(hs[k]);});return head.status>=200&&head.status<300&&len!=='0'&&!/text\/html/i.test(ct);}catch(e){return false;}}
 try{var r=await fetch(s.url,{headers:s.headers,timeoutMs:5000}),body=r.body!=null?r.body:await r.text();return r.status>=200&&r.status<300&&/^\s*#EXTM3U/.test(body);}catch(e){return false;}
}
async function getVideoSources(url){
 var mark=String(url).split('#dex=')[1];if(!mark)throw Error('AnimeDex: refresh the episode list');var ep=JSON.parse(decodeURIComponent(mark));if(!Number.isInteger(ep.id)||ep.id<1||!Number.isInteger(ep.ep)||ep.ep<1)throw Error('AnimeDex: invalid episode');
 var selected=setting('dexSelected'),allEnabled=setting('dexEnableAll'),audio=setting('audio'),tasks=[],errors=[],rows=[],next=0;
 dexServers.forEach(function(s){if(!allEnabled&&selected.indexOf(s[0])<0)return;['sub','dub'].forEach(function(kind){if(audio!=='both'&&audio!==kind)return;if((s[0]==='anibd'||s[0]==='anilink')&&kind==='dub')return;tasks.push({server:s,kind:kind});});});
 if(!tasks.length)throw Error('AnimeDex: select a server supporting the chosen audio, or enable all servers');
 async function worker(){while(next<tasks.length){var i=next++,t=tasks[i];try{var found=dexStreams(await dexResolve(t.server,ep,t.kind),t.server,t.kind);var flags=await Promise.all(found.map(dexPlayable));rows[i]=found.filter(function(s,j){return flags[j];});}catch(e){errors.push(t.server[1]+': '+e.message);rows[i]=[];}}}
 var workers=[];for(var w=0;w<Math.min(12,tasks.length);w++)workers.push(worker());await Promise.all(workers);
 // Preserve website order regardless of network completion order. Keep aliases
 // selectable while avoiding duplicate qualities within one server.
 var out=[].concat.apply([],rows);if(!out.length)throw Error('AnimeDex: no playable streams. '+errors.slice(0,5).join('; '));return out;
}
