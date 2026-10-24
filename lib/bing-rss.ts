/** Keep saved feed URLs intact; apply Turkish market defaults only to Bing News requests. */
export function bingFeedURL(value:string){
 const u=new URL(value);
 if((u.hostname==='www.bing.com'||u.hostname==='bing.com')&&u.pathname==='/news/search'){
  u.searchParams.set('format','RSS');
  for(const [key,v] of Object.entries({mkt:'tr-TR',cc:'TR',setlang:'tr',sortby:'date'}))if(!u.searchParams.has(key))u.searchParams.set(key,v);
 }
 return u.href;
}
export function bingArticleURL(value:string){
 try{const u=new URL(value);if((u.hostname==='www.bing.com'||u.hostname==='bing.com')&&u.pathname==='/news/apiclick.aspx'){
  const target=new URL(u.searchParams.get('url')||'');if(['https:','http:'].includes(target.protocol)&&!target.username&&!target.password)return target.href;
 }}catch{}return value;
}
export function bingImageURL(value:string){
 try{const u=new URL(value);if(u.hostname==='www.bing.com'||u.hostname==='bing.com')u.protocol='https:';return u.href}catch{return value}
}
