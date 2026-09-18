const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
function card(title,jp,url){return '<div class="item"><a class="name" href="'+url+'" data-jp="'+jp+'">'+title+'</a></div>';}
(async()=>{
 for(const [name,host,second] of [['anikoto','anikototv.to','youjo-senki-ii'],['animekai','animekaitv.to','youjo-senki-ii-goyvj'],['aniwave','animewave.to','youjo-senki-ii']]){
  const first='https://'+host+'/watch/the-saga-of-tanya-the-evil-mkgcv',s2='https://'+host+'/watch/'+second;
  const markup='<div class="ani items">'+card('Saga of Tanya the Evil Season 2','Youjo Senki II',s2+'/ep-1')+card('The Saga of Tanya the Evil','Youjo Senki',first+'/ep-1')+'</div>';
  const c={fetch:async()=>({status:200,body:markup})};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','serenity-'+name+'.js'),'utf8'),c);
  for(const query of ['Saga of Tanya the Evil','The Saga of Tanya the Evil','Youjo Senki']){const rows=await c.search(query,1);assert.equal(rows.length,1);assert.equal(rows[0].url,first);assert([rows[0].title,rows[0].englishTitle].includes(query));}
  for(const query of ['Saga of Tanya the Evil Season 2','Youjo Senki II']){const rows=await c.search(query,1);assert.equal(rows.length,1);assert.equal(rows[0].url,s2);}
  const make=title=>({title,url:'https://'+host+'/'+encodeURIComponent(title)});
  let rows=c.rankAnimeResults([make('Example Season 2 Part 2'),make('Example Season 2 Part 1')],'Example Season 2 Part 1');assert.equal(rows.length,1);assert.equal(rows[0].title,'Example Season 2 Part 1');
  assert.equal(c.rankAnimeResults([make('Example Season 2')],'Example').length,0);
  assert.equal(c.rankAnimeResults([make('Example 2nd Season')],'Example Season 2').length,1);
  assert.equal(c.rankAnimeResults([make('Example Season 1')],'Example').length,1);
  assert.equal(c.rankAnimeResults([make('Example II'),make('Example')],'Example II').length,1);
  assert.equal(c.rankAnimeResults([make('Example Season 2'),make('Example')],'Exam').length,2);
  assert.notEqual(c.animeIdentity('Example: The Movie'),c.animeIdentity('Example'));
  assert.notEqual(c.animeIdentity('Example Part 2'),c.animeIdentity('Example Part 1'));
 }
 const manifest=require('../index.json');assert.equal(manifest.sources.length,5);assert(!manifest.sources.some(s=>/animegg|animedex/.test(s.id)));assert(manifest.sources.every(s=>s.version==='0.2.7'));
 console.log('PASS: all three source domains, original/sequel selection, English/Romaji aliases, parts, ordinal/Roman season labels, missing-season refusal, broad searches and five-source manifest.');
})().catch(e=>{console.error(e);process.exitCode=1});
