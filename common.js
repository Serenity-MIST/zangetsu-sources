// Shared runtime helpers. No Node, DOM, browser cookies or remote code execution.
function text(value) {
  return String(value || '').replace(/<[^>]*>/g, '')
    .replace(/&#x([\da-f]+);/gi, function(_, n) { return String.fromCodePoint(parseInt(n, 16)); })
    .replace(/&#(\d+);/g, function(_, n) { return String.fromCodePoint(+n); })
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
function attrs(raw) {
  var out = {}, re = /([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, m;
  while ((m = re.exec(raw))) out[m[1].toLowerCase()] = text(m[2] != null ? m[2] : m[3] != null ? m[3] : m[4] || '');
  return out;
}
// Small non-executing tree parser for the HTML selectors used by these sources.
function html(raw) {
  var root = {tag: '#root', a: {}, children: [], parent: null}, stack = [root];
  var tokens = String(raw).match(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<\/?[a-zA-Z][^>]*>|[^<]+/g) || [];
  tokens.forEach(function(t) {
    if (/^<!--|^<(script|style)\b/i.test(t)) return;
    if (/^<\//.test(t)) {
      var end = t.match(/^<\/([^\s>]+)/)[1].toLowerCase();
      for (var i = stack.length - 1; i > 0; i--) if (stack[i].tag === end) { stack.length = i; break; }
      return;
    }
    var parent = stack[stack.length - 1];
    if (t.charAt(0) !== '<') { parent.children.push({tag:'#text', value:text(t), children:[], a:{}, parent:parent}); return; }
    var m = t.match(/^<([^\s/>]+)([\s\S]*?)\/?\s*>$/); if (!m) return;
    var node = {tag:m[1].toLowerCase(), a:attrs(m[2]), children:[], parent:parent}; parent.children.push(node);
    if (!/^(img|input|br|hr|meta|link|source|area|base|embed|param|track|wbr)$/.test(node.tag) && !/\/\s*>$/.test(t)) stack.push(node);
  });
  return root;
}
function all(node, predicate) {
  var out = []; function walk(n) { n.children.forEach(function(c) { if(predicate(c)) out.push(c); walk(c); }); } walk(node); return out;
}
function first(node, predicate) { return all(node, predicate)[0] || null; }
function has(node, cls) { return (' ' + (node.a.class || '') + ' ').indexOf(' ' + cls + ' ') >= 0; }
function content(node) { return node ? (node.tag === '#text' ? node.value : node.children.map(content).join(' ')).replace(/\s+/g,' ').trim() : ''; }
function origin(url) { var m=String(url).match(/^https?:\/\/[^/]+/i); if(!m) throw new Error('Expected HTTP URL'); return m[0]; }
function absolute(url, base) {
  url=text(url); if(/^https?:\/\//i.test(url)) return url;
  if(url.indexOf('//')===0) return 'https:'+url;
  if(!url || /^[a-z][a-z0-9+.-]*:/i.test(url)) throw new Error('Invalid source URL');
  var root=origin(base || SITE), path=url.charAt(0)==='/' ? url : String(base || SITE+'/').split(/[?#]/)[0].replace(/[^/]*$/,'')+url;
  if(/^https?:/.test(path)) path=path.slice(origin(path).length);
  var parts=[]; path.split('/').forEach(function(p){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);});
  return root+parts.join('/');
}
function pathOf(url) { return String(url).replace(/^https?:\/\/[^/]+/i,'').split(/[?#]/)[0]; }
function pageNum(p) { p=Math.floor(Number(p)||1); return Math.max(1,p); }
function headers(ref) { return {Referer:ref || SITE+'/'}; }
async function request(url, ref, json) {
  var h=headers(ref); if(json){h.Accept='application/json, text/javascript, */*; q=0.01';h['X-Requested-With']='XMLHttpRequest';}
  var res=await fetch(url,{headers:h,timeoutMs:12000});
  if(res.status<200 || res.status>=300) throw new Error(NAME+': HTTP '+res.status+' from '+origin(url));
  var body=res.body != null ? res.body : await res.text();
  if(json){try{return JSON.parse(body);}catch(e){throw new Error(NAME+': source returned invalid JSON');}}
  if(/<title>\s*(Just a moment|Attention Required)/i.test(body)) throw new Error(NAME+': open the source in the app WebView to complete its browser check');
  return body;
}
function unique(items, key) { var seen={}; return items.filter(function(x){var k=key(x);if(seen[k])return false;seen[k]=true;return true;}); }
function getInfo() { return {name:NAME,lang:'en',baseUrl:SITE,logo:SITE+'/favicon.ico',type:TYPE,version:VERSION}; }
function item(url,title,cover) { return {id:pathOf(url),title:title,url:url,cover:cover || null,coverHeaders:headers(),type:TYPE,sourceId:SOURCE_ID}; }
