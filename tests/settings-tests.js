const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
function load(file,handler){const calls=[],c={__SOURCE_ID:'installed-provider-id',__settings:{},fetch:async(u,o)=>{calls.push({u,o});const body=await handler(u,o);return {status:200,body:typeof body==='string'?body:JSON.stringify(body)};}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),c);c.calls=calls;c.save=x=>{c.__settings[c.__SOURCE_ID]=x;};return c;}
async function main(){
for(const entry of require('../index.json').sources){const c=load(entry.file,()=>''),keys=new Set();for(const s of c.getSettings()){assert(!keys.has(s.key));keys.add(s.key);assert(s.label);assert(['enum','multiEnum','bool','text'].includes(s.type));if(s.options){assert(s.options.length);if(s.type==='enum')assert(s.options.some(x=>x.value===s.default));}assert.notEqual(c.setting(s.key),undefined);}c.save({timeout:'garbage'});assert.equal(c.setting('timeout'),'12000');c.save({timeout:'8000'});assert.equal(c.setting('timeout'),'8000');}
const a=load('serenity-anikoto.js',u=>{
  if(u.includes('/ajax/server/list'))return {result:'<div class="type"><label>Sub</label><li data-link-id="sub">HD-1</li></div><div class="type"><label>Dub</label><li data-link-id="dub">HD-1</li></div>'};
  if(u.includes('/ajax/server?'))return {result:{url:'https://video.example/'+(u.includes('get=dub')?'dub':'sub')+'.m3u8'}};
  return '';
});
const ep='https://anikototv.to/demo#zangetsu='+encodeURIComponent(JSON.stringify({ids:'sub,dub',epurl:'/demo/ep-1'}));
a.save({audio:'dub',timeout:'8000',subtitles:false});let out=await a.getVideoSources(ep);assert.equal(out.length,1);assert.equal(out[0].kind,'dub');assert(!a.calls.some(x=>x.u.includes('get=sub')));assert(a.calls.filter(x=>x.u.includes('/ajax/')).every(x=>x.o.timeoutMs===8000));
assert.equal(a.stream('https://video.example/test.m3u8',{name:'HD',kind:'sub'},'https://video.example/',[{kind:'captions',file:'/en.vtt'}]).subtitles.length,0);
a.save({audio:'sub',subtitles:true,homeOrder:'latest'});out=await a.getVideoSources(ep);assert.equal(out[0].kind,'sub');assert.equal(a.homeOrder([{title:'Popular'},{title:'Latest'}])[0].title,'Latest');assert.equal(a.stream('https://video.example/test.m3u8',{name:'HD',kind:'sub'},'https://video.example/',[{kind:'captions',file:'/en.vtt'}]).subtitles.length,1);
const c=load('serenity-cinestream.js',u=>{
  if(u.includes('/api.php'))return {data:{stream_urls:['https://video.example/one.m3u8','https://video.example/two.m3u8','https://video.example/three.m3u8']},default_subs:[{url:'https://video.example/en.vtt',lang:'English'}]};
  if(u.includes('/meta/'))return {meta:{id:'tt1234',name:'A Series',type:'series',videos:[{season:0,episode:1,title:"Special",released:"2010-01-01"},{season:2,episode:1,title:'New',released:'2020-01-01'},{season:1,episode:1,title:'Pilot',released:'2019-01-01'},{season:3,episode:1,title:'Future',released:'2999-01-01'}]}};
  return {metas:[{id:'tt1234',type:u.includes('/movie/')?'movie':'series',name:'Test'}]};
});
c.save({catalog:'series',streamServer:'2',subtitles:false});let results=await c.search('A & B',1);assert.equal(results.length,1);assert(c.calls[0].u.includes('search=A%20%26%20B.json'));await c.popular(2);assert(c.calls[1].u.includes('skip=50.json'));assert.equal((await c.search('Test',2)).length,0);
let detail=await c.getDetail('https://v3-cinemeta.strem.io/meta/series/tt1234.json');assert.equal(detail.episodes.length,2);assert.match(detail.episodes[0].title,/^S1E1/);assert.notEqual(detail.episodes[0].id,detail.episodes[1].id);
out=await c.getVideoSources(detail.episodes[1].url);assert.equal(out.length,1);assert.match(out[0].label,/^VaPlayer 2/);assert.equal(out[0].subtitles.length,0);assert.equal(out[0].headers.Referer,'https://nextgencloudfabric.com/');assert(c.calls.filter(x=>x.u.includes('/api.php')).at(-1).u.includes('type=tv&season=2&episode=1'));
c.save({streamServer:'all',subtitles:true});out=await c.getVideoSources(detail.episodes[0].url);assert.equal(out.length,3);assert.equal(out[0].subtitles[0].lang,'en');
const movie=c.cineEpisodes({id:'tt1234',type:'movie',name:'Movie'});assert.equal(movie.length,1);await c.getVideoSources(movie[0].url);assert.match(c.calls.filter(x=>x.u.includes('/api.php')).at(-1).u,/type=movie$/);
await assert.rejects(()=>c.getVideoSources('invalid'),/refresh/);assert.throws(()=>c.cineIdentity('https://example.com/unrelated'),/refresh/);
const same=[{title:'The Mentalist',tmdbIsTv:false},{title:'The Mentalist',tmdbIsTv:true}];
assert.equal(c.rankCineSearch(same,'The Mentalist')[0].tmdbIsTv,true);c.save({sameTitle:'movie'});assert.equal(c.rankCineSearch(same,'The Mentalist')[0].tmdbIsTv,false);
assert.equal(a.languageCode('English'),'en');assert.equal(a.languageCode('jpn'),'ja');assert.equal(a.languageCode('unknown'),null);
assert.equal(a.playlistLanguages('#EXTM3U\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="a",NAME="English",LANGUAGE="en"')[0],'en');
a.save({audioLanguage:'ja'});assert.equal((await a.audioMetadata([{url:'https://example.com/a.mp4',container:'mp4',label:'Test'}]))[0].audioLang,'ja');
a.save({audioLanguage:'auto'});assert.equal((await a.audioMetadata([{url:'https://example.com/a.mp4',container:'mp4',label:'Test'}]))[0].audioLang,null);
console.log('PASS: settings schema, runtime source ID, live setting changes, audio filtering, timeout, captions, home order, CineStream catalog, search, paging, seasons, future episodes, movies, server selection and headers.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
