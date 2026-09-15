// Port of Yuzono AnikotoTheme / AnikotoExtractor (Apache-2.0); see NOTICE.md.
function b64(bytes) {
  var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', out='';
  for(var i=0;i<bytes.length;i+=3){var a=bytes[i],b=bytes[i+1],c=bytes[i+2];out+=chars[a>>2]+chars[((a&3)<<4)|((b||0)>>4)]+(b==null?'=':chars[((b&15)<<2)|((c||0)>>6)])+(c==null?'=':chars[c&63]);}return out;
}
function utf8(s) { var b=unescape(encodeURIComponent(s));return b.split('').map(function(c){return c.charCodeAt(0);}); }
function rc4(key,s) { var a=[],j=0,t,out=[],bytes=utf8(s);for(var i=0;i<256;i++)a[i]=i;for(i=0;i<256;i++){j=(j+a[i]+key.charCodeAt(i%key.length))%256;t=a[i];a[i]=a[j];a[j]=t;}i=0;j=0;bytes.forEach(function(b){i=(i+1)%256;j=(j+a[i])%256;t=a[i];a[i]=a[j];a[j]=t;out.push(b^a[(a[i]+a[j])%256]);});return b64(out); }
function exchange(s,a,b){return s.split('').map(function(c){var i=a.indexOf(c);return i<0?c:b.charAt(i);}).join('');}
function vrf(s){s=exchange(s,'AP6GeR8H0lwUz1','UAz8Gwl10P6ReH');s=rc4('ItFKjuWokn4ZpB',s);s=rc4('fOyt97QWFB3',s);s=exchange(s,'1majSlPQd2M5','da1l2jSmP5QM');s=exchange(s,'CPYvHj09Au3','0jHA9CPYu3v');s=rc4('736y1uTJpBLUX',s.split('').reverse().join(''));return encodeURIComponent(b64(utf8(s)));}
function parseCatalogue(body){
  var doc=html(body), cards=all(doc,function(n){return n.tag==='div' && has(n,'item') && n.parent && has(n.parent,'ani') && has(n.parent,'items');});
  return unique(cards.map(function(n){var a=first(n,function(x){return x.tag==='a'&&has(x,'name');}),img=first(n,function(x){return x.tag==='img';});if(!a||!a.a.href)return null;var u=absolute(a.a.href,SITE+'/').replace(/\/ep-\d+(?:[?#].*)?$/,'');return item(u,content(a),img?absolute(img.a['data-src']||img.a.src,SITE+'/'):null);}).filter(Boolean),function(x){return x.id;});
}
async function search(query,page){query=String(query||'');return parseCatalogue(await request(SITE+'/filter?keyword='+encodeURIComponent(query)+'&page='+pageNum(page)+'&vrf='+(query?encodeURIComponent(vrf(query)):'')));}
async function popular(page){return parseCatalogue(await request(SITE+'/most-viewed/?page='+pageNum(page)));}
async function getHome(){return homeOrder([{title:'Popular',items:await popular(1)},{title:'Latest updates',items:parseCatalogue(await request(SITE+'/latest-updated/?page=1'))}]);}
function seriesUrl(url){return absolute(url,SITE+'/').split('#')[0].split('?')[0].replace(/\/ep-\d+$/,'');}
async function getDetail(url){
  url=seriesUrl(url);var doc=html(await request(url)),t=first(doc,function(n){return /^(h1|h2)$/.test(n.tag)&&has(n,'title');});if(!t)throw new Error(NAME+': title not found; site markup may have changed');
  var image=first(doc,function(n){return n.tag==='img' && n.parent && has(n.parent,'poster');});
  var syn=first(doc,function(n){return has(n,'synopsis');}), status=content(doc), result=item(url,content(t),image?absolute(image.a['data-src']||image.a.src,url):null);
  result.description=content(syn);result.status=/finished airing|completed/i.test(status)?'completed':/currently airing|ongoing anime/i.test(status)?'ongoing':'unknown';result.genres=[];result.studios=[];
  result.episodes=await episodesFromDocument(url,doc);return result;
}
async function getEpisodes(url){url=seriesUrl(url);return episodesFromDocument(url,html(await request(url)));}
async function episodesFromDocument(url,doc){
  var node=first(doc,function(n){return !!n.a['data-id'];})||first(doc,function(n){return !!n.a['data-tip'];});
  if(!node)throw new Error(NAME+': anime ID missing');var id=node.a['data-id']||node.a['data-tip'];
  var data=await request(SITE+'/ajax/episode/list/'+encodeURIComponent(id)+'?vrf='+vrf(id),url,true);
  var markup=typeof data.result==='string'?data.result:data.result&&data.result.html;if(typeof markup!=='string')throw new Error(NAME+': invalid episode response');
  return unique(all(html(markup),function(n){return n.tag==='a'&&!!n.a['data-ids'];}).map(function(n){
    var num=n.a['data-num'],title=n.parent?content(first(n.parent,function(x){return has(x,'d-title');})):'';
    var info={ids:n.a['data-ids'],epurl:pathOf(url)+'/ep-'+num,mal:n.a['data-mal']||'',slug:n.a['data-slug']||'',ts:n.a['data-timestamp']||''};
    var ep={id:pathOf(url)+':'+num,title:'Episode '+num+(title&&title!=='Episode '+num?': '+title:''),number:isFinite(Number(num))?Number(num):null,url:url+'#zangetsu='+encodeURIComponent(JSON.stringify(info)),filler:has(n,'filler')};
    if(info.ts&&isFinite(Number(info.ts)))ep.date=new Date(Number(info.ts)*1000).toISOString();return ep;
  }),function(x){return x.id;}).sort(function(a,b){return (a.number||0)-(b.number||0);});
}
function serverNodes(markup){return all(html(markup),function(n){return n.tag==='li'&&!!n.a['data-link-id']&&!has(n,'download-icon');}).map(function(n){var p=n.parent;while(p&&!has(p,'type'))p=p.parent;var label=p?content(first(p,function(x){return x.tag==='label';}))||p.a['data-type']||'sub':'sub';return {id:n.a['data-link-id'],name:content(n),kind:/dub/i.test(label)?'dub':'sub'};});}
function stream(url,server,ref,tracks){return {url:absolute(url,ref),label:server.name+' · '+server.kind,container:/\.mp4(?:[?#]|$)/i.test(url)?'mp4':'hls',kind:server.kind,audioLang:server.kind==='dub'?'en':'ja',headers:{Referer:ref,Origin:origin(ref)},subtitles:(setting('subtitles')?tracks||[]:[]).filter(function(t){return t.kind==='captions'&&t.file;}).map(function(t){return {url:absolute(t.file,ref),lang:languageCode(t.label)||'und',label:t.label||'Subtitles',format:/\.srt(?:[?#]|$)/i.test(t.file)?'srt':'vtt'};})};}
async function resolveEmbed(url,server,ref,depth){
  if(depth>3)throw new Error('Too many nested players');url=absolute(url,ref);
  // These upstream routes require Android's binary-rewriting local proxy.
  if(/kiwi|vidplay/i.test(server.name)||/mewcdn\.online\/player\/plyr\.php/i.test(url))throw new Error(server.name+': requires Android-only segment proxy');
  if(/\.m3u8(?:[?#]|$)|\.mp4(?:[?#]|$)/i.test(url)&&url.indexOf('/stream/')<0)return [stream(url,server,ref)];
  var body=await request(url,ref),host=origin(url),m=body.match(/data-id=["']([^"']+)["']/i);
  if(m){
    var type=(url.split(/[?#]/)[0].match(/\/(sub|dub|hsub)$/)||[])[1]||'',id=encodeURIComponent(m[1]);
    // getSourcesNew requires byte-rewriting proxy and is deliberately not advertised.
    var api=await request(host+'/stream/getSources?id='+id+'&id='+id+'&type='+type+'&type='+type,url,true);
    var files=sourceFiles(api);if(!files.length)throw new Error(server.name+': direct stream missing; proxy-only or changed API');
    return files.map(function(file){return stream(/(^|\.)megaplay\./i.test(host.replace(/^https?:\/\//,''))?signPlayerUrl(file):file,server,host+'/',api.tracks);});
  }
  m=body.match(/<iframe[^>]+src=["']([^"']+)["']/i);if(m)return resolveEmbed(m[1],server,url,depth+1);
  m=body.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);if(m)return [stream(text(m[0]),server,host+'/')];
  m=body.match(/<source[^>]+src=["']([^"']+)["']/i);if(m)return [stream(m[1],server,host+'/')];
  throw new Error(server.name+': no supported direct stream found');
}
async function getVideoSources(episodeUrl){
  var marker=String(episodeUrl).split('#zangetsu=')[1];if(!marker)throw new Error('Refresh the episode list before playing');var ep=JSON.parse(decodeURIComponent(marker));
  var ref=SITE+ep.epurl,data=await request(SITE+'/ajax/server/list?servers='+encodeURIComponent(ep.ids),ref,true);
  var markup=typeof data.result==='string'?data.result:data.result&&data.result.html;if(typeof markup!=='string')throw new Error('Invalid server list');
  var servers=serverNodes(markup),out=[],failures=[];
  // Resolve a bounded set, two at a time; one dead mirror must not freeze the app.
  var candidates=servers.filter(function(s){return !/kiwi|vidplay/i.test(s.name)&&(setting('audio')==='both'||s.kind===setting('audio'));}).slice(0,6);
  for(var i=0;i<candidates.length;i+=2){var batch=await Promise.all(candidates.slice(i,i+2).map(async function(s){try{var r=await request(SITE+'/ajax/server?get='+encodeURIComponent(s.id),ref,true);if(!r.result||!r.result.url)throw new Error('Missing embed URL');return await resolveEmbed(r.result.url,s,ref,0);}catch(e){failures.push(s.name+': '+e.message);return [];}}));batch.forEach(function(v){out=out.concat(v);});if(out.length&&(setting('audio')!=='both'||(out.some(function(v){return v.kind==='sub';})&&out.some(function(v){return v.kind==='dub';}))))break;}
  if(!out.length)throw new Error(NAME+': no supported direct servers. '+(failures.join('; ')||'Available hosts require the Android proxy.'));
  return audioMetadata(unique(out,function(v){return v.url+'|'+v.kind;}));
}



