// SPDX-License-Identifier: GPL-3.0-or-later
// Catalog helpers are CSX-derived; stream protocol adapted from Yuzono Cineby (Apache-2.0).
// This overrides only the new Cineby bundle; existing CineStream stays on VaPlayer.
var cinebyBaseSettings=getSettings;
getSettings=function(){return cinebyBaseSettings().filter(function(s){return s.key!=='streamServer'&&s.key!=='audioLanguage';});};
async function getVideoSources(url){
  var marker=String(url).split('#cine=')[1];if(!marker)throw Error('Cineby: refresh the episode list');
  var ep=JSON.parse(decodeURIComponent(marker));if(!ep.tmdb)throw Error('Cineby: this title is missing its TMDB ID');
  var base='https://api.speedracelight.com',h={Origin:'https://www.cineby.at',Referer:'https://www.cineby.at/','User-Agent':CINE_UA};
  var seed=(await cineJson(base+'/seed?mediaId='+encodeURIComponent(ep.tmdb),h)).seed;if(!seed)throw Error('Cineby: session unavailable');
  var fields={mediaType:ep.type==='series'?'tv':'movie',year:ep.year,episodeId:ep.episode||1,seasonId:ep.season||1,tmdbId:ep.tmdb,imdbId:ep.id,enc:2,seed:seed};
  var q='title='+encodeURIComponent(encodeURIComponent(ep.title));Object.keys(fields).forEach(function(k){q+='&'+k+'='+encodeURIComponent(fields[k]);});
  var r=await fetch(base+'/cdn/sources-with-title?'+q,{headers:h,timeoutMs:Number(setting('timeout'))||12000});if(r.status<200||r.status>=300)throw Error('Cineby: streaming server HTTP '+r.status);
  var d=await cineJson('https://enc-dec.app/api/dec-videasy',{}, {text:r.body!=null?r.body:await r.text(),id:String(ep.tmdb),seed:seed});
  if(d.status!==200||!d.result)throw Error('Cineby: could not decode stream response');
  var data=d.result,tracks=(data.subtitles||[]).map(function(t){return {url:t.url,language:t.language||t.lang};});
  var rows=data.sources||[];if(!rows.length&&data.url)rows=[{url:data.url}];
  var out=unique(rows.map(function(v){return cineStream(v.url,'Videasy · Yoru',{Referer:h.Referer,'User-Agent':CINE_UA},tracks,v.quality);}).filter(Boolean),function(v){return v.url;});
  if(!out.length)throw Error('Cineby: no streams for this title');return out;
}
