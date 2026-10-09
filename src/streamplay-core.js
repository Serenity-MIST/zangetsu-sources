// SPDX-License-Identifier: GPL-3.0-or-later
// StreamPlay protocols adapted from Phisher98/Hexated; see NOTICE.md.
var streamPlaySettings=getSettings;
getSettings=function(){
  var rows=streamPlaySettings().filter(function(s){return s.key!=='streamServer'&&s.key!=='timeout';});
  rows.push(choice('backend','Playback backends',[
    ['all','Fastest available'],['vidlink','Vidlink'],['vaplayer','VaPlayer']
  ],'all'));
  return rows;
};
// Zangetsu's Auto Resolve budgets eight seconds for search, episodes and
// extraction together. Bound individual hops and cache successful metadata.
var spDeadline=0,spSearchOriginal=search,spHomeOriginal=getHome,spPopularOriginal=popular;
search=async function(query,page){spDeadline=Date.now()+7000;try{return await spSearchOriginal(query,page);}catch(e){throw Error(String(e.message||e).replace(/^CineStream:/,'StreamPlay:'));}};
getHome=async function(){spDeadline=0;return spHomeOriginal();};
popular=async function(page){spDeadline=0;return spPopularOriginal(page);};
cineJson=async function(url,h,body){
  if(spDeadline&&spDeadline<=Date.now())throw Error('StreamPlay request budget exhausted');
  var remaining=spDeadline?spDeadline-Date.now():4000;
  var cap=/\/catalog\//.test(url)?4000:2500;
  var opts={headers:h||{},timeoutMs:Math.max(100,Math.min(cap,remaining))};
  if(body!=null){opts.method='POST';opts.headers=Object.assign({},opts.headers,{'Content-Type':'application/json'});opts.body=JSON.stringify(body);}
  var r=await fetch(url,opts);if(r.status<200||r.status>=300)throw Error('HTTP '+r.status+' from '+origin(url));
  try{return JSON.parse(r.body!=null?r.body:await r.text());}catch(e){throw Error('Invalid JSON from '+origin(url));}
};
var spMetaOriginal=cineMeta,spMetaCache={};
cineMeta=async function(url){
  if(spDeadline<=Date.now())spDeadline=Date.now()+7000;
  var key=String(url).split('#')[0],cached=spMetaCache[key];
  if(cached&&Date.now()-cached.at<300000)return cached.value;
  var value=await spMetaOriginal(key);if(Object.keys(spMetaCache).length>=20)spMetaCache={};
  spMetaCache[key]={at:Date.now(),value:value};return value;
};
function spHeaders(input){
  var out={'User-Agent':CINE_UA};
  if(input&&typeof input==='object')Object.keys(input).forEach(function(k){
    var v=input[k];
    if(typeof v==='string'&&!/[\r\n]/.test(k+v)&&! /^(host|content-length|connection|cookie|authorization)$/i.test(k))out[k]=v;
  });
  return out;
}
function spCaptions(captions){
  return (Array.isArray(captions)?captions:[]).map(function(t){return {
    url:t.url||t.file,language:t.language||t.lang||t.label||'und'
  };});
}
function spVidlinkStreams(data){
  var stream=data&&data.stream;if(!stream||typeof stream!=='object')return [];
  var tracks=spCaptions(stream.captions),out=[];
  var qualities=stream.qualities;
  if(qualities&&typeof qualities==='object')Object.keys(qualities).sort(function(a,b){return parseInt(b,10)-parseInt(a,10);}).forEach(function(q){
    var v=qualities[q];if(!v||typeof v!=='object')return;
    var s=cineStream(v.url,'StreamPlay · Vidlink',spHeaders(v.headers),tracks,q);
    if(s){if(/hls|m3u8/i.test(v.type||''))s.container='hls';else if(/mp4|file/i.test(v.type||stream.type||''))s.container='mp4';s.audioLang=languageCode(v.language||stream.language);out.push(s);}
  });
  // Earlier upstream responses supplied one playlist instead of a qualities map.
  if(!out.length&&typeof stream.playlist==='string'){
    var headers={},m=stream.playlist.match(/[?&]headers=([^&]+)/);
    if(m)try{headers=JSON.parse(decodeURIComponent(m[1]));}catch(e){}
    var s=cineStream(stream.playlist,'StreamPlay · Vidlink',spHeaders(headers),tracks);
    if(s){s.container='hls';out.push(s);}
  }
  return out;
}
async function spVidlink(ep){
  if(!Number.isInteger(Number(ep.tmdb))||Number(ep.tmdb)<1)throw Error('Vidlink: this title has no TMDB ID');
  var encoded=await cineJson('https://enc-dec.app/api/enc-vidlink?text='+encodeURIComponent(ep.tmdb));
  if(encoded.status!==200||typeof encoded.result!=='string'||!encoded.result)throw Error('Vidlink: token service unavailable');
  var base='https://vidlink.pro',path=ep.type==='movie'?'/movie/':'/tv/';
  var url=base+'/api/b'+path+encodeURIComponent(encoded.result)+(ep.type==='series'?'/'+ep.season+'/'+ep.episode:'');
  return spVidlinkStreams(await cineJson(url,{Referer:base+'/',Origin:base,'User-Agent':CINE_UA}));
}
async function spVaPlayer(ep){
  if(!Number.isInteger(Number(ep.tmdb))||Number(ep.tmdb)<1)throw Error('VaPlayer: this title has no TMDB ID');
  var h={Referer:'https://nextgencloudfabric.com/','User-Agent':CINE_UA};
  var url='https://streamdata.vaplayer.ru/api.php?tmdb='+encodeURIComponent(ep.tmdb)+'&type='+(ep.type==='movie'?'movie':'tv&season='+ep.season+'&episode='+ep.episode);
  var data=await cineJson(url,h),d=data.data||{};
  return (Array.isArray(d.stream_urls)?d.stream_urls:[]).map(function(u,i){
    var s=cineStream(u,'StreamPlay · VaPlayer '+(i+1),h,d.default_subs);
    if(s)s.container='hls';return s;
  }).filter(Boolean);
}
async function spAvailable(streams){
  // Avoid returning CDN rate-limit/error pages as video links. HEAD does not
  // download a movie, unlike servers that ignore a small Range request.
  // Bounded parallel checks, rather than serial checks of every quality/server.
  // A HEAD timeout is inconclusive; Zangetsu already probes the returned URL.
  if(spDeadline&&spDeadline-Date.now()<100)return streams.slice(0,4);
  var checkBudget=Math.max(100,Math.min(600,spDeadline?spDeadline-Date.now():600));
  var out=await Promise.all(streams.slice(0,4).map(async function(s){try{
    var r=await fetch(s.url,{method:'HEAD',headers:s.headers||{},timeoutMs:checkBudget});
    return r.status>=200&&r.status<400||r.status===405||r.status===501?s:null;
  }catch(e){return s;}}));return out.filter(Boolean);
}
async function getVideoSources(url){
  if(spDeadline<=Date.now())spDeadline=Date.now()+4400;
  var marker=String(url).split('#cine=')[1];if(!marker)throw Error('StreamPlay: refresh the episode list');
  var ep;try{ep=JSON.parse(decodeURIComponent(marker));}catch(e){throw Error('StreamPlay: invalid episode');}
  if(!ep||!/^tt\d+$/.test(ep.id)||! /^(movie|series)$/.test(ep.type)||ep.type==='series'&&(!Number.isInteger(ep.season)||ep.season<1||!Number.isInteger(ep.episode)||ep.episode<1))throw Error('StreamPlay: invalid episode');
  var selected=setting('backend'),errors=[],backends=[['vidlink',spVidlink],['vaplayer',spVaPlayer]];
  var active=backends.filter(function(b){return selected==='all'||selected===b[0];});
  var out=await new Promise(function(resolve){var remaining=active.length;
    active.forEach(async function(b){try{
      var rows=await spAvailable(unique(await b[1](ep),function(s){return s.url;}));
      if(rows.length){resolve(rows);return;}errors.push(b[0]+': no available streams');
    }catch(e){errors.push(b[0]+': '+e.message);}
    if(--remaining===0)resolve([]);
    });
  });
  if(!out.length)throw Error('StreamPlay: no playable sources. '+(errors.join('; ')||'The streaming servers are unavailable or rate limited; retry shortly.'));
  // Avoid an extra HLS download per stream while resolving playback. Honour
  // explicit language overrides; the player can discover HLS audio tracks.
  var override=setting('audioLanguage');out.forEach(function(s){
    s.audioLang=override&&override!=='auto'?override:languageCode(s.audioLang);
    s.label+=' · '+(s.audioLang?'Audio: '+languageName(s.audioLang):'Audio: unspecified');
  });return out;
}
