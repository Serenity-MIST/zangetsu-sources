// SPDX-License-Identifier: Apache-2.0
function languageCode(value){
  var s=String(value||'').trim().toLowerCase().replace(/_/g,'-');
  var names={english:'en',eng:'en',japanese:'ja',jpn:'ja',chinese:'zh',mandarin:'zh',chi:'zh',zho:'zh',korean:'ko',kor:'ko',hindi:'hi',hin:'hi',spanish:'es',spa:'es',french:'fr',fre:'fr',fra:'fr',german:'de',ger:'de',deu:'de',portuguese:'pt',por:'pt',russian:'ru',rus:'ru',arabic:'ar',ara:'ar',italian:'it',ita:'it',tamil:'ta',tam:'ta',telugu:'te',tel:'te'};
  if(names[s])return names[s];return /^[a-z]{2}(?:-[a-z0-9]{2,8})*$/.test(s)?s:null;
}
function languageName(code){return {en:'English',ja:'Japanese',zh:'Chinese',ko:'Korean',hi:'Hindi',es:'Spanish',fr:'French',de:'German',pt:'Portuguese',ru:'Russian',ar:'Arabic',it:'Italian',ta:'Tamil',te:'Telugu'}[String(code||'').split('-')[0]]||code;}
function hlsAttributes(line){var out={},re=/([A-Z0-9-]+)=(?:"([^"]*)"|([^,]*))/g,m;while((m=re.exec(line)))out[m[1]]=m[2]!=null?m[2]:m[3];return out;}
function playlistLanguages(body){
  var tracks=String(body).split(/\r?\n/).filter(function(l){return l.indexOf('#EXT-X-MEDIA:')===0;}).map(hlsAttributes).filter(function(t){return t.TYPE==='AUDIO';});
  return unique(tracks.map(function(t){return languageCode(t.LANGUAGE)||languageCode(t.NAME);}).filter(Boolean),function(x){return x;});
}
async function audioMetadata(streams){
  var override=setting('audioLanguage');
  return Promise.all(streams.map(async function(s){
    var known=languageCode(s.audioLang),langs=[];
    if(override&&override!=='auto')known=override;
    else if(s.container==='hls')try{var r=await fetch(s.url,{headers:s.headers||{},timeoutMs:4000});if(r.status>=200&&r.status<300)langs=playlistLanguages(r.body!=null?r.body:await r.text());}catch(e){/* Metadata is optional; never discard a playable stream. */}
    if(langs.length===1)known=langs[0];else if(langs.length>1)known=null;
    s.audioLang=known||null;
    var label=langs.length>1?'Audio: '+langs.map(languageName).join(', '):known?'Audio: '+languageName(known):'Audio: unspecified';
    s.label=(s.label||'Stream')+' · '+label;
    return s;
  }));
}
