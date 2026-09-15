// SPDX-License-Identifier: Apache-2.0
// Adapted from Yuzono AnimeGG. Independent AnimeGG/vidcache video hosting.
var ggBaseSettings=getSettings;
getSettings=function(){return ggBaseSettings().filter(function(s){return s.key==='audio'||s.key==='timeout';});};
function ggCards(raw,searching,query){return all(html(raw),function(n){return has(n,searching?'mse':'fea');}).map(function(n){var a=searching?n:first(n,function(c){return c.tag==='a'&&c.a.href&&c.parent&&has(c.parent,'rightpop');}),im=first(n,function(c){return c.tag==='img';}),title=content(searching?first(n,function(c){return c.tag==='h2';}):a);if(!a||!a.a.href||!title)return null;
  var alt=content(first(n,function(c){return c.tag==='div'&&/^Alt Titles\s*:/i.test(content(c))&&!first(c,function(x){return x.tag==='div';});}));
  var aliases=alt.replace(/^Alt Titles\s*:\s*/i,'').split(/[,;]/).map(function(s){return s.trim();});
  var match=aliases.filter(function(s){return query&&s.toLowerCase()===query.toLowerCase();})[0];
  return item(absolute(a.a.href,SITE),match||title,im?absolute(im.a.src,SITE):null);
}).filter(Boolean);}
async function search(query,page){return pageNum(page)>1?[]:ggCards(await request(SITE+'/search/?q='+encodeURIComponent(query)),true,String(query).trim());}
async function popular(page){return pageNum(page)>1?[]:ggCards(await request(SITE+'/popular-series?sortBy=hits&sortDirection=DESC&ongoing&limit=50&start=0'),false);}
async function getHome(){var p=await popular(1);return [{title:'Popular',items:p}];}
function ggEpisodes(raw){return unique(all(html(raw),function(n){return n.tag==='a'&&has(n,'anm_det_pop')&&n.a.href;}).map(function(n){var m=content(n).match(/(\d+(?:\.\d+)?)\s*$/);if(!m)return null;var u=absolute(n.a.href,SITE);return {id:pathOf(u),title:'Episode '+m[1],number:Number(m[1]),url:u};}).filter(Boolean),function(e){return e.id;}).sort(function(a,b){return a.number-b.number;});}
async function getEpisodes(url){return ggEpisodes(await request(url));}
async function getDetail(url){var raw=await request(url),root=html(raw),im=first(root,function(n){return n.tag==='img'&&has(n,'media-object');});var x=item(url,content(first(root,function(n){return n.tag==='h1';})),im?absolute(im.a.src,SITE):null);x.description=content(first(root,function(n){return has(n,'ptext');}));x.status=/Status:\s*Completed/i.test(content(root))?'completed':'unknown';x.episodes=ggEpisodes(raw);return x;}
function ggSources(raw){var m=raw.match(/var\s+videoSources\s*=\s*(\[[\s\S]*?\])\s*;/);if(!m)return [];return JSON.parse(m[1].replace(/([{,])\s*([A-Za-z_$][\w$]*)\s*:/g,'$1"$2":'));}
async function getVideoSources(url){var root=html(await request(url)),errors=[],groups=await Promise.all(all(root,function(n){return n.tag==='iframe'&&n.a.src;}).map(async function(n){try{var p=n.parent;while(p&&!has(p,'tab-pane'))p=p.parent;var mode=p&&p.a.id||'',kind=/dubbed/i.test(mode)?'dub':'sub';if(/raw/i.test(mode)||setting('audio')!=='both'&&setting('audio')!==kind)return [];var embed=absolute(n.a.src,url);return ggSources(await request(embed,url)).filter(function(v){return v.file;}).map(function(v){return {url:absolute(v.file,embed),label:'AnimeGG · '+kind+' · '+v.label,quality:v.label,container:'mp4',kind:kind,audioLang:kind==='dub'?'en':null,headers:{Referer:origin(embed)},subtitles:[]};});}catch(e){errors.push(e.message);return [];}}));var out=unique([].concat.apply([],groups),function(v){return v.url;}).sort(function(a,b){return parseInt(b.quality,10)-parseInt(a.quality,10);});if(!out.length)throw Error('AnimeGG: no playable streams. '+errors.join('; '));return out;}
