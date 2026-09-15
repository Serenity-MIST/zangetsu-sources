// SPDX-License-Identifier: GPL-3.0-or-later
// Adapted from SaurabhKaperwan/CSX CineStreamProvider and CineStreamExtractors.
// Native port: Cinemeta movies/series, VaPlayer playback.
var CINE_CATALOG='https://cinemeta-catalogs.strem.io';
var CINE_UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36';
async function cineJson(url,h,body){
  var opts={headers:h||{},timeoutMs:Number(setting('timeout'))||12000};
  if(body!=null){opts.method='POST';opts.headers=Object.assign({},opts.headers,{'Content-Type':'application/json'});opts.body=JSON.stringify(body);}
  var r=await fetch(url,opts);if(r.status<200||r.status>=300)throw new Error('HTTP '+r.status+' from '+origin(url));
  var raw=r.body!=null?r.body:await r.text();try{return JSON.parse(raw);}catch(e){throw new Error('Invalid JSON from '+origin(url));}
}
function cineItem(m){
  if(!m||!/^tt\d+$/.test(m.id||'')||!m.name||! /^(movie|series)$/.test(m.type))return null;
  var url=SITE+'/meta/'+m.type+'/'+m.id+'.json',x=item(url,m.name,m.poster);x.id=m.type+':'+m.id;x.imdbId=m.id;x.tmdbIsTv=m.type==='series';x.tmdbId=Number(m.moviedb_id)||null;
  return x;
}
function cineTypes(){return setting('catalog')==='both'?['movie','series']:[setting('catalog')];}
async function cineLists(makeUrl){
  var failures=[],rows=await Promise.all(cineTypes().map(async function(type){try{var data=await cineJson(makeUrl(type));if(!Array.isArray(data.metas))throw new Error('Catalog list missing');return {title:type==='movie'?'Top Movies':'Top Series',items:data.metas.map(cineItem).filter(Boolean)};}catch(e){failures.push(e.message);return null;}}));
  rows=rows.filter(Boolean);if(!rows.length)throw new Error('CineStream: '+failures.join('; '));return rows;
}
async function getHome(){return cineLists(function(t){return CINE_CATALOG+'/top/catalog/'+t+'/top/skip=0.json';});}
async function popular(page){var rows=await cineLists(function(t){return CINE_CATALOG+'/top/catalog/'+t+'/top/skip='+((pageNum(page)-1)*50)+'.json';});return rows.reduce(function(a,r){return a.concat(r.items);},[]);}
async function search(query,page){if(pageNum(page)>1)return [];var rows=await cineLists(function(t){return SITE+'/catalog/'+t+'/top/search='+encodeURIComponent(String(query||''))+'.json';});var out=[],max=0;rows.forEach(function(r){max=Math.max(max,r.items.length);});for(var i=0;i<max;i++)rows.forEach(function(r){if(r.items[i])out.push(r.items[i]);});return rankCineSearch(out,query);}
function rankCineSearch(items,query){
  function normalized(s){return String(s).toLowerCase().replace(/[^a-z0-9]/g,'');}
  var wanted=normalized(query),prefer=setting('sameTitle');
  return items.map(function(x,i){return {x:x,i:i};}).sort(function(a,b){var an=normalized(a.x.title),bn=normalized(b.x.title);var exact=Number(bn===wanted)-Number(an===wanted);if(exact)return exact;if(an===bn){var ap=a.x.tmdbIsTv?'series':'movie',bp=b.x.tmdbIsTv?'series':'movie';var priority=Number(bp===prefer)-Number(ap===prefer);if(priority)return priority;}return a.i-b.i;}).map(function(r){return r.x;});
}
function cineIdentity(url){var m=String(url).match(/\/meta\/(movie|series)\/(tt\d+)\.json(?:#.*)?$/);if(!m)throw new Error('CineStream: refresh the title from search');return {type:m[1],id:m[2]};}
async function cineMeta(url){var id=cineIdentity(url),data=await cineJson(SITE+'/meta/'+id.type+'/'+id.id+'.json');if(!data.meta||!data.meta.name)throw new Error('CineStream: title metadata missing');data.meta.id=id.id;data.meta.type=id.type;return data.meta;}
function cineEpisodes(m){
  var base=SITE+'/meta/'+m.type+'/'+m.id+'.json',payload={id:m.id,type:m.type,title:m.name,tmdb:m.moviedb_id||null,year:parseInt(m.year||m.releaseInfo,10)||null};
  function episode(v){var p=Object.assign({},payload);if(m.type==='series'){p.season=Number(v.season);p.episode=Number(v.episode);}
    return {id:m.id+(m.type==='series'?':'+p.season+':'+p.episode:''),title:m.type==='movie'?m.name:'S'+p.season+'E'+p.episode+' · '+(v.title||'Episode '+p.episode),number:m.type==='movie'?1:p.episode,url:base+'#cine='+encodeURIComponent(JSON.stringify(p)),date:v.released||m.released||null,thumbnail:v.thumbnail||null};}
  if(m.type==='movie')return [episode({})];
  return (m.videos||[]).filter(function(v){return Number.isInteger(Number(v.season))&&Number(v.season)>0&&Number.isInteger(Number(v.episode))&&Number(v.episode)>0&&(!v.released||isNaN(Date.parse(v.released))||Date.parse(v.released)<=Date.now());}).sort(function(a,b){return a.season-b.season||a.episode-b.episode;}).map(episode);
}
async function getEpisodes(url){return cineEpisodes(await cineMeta(url));}
async function getDetail(url){var m=await cineMeta(url),x=cineItem(m);x.description=m.description||'';x.genres=m.genres||m.genre||[];x.studios=[];x.status=m.type==='movie'?'completed':'unknown';x.episodes=cineEpisodes(m);return x;}
function cineSubs(tracks){if(!setting('subtitles'))return [];return (tracks||[]).filter(function(t){return /^https?:\/\//i.test(t.url||'');}).map(function(t){var lang=t.language||t.lang||t.code||'und';return {url:t.url,lang:languageCode(lang)||'und',label:lang,format:/\.srt(?:[?#]|$)/i.test(t.url)?'srt':'vtt'};});}
function cineStream(url,name,h,tracks,quality){if(typeof url!=='string'||!/^https?:\/\//i.test(url))return null;return {url:url,label:name+(quality?' · '+quality:''),quality:quality?String(quality):null,container:/\.m3u8(?:[?#]|$)/i.test(url)?'hls':/\.mp4(?:[?#]|$)/i.test(url)?'mp4':'unknown',kind:'unknown',audioLang:null,headers:h,subtitles:cineSubs(tracks)};}
async function cineVaPlayer(ep){var h={Referer:'https://nextgencloudfabric.com/','User-Agent':CINE_UA},url='https://streamdata.vaplayer.ru/api.php?imdb='+ep.id+'&type='+(ep.type==='movie'?'movie':'tv&season='+ep.season+'&episode='+ep.episode),data=await cineJson(url,h);return (data.data&&data.data.stream_urls||[]).map(function(u,i){return cineStream(u,'VaPlayer '+(i+1),h,data.default_subs);}).filter(Boolean);}
async function getVideoSources(url){
  var marker=String(url).split('#cine=')[1];if(!marker)throw new Error('CineStream: refresh the episode list');
  var ep=JSON.parse(decodeURIComponent(marker));if(!/^tt\d+$/.test(ep.id)||! /^(movie|series)$/.test(ep.type)||ep.type==='series'&&(!Number.isInteger(ep.season)||ep.season<0||!Number.isInteger(ep.episode)||ep.episode<1))throw new Error('CineStream: invalid episode');
  var out=unique(await cineVaPlayer(ep),function(v){return v.url;});
  if(setting('streamServer')!=='all')out=out.filter(function(v){return v.label==='VaPlayer '+setting('streamServer');});
  if(!out.length)throw new Error('CineStream: no streams found. Try All available in source settings.');return audioMetadata(out);
}
