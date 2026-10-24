import {renderPoster} from './lib/poster';
import {applyCaption} from './lib/caption-settings';
import {bingArticleURL,bingImageURL} from './lib/bing-rss';
export {renderPoster,applyCaption};
export function parseFeeds(feeds:any[],minutes:number,now:number){
 const items:any[]=[];const clean=(s:string)=>new DOMParser().parseFromString(s,'text/html').body.textContent?.trim()||'';
 for(const f of feeds){if(!f.xml)continue;const doc=new DOMParser().parseFromString(f.xml,'text/xml');if(doc.querySelector('parsererror'))continue;
 for(const n of Array.from(doc.querySelectorAll('item,entry')).slice(0,100)){
 const val=(s:string)=>n.getElementsByTagName(s)[0]?.textContent?.trim()||'';
 const desc=val('description')||val('summary');const html=new DOMParser().parseFromString(desc,'text/html');const media=Array.from(n.getElementsByTagName('*')).find(x=>['media:content','media:thumbnail','enclosure'].includes(x.tagName)&&x.getAttribute('url')&&!x.getAttribute('type')?.startsWith('video/'));
 const date=val('pubDate')||val('published')||val('dc:date')||val('updated');const ms=Date.parse(date);if(!Number.isFinite(ms)||ms>now||ms<now-minutes*60000)continue;
 const title=clean(val('title')),link=bingArticleURL(val('link')||n.querySelector('link')?.getAttribute('href')||'');if(!title||!/^https?:\/\//.test(link))continue;
 items.push({title,description:clean(desc),link,date,source:new URL(f.url).hostname,image:bingImageURL(media?.getAttribute('url')||html.querySelector('img')?.getAttribute('src')||val('News:Image'))});
 }}
 const seen=new Set<string>();return items.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).filter(a=>{const key=a.title.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]/gu,'');if(seen.has(key))return false;seen.add(key);return true});
}
