import {chromium} from 'playwright';
import {build} from 'esbuild';
import {writeFile,readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const origin='https://tnf-media.mehmetofficial71.chatgpt.site';
async function identity(){
 const url=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL||'');
 if(url.protocol!=='https:'||!url.hostname.endsWith('.actions.githubusercontent.com'))throw Error('Not a GitHub Actions identity endpoint');
 url.searchParams.set('audience','tnf-otomasyon');
 const r=await fetch(url,{redirect:'error',headers:{Authorization:'Bearer '+process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN},signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error('GitHub identity request failed');const d=await r.json();if(!d.value)throw Error('Missing identity');return d.value;
}
let lease='';
async function call(action,body={},binary=false){
 const r=await fetch(origin+'/runner?action='+action,{method:'POST',redirect:'error',headers:{'Authorization':'Bearer '+await identity(),'X-TNF-Lease':lease,'Content-Type':binary?'video/mp4':'application/json'},body:binary?body:JSON.stringify(body),signal:AbortSignal.timeout(90000)});
 if(!r.ok)throw new Error('TNF '+action+' failed: HTTP '+r.status);
 if(action==='image'){const mime=r.headers.get('content-type');if(!mime?.startsWith('image/'))throw Error('Invalid image');return 'data:'+mime+';base64,'+Buffer.from(await r.arrayBuffer()).toString('base64')}
 const data=await r.json();if(data.error)throw Error('TNF '+action+' failed');if(data.status==='paused'&&lease)throw Error('Stopped by owner');return data;
}
const probe=process.env.TNF_PROBE==='true';
if(probe){const d=await call('probe');if(!d.ok)throw Error('Probe failed');console.log('TNF connection verified; no news published.');process.exit(0)}
const job=await call('claim');
if(job.status!=='claimed'){console.log('TNF status: '+job.status);process.exit(0)}
lease=job.lease;let browser;let dir;let message='İşlem tamamlanamadı. Yayın geçmişini kontrol edin.';
try{
 const all=[];for(let i=0;i<job.feeds.length;i+=5){const d=await call('feed',{urls:job.feeds.slice(i,i+5)});all.push(...d.feeds)}
 if(!all.some(x=>x.xml))throw Error('RSS sources unavailable');
 const compiled=await build({entryPoints:['render.ts'],bundle:true,write:false,format:'iife',globalName:'TNF',platform:'browser'});
 browser=await chromium.launch({headless:true});const page=await browser.newPage();
 // Renderer is offline: external images are supplied as data URLs through the authenticated image endpoint.
 await page.route('**/*',route=>route.abort());await page.setContent('<html><body></body></html>');await page.addScriptTag({content:compiled.outputFiles[0].text});
 const items=await page.evaluate(({all,minutes,now})=>TNF.parseFeeds(all,minutes,now),{all,minutes:job.minutes,now:job.now});
 const p=job.profile;const mode=['photo','reel','both'].includes(p.publishContent)?p.publishContent:p.posterVideo?'both':'photo';
 const a=items.find(a=>!job.jobs.some(j=>j.key===a.link||j.key===a.link+':poster-video'));
 if(!a){message='Yeni paylaşılmamış haber yok.';console.log('No new unpublished news.')}else{
  const resolved=await call('resolve',{title:a.title,link:a.link,image:a.image,replace:p.photoPolicy==='alternative'});a.image=await call('image',{url:resolved.image});a.archive=!!resolved.archive;
  if(p.brandLogo&&!p.brandLogo.startsWith('data:'))p.brandLogo=await call('image',{url:p.brandLogo});
  const rendered=await page.evaluate(async({a,p})=>{const article=TNF.applyCaption({...a,...p,image:a.image},p);const canvas=document.createElement('canvas');const r=await TNF.renderPoster(canvas,article,p.brandColor||'#8247e5',p.brandLogo||'');if(!r.ready)throw Error(r.error);return {jpeg:canvas.toDataURL('image/jpeg',.9),title:article.title,caption:article.description}}, {a,p});
  if(Array.from(rendered.caption).length>2200)throw Error('Caption exceeds Instagram limit');
  let video;
  if(mode!=='photo'){
   dir=await mkdtemp(join(tmpdir(),'tnf-'));await writeFile(join(dir,'poster.jpg'),Buffer.from(rendered.jpeg.split(',')[1],'base64'));
   execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-loop','1','-i',join(dir,'poster.jpg'),'-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=48000','-t','10','-r','30','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',join(dir,'poster.mp4')],{timeout:180000,stdio:'pipe'});
   video=await call('upload',await readFile(join(dir,'poster.mp4')),true);
  }
  async function publish(payload){let d=await call('publish',payload);for(let i=0;i<55&&['processing','busy','publishing'].includes(d.stage);i++){await new Promise(r=>setTimeout(r,3000));d=await call('publish',{jobId:d.jobId})}if(d.stage!=='published')throw Error('Publication unconfirmed; not retrying');}
  if(mode!=='reel')await publish({format:p.format||'feed',jpeg:rendered.jpeg,caption:p.format==='story'?'':rendered.caption,articleKey:a.link,title:rendered.title});
  if(video)await publish({format:'reel',videoUrl:video.url,caption:rendered.caption,articleKey:a.link+':poster-video',title:rendered.title});
  message='Yayımlandı: '+rendered.title;console.log('TNF publication verified.');
 }
}catch(e){console.error(e instanceof Error?e.message:'TNF failed');process.exitCode=1}
finally{await browser?.close();if(dir)await rm(dir,{recursive:true,force:true});try{await call('finish',{message})}catch{console.error('Could not update final status; no forced retry.')}}
