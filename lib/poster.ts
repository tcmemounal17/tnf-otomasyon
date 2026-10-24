import {sharpenPhoto} from './photo-enhance';
export const templates=[['classic','Klasik'],['editorial','Editoryal'],['paper','Gazete'],['split','Dergi'],['frame','Çerçeve'],['card','Odak kartı']] as const;
export type Design={template?:string;format?:string;brandName?:string;brandColor?:string;brandLogo?:string};
type Poster=Design & {title:string;image:string;googleImage?:boolean;archive?:boolean;style?:{size:number;y:number;align:CanvasTextAlign;color:string;shade:number;autoFit?:boolean};photoStyle?:{x:number;y:number;zoom:number;sharpness:number}};
export async function renderPoster(c:HTMLCanvasElement,a:Poster,color:string,logo:string){
 const H=a.format==='story'?1920:1350;c.width=1080;c.height=H;const x=c.getContext('2d')!;const t=a.template||'classic',safe=a.format==='story'?180:40;const st=a.style||{size:58,y:1210,align:'left',color:'#fff',shade:1};const ps=a.photoStyle||{x:0,y:0,zoom:1,sharpness:.2};color=a.brandColor||color;logo=a.brandLogo??logo;const name=a.brandName||'Turkey News Haber';
 const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src.startsWith('data:')?src:'/api/image?url='+encodeURIComponent(src)});
 let box=[0,0,1080,H],text=[60,200,960,H-safe-100];
 if(t==='paper'){box=[0,safe+100,1080,H*.48];text=[65,safe+130+H*.48,950,H-safe-75]}
 if(t==='split'){box=[0,0,1080,H*.57];text=[65,H*.60,950,H-safe-90]}
 if(t==='frame'){box=[65,safe+95,950,H*.48];text=[80,safe+125+H*.48,920,H-safe-80]}
 if(t==='card')text=[105,H*.59,870,H-safe-100];
 if(t==='editorial')text=[95,H*.42,900,H-safe-100];
 x.fillStyle=t==='paper'?'#f7f3ea':t==='frame'?'#e9e4dc':'#12131a';x.fillRect(0,0,1080,H);
 let imageOk=false,resolution='';
 try{if(!a.image)throw Error();const im=await load(a.image);const [bx,by,bw,bh]=box;const scale=Math.max(bw/im.width,bh/im.height)*ps.zoom,w=im.width*scale,h=im.height*scale;const p=document.createElement('canvas');p.width=bw;p.height=bh;const px=p.getContext('2d')!;px.imageSmoothingEnabled=true;px.imageSmoothingQuality='high';px.drawImage(im,(bw-w)/2+(w-bw)*ps.x/200,(bh-h)/2+(h-bh)*ps.y/200,w,h);sharpenPhoto(px,bw,bh,Math.min(.8,ps.sharpness));x.drawImage(p,bx,by);imageOk=true;resolution=`${im.width} × ${im.height}${scale>1.5?' · Kaynak küçük; ayrıntı sınırlı.':' · Yüksek kaliteli ölçekleme'}`;}catch{}
 if(['classic','editorial','card'].includes(t)){const g=x.createLinearGradient(0,H*.25,0,H);g.addColorStop(0,'#00000000');g.addColorStop(1,`rgba(0,0,0,${st.shade})`);x.fillStyle=g;x.fillRect(0,0,1080,H)}
 if(t==='card'){x.fillStyle='#14141ded';x.beginPath();x.roundRect(60,H*.55,960,H*.45-safe-35,32);x.fill();}
 if(t==='editorial'){x.fillStyle=color;x.fillRect(55,H*.43,9,H*.28)}
 if(t==='split'){x.fillStyle=color;x.fillRect(65,H*.58,120,8)}
 if(t==='paper'){x.fillStyle='#161616';x.fillRect(65,safe+75,950,3)}
 const dark=t==='paper'||t==='frame';x.fillStyle=dark?'#161616':'#fff';x.font='bold 46px Arial';x.fillText('tnf.',60,safe+40);
 if(logo){try{const im=await load(logo);x.fillStyle=dark?'#f7f3ea':'#171721';x.fillRect(50,safe-12,160,70);const k=Math.min(130/im.width,65/im.height);x.drawImage(im,60,safe-10,im.width*k,im.height*k)}catch{}}
 x.font='bold 25px Arial';x.textAlign='right';x.fillStyle=dark?'#161616':'#fff';x.fillText(name,1020,safe+34,760);x.textAlign='left';
 const [left,top,width,bottom]=text;let size=st.size;const baseline=Math.max(top+size,Math.min(bottom,bottom+(st.y-1210)*(H/1350)));
 const wrap=(s:number)=>{x.font=`bold ${s}px Arial`;const lines:string[]=[];for(const para of a.title.split('\n')){let line='';for(const word of para.split(/\s+/)){if(x.measureText((line?line+' ':'')+word).width<=width){line+=(line?' ':'')+word;continue}if(line){lines.push(line);line=''}for(const ch of word){if(x.measureText(line+ch).width>width&&line){lines.push(line);line=''}line+=ch}}lines.push(line)}return lines};let lines=wrap(size);const fits=()=>baseline-(lines.length-1)*size*1.18-size>=top;if(st.autoFit!==false)while(!fits()&&size>10)lines=wrap(--size);const overflow=!fits();x.font=`bold ${size}px Arial`;x.fillStyle=dark&&['#fff','#ffffff'].includes(st.color)?'#171721':st.color;x.textAlign=st.align;const tx=st.align==='center'?left+width/2:st.align==='right'?left+width:left;lines.forEach((l,i)=>x.fillText(l,tx,baseline-(lines.length-1-i)*size*1.18));x.textAlign='left';
 if(t==='classic'){x.fillStyle=color;x.fillRect(0,H-safe-40,1080,80)}
 x.fillStyle=dark?'#161616':'#fff';x.font='bold 25px Arial';if(logo){try{const im=await load(logo);const k=Math.min(80/im.width,40/im.height);x.drawImage(im,65,H-safe-25,im.width*k,im.height*k);x.fillText(name,160,H-safe+8,850)}catch{x.fillText('tnf.  '+name,65,H-safe+8,950)}}else x.fillText('tnf.  '+name,65,H-safe+8,950);
 if(a.archive){x.font='18px Arial';x.fillText('ARŞİV / TEMSİLİ FOTOĞRAF',65,H-safe-55)}
 return {ready:imageOk&&!overflow,size,error:overflow?'Metin alana sığmıyor; yazıyı küçültün.':!imageOk?'Fotoğraf yüklenemedi.':'',resolution};
}
