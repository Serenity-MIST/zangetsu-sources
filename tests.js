const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const manifest=require('./index.json');
function load(file,handler){const calls=[];const c={fetch:async(url,options)=>{calls.push({url,options});const r=await handler(url,options);return {status:200,body:typeof r==='string'?r:JSON.stringify(r)};}};vm.createContext(c);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,file),'utf8'),c);c.calls=calls;return c;}
async function main(){
for(const s of manifest.sources){const c=load(s.file,()=> '');assert.equal(c.getInfo().type,s.type);assert.equal(c.getInfo().version,s.version);for(const f of ['search','popular','getHome','getDetail','getEpisodes',s.type!=='manga'?'getVideoSources':'getPages'])assert.equal(typeof c[f],'function');}
const cards='<div class="ani items"><div class="item"><div class="poster"><img data-src="/cover.jpg"></div><a class="name" href="/anime/demo/ep-1">Demo &amp; Test</a></div></div>';
let anime=load('serenity-anikoto.js',u=>{if(u.includes('/filter?'))return cards;if(u.includes('/ajax/episode/list/'))return {result:'<li><a data-ids="a,b" data-num="1.5"></a><span class="d-title">Special</span></li>'};return '<h1 class="title">Demo</h1><div data-id="123"></div>';});
assert.equal(anime.rc4('Key','Plaintext'),'u_MW6NlArwrT');
let items=await anime.search('Demo & Test',2);assert.equal(items[0].title,'Demo & Test');assert.equal(items[0].url,'https://anikototv.to/anime/demo');assert.match(anime.calls[0].url,/page=2/);
let eps=await anime.getEpisodes(items[0].url);assert.equal(eps[0].number,1.5);assert.match(eps[0].title,/Special/);assert.equal(JSON.parse(decodeURIComponent(eps[0].url.split('#zangetsu=')[1])).ids,'a,b');
anime=load('serenity-anikoto.js',u=>{if(u.includes('/ajax/server/list'))return {result:'<div class="type"><label>Sub</label><ul><li data-link-id="dead">HD-1</li><li data-link-id="ok">VidCloud-1</li></ul></div>'};if(u.includes('get=dead'))throw Error('Offline');if(u.includes('get=ok'))return {result:{url:'https://player.example/e/sub'}};if(u.includes('/stream/getSources'))return {sources:'https://cdn.example/video.m3u8',tracks:[{kind:'captions',file:'/en.vtt',label:'English'}]};return '<div data-id="xyz"></div>';});
let videos=await anime.getVideoSources(eps[0].url);assert.equal(videos.length,1);assert.equal(videos[0].container,'hls');assert.equal(videos[0].subtitles[0].url,'https://player.example/en.vtt');assert.equal(videos[0].headers.Referer,'https://player.example/');
const proxy=load('serenity-anikoto.js',()=>({result:'<li data-link-id="x">Kiwi-Stream</li>'}));await assert.rejects(()=>proxy.getVideoSources(eps[0].url),/Android proxy/);
const broken=load('serenity-anikoto.js',()=>'<html>error</html>');await assert.rejects(()=>broken.request('https://example.com',null,true),/invalid JSON/);
console.log('PASS: four provider contracts, catalogue, RC4 vector, episodes, mirror failure isolation, captions, proxy errors, malformed JSON.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});

const crypto=require('node:crypto');
const decoder=load('serenity-anikoto.js',()=> '');
for(const payload of [{file:'https://example.com/master.m3u8'},[{file:'https://example.com/long/path/master.m3u8?test=1'}]]){
 const key=Buffer.alloc(32);key.write('i?LMTAx0Q6,:}50U');const cipher=crypto.createCipheriv('aes-256-cbc',key,Buffer.from("W0;27ToaUpl_P%'c"));const enc=Buffer.concat([cipher.update(JSON.stringify(payload),'utf8'),cipher.final()]).toString('base64url');assert.equal(JSON.stringify(decoder.decodePlayerSources(enc)),JSON.stringify(payload));assert.equal(decoder.sourceFiles({enc})[0],Array.isArray(payload)?payload[0].file:payload.file);
}
for(const sources of ['https://example.com/a.m3u8',{file:'https://example.com/a.m3u8'},[{file:'https://example.com/a.m3u8'}]])assert.equal(decoder.sourceFiles({sources})[0],'https://example.com/a.m3u8');
assert.throws(()=>decoder.decodePlayerSources('bad'),/Invalid/);
console.log('PASS: encrypted source decoding against Node crypto and string/object/array source formats.');
const sample='https://example.com/anime/0123456789abcdef0123456789abcdef/fedcba9876543210fedcba9876543210/master.m3u8';const now=1789460000000;const msg=(Math.floor(now/1000)+90)+'|0123456789abcdef0123456789abcdef/fedcba9876543210fedcba9876543210';const expected=Buffer.from(msg).toString('base64url')+'.'+crypto.createHmac('sha256','MpCdnT0k3n!9f2K#xQ7vL5mR8wN1pY4s').update(msg).digest('base64url');assert.equal(decoder.signPlayerUrl(sample,now),sample+'?token='+expected);assert.equal(decoder.signPlayerUrl(sample+'?token=existing',now),sample+'?token=existing');assert.equal(decoder.signPlayerUrl('https://example.com/plain.m3u8',now),'https://example.com/plain.m3u8');console.log('PASS: CDN signature matches independent HMAC-SHA256 implementation.');
