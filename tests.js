const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const manifest=require('./index.json');
function load(file,handler){const calls=[];const c={fetch:async(url,options)=>{calls.push({url,options});const r=await handler(url,options);return {status:200,body:typeof r==='string'?r:JSON.stringify(r)};}};vm.createContext(c);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,file),'utf8'),c);c.calls=calls;return c;}
async function main(){
for(const s of manifest.sources){const c=load(s.file,()=> '');assert.equal(c.getInfo().type,s.type);assert.equal(c.getInfo().version,s.version);for(const f of ['search','popular','getHome','getDetail','getEpisodes',s.type==='anime'?'getVideoSources':'getPages'])assert.equal(typeof c[f],'function');}
const cards='<div class="ani items"><div class="item"><div class="poster"><img data-src="/cover.jpg"></div><a class="name" href="/anime/demo/ep-1">Demo &amp; Test</a></div></div>';
let anime=load('serenity-anikoto.js',u=>{if(u.includes('/filter?'))return cards;if(u.includes('/ajax/episode/list/'))return {result:'<li><a data-ids="a,b" data-num="1.5"></a><span class="d-title">Special</span></li>'};return '<h1 class="title">Demo</h1><div data-id="123"></div>';});
assert.equal(anime.rc4('Key','Plaintext'),'u_MW6NlArwrT');
let items=await anime.search('Demo & Test',2);assert.equal(items[0].title,'Demo & Test');assert.equal(items[0].url,'https://anikototv.to/anime/demo');assert.match(anime.calls[0].url,/page=2/);
let eps=await anime.getEpisodes(items[0].url);assert.equal(eps[0].number,1.5);assert.match(eps[0].title,/Special/);assert.equal(JSON.parse(decodeURIComponent(eps[0].url.split('#zangetsu=')[1])).ids,'a,b');
anime=load('serenity-anikoto.js',u=>{if(u.includes('/ajax/server/list'))return {result:'<div class="type"><label>Sub</label><ul><li data-link-id="dead">HD-1</li><li data-link-id="ok">VidCloud-1</li></ul></div>'};if(u.includes('get=dead'))throw Error('Offline');if(u.includes('get=ok'))return {result:{url:'https://player.example/e/sub'}};if(u.includes('/stream/getSources'))return {sources:'https://cdn.example/video.m3u8',tracks:[{kind:'captions',file:'/en.vtt',label:'English'}]};return '<div data-id="xyz"></div>';});
let videos=await anime.getVideoSources(eps[0].url);assert.equal(videos.length,1);assert.equal(videos[0].container,'hls');assert.equal(videos[0].subtitles[0].url,'https://player.example/en.vtt');assert.equal(videos[0].headers.Referer,'https://player.example/');
const proxy=load('serenity-anikoto.js',()=>({result:'<li data-link-id="x">Kiwi-Stream</li>'}));await assert.rejects(()=>proxy.getVideoSources(eps[0].url),/Android proxy/);
const broken=load('serenity-anikoto.js',()=>'<html>error</html>');await assert.rejects(()=>broken.request('https://example.com',null,true),/invalid JSON/);
let manga=load('serenity-manganato.js',u=>u.includes('/api/manga/')?{success:true,data:{chapters:[{chapter_slug:'chapter-2',chapter_name:'Second',chapter_num:2},{chapter_slug:'chapter-1',chapter_name:'First',chapter_num:1}]}}:'<script>const cdns=["https://images.example"];const chapterImages=["book/1.jpg","book/2.jpg"];</script>');
let chapters=await manga.getEpisodes('https://www.natomanga.com/manga/demo');assert.equal(chapters[0].title,'First');assert.equal(chapters[0].url,'https://www.natomanga.com/manga/demo/chapter-1');let pages=await manga.getPages(chapters[0].url);assert.equal(pages.length,2);assert.equal(pages[0].url,'https://images.example/book/1.jpg');assert.equal(pages[0].headers.Referer,chapters[0].url);
manga=load('serenity-manganato.js',()=>'<div class="container-chapter-reader"><img src="//images.example/1.jpg"></div>');assert.equal((await manga.getPages(chapters[0].url))[0].url,'https://images.example/1.jpg');assert.equal(manga.normalizeQuery('Café: Test!'),'cafe_test');assert.throws(()=>manga.absolute('javascript:alert(1)','https://example.com'),/Invalid/);
console.log('PASS: four provider contracts, catalogue, RC4 vector, episodes, mirror failure isolation, captions, proxy errors, malformed JSON, chapters and both image formats.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});

