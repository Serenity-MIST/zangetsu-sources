// SPDX-License-Identifier: Apache-2.0
// Read at call time: Zangetsu can update settings without reloading the source.
function setting(key) {
  var schema=getSettings().filter(function(s){return s.key===key;})[0];
  if(!schema)return undefined;
  var id=typeof __SOURCE_ID==='string'?__SOURCE_ID:SOURCE_ID;
  var saved=typeof __settings==='object'&&__settings[id]||{}, value=saved[key];
  if(schema.type==='bool')return typeof value==='boolean'?value:schema.default;
  if(schema.type==='enum')return schema.options.some(function(o){return o.value===value;})?value:schema.default;
  if(schema.type==='multiEnum')return Array.isArray(value)?value.filter(function(v){return schema.options.some(function(o){return o.value===v;});}):schema.default.slice();
  return typeof value==='string'?value:schema.default;
}
function choice(key,label,values,initial){return {key:key,label:label,type:'enum',default:initial,options:values.map(function(v){return {value:v[0],label:v[1]};})};}
function getSettings(){
  var out=[choice('audioLanguage','Audio language (when missing or incorrect)',[['auto','Detect automatically'],['en','English'],['ja','Japanese'],['zh','Chinese'],['ko','Korean'],['hi','Hindi'],['es','Spanish'],['fr','French'],['de','German'],['pt','Portuguese'],['ru','Russian'],['ar','Arabic']],'auto'),choice('timeout','Request timeout',[['8000','8 seconds'],['12000','12 seconds']],'12000')];
  if(TYPE==='anime')out=out.concat([
    choice('audio','Episode audio',[['both','Sub and dub'],['sub','Sub only'],['dub','Dub only']],'both'),
    {key:'subtitles',label:'Include subtitle tracks',type:'bool',default:true}
  ]);
  if(TYPE==='anime')out.push(choice('homeOrder','Show first on home',[['popular','Popular'],['latest','Latest updates']],'popular'));
  if(TYPE==='movie')out=out.concat([
    choice('streamServer','Stream servers',[['all','All available'],['1','Server 1'],['2','Server 2'],['3','Server 3']],'all'),
    choice('sameTitle','When a movie and series share a title',[['series','Prefer series'],['movie','Prefer movie']],'series'),
    choice('catalog','Browse and search',[['both','Movies and series'],['movie','Movies'],['series','Series']],'both'),
    {key:'subtitles',label:'Include subtitle tracks',type:'bool',default:true}
  ]);
  return out;
}
function homeOrder(rows){return setting('homeOrder')==='latest'?rows.slice().reverse():rows;}
